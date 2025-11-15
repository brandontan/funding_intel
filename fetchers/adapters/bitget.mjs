import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTCUSDT_UMCBL',
  ETHUSDT: 'ETHUSDT_UMCBL',
}

export async function fetchBitgetRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const symbol = symbolMap[pair] ?? `${pair}_UMCBL`
    const url = new URL('https://api.bitget.com/api/mix/v1/market/historyFundRate')
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('pageSize', '1')
    const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
    const json = await res.json()
    if (!json.data || json.data.length === 0) continue
    const entry = json.data[0]
    const rate = Number(entry.fundingRate)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'bitget',
      pair,
      fundingRate: rate,
      markPrice: Number(entry.avgPrice) ?? 0,
      nextFundingTime: entry.fundingTime ? new Date(Number(entry.fundingTime)).toISOString() : null,
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
