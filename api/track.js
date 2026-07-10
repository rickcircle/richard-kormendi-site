// Vercel serverless — egy látogatói esemény (pageview / section_view) mentése Redisbe
// Env var: REDIS_URL — a Vercel "Storage" fülön létrehozott Redis Cloud adatbázis
// automatikusan beállítja, nem kell kézzel megadni.

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

function todayKey() {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Budapest" }); // YYYY-MM-DD
  return `rk:events:${d}`;
}

let clientPromise;
function getRedis() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", err => console.error("Redis kliens hiba:", err.message));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
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

  const { type, path, referrer, sessionId, ts, section, label } = body || {};
  if (!type || !sessionId) return res.status(400).end();

  const event = {
    type,
    path: path || "/",
    section: section || null,
    label: label || null,
    source: classifyReferrer(referrer),
    sessionId,
    ts: ts || Date.now(),
  };

  try {
    const client = await getRedis();
    const key = todayKey();
    await client.rPush(key, JSON.stringify(event));
    await client.expire(key, 60 * 60 * 24 * 4); // 4 nap után automatikusan törlődik
    return res.status(204).end();
  } catch (err) {
    console.error("track hiba:", err.message);
    // A követés soha ne törje el a felhasználói élményt — csendben nyelje el
    return res.status(204).end();
  }
}
