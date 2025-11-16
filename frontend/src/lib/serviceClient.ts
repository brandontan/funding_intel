import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null

export function getServiceClient() {
  if (serviceClient) {
    return serviceClient
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return null
  }

  serviceClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
  return serviceClient
}
