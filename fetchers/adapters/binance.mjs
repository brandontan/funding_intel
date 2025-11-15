import { z } from 'zod';
import { DEFAULT_HEADERS } from './shared.mjs';

const RESPONSE_SCHEMA = z.array(
  z.object({
    symbol: z.string(),
    markPrice: z.string(),
    lastFundingRate: z.string(),
    nextFundingTime: z.union([z.string(), z.number()]).nullable().optional(),
  })
);

const BINANCE_PATH = '/fapi/v1/premiumIndex';

export async function fetchBinanceRates(targetPairs = []) {
  const proxyBase = process.env.BINANCE_PROXY_URL?.replace(/\/$/, '');
  const requestUrl = (proxyBase ?? 'https://fapi.binance.com') + BINANCE_PATH;
  const headers = { ...DEFAULT_HEADERS };
  const proxyKey = process.env.BINANCE_PROXY_KEY;
  if (proxyBase && proxyKey) {
    headers['x-proxy-key'] = proxyKey;
  }

  const res = await fetch(requestUrl, { headers });
  if (!res.ok) {
    throw new Error(`Binance request failed: ${res.status} ${res.statusText}`);
  }

  const parsed = RESPONSE_SCHEMA.parse(await res.json());
  const now = new Date().toISOString();

  return parsed
    .filter((entry) => targetPairs.length === 0 || targetPairs.includes(entry.symbol))
    .map((entry) => ({
      exchange: 'binance',
      pair: entry.symbol,
      fundingRate: Number(entry.lastFundingRate ?? 0),
      markPrice: Number(entry.markPrice ?? 0),
      nextFundingTime: entry.nextFundingTime
        ? new Date(Number(entry.nextFundingTime)).toISOString()
        : null,
      fetchedAt: now,
      raw: entry,
    }));
}
