# Tasks – Funding Intelligence MVP

## Task 1 – Supabase Schema & Fetcher Skeleton
- Create tables: `funding_rates`, `opportunities`, `user_settings`, `alerts`, `metrics` with indices + RLS.
- Implement Node/TypeScript fetchers (per exchange) that normalize responses and insert rows (cron-ready).
- Add logging + health metrics endpoints.
- **Acceptance**: manual run populates rows for BTC/ETH/SOL from all three exchanges with timestamps and no duplicates.

## Task 2 – Next.js Dashboard Skeleton
- Initialize Next.js 15 app with Tailwind + eslint config.
- Build hero summary component, three overview tiles, opportunity table stub, profit calculator widget (state only), trust badges.
- Connect to Supabase (client + server) to fetch mock data.
- **Acceptance**: page renders hero + tiles + table with data from Supabase (or seed), profit calculator updates numbers live.

## Task 3 – User Settings & Onboarding
- Create onboarding flow capturing default capital, leverage, preferred exchanges, alert channel.
- Persist to `user_settings`; show skip option for alerts.
- Ensure profit calculator + tiles use stored defaults.
- **Acceptance**: new user can finish onboarding in <2 mins, returning user sees stored preferences.

## Task 4 – Risk Scoring & Drawer Details
- Implement opportunity scoring job deriving risk grade from volatility/persistence/exchange trust.
- Build side drawer component showing persistence chart, fee breakdown, hedging steps, quick action buttons (alert, copy order, send to WhatsApp share stub).
- **Acceptance**: table rows open drawers with fully populated info; risk badge updates based on derived grade.

## Task 5 – Alerts Engine (Email + WhatsApp)
- CRUD UI for alerts with thresholds, exchange/pair filters, channel selection, and “test notification”.
- Backend worker polls for triggered rules and sends via SendGrid/Twilio; store results + last triggered time.
- Include alert composer slide-out accessible anywhere.
- **Acceptance**: rule fires when funding exceeds threshold, logs delivery status, and user receives sample email/WhatsApp (test mode acceptable).

## Task 6 – Historical Dashboard & Heatmap
- Store trailing 24h/7d funding series per pair; build heatmap tab or modal with overlays for volatility + open interest.
- Ensure mobile-friendly view with swipe cards + floating alert button.
- **Acceptance**: users can toggle heatmap timeframe and overlay metrics; layout degrades gracefully on mobile.

## Task 7 – Execution Checklist & Automation Hooks
- Modal listing manual steps (connect API, confirm margin, place spot/perp) with completion checklist.
- “Send to n8n workflow” CTA posts to placeholder webhook with opportunity payload.
- **Acceptance**: user can open checklist from hero/table, mark steps, and see confirmation when webhook receives payload.

## Task 8 – Beta Launch + Instrumentation
- Add analytics events (onboarding completion, alerts created, drawer opened) via PostHog.
- Implement ROI banner (“Paid $299 → Earned $X last week”) once user logs sample profits.
- Draft simple landing/sales page section capturing beta signups + value prop.
- **Acceptance**: analytics capturing key funnels, landing page live with CTA, ROI banner updates once sample profits exist.
