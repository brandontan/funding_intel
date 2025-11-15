import { z } from 'zod';
import { DEFAULT_HEADERS } from './shared.mjs';

const RESPONSE_SCHEMA = z.object({
  data: z.array(
    z.object({
      instId: z.string(),
      fundingRate: z.string(),
      nextFundingRate: z.string().optional(),
      nextFundingTime: z.string().optional(),
    })
  ),
});

const MARK_PRICE_SCHEMA = z.object({
  data: z.array(
    z.object({
      markPx: z.string(),
    })
  ),
});

function toOkxInst(pair) {
  return `${pair.slice(0, 3)}-${pair.slice(3)}-SWAP`;
}

export async function fetchOkxRates(targetPairs = []) {
  const pairs = targetPairs.length ? targetPairs : ['BTCUSDT'];
  const records = [];

  for (const pair of pairs) {
    const instId = toOkxInst(pair);
    const url = new URL('https://www.okx.com/api/v5/public/funding-rate');
    url.searchParams.set('instId', instId);

    const res = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!res.ok) {
      throw new Error(`OKX request failed for ${pair}: ${res.status} ${res.statusText}`);
    }

    const parsed = RESPONSE_SCHEMA.parse(await res.json());
    const markRes = await fetch(
      'https://www.okx.com/api/v5/public/mark-price?' + new URLSearchParams({ instType: 'SWAP', instId }).toString(),
      {
        headers: DEFAULT_HEADERS,
      }
    );
    if (!markRes.ok) {
      throw new Error(`OKX mark price failed for ${pair}: ${markRes.status} ${markRes.statusText}`);
    }
    const markParsed = MARK_PRICE_SCHEMA.parse(await markRes.json());
    const markPx = Number(markParsed.data[0]?.markPx ?? 0);
    const now = new Date().toISOString();

    parsed.data.forEach((entry) => {
      records.push({
        exchange: 'okx',
        pair,
        fundingRate: Number(entry.fundingRate ?? 0),
        markPrice: markPx,
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
