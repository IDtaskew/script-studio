/**
 * Script Studio — Cloudflare Worker
 * Proxies requests to the Anthropic API.
 * Deploy via: https://dash.cloudflare.com/workers
 *
 * Set your secret in the Cloudflare dashboard:
 *   Workers → Your Worker → Settings → Variables → Add secret
 *   Name: ANTHROPIC_API_KEY   Value: sk-ant-...
 */

export default {
  async fetch(request, env) {

    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // ── Only accept POST to /api/generate ──
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api/generate') {
      return new Response('Not found', { status: 404 });
    }

    // ── Parse body ──
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { system, messages, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return json({ error: 'messages array required' }, 400);
    }

    // ── Call Anthropic ──
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 4000,
        system: system || '',
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return json({ error: data.error?.message || 'Anthropic API error', status: anthropicRes.status }, anthropicRes.status);
    }

    return json(data);
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
