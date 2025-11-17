'use server'

import { normalizeExchange, toExchangeLabel } from '@/lib/exchanges'
import { getServiceClient } from '@/lib/serviceClient'
import type { AlertRule } from '@/types'

type RawAlert = {
  id: number
  pair: string | null
  exchange: string | null
  threshold_rate: number | null
  channel: 'email' | 'telegram'
  status: 'active' | 'paused'
  last_triggered_at?: string | null
  created_at: string
  updated_at: string
}

export async function getAlerts(userId?: string): Promise<AlertRule[]> {
  if (!userId) {
    return []
  }

  const client = getServiceClient()
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('alerts')
    .select('id, pair, exchange, threshold_rate, channel, status, last_triggered_at, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Failed to load alerts', error)
    return []
  }

  return data.map((row: RawAlert) => {
    const exchangeKey = normalizeExchange(row.exchange ?? '')
    return {
      id: row.id,
      pair: row.pair ?? 'Unknown pair',
      exchange: toExchangeLabel(exchangeKey),
      exchangeKey,
      thresholdRate: Number(row.threshold_rate ?? 0),
      channel: row.channel ?? 'email',
      status: row.status ?? 'active',
      lastTriggeredAt: row.last_triggered_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}
