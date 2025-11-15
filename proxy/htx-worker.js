const ALLOWED_PATHS = new Set([
  '/linear-swap-api/v1/swap_funding_rate',
  '/market/detail/merged',
]);

export default {
  async fetch(request, env) {
    if (!env.HTX_PROXY_KEY) {
      return new Response('Proxy not configured', { status: 500 });
    }

    const provided = request.headers.get('x-proxy-key');
    if (provided !== env.HTX_PROXY_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.has(url.pathname)) {
      return new Response('Path not allowed', { status: 403 });
    }

    const upstreamBase = env.HTX_UPSTREAM ?? 'https://api.hbdm.com';
    const upstreamUrl = new URL(url.pathname + url.search, upstreamBase);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FundingIntelProxy/0.1',
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
