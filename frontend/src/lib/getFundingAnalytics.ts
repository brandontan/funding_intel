import { supabase } from '@/lib/live-data'

export type FundingAnalytics = {
  exchangeAverages: Array<{ exchange: string; avgRate: number }>
  heatmap: Array<{ exchange: string; pair: string; value: number }>
  pairTrends: Array<{ pair: string; points: Array<{ timestamp: string; value: number }> }>
}

const FALLBACK_DATA: FundingAnalytics = {
  exchangeAverages: [
    { exchange: 'Binance', avgRate: 0.0012 },
    { exchange: 'Bybit', avgRate: 0.001 },
    { exchange: 'OKX', avgRate: 0.0008 },
  ],
  heatmap: [
    { exchange: 'Binance', pair: 'BTCUSDT', value: 0.0015 },
    { exchange: 'Binance', pair: 'ETHUSDT', value: 0.0012 },
    { exchange: 'Binance', pair: 'SOLUSDT', value: 0.002 },
    { exchange: 'Bybit', pair: 'BTCUSDT', value: 0.001 },
    { exchange: 'Bybit', pair: 'ETHUSDT', value: 0.0009 },
    { exchange: 'Bybit', pair: 'SOLUSDT', value: 0.0014 },
    { exchange: 'OKX', pair: 'BTCUSDT', value: 0.0008 },
    { exchange: 'OKX', pair: 'ETHUSDT', value: 0.0007 },
    { exchange: 'OKX', pair: 'SOLUSDT', value: 0.0011 },
  ],
  pairTrends: [
    {
      pair: 'BTCUSDT',
      points: [
        { timestamp: '08:00', value: 0.001 },
        { timestamp: '12:00', value: 0.0014 },
        { timestamp: '16:00', value: 0.0013 },
        { timestamp: '20:00', value: 0.0016 },
      ],
    },
  ],
}

export async function getFundingAnalytics(): Promise<FundingAnalytics> {
  if (!supabase) {
    return FALLBACK_DATA
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('funding_rates')
    .select('exchange,pair,funding_rate,fetched_at')
    .gte('fetched_at', since)
    .order('fetched_at', { ascending: true })

  if (error || !data?.length) {
    return FALLBACK_DATA
  }

  const exchangeMap = new Map<string, { sum: number; count: number }>()
  const pairMap = new Map<string, { exchange: string; pair: string; sum: number; count: number }>()
  const trendMap = new Map<string, Array<{ timestamp: string; value: number }>>()

  for (const row of data) {
    const exchange = row.exchange ?? 'unknown'
    const pair = row.pair ?? 'unknown'
    const rate = Number(row.funding_rate ?? 0)

    const stats = exchangeMap.get(exchange) ?? { sum: 0, count: 0 }
    stats.sum += rate
    stats.count += 1
    exchangeMap.set(exchange, stats)

    const heatKey = `${exchange}-${pair}`
    const pairStats = pairMap.get(heatKey) ?? { exchange, pair, sum: 0, count: 0 }
    pairStats.sum += rate
    pairStats.count += 1
    pairMap.set(heatKey, pairStats)

    const bucket = trendMap.get(pair) ?? []
    if (bucket.length < 24) {
      bucket.push({
        timestamp: new Date(row.fetched_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: rate,
      })
    }
    trendMap.set(pair, bucket)
  }

  const exchangeAverages = Array.from(exchangeMap.entries())
    .map(([exchange, stats]) => ({
      exchange,
      avgRate: stats.count ? stats.sum / stats.count : 0,
    }))
    .sort((a, b) => b.avgRate - a.avgRate)

  const heatmap = Array.from(pairMap.values()).map((entry) => ({
    exchange: entry.exchange,
    pair: entry.pair,
    value: entry.count ? entry.sum / entry.count : 0,
  }))

  const pairTrends = Array.from(trendMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 2)
    .map(([pair, points]) => ({ pair, points }))

  return {
    exchangeAverages: exchangeAverages.length ? exchangeAverages : FALLBACK_DATA.exchangeAverages,
    heatmap: heatmap.length ? heatmap : FALLBACK_DATA.heatmap,
    pairTrends: pairTrends.length ? pairTrends : FALLBACK_DATA.pairTrends,
  }
}
