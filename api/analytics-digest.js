// Vercel Cron — napi 2x fut (lásd vercel.json), a saját Redis-be gyűjtött látogatói
// eseményekből összefoglaló emailt küld Resenden keresztül. Nem függ Google Cloudtól.
//
// Minden futás csak az ELŐZŐ sikeres futás óta történteket dolgozza fel (rk:digest:last_run
// alapján) — így a 13:00-as és 19:00-as email nem ismétli meg egymás tartalmát.
//
// Szükséges env vars (Vercel Dashboard → Settings → Environment Variables):
//   (REDIS_URL-t a Vercel Storage fülön létrehozott Redis Cloud adatbázis automatikusan beállítja)
//   RESEND_API_KEY     — resend.com API kulcs
//   DIGEST_FROM_EMAIL  — pl. "onboarding@resend.dev" teszthez, később saját domain
//   DIGEST_TO_EMAIL    — hova menjen az összefoglaló, pl. "richard.kormendi@gmail.com"
//   CRON_SECRET        — Vercel automatikusan Bearer tokenként küldi a cron-hívásokban;
//                        kézi teszthez ?secret= paraméterként is elfogadjuk

import { createClient } from "redis";

const EVENTS_KEY = "rk:events";
const LAST_RUN_KEY = "rk:digest:last_run";

const SECTION_LABELS_HU = {
  about: "Rólam", music: "Zene", releases: "Kiadások", press: "Sajtó",
  shows: "Koncertek", photos: "Fotók", contact: "Kapcsolat",
};

const COUNTRY_NAMES_HU = {
  HU: "Magyarország", US: "Egyesült Államok", GB: "Egyesült Királyság", DE: "Németország",
  AT: "Ausztria", RO: "Románia", SK: "Szlovákia", HR: "Horvátország", PL: "Lengyelország",
  FR: "Franciaország", IT: "Olaszország", ES: "Spanyolország", CA: "Kanada", AU: "Ausztrália",
  NL: "Hollandia", CH: "Svájc", SE: "Svédország", NO: "Norvégia", DK: "Dánia", BE: "Belgium",
  CZ: "Csehország", UA: "Ukrajna", RS: "Szerbia", BR: "Brazília", MX: "Mexikó", JP: "Japán",
  IE: "Írország", PT: "Portugália", FI: "Finnország", IN: "India", SI: "Szlovénia",
};

function countryName(code) {
  if (!code) return null;
  return COUNTRY_NAMES_HU[code] || code;
}

function deviceLabel(d) {
  if (d === "mobile") return "Mobil";
  if (d === "desktop") return "Asztali gép";
  return d || "Ismeretlen";
}

function langLabel(l) {
  if (l === "hu") return "Magyar";
  if (l === "en") return "Angol";
  return l || "Ismeretlen";
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

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m} perc ${rem} mp` : `${rem} mp`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
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

function renderVisitsTable(visits) {
  if (visits.length === 0) {
    return `<tr><td style="padding:6px 12px;color:#999;" colspan="4">Nincs látogatás ebben az időszakban.</td></tr>`;
  }
  const header = `<tr>
    <td style="padding:6px 12px;color:#999;font-size:0.7rem;text-transform:uppercase;">Időpont</td>
    <td style="padding:6px 12px;color:#999;font-size:0.7rem;text-transform:uppercase;">Honnan</td>
    <td style="padding:6px 12px;color:#999;font-size:0.7rem;text-transform:uppercase;">Eszköz</td>
    <td style="padding:6px 12px;color:#999;font-size:0.7rem;text-transform:uppercase;text-align:right;">Idő az oldalon</td>
  </tr>`;
  const rows = visits.map(v => `<tr>
    <td style="padding:6px 12px;color:#f5f1ea;white-space:nowrap;">${fmtTime(v.minTs)}${v.isReturning ? " 🔁" : " ✨"}</td>
    <td style="padding:6px 12px;color:#f5f1ea;">${v.location || "Ismeretlen"} · ${v.source || "-"}</td>
    <td style="padding:6px 12px;color:#f5f1ea;">${deviceLabel(v.device)}</td>
    <td style="padding:6px 12px;color:#e8963a;text-align:right;white-space:nowrap;">${fmtDuration(v.maxTs - v.minTs)}</td>
  </tr>`).join("");
  return header + rows;
}

function buildEmailHtml({
  sessionCount, pageviewCount, avgDurationMs, newCount, returningCount,
  sourceRows, locationRows, deviceRows, langRows, sectionRows, pageRows, clickRows, visits, periodLabel,
  totalVisitorsAllTime, totalPageviewsAllTime,
}) {
  return `
  <div style="background:#0b0a08;padding:2rem;font-family:-apple-system,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">
      <p style="color:#e8963a;letter-spacing:0.1em;text-transform:uppercase;font-size:0.75rem;margin:0 0 0.5rem;">richardkormendi.com</p>
      <h1 style="color:#f5f1ea;font-size:1.4rem;margin:0 0 1.5rem;">Összefoglaló — ${periodLabel}</h1>

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
          <td style="padding:10px 12px;background:#1c1814;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Átlag idő az oldalon</div>
            <div style="color:#f5f1ea;font-size:1.1rem;font-weight:700;">${fmtDuration(avgDurationMs)}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;border-radius:0 6px 6px 0;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Új / Visszatérő</div>
            <div style="color:#f5f1ea;font-size:1.1rem;font-weight:700;">${newCount} / ${returningCount}</div>
          </td>
        </tr>
      </table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Látogatások időpontja</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderVisitsTable(visits)}</table>
      <p style="color:#555;font-size:0.7rem;margin:0.4rem 0 0;">✨ = új látogató · 🔁 = már járt korábban is</p>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Honnan jöttek (csatorna)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(sourceRows)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Honnan jöttek (ország/város)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(locationRows)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Eszköz</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(deviceRows, deviceLabel)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Nyelv</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(langRows, langLabel)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Mi érdekelte őket (szekciók)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(sectionRows, id => SECTION_LABELS_HU[id] || id)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Melyik oldalakon jártak</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(pageRows)}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Amit csináltak (kattintások)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${renderTable(clickRows)}</table>

      <table style="width:100%;border-collapse:collapse;margin-top:1.5rem;">
        <tr>
          <td style="padding:10px 12px;background:#1c1814;border-radius:6px;text-align:center;">
            <span style="color:#999;font-size:0.75rem;text-transform:uppercase;">Összesen az indulás óta</span>
            <span style="color:#f5f1ea;font-weight:700;"> · ${totalVisitorsAllTime} látogató · ${totalPageviewsAllTime} oldalmegtekintés</span>
          </td>
        </tr>
      </table>

      <p style="color:#666;font-size:0.75rem;margin-top:1.5rem;">Automatikus összefoglaló a saját látogatottság-követésből, csak az előző email óta történtekről.</p>
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
      subject: `📊 richardkormendi.com — ${periodLabel}`,
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

    const lastRunRaw = await client.get(LAST_RUN_KEY);
    const lastRun = lastRunRaw ? Number(lastRunRaw) : Date.now() - 24 * 60 * 60 * 1000; // első futásnál: elmúlt 24 óra
    const runStartedAt = Date.now();

    const raw = await client.lRange(EVENTS_KEY, 0, -1);
    const allEvents = raw.map(e => (typeof e === "string" ? JSON.parse(e) : e));
    const events = allEvents.filter(e => e.ts > lastRun);

    const sessions = new Map(); // sessionId -> { minTs, maxTs, source, location, device, lang, isReturning }
    const sourceCounts = new Map();
    const sectionCounts = new Map();
    const pageCounts = new Map();
    const clickCounts = new Map();
    let pageviewCount = 0;

    for (const ev of events) {
      if (!sessions.has(ev.sessionId)) sessions.set(ev.sessionId, { minTs: ev.ts, maxTs: ev.ts });
      const s = sessions.get(ev.sessionId);
      s.minTs = Math.min(s.minTs, ev.ts);
      s.maxTs = Math.max(s.maxTs, ev.ts);
      // Ezeket bármelyik eseményből felvesszük, amelyikben szerepelnek — így nem csak a pageview-tól függ
      if (ev.source) s.source = ev.source;
      if (ev.country || ev.city) s.location = [ev.city, countryName(ev.country)].filter(Boolean).join(", ") || null;
      if (ev.device) s.device = ev.device;
      if (ev.lang) s.lang = ev.lang;
      if (ev.isReturning !== null && ev.isReturning !== undefined) s.isReturning = ev.isReturning;

      if (ev.type === "pageview") {
        pageviewCount++;
        pageCounts.set(ev.path, (pageCounts.get(ev.path) || 0) + 1);
      }
      if (ev.type === "section_view" && ev.section) {
        sectionCounts.set(ev.section, (sectionCounts.get(ev.section) || 0) + 1);
      }
      if (ev.type === "click" && ev.label) {
        clickCounts.set(ev.label, (clickCounts.get(ev.label) || 0) + 1);
      }
    }

    // Forrás, hely, eszköz, nyelv session-önként (egy látogató egyszer számít, ne az eseményei szerint)
    const locationCounts = new Map();
    const deviceCounts = new Map();
    const langCounts = new Map();
    let newCount = 0;
    let returningCount = 0;

    for (const s of sessions.values()) {
      if (s.source) sourceCounts.set(s.source, (sourceCounts.get(s.source) || 0) + 1);
      const loc = s.location || "Ismeretlen";
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
      if (s.device) deviceCounts.set(s.device, (deviceCounts.get(s.device) || 0) + 1);
      if (s.lang) langCounts.set(s.lang, (langCounts.get(s.lang) || 0) + 1);
      if (s.isReturning === true) returningCount++;
      else if (s.isReturning === false) newCount++;
    }

    const sessionCount = sessions.size;
    const totalDuration = [...sessions.values()].reduce((sum, s) => sum + (s.maxTs - s.minTs), 0);
    const avgDurationMs = sessionCount > 0 ? totalDuration / sessionCount : 0;

    const visits = [...sessions.values()].sort((a, b) => a.minTs - b.minTs).slice(0, 40);

    const fmtShort = ts => new Date(ts).toLocaleString("hu-HU", { timeZone: "Europe/Budapest", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const periodLabel = `${fmtShort(lastRun)} – ${fmtShort(runStartedAt)}`;

    // Örökké növekvő, soha nem törlődő összesítők — függetlenül attól, hogy a részletes
    // esemény-lista mikor jár le
    const totalPageviewsAllTime = (await client.get("rk:totals:pageviews")) || "0";
    const totalVisitorsAllTime = await client.hLen("rk:visitors:first_seen");

    const html = buildEmailHtml({
      sessionCount,
      pageviewCount,
      avgDurationMs,
      newCount,
      returningCount,
      sourceRows: topRows(sourceCounts),
      locationRows: topRows(locationCounts),
      deviceRows: topRows(deviceCounts),
      langRows: topRows(langCounts),
      sectionRows: topRows(sectionCounts),
      pageRows: topRows(pageCounts),
      clickRows: topRows(clickCounts, 12),
      visits,
      periodLabel,
      totalVisitorsAllTime,
      totalPageviewsAllTime,
    });

    await sendEmail(html, periodLabel);
    await client.set(LAST_RUN_KEY, String(runStartedAt));
    return res.status(200).json({ ok: true, sessionCount, pageviewCount, windowFrom: new Date(lastRun).toISOString(), windowTo: new Date(runStartedAt).toISOString() });
  } catch (err) {
    console.error("Analytics digest hiba:", err);
    return res.status(500).json({ error: err.message });
  }
}
