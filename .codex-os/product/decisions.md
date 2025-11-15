# Decisions Log

## 2025-11-15 – MVP Focus on Read-Only Intelligence
- **Context**: Users need fast insight, but automation introduces compliance + security scope.
- **Decision**: Keep MVP strictly read-only + alerting; postpone auto-execution until we validate willingness to pay.
- **Implication**: Architecture keeps connectors modular for future automation, but UI copy emphasizes monitoring + ROI proof.

## 2025-11-15 – Supabase + Next.js Stack
- **Context**: Need to iterate within 30 days with minimal DevOps.
- **Decision**: Use Supabase for storage/auth/cron and Next.js for dashboards.
- **Implication**: Avoids spinning up custom infra; ensures RLS + row-level preferences easier to implement.

## 2025-11-15 – Alerts via Email + WhatsApp First
- **Context**: WhatsApp is the fastest path to meaningful trader notifications, email is baseline.
- **Decision**: Build Twilio WhatsApp + SendGrid integration during MVP; Telegram/Discord later.
- **Implication**: Need compliance copy + opt-in flows now; future channels plug into same alert engine.
