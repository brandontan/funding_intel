# Code Style (Global)

1. **TypeScript/JavaScript**
   - Use modern ES modules + TypeScript strict mode.
   - Prefer functional React components with hooks; server components for data fetching when possible.
   - Lint via `eslint-config-next` + `@typescript-eslint`.
2. **Styling**
   - Tailwind for layout + tokens; extracted components for repeated tiles.
3. **Naming**
   - Descriptive React component names, e.g., `FundingOpportunityDrawer`.
4. **Data Fetching**
   - Centralize Supabase queries in `/lib/data/` helpers; handle errors + stale data timestamps.
5. **Docs**
   - Use Markdown with sentence-case headings, wrap lines at ~100 chars when feasible.
