'use server'

import { normalizeExchange } from '@/lib/exchanges'
import { getServiceClient } from '@/lib/serviceClient'
import type { UserSettings } from '@/types'

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
    contactEmail: data.email_address ?? undefined,
    telegramHandle: data.telegram_handle ?? undefined,
  }
}
