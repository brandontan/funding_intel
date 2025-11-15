'use server'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeExchange } from '@/lib/exchanges'
import type { UserSettings } from '@/types'

let serviceClient: SupabaseClient | null = null

function getServiceClient() {
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

export async function getUserSettings(userId?: string): Promise<UserSettings | null> {
  if (!userId) {
    return null
  }

  const client = getServiceClient()
  if (!client) {
    return null
  }

  const { data, error } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    userId: data.user_id,
    capitalDefault: data.capital_default,
    leverage: data.leverage,
    preferredExchanges: (data.preferred_exchanges ?? []).map((value: string) => normalizeExchange(value)),
    alertChannel: data.alert_channels?.[0] ?? 'email',
    alertOptedOut: !data.alert_channels || data.alert_channels.length === 0,
  }
}
