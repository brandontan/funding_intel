import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC-USD',
  ETHUSDT: 'ETH-USD',
}

export async function fetchDydxRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const url = 'https://indexer.dydx.trade/v4/perpetualMarkets'
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
  const json = await res.json()
  const markets = json.markets ?? {}
  const now = new Date().toISOString()
  return pairs.flatMap((pair) => {
    const marketName = symbolMap[pair] ?? pair.replace('USDT', '-USD')
    const info = markets[marketName]
    if (!info) return []
    const rate = Number(info.nextFundingRate ?? info.lastFundingRate ?? 0)
    if (Number.isNaN(rate)) return []
    return [{
      exchange: 'dydx',
      pair,
      fundingRate: rate,
      markPrice: Number(info.oraclePrice ?? info.indexPrice ?? 0),
      nextFundingTime: info.nextFundingTime ?? now,
      fetchedAt: now,
    }]
  })
}
