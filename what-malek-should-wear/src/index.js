// What Malek Should Wear — Cloudflare Worker
// Checks tonight's weather in Amman, asks Workers AI for a safe-sleep outfit,
// and generates a cute illustration of it.

const AMMAN = { lat: 31.9539, lon: 35.9106, tz: "Asia/Amman" };
const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const CACHE_SECONDS = 60 * 60; // weather + advice are refreshed hourly

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/outfit") return await outfit(request, env, ctx, url);
      if (url.pathname === "/api/image") return await image(request, env, ctx, url);
    } catch (err) {
      console.error(err);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
    return env.ASSETS.fetch(request);
  },
};

// ---------- /api/outfit ----------

async function outfit(request, env, ctx, url) {
  const fresh = url.searchParams.has("fresh");
  const key = `outfit:${hourKey()}`;
  if (!fresh) {
    const hit = await cacheGet(env, url, key, "json");
    if (hit) return json(hit, 200, { "Cache-Control": "no-store" });
  }

  const weather = await getTonightWeather();
  const plan = baseline(weather.feelsLow);
  const advice = await askAI(env, weather, plan);

  const body = {
    weather,
    tog: plan.tog,
    ...advice,
    imageUrl: `/api/image?k=${encodeURIComponent(plan.key)}`,
    generatedAt: new Date().toISOString(),
  };
  ctx.waitUntil(cachePut(env, url, key, JSON.stringify(body), "application/json", CACHE_SECONDS));
  return json(body, 200, { "Cache-Control": "no-store" });
}

async function getTonightWeather() {
  const api = new URL("https://api.open-meteo.com/v1/forecast");
  api.search = new URLSearchParams({
    latitude: AMMAN.lat,
    longitude: AMMAN.lon,
    timezone: AMMAN.tz,
    current: "temperature_2m,apparent_temperature,weather_code,is_day",
    hourly: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code",
    forecast_days: "2",
  });
  const r = await fetch(api, { cf: { cacheTtl: 900 } });
  if (!r.ok) throw new Error(`Weather API ${r.status}`);
  const d = await r.json();

  // "Tonight" = 7pm → 7am. After midnight (before 7am) we're already inside last night's window.
  const now = d.current.time; // local time, e.g. "2026-10-17T21:15"
  const [date, time] = now.split("T");
  const hour = Number(time.slice(0, 2));
  const start = hour < 7 ? addDays(date, -1) + "T19:00" : date + "T19:00";
  const end = addDays(start.slice(0, 10), 1) + "T07:00";

  const idx = d.hourly.time
    .map((t, i) => [t, i])
    .filter(([t]) => t >= start && t <= end && t >= now.slice(0, 13) + ":00")
    .map(([, i]) => i);
  const pick = (k) => idx.map((i) => d.hourly[k][i]);
  const temps = idx.length ? pick("temperature_2m") : [d.current.temperature_2m];
  const feels = idx.length ? pick("apparent_temperature") : [d.current.apparent_temperature];
  const hum = idx.length ? pick("relative_humidity_2m") : [];
  const codes = idx.length ? pick("weather_code") : [d.current.weather_code];

  return {
    city: "Amman",
    now: round(d.current.temperature_2m),
    feelsNow: round(d.current.apparent_temperature),
    low: round(Math.min(...temps)),
    high: round(Math.max(...temps)),
    feelsLow: round(Math.min(...feels)),
    humidity: hum.length ? Math.round(hum.reduce((a, b) => a + b, 0) / hum.length) : null,
    condition: describeCode(mode(codes)),
    isDay: d.current.is_day === 1,
  };
}

// Rule-based plan following safe-sleep TOG guidance for an infant.
// The AI writes the friendly wording, but this keeps the core advice sane
// (and is the fallback if the AI is unavailable).
// Room temperature is estimated from the outdoor overnight low, since homes
// in Amman are usually warmer than outside at night.
function baseline(outdoorLow) {
  const room = estimateRoom(outdoorLow);
  if (room >= 27) return { key: "hot", tog: 0.2, room,
    items: ["Diaper only or a short-sleeve cotton bodysuit", "0.2 TOG muslin sleep sack (optional)"] };
  if (room >= 24) return { key: "warm", tog: 0.5, room,
    items: ["Short-sleeve cotton bodysuit", "0.5 TOG light sleep sack"] };
  if (room >= 22) return { key: "mild", tog: 1.0, room,
    items: ["Long-sleeve cotton bodysuit", "1.0 TOG sleep sack"] };
  if (room >= 20) return { key: "cool", tog: 1.0, room,
    items: ["Long-sleeve bodysuit", "Cotton footed pajamas", "1.0 TOG sleep sack"] };
  if (room >= 17) return { key: "cold", tog: 2.5, room,
    items: ["Long-sleeve bodysuit", "Footed pajamas", "2.5 TOG sleep sack"] };
  return { key: "freezing", tog: 3.5, room,
    items: ["Long-sleeve bodysuit", "Warm fleece footed pajamas", "Socks", "3.5 TOG sleep sack"] };
}

function estimateRoom(outdoorLow) {
  // Simple, conservative model: indoor rooms stay between ~17°C and ~29°C.
  const est = outdoorLow >= 22 ? outdoorLow + 3 : outdoorLow >= 12 ? 19 + (outdoorLow - 12) * 0.5 : 18;
  return round(Math.min(29, Math.max(17, est)));
}

async function askAI(env, weather, plan) {
  const fallback = {
    headline: titleFor(plan.key),
    outfit: plan.items,
    tip: "Feel the back of Malek's neck — warm and dry is perfect. Sweaty means remove a layer; cool means add one.",
    roomTemp: plan.room,
    source: "rules",
  };
  if (!env.AI) return fallback;

  const system = `You are a warm, practical baby-sleep helper for a mom in Amman, Jordan.
Her son Malek is 4 months old. You recommend what he should wear to sleep tonight.
Follow safe sleep rules strictly: baby sleeps on his back, no loose blankets, no pillows,
no hats or hoods indoors while sleeping, no weighted sleep sacks, avoid overheating.
Use a wearable sleep sack (TOG rated) instead of blankets. Keep it short and sweet.`;

  const user = `Tonight in Amman: outdoor ${weather.low}°C to ${weather.high}°C overnight
(feels like ${weather.feelsLow}°C at coldest), ${weather.condition}, humidity ${weather.humidity ?? "?"}%.
Estimated nursery temperature: about ${plan.room}°C.
Suggested baseline: ${plan.tog.toFixed(1)} TOG — ${plan.items.join(", ")}.
Write a recommendation. The sleep sack MUST be ${plan.tog.toFixed(1)} TOG.
Reply as JSON with:
- "headline": max 6 words, cheerful (e.g. "Cozy sleep sack night")
- "outfit": array of 2-4 short clothing items, each max 7 words
- "tip": one sentence (max 25 words) of practical advice for tonight`;

  try {
    const out = await env.AI.run(TEXT_MODEL, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 300,
      temperature: 0.6,
      response_format: {
        type: "json_schema",
        json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            outfit: { type: "array", items: { type: "string" } },
            tip: { type: "string" },
          },
          required: ["headline", "outfit", "tip"],
        },
      },
    });
    const parsed = typeof out.response === "string" ? JSON.parse(out.response) : out.response;
    if (!parsed?.headline || !Array.isArray(parsed.outfit) || !parsed.outfit.length) return fallback;
    // The TOG rating is the safety-critical part, so never let the AI change it.
    const outfit = parsed.outfit.slice(0, 4).map((s) => String(s).slice(0, 60).replace(/\d+(\.\d+)?\s*TOG/gi, `${plan.tog.toFixed(1)} TOG`));
    if (!outfit.some((s) => /sack|sleep bag/i.test(s))) outfit.splice(3, 1, plan.items[plan.items.length - 1]);
    return {
      headline: String(parsed.headline).slice(0, 60),
      outfit,
      tip: String(parsed.tip || fallback.tip).slice(0, 200),
      roomTemp: plan.room,
      source: "ai",
    };
  } catch (err) {
    console.error("AI text failed", err);
    return fallback;
  }
}

// ---------- /api/image ----------

const IMAGE_PROMPTS = {
  hot: "wearing only a white diaper and a thin short-sleeve white cotton bodysuit",
  warm: "wearing a short-sleeve pastel cotton bodysuit inside a very light thin muslin sleep sack",
  mild: "wearing a long-sleeve pastel cotton bodysuit inside a light cotton sleep sack",
  cool: "wearing soft cotton footed pajamas inside a cotton sleep sack",
  cold: "wearing cozy footed pajamas inside a thick quilted padded sleep sack",
  freezing: "wearing warm fleece footed pajamas and little socks inside a thick puffy quilted sleep sack",
};

async function image(request, env, ctx, url) {
  const key = IMAGE_PROMPTS[url.searchParams.get("k")] ? url.searchParams.get("k") : "mild";
  // One illustration per outfit type per day keeps it fresh but cheap.
  const cacheKey = `image:${key}:${localDate()}`;
  const hit = await cacheGet(env, url, cacheKey, "arrayBuffer");
  if (hit) return imageResponse(hit);

  if (!env.AI) return env.ASSETS.fetch(new Request(`${url.origin}/fallback-baby.svg`));

  try {
    const prompt = `Adorable soft watercolor children's book illustration of a happy chubby 4 month old baby boy
${IMAGE_PROMPTS[key]}, lying on his back peacefully, gentle smile, soft pastel colors, cream background,
cute moon and stars, warm cozy nursery mood, minimalist, centered, no text, no blanket, no pillow`;
    const out = await env.AI.run(IMAGE_MODEL, { prompt, steps: 6 });
    const bytes = Uint8Array.from(atob(out.image), (c) => c.charCodeAt(0));
    ctx.waitUntil(cachePut(env, url, cacheKey, bytes, "image/jpeg", 60 * 60 * 26));
    return imageResponse(bytes);
  } catch (err) {
    console.error("AI image failed", err);
    return env.ASSETS.fetch(new Request(`${url.origin}/fallback-baby.svg`));
  }
}

// ---------- helpers ----------

const imageResponse = (bytes) =>
  new Response(bytes, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" } });

// Uses the KV namespace when bound (works everywhere, including *.workers.dev),
// otherwise the edge Cache API (only effective on a custom domain).
async function cacheGet(env, url, key, type) {
  if (env.CACHE) return env.CACHE.get(key, type);
  const hit = await caches.default.match(new Request(`${url.origin}/__cache/${key}`));
  return hit ? (type === "json" ? hit.json() : hit.arrayBuffer()) : null;
}

async function cachePut(env, url, key, value, contentType, ttl) {
  if (env.CACHE) return env.CACHE.put(key, value, { expirationTtl: Math.max(60, ttl) });
  return caches.default.put(
    new Request(`${url.origin}/__cache/${key}`),
    new Response(value, { headers: { "Content-Type": contentType, "Cache-Control": `public, max-age=${ttl}` } }),
  );
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function localParts() {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: AMMAN.tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  });
  return Object.fromEntries(f.formatToParts(new Date()).map((p) => [p.type, p.value]));
}
const localDate = () => { const p = localParts(); return `${p.year}-${p.month}-${p.day}`; };
const hourKey = () => `${localDate()}T${localParts().hour}`;

function addDays(isoDate, n) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const round = (n) => Math.round(n);

function mode(arr) {
  const counts = {};
  let best = arr[0];
  for (const v of arr) if ((counts[v] = (counts[v] || 0) + 1) > (counts[best] || 0)) best = v;
  return best;
}

function describeCode(c) {
  if (c === 0) return "clear skies";
  if (c <= 2) return "partly cloudy";
  if (c === 3) return "cloudy";
  if (c <= 48) return "foggy";
  if (c <= 57) return "drizzle";
  if (c <= 67) return "rain";
  if (c <= 77) return "snow";
  if (c <= 82) return "rain showers";
  if (c <= 86) return "snow showers";
  return "thunderstorms";
}

function titleFor(key) {
  return {
    hot: "Keep it super light tonight",
    warm: "Light and breezy night",
    mild: "Comfy cotton night",
    cool: "Snug pajama night",
    cold: "Cozy sleep sack night",
    freezing: "Extra warm and snuggly",
  }[key];
}
