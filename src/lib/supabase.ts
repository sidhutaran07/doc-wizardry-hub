import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Re-export supabase client for app-wide use
export const supabase = supabaseClient;

// Supabase project URL and anon key (public)
const supabaseUrl = "https://glpwshjvtofkxcmsiuts.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscHdzaGp2dG9ma3hjbXNpdXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQxMDksImV4cCI6MjA3MTUxMDEwOX0.xNwgxeVtjuGZtpT2Emnlzapm4gMDO5gOXE6vUjBvw6g";

// Helper function to call edge functions
export const callEdgeFunction = async (
  functionName: string,
  formData: FormData,
  authRequired = false
) => {
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (authRequired && session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    } else if (!authRequired) {
      // Provide anon bearer to satisfy Edge Function auth when verify_jwt is enabled
      headers.Authorization = `Bearer ${supabaseAnonKey}`;
    }
  } catch (error) {
    console.warn("Auth session error:", error);
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Function call failed: ${errorText}`);
  }

  return response;
};
