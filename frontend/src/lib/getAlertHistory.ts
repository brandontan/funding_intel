'use server'

import { toExchangeLabel } from '@/lib/exchanges'
import { getServiceClient } from '@/lib/serviceClient'
import type { AlertHistoryEvent } from '@/types'

type RawAlertEvent = {
  id: number
  alert_id: number
  channel: 'email' | 'telegram'
  delivery_status: string
  message?: string | null
  created_at: string
  alerts?: {
    user_id?: string
    pair?: string
    exchange?: string
    threshold_rate?: number
  } | null
}

export async function getAlertHistory(userId?: string): Promise<AlertHistoryEvent[]> {
  if (!userId) {
    return []
  }

  const client = getServiceClient()
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('alert_events')
    .select('id, alert_id, channel, delivery_status, message, created_at, alerts!inner(user_id,pair,exchange,threshold_rate)')
    .eq('alerts.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !data) {
    console.error('Failed to load alert events', error)
    return []
  }

  return data.map((row: RawAlertEvent) => ({
    id: row.id,
    alertId: row.alert_id,
    channel: row.channel,
    deliveryStatus: row.delivery_status,
    message: row.message ?? undefined,
    pair: row.alerts?.pair ?? 'Unknown pair',
    exchange: toExchangeLabel(row.alerts?.exchange ?? ''),
    thresholdRate: Number(row.alerts?.threshold_rate ?? 0),
    createdAt: row.created_at,
  }))
}
