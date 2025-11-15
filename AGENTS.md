# Repository Guidelines

## Start Here
1. Read `.codex-os/product/mission.md` for vision, then scan `.codex-os/specs/2025-11-15-funding-intelligence-mvp/` (SRD, tech spec, tasks).
2. Run `npm install && npm run dev` to verify the Next.js skeleton once it exists; today focus on spec + setup.
3. Log progress in `HANDOFF-YYYY-MM-DD.md` before ending your session.

## Project Structure & Module Organization
Use `.codex-os/` for product context, standards, and the dated MVP spec (`.codex-os/specs/2025-11-15-funding-intelligence-mvp/`). The application code will live under `app/` (Next.js 15) with shared helpers in `lib/`, UI components in `components/`, and hooks in `hooks/`. Keep Supabase adapters inside `lib/data/` and exchange fetchers in `lib/exchanges/`. Tests belong in `__tests__/` mirroring source paths, and public assets live in `public/`.

## Build, Test, and Development Commands
- `npm install` – install Node dependencies (Next.js, Supabase client, chart libs).
- `npm run dev` – launch the Next.js dev server with hot reload for UI work.
- `npm run test` – execute Vitest/Jest suites (risk scoring, alert logic, API helpers).
- `npm run lint` – run ESLint + TypeScript checks; required before commits.
When adding Supabase scripts, document their `package.json` entries (e.g., `npm run fetch:binance`).

## Coding Style & Naming Conventions
Adhere to `.codex-os/standards/code-style.md` and language guides. Use TypeScript strict mode, 2-space indentation, and descriptive React component names (`FundingOpportunityDrawer`). Tailwind powers layout; abstract repeated styles into components. Normalize exchange payloads to `{ exchange, pair, fundingRate, markPrice, timestamp }`. Keep Markdown docs sentence case with wrapped lines around 100 chars.

## Testing Guidelines
Use Vitest/Jest for logic layers and Playwright or React Testing Library for UI snapshots sparingly. Mirror file names (`fundingRisk.test.ts`) and group fixtures under `__tests__/fixtures/`. Cover risk scoring math, alert triggering, Supabase adapters, and onboarding flows; aim for 80%+ statement coverage before release. Run `npm run test -- --watch` while iterating.

## Commit & Pull Request Guidelines
Follow `<area>: <what/why> (spec <id> / task <n>)` messages, e.g., `alerts: add WhatsApp channel (spec 2025-11-15 task 5)`. Keep commits small and reference the spec tasks. PRs should link to relevant spec sections, describe implementation + tests, attach screenshots for UI work, and note any schema changes or new env vars. Document architectural shifts in `.codex-os/product/decisions.md` before requesting review.

## Security & Configuration Tips
Keep the repo read-only regarding exchanges: no API keys stored until automation work begins. Use environment variables (`.env.local`) for Supabase, SendGrid, Twilio, PostHog; never commit secrets. Surface API health metrics in both Supabase logging and UI trust cues per the spec.
