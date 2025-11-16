# Funding Intelligence

A 30-day MVP sprint for a Web3 funding rate intelligence hub that pinpoints the best cash-and-carry plays across Binance, Bybit, and OKX. The product focuses on translating raw funding data into capital-aware profit insights, risk grades, and instant alerts while keeping the experience fully read-only until automation features are ready.

## Why This Matters
- Traders and small desks currently rely on spreadsheets + Coinglass-style tables without fee/risk context.
- Funding yields remain one of the few consistent “cash-and-carry” strategies, yet tooling gaps keep retail + boutique desks from scaling it.
- A polished UX that shows “BTC funding 0.126% → $37.80/8h on $10K” plus alerting can command $99–$299/mo before automation exists.

## MVP Scope
1. **Data ingestion**: minute-level fetchers for Binance/Bybit/OKX storing normalized records in Supabase.
2. **Experience**: hero summary, three featured tiles, sortable opportunity list with drawers, always-on profit calculator, onboarding, and trust cues.
3. **Alerts**: email + Telegram composer with threshold logic, quick test button, and per-row quick actions.
4. **Historical context**: heatmap modal/tab with volatility + open interest overlays.
5. **Execution helpers**: checklist modal + “Send to n8n workflow” placeholder for future automation.

Consult `.codex-os/specs/2025-11-15-funding-intelligence-mvp/` for detailed SRD, architecture, and task breakdown.

## Project Structure
```
.codex-os/
  product/        ← mission, roadmap, stack, decisions
  standards/      ← tech + code style guidance for this repo
  specs/          ← dated MVP spec with SRD, tech-spec, tasks
frontend/         ← Next.js 16 app (React 19, Tailwind 4, Vitest)
README.md         ← high-level context + scope
```

## Local Development
```
cd frontend
npm install        # already run once, needed after clean clone
npm run dev        # Next.js dev server on http://localhost:3000
npm run lint       # ESLint (Next config)
npm run test       # Vitest + Testing Library
```
Copy `frontend/.env.example` → `.env.local` and fill Supabase/Resend/Telegram/PostHog/LangGraph keys before wiring APIs.

### Data Fetchers (Task 1 groundwork)
```
cd fetchers
cp .env.example .env
# edit with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm install        # already run once
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run ingest
```
`npm run ingest` hits Binance/Bybit/OKX public endpoints, normalizes BTC/ETH/SOL funding data, inserts rows into `funding_rates`, and logs metrics in Supabase.

If Binance futures is geo-blocked for you (HTTP 451), deploy the Cloudflare Worker under `proxy/binance-worker.js` (or point to the São Paulo VPS proxy) and set `BINANCE_PROXY_URL` + `BINANCE_PROXY_KEY` before running the fetcher so traffic goes through your proxy. The Bybit adapter now supports the same pattern via `BYBIT_PROXY_URL` + `BYBIT_PROXY_KEY`.

Huobi's TLS chain isn't trusted in this environment, so deploy the Worker under `proxy/htx-worker.js` (or reuse the VPS proxy via `/htx`) and set `HTX_PROXY_URL` + `HTX_PROXY_KEY` to make those requests go through Cloudflare (or the VPS) as well.

### Vercel Deployment
The Next.js frontend is linked to the Vercel project `funding-intel` under the `brandontan's projects` team. Deployments consume these environment variables (set for Production/Preview/Development in Vercel):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ezajbjqsrpxiblkgjhws.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_URL` | `https://ezajbjqsrpxiblkgjhws.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |
| `BETA_AUTH_USER` | `beta` |
| `BETA_AUTH_PASS` | `preview-pass-2025` |

Password protection is enforced via middleware, so every route prompts for HTTP Basic Auth using the credentials above. Rotate the password by updating the Vercel env var and redeploying (`cd frontend && vercel deploy --prod --yes`). For new environments, run `vercel link`, then `vercel env pull` / `vercel env add ...` to sync the variables before deploying.

### Alert Worker (Task 5 groundwork)
```
cd fetchers
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
SENDGRID_API_KEY=... SENDGRID_FROM_EMAIL=... ALERT_DEFAULT_EMAIL=... \
TELEGRAM_BOT_TOKEN=... TELEGRAM_DEFAULT_CHAT_ID=... \
npm run alerts
```
The script polls `alerts` for active rules, compares them to `opportunities`, and dispatches email/Telegram notifications (stubbing if credentials are missing). It logs outcomes and updates `alert_events` + `alerts.last_triggered_at`.

## Database setup
- Run the SQL in `supabase/migrations/20251115120000_init.sql` via the Supabase SQL editor or CLI (`supabase db push`) to create enums, tables, triggers, and RLS policies.
- Confirm `user_settings`, `funding_rates`, `opportunities`, `alerts`, and `ingestion_metrics` exist before running fetchers or UI code.

## Next Steps
- Implement Task 1 from the spec: Supabase schema + ingestion fetchers.
- Set up repo tooling (Next.js app, lint config) ahead of UI sprint.
- Secure credentials (Supabase, SendGrid, Telegram bot, PostHog) per stack checklist.
