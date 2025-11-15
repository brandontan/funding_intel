# 30-Day MVP Roadmap

### Week 1 – Data Foundation
- Provision Supabase (users, funding_rates, opportunities, alerts tables).
- Stand up fetchers (Node or n8n) hitting Binance/Bybit/OKX public endpoints; schedule cron + retries.
- Build temporary JSON/console dashboard for sanity checks, add API health logging.

### Week 2 – Core Experience Skeleton
- Scaffold Next.js dashboard with hero card, three-tile overview, opportunity table stub.
- Implement profit calculator widget (capital + leverage inputs, persistent per user).
- Wire Supabase API (RLS-safe) → UI via tRPC/REST; include caching.
- Add onboarding flow to capture capital + preferred exchanges.

### Week 3 – Risk + Alerts + Historical Context
- Compute risk score (volatility stddev, exchange trust weight, persistence) nightly job.
- Add alert composer UI + backend (sendgrid/email + Twilio/WhatsApp MVP) with threshold logic.
- Render historical mini charts + trailing heatmap (24h/7d) per instrument using stored rates.

### Week 4 – Polish + Beta Push
- Implement drawer details, trust cues (latency, fee deductions, last updated badges).
- Add execution checklist modal and “Send to n8n workflow” placeholder.
- Mobile optimizations (stacked cards, floating alert button).
- Instrument analytics, recruit/ onboard 10 beta testers, close 3 preorders.

### Post-MVP Backlog
- Auto-execution workflows (ccxt + optional hedging automation).
- Additional exchanges + DeFi perps.
- Paid tiers with SLA’d data + analytics add-ons.
