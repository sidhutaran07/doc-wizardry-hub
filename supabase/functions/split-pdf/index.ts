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
    const file = formData.get('file') as File
    const pageRanges = formData.get('pageRanges') as string // e.g., "1-3,5,7-10"

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No PDF file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fileBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    // In real implementation, use pdf-lib to split PDF based on page ranges
    // For demo, create multiple "split" files
    const splitFiles = []
    const ranges = pageRanges ? pageRanges.split(',') : ['1-2', '3-4']

    for (let i = 0; i < ranges.length; i++) {
      const splitFileName = `split_${Date.now()}_part${i + 1}.pdf`
      
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('pdf-files')
        .upload(splitFileName, uint8Array, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: urlData } = supabaseClient.storage
        .from('pdf-files')
        .getPublicUrl(splitFileName)

      splitFiles.push({
        fileName: splitFileName,
        pages: ranges[i],
        downloadUrl: urlData.publicUrl
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        splitFiles,
        originalFileName: file.name
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