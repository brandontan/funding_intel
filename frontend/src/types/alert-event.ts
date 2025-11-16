export type AlertHistoryEvent = {
  id: number
  alertId: number
  channel: 'email' | 'telegram'
  deliveryStatus: string
  message?: string | null
  pair: string
  exchange: string
  thresholdRate: number
  createdAt: string
}
