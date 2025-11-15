import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFeeBreakdown } from '@/lib/fees'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const pair = searchParams.get('pair')
  const exchange = searchParams.get('exchange')

  if (!pair || !exchange) {
    return NextResponse.json({ error: 'Missing pair or exchange' }, { status: 400 })
  }

  const { data: opportunity, error: oppError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('pair', pair)
    .eq('exchange', exchange)
    .maybeSingle()

  if (oppError || !opportunity) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
  }

  const { data: historyRows, error: historyError } = await supabase
    .from('funding_rates')
    .select('funding_rate,mark_price,fetched_at,next_funding_time')
    .eq('pair', pair)
    .eq('exchange', exchange)
    .order('fetched_at', { ascending: false })
    .limit(16)

  if (historyError) {
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }

  const history = (historyRows ?? [])
    .map((row) => ({
      timestamp: row.fetched_at,
      fundingRate: row.funding_rate,
    }))
    .reverse()

  const avgMarkPrice =
    historyRows && historyRows.length > 0
      ? historyRows.reduce((sum, row) => sum + Number(row.mark_price ?? 0), 0) / historyRows.length
      : null
  const nextFundingTime = historyRows?.[0]?.next_funding_time ?? null
  const fees = getFeeBreakdown(exchange)
  const recommendedThreshold = Number((opportunity.current_funding_rate * 0.85).toFixed(4))

  return NextResponse.json({
    pair: opportunity.pair,
    exchange: opportunity.exchange,
    currentFundingRate: opportunity.current_funding_rate,
    netRateAfterFees: opportunity.net_rate_after_fees,
    persistenceScore: opportunity.persistence_score,
    volatilityScore: opportunity.volatility_score,
    exchangeTrust: opportunity.exchange_trust,
    risk: opportunity.risk,
    spreadVsSpot: opportunity.spread_vs_spot,
    capitalRequired: opportunity.capital_required,
    updatedAt: opportunity.updated_at,
    avgMarkPrice,
    makerFeeBps: fees.makerBps,
    takerFeeBps: fees.takerBps,
    borrowCostBps: fees.borrowBps,
    history,
    nextFundingTime,
    recommendedThreshold,
  })
}
