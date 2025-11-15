import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC-USDT',
  ETHUSDT: 'ETH-USDT',
}

export async function fetchHuobiRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const contract = symbolMap[pair] ?? `${pair.replace('USDT', '')}-USDT`
    const url = new URL('https://api.hbdm.com/linear-swap-api/v1/swap_funding_rate')
    url.searchParams.set('contract_code', contract)
    const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
    const json = await res.json()
    if (!json.data || json.data.err_code) continue
    const rate = Number(json.data.funding_rate)
    if (Number.isNaN(rate)) continue
    records.push({
      exchange: 'htx',
      pair,
      fundingRate: rate,
      markPrice: Number(json.data.index_price) ?? 0,
      nextFundingTime: json.data.next_funding_time ? new Date(Number(json.data.next_funding_time)).toISOString() : null,
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
