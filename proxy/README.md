# Binance Proxy (Cloudflare Worker example)

Binance blocks futures API calls from restricted regions (HTTP 451). Deploy this worker so fetchers can hit a compliant endpoint.

## Setup
1. `wrangler init binance-proxy` (or use Cloudflare dashboard → Workers → Create).
2. Replace the generated worker with `binance-worker.js`.
3. Set environment variables:
   - `BINANCE_PROXY_KEY` – shared secret required in the `x-proxy-key` header.
   - `BINANCE_UPSTREAM` (optional) – override upstream base URL (defaults to `https://fapi.binance.com`).
4. Deploy: `npx wrangler deploy binance-worker.js`.

## Using in fetchers
Set these env vars before running `npm run ingest`:
```
export BINANCE_PROXY_URL="https://your-worker.youraccount.workers.dev"
export BINANCE_PROXY_KEY="same-secret-you-set"
```
The fetcher will send `GET {BINANCE_PROXY_URL}/fapi/v1/premiumIndex` with the required header. Only the premium index endpoint is proxied; expand `ALLOWED_PATHS` in the worker if you need more Binance endpoints.
