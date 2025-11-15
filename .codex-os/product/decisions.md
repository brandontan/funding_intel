# Decisions Log

## 2025-11-15 – MVP Focus on Read-Only Intelligence
- **Context**: Users need fast insight, but automation introduces compliance + security scope.
- **Decision**: Keep MVP strictly read-only + alerting; postpone auto-execution until we validate willingness to pay.
- **Implication**: Architecture keeps connectors modular for future automation, but UI copy emphasizes monitoring + ROI proof.

## 2025-11-15 – Supabase + Next.js Stack
- **Context**: Need to iterate within 30 days with minimal DevOps.
- **Decision**: Use Supabase for storage/auth/cron and Next.js for dashboards.
- **Implication**: Avoids spinning up custom infra; ensures RLS + row-level preferences easier to implement.

## 2025-11-15 – Alerts via Email + Telegram First
- **Context**: Telegram is the most requested channel from beta desks, email remains baseline.
- **Decision**: Focus alert engine on SendGrid email + Telegram bot delivery during MVP; defer WhatsApp until compliance + template work is worth it.
- **Implication**: UX copy, onboarding defaults, and backend workers only expose email + Telegram (skip option supported) while keeping architecture extensible for future channels.

## 2025-11-15 – Cookie IDs for Onboarding Defaults
- **Context**: We need to store trader defaults before Supabase Auth is wired up, but Task 3 requires persisted settings.
- **Decision**: Drop the `auth.users` FK on `user_settings`, use service-role Supabase APIs plus a secure `fi_user_id` cookie to read/write rows, and allow alert channels to be empty (skip option).
- **Implication**: Frontend can personalize hero/tiles/calculator immediately; once auth lands we can migrate by mapping cookie IDs to real users.
