// supabase/functions/images-to-pdf/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  PDFDocument,
  StandardFonts,
} from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      // For storage uploads from an Edge Function, the anon key is OK
      // If you later need RLS-bypassing DB ops, switch to SERVICE_ROLE (never expose to client).
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const formData = await req.formData();
    // Expect <input type="file" name="files" multiple />
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return json({ error: "No images provided" }, 400);
    }

    // 1) Build a REAL PDF from the images
    const pdfDoc = await PDFDocument.create();

    // Optional: add a small first page/title if you want
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());

      // Try to embed based on MIME type; fall back to detect simple PNG/JPG
      let img;
      if (file.type.includes("png")) {
        img = await pdfDoc.embedPng(bytes);
      } else if (file.type.includes("jpg") || file.type.includes("jpeg")) {
        img = await pdfDoc.embedJpg(bytes);
      } else {
        // naive sniff: PNG files start with 0x89 'PNG', JPEG with 0xFF 0xD8
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
          img = await pdfDoc.embedPng(bytes);
        } else {
          img = await pdfDoc.embedJpg(bytes);
        }
      }

      const { width, height } = img.size();

      // Create a page that matches image aspect ratio (scale to A4-ish max)
      const maxW = 595; // ~A4 width in points
      const maxH = 842; // ~A4 height in points
      const scale = Math.min(maxW / width, maxH / height);
      const pageWidth = Math.min(width, maxW);
      const pageHeight = Math.min(height, maxH);
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const drawW = width * scale;
      const drawH = height * scale;
      const x = (pageWidth - drawW) / 2;
      const y = (pageHeight - drawH) / 2;

      page.drawImage(img, { x, y, width: drawW, height: drawH });

      // Optional footer
      page.drawText(file.name ?? "image", {
        x: 24,
        y: 16,
        size: 10,
        font,
        color: undefined,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // 2) Upload the generated PDF to Supabase Storage
    const fileName = `converted_${Date.now()}.pdf`;
    const bucket = "pdf-files"; // ensure this bucket exists

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return json({ error: "Failed to upload PDF" }, 500);
    }

    // 3) Get a public or signed URL
    // If bucket is PUBLIC:
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName, { download: fileName }); // appends ?download=filename

    // If your bucket is PRIVATE, comment the above and use a signed URL instead:
    // const { data: signedData, error: signedErr } = await supabase.storage
    //   .from(bucket)
    //   .createSignedUrl(fileName, 60 * 60, { download: fileName }); // 1 hour
    // if (signedErr) return json({ error: "Failed to create signed URL" }, 500);
    // const downloadUrl = signedData.signedUrl;

    const downloadUrl = publicData.publicUrl;

    return json(
      {
        success: true,
        fileName,
        imagesProcessed: files.length,
        downloadUrl, // clicking this will download the PDF
      },
      200,
    );
  } catch (err) {
    console.error("Error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload),
