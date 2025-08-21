import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment or use placeholder
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to call edge functions
export const callEdgeFunction = async (
  functionName: string, 
  formData: FormData,
  authRequired = false
) => {
  const headers: Record<string, string> = {}
  
  if (authRequired) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Function call failed: ${errorText}`)
  }

  return response
}