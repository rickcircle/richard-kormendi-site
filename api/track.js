// Vercel serverless — egy látogatói esemény (pageview / section_view / click) mentése Redisbe
// Env var: REDIS_URL — a Vercel "Storage" fülön létrehozott Redis Cloud adatbázis
// automatikusan beállítja, nem kell kézzel megadni.
//
// Ország/város: a Vercel edge hálózata automatikusan hozzáadja ezeket a fejléceket
// (x-vercel-ip-country / -city), nem kell hozzá külön szolgáltatás vagy nyers IP-t tárolni.

import { createClient } from "redis";

const KNOWN_SOURCES = [
  { match: /google\./,        label: "Google keresés" },
  { match: /bing\./,          label: "Bing keresés" },
  { match: /duckduckgo\./,    label: "DuckDuckGo keresés" },
  { match: /instagram\./,     label: "Instagram" },
  { match: /facebook\.|fb\./, label: "Facebook" },
  { match: /youtu\.?be/,      label: "YouTube" },
  { match: /spotify\./,       label: "Spotify" },
  { match: /music\.apple\./,  label: "Apple Music" },
  { match: /tidal\./,         label: "Tidal" },
  { match: /tiktok\./,        label: "TikTok" },
  { match: /twitter\.|x\.com/, label: "X (Twitter)" },
  { match: /linkedin\./,      label: "LinkedIn" },
];

function classifyReferrer(referrer) {
  if (!referrer) return "Közvetlen / ismeretlen";
  try {
    const host = new URL(referrer).hostname;
    const found = KNOWN_SOURCES.find(s => s.match.test(host));
    return found ? found.label : host;
  } catch {
    return "Közvetlen / ismeretlen";
  }
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Budapest" }); // YYYY-MM-DD
}

// Egyetlen folyamatos lista (nem naponta külön kulcs) — így a digest pontosan az
// előző email óta eltelt időszakot tudja kiszűrni, dátumhatártól függetlenül.
const EVENTS_KEY = "rk:events";

let clientPromise;
function getRedis() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", err => console.error("Redis kliens hiba:", err.message));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

// Visszatérő látogató: az első alkalommal rögzítjük a visitorId-t egy tartós Redis hash-ben.
// Ha már szerepel benne (akár ma korábban, akár egy előző napon), visszatérőnek számít.
async function checkReturning(client, visitorId) {
  if (!visitorId) return false;
  const key = "rk:visitors:first_seen";
  const existing = await client.hGet(key, visitorId);
  if (existing) return true;
  await client.hSet(key, visitorId, todayStr());
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).end();
  }

  const { type, path, referrer, sessionId, visitorId, device, lang, utm, ts, section, label } = body || {};
  if (!type || !sessionId) return res.status(400).end();

  const country = req.headers["x-vercel-ip-country"] || null;
  const cityRaw = req.headers["x-vercel-ip-city"];
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;

  try {
    const client = await getRedis();

    const isReturning = type === "pageview" ? await checkReturning(client, visitorId) : null;

    const event = {
      type,
      path: path || "/",
      section: section || null,
      label: label || null,
      source: classifyReferrer(referrer),
      country,
      city,
      device: device || null,
      lang: lang || null,
      utmSource: utm?.source || null,
      sessionId,
      visitorId: visitorId || null,
      isReturning,
      ts: ts || Date.now(),
    };

    await client.rPush(EVENTS_KEY, JSON.stringify(event));
    await client.expire(EVENTS_KEY, 60 * 60 * 24 * 30); // biztonsági háló, minden új eseménnyel újraindul — gyakorlatilag sosem jár le, amíg van forgalom

    // Örökké növekvő, soha nem törlődő összesítő (nincs rajta lejárat)
    if (type === "pageview") await client.incr("rk:totals:pageviews");

    return res.status(204).end();
  } catch (err) {
    console.error("track hiba:", err.message);
    // A követés soha ne törje el a felhasználói élményt — csendben nyelje el
    return res.status(204).end();
  }
}
