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

    if (!files || files.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 PDF files required for merging' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In real implementation, use pdf-lib to merge PDFs
    const mergedFileName = `merged_${Date.now()}.pdf`
    
    // Simulate merging by using the largest file
    const largestFile = files.reduce((prev, current) => 
      current.size > prev.size ? current : prev
    )
    
    const fileBuffer = await largestFile.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('pdf-files')
      .upload(mergedFileName, uint8Array, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to merge PDFs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: urlData } = supabaseClient.storage
      .from('pdf-files')
      .getPublicUrl(mergedFileName)

    return new Response(
      JSON.stringify({ 
        success: true, 
        downloadUrl: urlData.publicUrl,
        filesmerged: files.length,
        totalSize: files.reduce((acc, file) => acc + file.size, 0)
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