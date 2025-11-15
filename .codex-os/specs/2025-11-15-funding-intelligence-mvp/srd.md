# SRD – Funding Intelligence MVP

## Problem
Crypto traders chase perpetual funding yield but current tools (Coinglass, generic dashboards) only expose raw rates. Users patch spreadsheets, lack fee/risk context, and cannot set proactive alerts tied to their actual capital. They want trustworthy signals within minutes, not custom scripts.

## Goals
1. Aggregate Binance/Bybit/OKX funding data, normalize, and highlight the best net opportunities.
2. Display capital-aware hero stats, trio overview tiles (BTC/ETH/SOL default), and sortable table with drawers.
3. Provide persistent profit calculator + alert composer (email + Telegram) with trust cues and onboarding.

## Non-Goals
- Automated trade execution.
- Portfolio tracking beyond capital defaults.
- Covering every exchange or DeFi perp (only top 3 in MVP).

## Users & Personas
- **Semi-pro hedger**: hedges books weekly; needs at-a-glance profit figure + quick alert button.
- **Small prop desk lead**: needs persistence confidence + ability to share snapshot to teammates (Telegram).
- **DAO treasurer**: monitors funding vs volatility, values historical heatmap before deploying idle capital.

## Success Metrics
- 10 beta testers log in weekly.
- 3 prepaid subscriptions ($99–$299/mo).
- Alerts delivered under 60s median latency.

## Experience Notes
- Hero text example: “BTC funding `0.126%` → `$37.80 / 8h` on `$10K`, `84% APY` if sustained.” plus `Open Strategy` CTA.
- Drawer must show: persistence mini-chart, fees, hedging steps, quick action buttons.
- Profit calculator (slide-out) is always visible; settings stored per user.
- Onboarding: select default capital → choose exchanges → connect alert channel.
- Historical heatmap accessible via tab/modal; overlays for volatility + open interest.
- Execution checklist modal explains manual workflow + “Send to n8n workflow” placeholder.
## Constraints
- Keep UI read-only until automation opt-in exists.
- All data and alerts must cite last updated timestamp and API health indicator.
