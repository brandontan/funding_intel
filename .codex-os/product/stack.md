# Stack & Tooling

| Layer | Choice | Rationale |
| --- | --- | --- |
| Data store | Supabase Postgres | Managed Postgres + auth, quick APIs, supports cron functions + RLS. |
| Data ingestion | Node/TypeScript scripts (deploy via Supabase Edge Functions or n8n) | Easy HTTP fetch of Binance/Bybit/OKX endpoints, can run every minute with retries + logging. |
| API layer | Supabase RPC / Edge Functions | Keep backend minimal, leverage Supabase auth for user-specific settings. |
| Frontend | Next.js 15 + React Server Components + Tailwind | Rapid dashboard iteration, first-class data fetching + SEO for landing page. |
| State & charts | React Query/Zustand + Tremor/Recharts | Supports live funding updates + historical heatmaps. |
| Notifications | SendGrid (email) + Twilio WhatsApp API | Covers email + WhatsApp, extensible to Telegram later. |
| Automation hooks | n8n / Zapier-style webhooks | Allow “Send to automation” button without building custom engine yet. |
| Analytics | PostHog or Supabase analytics | Understand onboarding funnel + retention for beta. |

## Environments
- **Local dev**: Next.js dev server + Supabase local stack.
- **Prod**: Vercel for frontend, Supabase hosted backend, cron jobs either Supabase Scheduled Functions or cloud worker.

## Credentials Checklist
1. Supabase project + service role + anon key.
2. SendGrid + Twilio API keys.
3. Optional: Vercel + PostHog tokens.
