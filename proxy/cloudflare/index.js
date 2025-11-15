const ALLOWED_PATHS = new Set(['/fapi/v1/premiumIndex']);

export default {
  async fetch(request, env) {
    if (!env.BINANCE_PROXY_KEY) {
      return new Response('Proxy not configured', { status: 500 });
    }

    const provided = request.headers.get('x-proxy-key');
    if (provided !== env.BINANCE_PROXY_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.has(url.pathname)) {
      return new Response('Path not allowed', { status: 403 });
    }

    const upstreamBase = env.BINANCE_UPSTREAM ?? 'https://fapi.binance.com';
    const upstreamUrl = new URL(url.pathname + url.search, upstreamBase);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const headers = new Headers(upstreamRes.headers);
    headers.set('access-control-allow-origin', '*');
    headers.delete('content-security-policy');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers,
    });
  },
};
