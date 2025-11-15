import { fetchWithRetry } from '../utils/http.mjs'
import { DEFAULT_HEADERS } from './shared.mjs'

const symbolMap = {
  BTCUSDT: 'BTC-USDT',
  ETHUSDT: 'ETH-USDT',
}

const proxyBase = process.env.HTX_PROXY_URL?.replace(/\/$/, '')
const proxyKey = process.env.HTX_PROXY_KEY

function buildUrl(path, params = {}) {
  const base = proxyBase ?? 'https://api.hbdm.com'
  const url = new URL(path, base)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  })
  return url
}

function headersWithKey() {
  return proxyBase && proxyKey
    ? { ...DEFAULT_HEADERS, 'x-proxy-key': proxyKey }
    : DEFAULT_HEADERS
}

async function fetchSpotPrice(symbol) {
  try {
    const spotSymbol = symbol.replace('-', '').toLowerCase()
    const url = buildUrl('/market/detail/merged', { symbol: spotSymbol })
    const res = await fetchWithRetry(url, { headers: headersWithKey() })
    const json = await res.json()
    return Number(json.tick?.close ?? json.tick?.lastPrice ?? 0)
  } catch {
    return 0
  }
}

export async function fetchHuobiRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT', 'ETHUSDT']
  const records = []
  for (const pair of pairs) {
    const contract = symbolMap[pair] ?? `${pair.replace('USDT', '')}-USDT`
    const url = buildUrl('/linear-swap-api/v1/swap_funding_rate', { contract_code: contract })
    try {
      const [fundingRes, price] = await Promise.all([
        fetchWithRetry(url, { headers: headersWithKey() }).then((res) => res.json()),
        fetchSpotPrice(contract),
      ])
      const data = fundingRes.data
      if (!data) continue
      const rate = Number(data.funding_rate ?? 0)
      if (Number.isNaN(rate)) continue
      records.push({
        exchange: 'htx',
        pair,
        fundingRate: rate,
        markPrice: price,
        nextFundingTime: data.funding_time ? new Date(Number(data.funding_time)).toISOString() : null,
        fetchedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('HTX fetch failed', error)
    }
  }
  return records
}
