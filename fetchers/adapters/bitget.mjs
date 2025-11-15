import { fetchWithRetry } from '../utils/http.mjs'

const PRODUCT_TYPE = 'USDT-FUTURES'
const symbolMap = {
  BTCUSDT: 'BTCUSDT',
  ETHUSDT: 'ETHUSDT',
}

async function fetchTicker(symbol) {
  const url = new URL('https://api.bitget.com/api/v2/mix/market/ticker')
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('productType', PRODUCT_TYPE)
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
  const json = await res.json()
  const entry = json.data?.[0]
  return {
    markPrice: Number(entry?.markPrice ?? entry?.indexPrice ?? 0),
    nextFundingTime: entry?.deliveryTime ? new Date(Number(entry.deliveryTime)).toISOString() : null,
  }
}

export async function fetchBitgetRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const symbol = symbolMap[pair] ?? pair
    const url = new URL('https://api.bitget.com/api/v2/mix/market/current-fund-rate')
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('productType', PRODUCT_TYPE)
    const [rateRes, ticker] = await Promise.all([
      fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } }).then((res) => res.json()),
      fetchTicker(symbol),
    ])
    const entry = rateRes.data?.[0]
    const rate = Number(entry?.fundingRate ?? entry?.funding_rate ?? 0)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'bitget',
      pair,
      fundingRate: rate,
      markPrice: ticker.markPrice,
      nextFundingTime: entry?.nextUpdate
        ? new Date(Number(entry.nextUpdate)).toISOString()
        : ticker.nextFundingTime,
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
