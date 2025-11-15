# Repository Guidelines

## Start Here
1. Read `.codex-os/product/mission.md`, then the active spec in `.codex-os/specs/2025-11-15-funding-intelligence-mvp/`.
2. Sync status with `HANDOFF-2025-11-15.md` and the Memory MCP note `mcp://memory/funding-intel/2025-11-15`. Update both before logging off.
3. Follow `.codex-os/standards/*` for stack, code-style, and best-practice guardrails before touching code.

## Project Structure & Module Organization
`frontend/` contains the Next.js 16 app (app router, components, lib, hooks). `fetchers/` hosts the Node ingestion runner plus exchange adapters, while `supabase/` holds migrations and type-safe SQL. Cloudflare worker proxies live in `proxy/`. Product context sits in `.codex-os/`; daily coordination happens in `HANDOFF-YYYY-MM-DD.md`. Keep new assets in `frontend/public/` and colocate tests under `__tests__` mirrors.

## Build, Test, and Development Commands
- `cd frontend && npm install` once, then `npm run dev` for UI work, `npm run build && npm run start` to confirm production output, `npm run lint`, and `npm run test` (Vitest + RTL).
- `cd fetchers && npm install && npm run ingest` loads multi-exchange funding data into Supabase (requires `.env` with Supabase + proxy secrets).
- `supabase db push` applies schema changes; `supabase gen types typescript --project-id <ref>` refreshes types when tables change.

## Coding Style & Naming Conventions
TypeScript strict mode, 2-space indentation, and Tailwind utility-first styling per `.codex-os/standards/code-style.md`. Name React components after intent (`FundingHero`, `OpportunityDrawer`). Shared data contracts follow `{exchange, pair, fundingRate, markPrice, spreadBps, collectedAt}`. Keep files snake-case inside fetchers (`bybit-client.mjs`) and kebab-case routes under Next.js. Document non-obvious logic with concise comments.

## Testing Guidelines
Favor small Vitest units for profit math, risk scoring, and alert rules. Use Testing Library for onboarding and drawer behaviors; mock Supabase via generated types. Fetchers require fixture-driven tests that stub exchange payloads plus a live “smoke” run before release. Target 80% statement coverage and include regression tests for every spec task touching alerting, pricing, or onboarding flows.

## Commit & Pull Request Guidelines
Message format: `<area>: <change> (spec 2025-11-15 task X)`. Reference Supabase migration IDs or proxy changes inside the body, list commands run, and attach screenshots for UI. PRs must cite spec sections, describe QA (tests + manual ingestion run), and update `.codex-os/product/decisions.md` when architecture or data contracts move. Keep commits atomic and never mix schema + UI without explanation.

## Security & Configuration Tips
No secrets in git: rely on `.env.local`, `.env.fetchers`, and Supabase config for anon/service keys plus proxy tokens (`BINANCE_PROXY_URL`, etc.). When touching ingestion, log rate-limit metadata and validation checks so we can justify the $99/mo pitch with trustworthy data. Mention new env vars in README and verify Auditor scans before merging.
