import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment or use safe defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to call edge functions
export const callEdgeFunction = async (
  functionName: string, 
  formData: FormData,
  authRequired = false
) => {
  // Check if Supabase is properly configured
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
    throw new Error('Supabase is not configured. Please set up your Supabase connection in the project settings.')
  }

  const headers: Record<string, string> = {}
  
  if (authRequired) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.warn('Auth session error:', error)
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