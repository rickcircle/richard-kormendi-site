// Vercel Cron — napi 2x fut (lásd vercel.json), a saját Redis-be gyűjtött látogatói
// eseményekből összefoglaló emailt küld Resenden keresztül. Nem függ Google Cloudtól.
//
// Szükséges env vars (Vercel Dashboard → Settings → Environment Variables):
//   (REDIS_URL-t a Vercel Storage fülön létrehozott Redis Cloud adatbázis automatikusan beállítja)
//   RESEND_API_KEY     — resend.com API kulcs
//   DIGEST_FROM_EMAIL  — pl. "onboarding@resend.dev" teszthez, később saját domain
//   DIGEST_TO_EMAIL    — hova menjen az összefoglaló, pl. "richard.kormendi@gmail.com"
//   CRON_SECRET        — Vercel automatikusan Bearer tokenként küldi a cron-hívásokban;
//                        kézi teszthez ?secret= paraméterként is elfogadjuk

import { createClient } from "redis";

const SECTION_LABELS_HU = {
  about: "Rólam", music: "Zene", releases: "Kiadások", press: "Sajtó",
  shows: "Koncertek", photos: "Fotók", contact: "Kapcsolat",
};

let clientPromise;
function getRedis() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", err => console.error("Redis kliens hiba:", err.message));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

function todayKey() {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Budapest" });
  return `rk:events:${d}`;
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m} perc ${rem} mp` : `${rem} mp`;
}

function topRows(map, limit = 8) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function renderTable(entries, labelFn = x => x) {
  if (entries.length === 0) {
    return `<tr><td style="padding:6px 12px;color:#999;">Nincs adat erre az időszakra.</td></tr>`;
  }
  return entries.map(([key, count]) =>
    `<tr><td style="padding:6px 12px;color:#f5f1ea;">${labelFn(key)}</td><td style="padding:6px 12px;color:#e8963a;text-align:right;">${count}</td></tr>`
  ).join("");
}

function buildEmailHtml({ sessionCount, pageviewCount, avgDurationMs, sourceRows, sectionRows, pageRows, periodLabel }) {
  return `
  <div style="background:#0b0a08;padding:2rem;font-family:-apple-system,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">
      <p style="color:#e8963a;letter-spacing:0.1em;text-transform:uppercase;font-size:0.75rem;margin:0 0 0.5rem;">richardkormendi.com — ${periodLabel}</p>
      <h1 style="color:#f5f1ea;font-size:1.5rem;margin:0 0 1.5rem;">Napi összefoglaló</h1>

      <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
        <tr>
          <td style="padding:10px 12px;background:#1c1814;border-radius:6px 0 0 6px;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Látogatók</div>
            <div style="color:#f5f1ea;font-size:1.3rem;font-weight:700;">${sessionCount}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Oldalmegtekintés</div>
            <div style="color:#f5f1ea;font-size:1.3rem;font-weight:700;">${pageviewCount}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;border-radius:0 6px 6px 0;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Átlag idő az oldalon</div>
            <div style="color:#f5f1ea;font-size:1.1rem;font-weight:700;">${fmtDuration(avgDurationMs)}</div>
          </td>
        </tr>
      </table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Honnan jöttek</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(sourceRows)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Mi érdekelte őket (szekciók)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(sectionRows, id => SECTION_LABELS_HU[id] || id)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Melyik oldalakon jártak</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(pageRows)}</table>

      <p style="color:#666;font-size:0.75rem;margin-top:2rem;">Automatikus összefoglaló a saját látogatottság-követésből, mai napra.</p>
    </div>
  </div>`;
}

async function sendEmail(html, periodLabel) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.DIGEST_FROM_EMAIL,
      to: process.env.DIGEST_TO_EMAIL,
      subject: `📊 richardkormendi.com — ${periodLabel} összefoglaló`,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend hiba: ${JSON.stringify(err)}`);
  }
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const providedSecret = authHeader?.replace("Bearer ", "") || req.query?.secret;
  if (process.env.CRON_SECRET && providedSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.RESEND_API_KEY || !process.env.DIGEST_FROM_EMAIL || !process.env.DIGEST_TO_EMAIL) {
    console.error("Hiányzó email env var(ok)");
    return res.status(500).json({ error: "Server misconfigured: missing email credentials" });
  }

  try {
    const client = await getRedis();
    const raw = await client.lRange(todayKey(), 0, -1);
    const events = raw.map(e => (typeof e === "string" ? JSON.parse(e) : e));

    const sessions = new Map(); // sessionId -> { minTs, maxTs }
    const sourceCounts = new Map();
    const sectionCounts = new Map();
    const pageCounts = new Map();
    let pageviewCount = 0;

    for (const ev of events) {
      if (!sessions.has(ev.sessionId)) sessions.set(ev.sessionId, { minTs: ev.ts, maxTs: ev.ts, source: ev.source });
      const s = sessions.get(ev.sessionId);
      s.minTs = Math.min(s.minTs, ev.ts);
      s.maxTs = Math.max(s.maxTs, ev.ts);

      if (ev.type === "pageview") {
        pageviewCount++;
        pageCounts.set(ev.path, (pageCounts.get(ev.path) || 0) + 1);
      }
      if (ev.type === "section_view" && ev.section) {
        sectionCounts.set(ev.section, (sectionCounts.get(ev.section) || 0) + 1);
      }
    }

    // Forrás session-önként (egy látogató egyszer számít, ne az eseményei szerint)
    for (const { source } of sessions.values()) {
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    }

    const sessionCount = sessions.size;
    const totalDuration = [...sessions.values()].reduce((sum, s) => sum + (s.maxTs - s.minTs), 0);
    const avgDurationMs = sessionCount > 0 ? totalDuration / sessionCount : 0;

    const now = new Date();
    const periodLabel = now.toLocaleString("hu-HU", { timeZone: "Europe/Budapest", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

    const html = buildEmailHtml({
      sessionCount,
      pageviewCount,
      avgDurationMs,
      sourceRows: topRows(sourceCounts),
      sectionRows: topRows(sectionCounts),
      pageRows: topRows(pageCounts),
      periodLabel,
    });

    await sendEmail(html, periodLabel);
    return res.status(200).json({ ok: true, sessionCount, pageviewCount });
  } catch (err) {
    console.error("Analytics digest hiba:", err);
    return res.status(500).json({ error: err.message });
  }
}
