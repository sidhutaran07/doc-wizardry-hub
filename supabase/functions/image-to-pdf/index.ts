import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    // use SERVICE_ROLE if your storage policy requires it
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files.length) {
      return new Response(JSON.stringify({ error: "No files" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const pdf = await PDFDocument.create();

    for (const f of files) {
      const bytes = new Uint8Array(await f.arrayBuffer());
      let img;
      if (f.type === "image/png") img = await pdf.embedPng(bytes);
      else if (f.type === "image/jpeg" || f.type === "image/jpg") img = await pdf.embedJpg(bytes);
      else {
        return new Response(JSON.stringify({ error: `Unsupported: ${f.type}` }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const pdfBytes = await pdf.save(); // ✅ real PDF bytes (Uint8Array)
    const fileName = `converted_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("pdf-files")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Signed URL works whether bucket is public or private
    const { data: signed, error: signErr } = await supabase.storage
      .from("pdf-files").createSignedUrl(fileName, 60 * 60);

    if (signErr) {
      console.error(signErr);
      return new Response(JSON.stringify({ error: "Sign URL failed" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      fileName,
      downloadUrl: signed.signedUrl,
      pages: files.length,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
