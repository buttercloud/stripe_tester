# What Malek Should Wear 🌙

A one-button web app: tap it at bedtime and it checks **tonight's weather in Amman**,
asks **Cloudflare Workers AI** what our 4-month-old should sleep in, and shows
an AI-drawn illustration of the outfit.

- **Weather:** [Open-Meteo](https://open-meteo.com) (free, no API key), looks at the 7pm–7am window.
- **Advice:** a rule-based safe-sleep baseline (TOG chart, nursery temperature estimated from the
  outdoor low), worded by `llama-3.3-70b` on Workers AI. The TOG rating always comes from the rules, so
  the AI can't change it. If the AI is down, the rules alone answer.
- **Image:** `flux-1-schnell` on Workers AI, one picture per outfit type per day (cached).
- **Hosting:** a single Cloudflare Worker with static assets. No build step.

## Deploy

```bash
cd what-malek-should-wear
npm install
npx wrangler login
npx wrangler deploy
```

Recommended (caching on `*.workers.dev`, which keeps AI usage tiny):

```bash
npx wrangler kv namespace create CACHE
# paste the returned id into wrangler.jsonc → "kv_namespaces"
npx wrangler deploy
```

Workers AI usage for one person checking once a night fits easily inside the free daily allowance.

## Add to iPhone Home Screen

Open the URL in **Safari** → Share → **Add to Home Screen**. It opens full-screen with its own icon.

## Local dev

```bash
npx wrangler dev   # the AI binding calls the real Workers AI (needs login)
```
