import { describe, expect, it } from 'vitest'
import { prioritizeOpportunities } from './prioritizeOpportunities'
import type { Opportunity } from '@/types'

const sample: Opportunity[] = [
  {
    id: 'btc-binance',
    pair: 'BTC/USDT',
    exchange: 'Binance',
    exchangeKey: 'binance',
    fundingRate: 0.001,
    netRateAfterFees: 0.0009,
    persistenceScore: 0.9,
    volatilityScore: 0.1,
    exchangeTrust: 0.9,
    risk: 'A',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eth-bybit',
    pair: 'ETH/USDT',
    exchange: 'Bybit',
    exchangeKey: 'bybit',
    fundingRate: 0.0008,
    netRateAfterFees: 0.0007,
    persistenceScore: 0.8,
    volatilityScore: 0.2,
    exchangeTrust: 0.8,
    risk: 'B',
    updatedAt: new Date().toISOString(),
  },
]

describe('prioritizeOpportunities', () => {
  it('returns matches when preferred exchanges exist', () => {
    const prioritized = prioritizeOpportunities(sample, ['bybit'])
    expect(prioritized).toHaveLength(1)
    expect(prioritized[0].exchangeKey).toBe('bybit')
  })

  it('falls back to full list when no matches found', () => {
    const prioritized = prioritizeOpportunities(sample, ['gate'])
    expect(prioritized).toHaveLength(sample.length)
  })

  it('handles empty input gracefully', () => {
    const prioritized = prioritizeOpportunities([], ['binance'])
    expect(prioritized).toHaveLength(0)
  })
})
