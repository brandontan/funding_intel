import { createClient } from '@supabase/supabase-js'
import type { Opportunity } from '@/types/opportunity'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const EXCHANGE_DISPLAY: Record<string, string> = {
  binance: 'Binance',
  bybit: 'Bybit',
  okx: 'OKX',
}

export async function fetchOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('net_rate_after_fees', { ascending: false })
    .limit(10)

  if (error) throw error

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
  })) satisfies Opportunity[]
}
