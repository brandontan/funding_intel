import { z } from 'zod';
import { DEFAULT_HEADERS } from './shared.mjs';

const RESPONSE_SCHEMA = z.object({
  result: z.object({
    list: z.array(
      z.object({
        symbol: z.string(),
        markPrice: z.string(),
        fundingRate: z.string(),
        nextFundingTime: z.string().optional(),
      })
    ),
  }),
});

const BYBIT_PATH = '/v5/market/tickers';

export async function fetchBybitRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT'];
  const records = [];
  const proxyBase = process.env.BYBIT_PROXY_URL?.replace(/\/$/, '');
  const headers = { ...DEFAULT_HEADERS };
  const proxyKey = process.env.BYBIT_PROXY_KEY ?? process.env.BINANCE_PROXY_KEY;
  if (proxyBase && proxyKey) {
    headers['x-proxy-key'] = proxyKey;
  }

  for (const pair of pairs) {
    const baseUrl = proxyBase ? `${proxyBase}${BYBIT_PATH}` : `https://api.bybit.com${BYBIT_PATH}`;
    const url = new URL(baseUrl);
    url.searchParams.set('category', 'linear');
    url.searchParams.set('symbol', pair);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Bybit request failed for ${pair}: ${res.status} ${res.statusText}`);
    }

    const parsed = RESPONSE_SCHEMA.parse(await res.json());
    const now = new Date().toISOString();
    parsed.result.list.forEach((entry) => {
      records.push({
        exchange: 'bybit',
        pair: entry.symbol,
        fundingRate: Number(entry.fundingRate ?? 0),
        markPrice: Number(entry.markPrice ?? 0),
        nextFundingTime: entry.nextFundingTime
          ? new Date(Number(entry.nextFundingTime)).toISOString()
          : null,
        fetchedAt: now,
        raw: entry,
      });
    });
  }

  return records;
}
