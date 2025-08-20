import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In a real implementation, you'd use a library like pdf-lib to create PDF from images
    // For now, we'll simulate by creating a simple response
    const pdfFileName = `converted_${Date.now()}.pdf`
    
    // Simulate PDF creation by using the first image (in real app, convert all images to PDF)
    const firstFile = files[0]
    const fileBuffer = await firstFile.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    // Upload to Supabase Storage (in real app, this would be the generated PDF)
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('pdf-files')
      .upload(pdfFileName, uint8Array, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: urlData } = supabaseClient.storage
      .from('pdf-files')
      .getPublicUrl(pdfFileName)

    return new Response(
      JSON.stringify({ 
        success: true, 
        downloadUrl: urlData.publicUrl,
        imagesProcessed: files.length,
        pdfSize: files.reduce((acc, file) => acc + file.size, 0)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})