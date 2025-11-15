import { fetchWithRetry } from '../utils/http.mjs'

const symbolMap = {
  BTCUSDT: 'BTC_USDT',
  ETHUSDT: 'ETH_USDT',
}

async function fetchTicker(contract) {
  const url = new URL('https://api.gateio.ws/api/v4/futures/usdt/tickers')
  url.searchParams.set('contract', contract)
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } })
  const json = await res.json()
  const entry = json[0]
  return Number(entry?.mark_price ?? entry?.index_price ?? 0)
}

export async function fetchGateRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const contract = symbolMap[pair] ?? `${pair.replace('USDT', '')}_USDT`
    const url = new URL('https://api.gateio.ws/api/v4/futures/usdt/funding_rate')
    url.searchParams.set('contract', contract)
    url.searchParams.set('settle', 'usdt')
    url.searchParams.set('limit', '1')
    const [fundingRes, markPrice] = await Promise.all([
      fetchWithRetry(url, { headers: { 'User-Agent': 'FundingIntelBot/0.1' } }).then((res) => res.json()),
      fetchTicker(contract),
    ])
    if (!Array.isArray(fundingRes) || fundingRes.length === 0) continue
    const entry = fundingRes[0]
    const rate = Number(entry.r ?? entry.rate ?? 0)
    if (Number.isNaN(rate)) continue
    const ts = entry.t ? Number(entry.t) * 1000 : Date.now()
    records.push({
      exchange: 'gate',
      pair,
      fundingRate: rate,
      markPrice,
      nextFundingTime: new Date(ts).toISOString(),
      fetchedAt: new Date().toISOString(),
    })
  }
  return records
}
