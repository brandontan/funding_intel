import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC-USD',
  ETHUSDT: 'ETH-USD',
}

export async function fetchDydxRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const url = 'https://api.dydx.trade/v4/markets'
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
  const markets = await res.json()
  const now = new Date().toISOString()
  return pairs.flatMap((pair) => {
    const marketName = symbolMap[pair] ?? pair.replace('USDT', '-USD')
    const info = markets[marketName]
    if (!info) return []
    const rate = Number(info.nextFundingRate ?? info.fundingRate ?? 0)
    if (Number.isNaN(rate)) return []
    return [{
      exchange: 'dydx',
      pair,
      fundingRate: rate,
      markPrice: Number(info.indexPrice ?? info.oraclePrice ?? 0),
      nextFundingTime: info.nextFundingTime ?? now,
      fetchedAt: now,
    }]
  })
}
