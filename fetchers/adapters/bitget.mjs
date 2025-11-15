import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: { productType: 'umcbl', symbol: 'BTCUSDT_UMCBL' },
  ETHUSDT: { productType: 'umcbl', symbol: 'ETHUSDT_UMCBL' },
}

export async function fetchBitgetRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const { productType, symbol } = symbolMap[pair] ?? { productType: 'umcbl', symbol: `${pair}_UMCBL` }
    const url = new URL('https://api.bitget.com/api/mix/v1/market/fundingRate')
    url.searchParams.set('productType', productType)
    url.searchParams.set('symbol', symbol)
    const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
    const json = await res.json()
    const data = json.data
    if (!data) continue
    const rate = Number(data.fundingRate)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'bitget',
      pair,
      fundingRate: rate,
      markPrice: Number(data.indexPrice) ?? 0,
      nextFundingTime: data.settleTime ? new Date(Number(data.settleTime)).toISOString() : null,
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
