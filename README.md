# Script Studio — Nuclear Association

A lightweight, browser-based script writing tool powered by Claude AI. No build step. No dependencies. One HTML file + one Worker file.

---

## How it works

```
User (GitHub Pages) → Cloudflare Worker (holds API key) → Anthropic API
```

The frontend is a static HTML file hosted on GitHub Pages. It never touches the API key. All API calls go through a Cloudflare Worker you deploy once, which holds your key as a secret.

---

## Setup — 5 minutes

### Step 1: Deploy the Cloudflare Worker

1. Go to [dash.cloudflare.com/workers](https://dash.cloudflare.com/workers)
2. Click **Create Worker**
3. Paste the contents of `worker/index.js` into the editor
4. Click **Deploy**
5. Note your Worker URL — it looks like `https://script-studio-api.yourname.workers.dev`

### Step 2: Add your API key as a secret

In your Worker dashboard:
1. Go to **Settings → Variables**
2. Under **Secret Variables**, click **Add secret**
3. Name: `ANTHROPIC_API_KEY`
4. Value: your key from [console.anthropic.com](https://console.anthropic.com)
5. Click **Save**

*(Alternatively, via CLI: `wrangler secret put ANTHROPIC_API_KEY`)*

### Step 3: Enable GitHub Pages

1. Push this repo to GitHub
2. Go to your repo **Settings → Pages**
3. Source: **Deploy from branch** → `main` → `/ (root)`
4. Save — your tool will be live at `https://yourusername.github.io/your-repo-name`

### Step 4: Connect the tool

When anyone opens the tool for the first time, a banner appears asking for the Worker URL. They paste it in, click Save — it's stored in their browser's localStorage and never shared.

If you want to pre-configure the URL for your team, edit `index.html` and change this line:

```js
let workerUrl = localStorage.getItem(STORAGE_KEY) || '';
```

to:

```js
let workerUrl = localStorage.getItem(STORAGE_KEY) || 'https://your-worker-url.workers.dev';
```

This means anyone with the link can use it immediately without any setup.

---

## File structure

```
/
├── index.html          ← The entire frontend (deploy to GitHub Pages)
└── worker/
    ├── index.js        ← Cloudflare Worker (deploy to Cloudflare)
    └── wrangler.toml   ← Worker config (optional, for CLI deployment)
```

---

## Formats supported

| Format | Use for |
|---|---|
| Narrative Documentary | Events, accidents, milestones |
| Explainer | Concepts, processes, technology |
| Interview | Expert guests, Q&A framing |
| News Response | Breaking news, policy announcements |
| Event Highlights | Conferences, summits |
| What to Expect | Previews, upcoming events |
| Topic 101 | Foundational subjects, wide public audience |

---

## Cost

Cloudflare Workers free tier: 100,000 requests/day — more than enough.  
Anthropic API: pay-per-use. A typical script generation costs ~$0.01–0.03 depending on length.

---

## Security

- Your API key is stored as a Cloudflare Worker secret — it never appears in any frontend code
- The Worker only accepts POST requests to `/api/generate`
- CORS is open (`*`) by default — tighten this in `worker/index.js` if you want to restrict to your GitHub Pages domain:

```js
'Access-Control-Allow-Origin': 'https://yourusername.github.io',
```
