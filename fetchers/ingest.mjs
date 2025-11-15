import { createClient } from '@supabase/supabase-js';
import { performance } from 'node:perf_hooks';
import { fetchBinanceRates } from './adapters/binance.mjs';
import { fetchBybitRates } from './adapters/bybit.mjs';
import { fetchOkxRates } from './adapters/okx.mjs';
import { fetchDeribitRates } from './adapters/deribit.mjs';
import { fetchBitgetRates } from './adapters/bitget.mjs';
import { fetchHuobiRates } from './adapters/huobi.mjs';
import { fetchDydxRates } from './adapters/dydx.mjs';
import { fetchGateRates } from './adapters/gate.mjs';

const TARGET_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const adapters = [
  { name: 'binance', fn: fetchBinanceRates },
  { name: 'bybit', fn: fetchBybitRates },
  { name: 'okx', fn: fetchOkxRates },
  { name: 'deribit', fn: fetchDeribitRates },
  { name: 'bitget', fn: fetchBitgetRates },
  { name: 'htx', fn: fetchHuobiRates },
  { name: 'dydx', fn: fetchDydxRates },
  { name: 'gate', fn: fetchGateRates },
];

async function recordMetric(exchange, latencyMs, status, metadata = {}) {
  const { error } = await supabase.from('ingestion_metrics').insert({
    exchange,
    latency_ms: Math.round(latencyMs),
    status,
    metadata,
  });
  if (error) {
    console.error(`Failed to record metric for ${exchange}:`, error.message);
  }
}

async function runAdapter(adapter) {
  const start = performance.now();
  try {
    const records = await adapter.fn(TARGET_PAIRS);
    if (!records.length) {
      console.warn(`No records returned for ${adapter.name}`);
      await recordMetric(adapter.name, performance.now() - start, 'empty', {});
      return;
    }

    const payload = records.map((record) => ({
      exchange: record.exchange,
      pair: record.pair,
      funding_rate: record.fundingRate,
      mark_price: record.markPrice,
      next_funding_time: record.nextFundingTime,
      fetched_at: record.fetchedAt,
    }));

    const { error } = await supabase.from('funding_rates').insert(payload);
    if (error) {
      throw error;
    }

    await recordMetric(adapter.name, performance.now() - start, 'success', {
      count: payload.length,
    });
    console.info(`Inserted ${payload.length} rows for ${adapter.name}`);
  } catch (error) {
    console.error(`Adapter ${adapter.name} failed:`, error.message);
    await recordMetric(adapter.name, performance.now() - start, 'error', {
      message: error.message,
    });
  }
}

async function main() {
  for (const adapter of adapters) {
    await runAdapter(adapter);
  }
  process.exit(0);
}

main();
