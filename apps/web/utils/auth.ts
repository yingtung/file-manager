import { createClient } from '@/utils/supabase/client'

/**
 * Get the current user's access token.
 * This function should only be called from client components.
 * 
 * @returns The access token, or null if not authenticated
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  return sessionData.session?.access_token ?? null
}

/**
 * Ensure user is authenticated and get access token.
 * Throws error if not authenticated.
 * This function should only be called from client components.
 * 
 * @returns The access token
 * @throws Error if not authenticated
 */
export async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken()
  
  if (!token) {
    throw new Error('未登入或 Session 已過期，請重新登入。')
  }
  
  return token
}

