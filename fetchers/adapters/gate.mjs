import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC_USDT',
  ETHUSDT: 'ETH_USDT',
}

export async function fetchGateRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const contract = symbolMap[pair] ?? `${pair.replace('USDT', '')}_USDT`
    const url = new URL('https://api.gateio.ws/api/v4/futures/usdt/funding_rate')
    url.searchParams.set('contract', contract)
    url.searchParams.set('limit', '1')
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'FundingIntelBot/0.1',
        'Accept': 'application/json',
      },
    })
    const json = await res.json()
    if (!Array.isArray(json) || json.length === 0) continue
    const entry = json[0]
    const rate = Number(entry.rate)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'gate',
      pair,
      fundingRate: rate,
      markPrice: Number(entry.mark_price) ?? 0,
      nextFundingTime: entry.next_funding_time ? new Date(entry.next_funding_time * 1000).toISOString() : null,
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
