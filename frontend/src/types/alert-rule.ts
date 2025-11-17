export type AlertRule = {
  id: number
  pair: string
  exchange: string
  exchangeKey: string
  thresholdRate: number
  channel: 'email' | 'telegram'
  status: 'active' | 'paused'
  lastTriggeredAt?: string | null
  createdAt: string
  updatedAt: string
}
