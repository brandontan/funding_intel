import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC-PERPETUAL',
  ETHUSDT: 'ETH-PERPETUAL',
}

export async function fetchDeribitRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  const now = Date.now()
  const lookbackMs = 8 * 60 * 60 * 1000
  for (const pair of pairs) {
    const instrument = symbolMap[pair] ?? pair.replace('USDT', '-PERPETUAL')
    const url = new URL('https://www.deribit.com/api/v2/public/get_funding_rate_history')
    url.searchParams.set('instrument_name', instrument)
    url.searchParams.set('start_timestamp', String(now - lookbackMs))
    url.searchParams.set('end_timestamp', String(now))
    const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
    const json = await res.json()
    if (!json.result || !json.result.length) continue
    const entry = json.result[json.result.length - 1]
    const rate = Number(entry.interest_8h)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'deribit',
      pair,
      fundingRate: rate,
      markPrice: Number(entry.index_price) ?? 0,
      nextFundingTime: new Date(entry.timestamp).toISOString(),
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
