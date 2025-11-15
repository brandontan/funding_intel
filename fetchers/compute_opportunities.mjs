import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const EXCHANGE_TRUST = {
  binance: 0.9,
  bybit: 0.8,
  okx: 0.75,
};

function calculateRisk(volatilityScore, persistenceScore, exchangeTrust) {
  const score = (persistenceScore * 0.4) + ((1 - volatilityScore) * 0.4) + (exchangeTrust * 0.2);
  if (score >= 0.8) return 'A';
  if (score >= 0.55) return 'B';
  return 'C';
}

async function compute() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: rates, error } = await supabase
    .from('funding_rates')
    .select('*')
    .gte('fetched_at', since);

  if (error) {
    console.error('Failed to load funding rates', error.message);
    process.exit(1);
  }

  const grouped = rates.reduce((acc, row) => {
    const key = `${row.exchange}:${row.pair}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(row);
    return acc;
  }, {});

  const rows = Object.entries(grouped).map(([key, entries]) => {
    const [exchange, pair] = key.split(':');
    const fundingRate = entries[entries.length - 1].funding_rate;
    const netRateAfterFees = fundingRate * 0.95;
    const values = entries.map((e) => e.funding_rate);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    const volatilityScore = Math.min(Math.sqrt(variance) * 50, 1);
    const positive = values.filter((v) => v > 0).length / values.length;
    const persistenceScore = positive;
    const exchangeTrust = EXCHANGE_TRUST[exchange] ?? 0.7;
    const risk = calculateRisk(volatilityScore, persistenceScore, exchangeTrust);
    return {
      exchange,
      pair,
      current_funding_rate: fundingRate,
      net_rate_after_fees: netRateAfterFees,
      persistence_score: Number(persistenceScore.toFixed(4)),
      volatility_score: Number(volatilityScore.toFixed(4)),
      exchange_trust: exchangeTrust,
      risk,
      spread_vs_spot: null,
      capital_required: null,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length === 0) {
    console.info('No opportunity rows computed');
    return;
  }

  const { error: upsertError } = await supabase.from('opportunities').upsert(rows, {
    onConflict: 'exchange,pair',
  });

  if (upsertError) {
    console.error('Failed to upsert opportunities', upsertError.message);
    process.exit(1);
  }

  console.info(`Upserted ${rows.length} opportunities`);
}

compute();
