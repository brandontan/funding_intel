# TypeScript Style Guide

- Enable `"strict": true` and `"moduleResolution": "bundler"` in `tsconfig`.
- Re-export shared types from `@/types` barrel to avoid deep imports.
- Use discriminated unions for risk grades + alert channels.
- Keep async fetchers idempotent; encapsulate exchange adapters in `/lib/exchanges/<name>.ts` and return normalized shape `{ pair, exchange, fundingRate, markPrice, timestamp }`.
