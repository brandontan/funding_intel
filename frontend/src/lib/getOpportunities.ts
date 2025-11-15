import { supabase } from '@/lib/live-data'
import type { Opportunity } from '@/types/opportunity'

const EXCHANGE_DISPLAY: Record<string, string> = {
  binance: 'Binance',
  bybit: 'Bybit',
  okx: 'OKX',
}

export async function getOpportunities(): Promise<Opportunity[]> {
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
    exchange: EXCHANGE_DISPLAY[row.exchange] ?? row.exchange,
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
