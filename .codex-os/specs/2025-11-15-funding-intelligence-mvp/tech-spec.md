# Tech Spec – Funding Intelligence MVP

## Architecture Overview
```
Exchange APIs (Binance / Bybit / OKX)
        ↓ normalized fetchers (Node Edge Functions / n8n)
 Supabase Postgres (funding_rates, opportunities, alerts, users)
        ↓
 Next.js (Vercel) dashboard + onboarding + alerts composer
        ↓
 Alert workers (Edge Function) → SendGrid email / Twilio WhatsApp
```

### Data Flow
1. **Fetchers** run every minute: call each exchange endpoint, normalize to `{ exchange, pair, fundingRate, markPrice, nextFundingAt }`.
2. **Storage**: insert into `funding_rates`, dedupe by `exchange+pair+timestamp`.
3. **Opportunity builder** (scheduled) calculates: estimated 8h/24h profit, APY, persistence (rolling stddev), risk grade (A/B/C) saved in `opportunities`.
4. **Frontend** queries `opportunities_view` (materialized) for hero, tiles, table, and historical heatmap.
5. **Profit calculator** uses user defaults (`users_settings`) to produce per-opportunity profit displayed inline.
6. **Alerts**: user-defined rules saved to `alerts`. When funding crosses threshold, trigger `alert_dispatch` job, queue message to SendGrid or Twilio.

### Data Model (draft)
- `users`: Supabase auth.
- `user_settings`: `capital_default`, `leverage`, `exchanges[]`, `alert_channels`.
- `funding_rates`: `id`, `exchange`, `pair`, `funding_rate`, `mark_price`, `next_funding_time`, `fetched_at`.
- `opportunities`: `id`, `pair`, `exchange`, `current_funding_rate`, `persistence_score`, `risk_grade`, `net_rate_after_fees`, `spread_vs_spot`, `capital_required`, `updated_at`.
- `alerts`: `id`, `user_id`, `pair`, `exchange`, `threshold_rate`, `channel`, `status`, `last_triggered_at`.
- `metrics`: store API latency + success.

### APIs / Modules
- `/api/opportunities` → returns hero + table data (SSR/ISR).
- `/api/user-settings` → GET/PUT; stores capital/exchanges/leverage.
- `/api/alerts` → CRUD + test send.
- `/api/metrics` → exposes trust cues (last updated, health) for UI badges.

### Risk Scoring
`risk_grade = weighted_score(volatility, exchange_trust, persistence)`.
- Volatility: stddev of funding last 24h.
- Exchange trust: static weight (Binance = 0.9, Bybit 0.8, OKX 0.75) adjustable.
- Persistence: share of periods where funding sign remained positive.
Grades: `A >= 0.8`, `B >= 0.55`, else `C` (render color-coded + label).

### Alert Channels
- **Email**: SendGrid dynamic template with hero stats + CTA.
- **WhatsApp**: Twilio template “Funding Alert: {pair} on {exchange} now {rate}% → {profit}/8h on ${capital}. Link.”

### Security & Compliance
- No private exchange keys stored. Onboarding clarifies read-only nature.
- Supabase RLS ensures user-specific settings/alerts.
- Add rate limiting to alert composer to avoid abuse.

### Analytics & Logging
- Supabase `logs` table captures fetch failures, alert send results.
- PostHog events for onboarding completion, hero CTA usage, alert toggles.

### Deployment
- Vercel for Next.js; environment variables for Supabase + SendGrid + Twilio + PostHog.
- Supabase scheduled functions for ingestion + derived opportunity jobs.
- n8n optional for automation share-out; Execution checklist button posts to n8n webhook stub.
