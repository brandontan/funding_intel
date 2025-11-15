import { supabase } from '@/lib/live-data'
import { toExchangeLabel, normalizeExchange } from '@/lib/exchanges'
import type { Opportunity } from '@/types'

export async function getOpportunities(): Promise<Opportunity[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('net_rate_after_fees', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Failed to load opportunities', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: `${row.pair}-${row.exchange}`,
    pair: row.pair,
    exchange: toExchangeLabel(row.exchange),
    exchangeKey: normalizeExchange(row.exchange),
    fundingRate: row.current_funding_rate,
    netRateAfterFees: row.net_rate_after_fees,
    persistenceScore: row.persistence_score,
    volatilityScore: row.volatility_score,
    exchangeTrust: row.exchange_trust,
    risk: row.risk,
    spreadVsSpot: row.spread_vs_spot,
    capitalRequired: row.capital_required,
    updatedAt: row.updated_at,
  }))
}
