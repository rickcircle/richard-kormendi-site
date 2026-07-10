// Vercel Cron — napi 2x fut (lásd vercel.json), GA4-ből összefoglaló emailt küld Resenden keresztül
//
// Szükséges env vars (Vercel Dashboard → Settings → Environment Variables):
//   GA4_PROPERTY_ID    — a GA4 property számazonosítója (Admin → Property Settings), NEM a G-XXXX measurement ID
//   GA4_CLIENT_EMAIL   — a Google Cloud service account email címe
//   GA4_PRIVATE_KEY    — a service account JSON kulcsából a private_key mező (a \n karaktereket escapelve)
//   RESEND_API_KEY     — resend.com API kulcs
//   DIGEST_FROM_EMAIL  — pl. "digest@richardkormendi.com" (Resendnél ellenőrzött domain kell hozzá — teszthez jó az "onboarding@resend.dev" is)
//   DIGEST_TO_EMAIL    — hova menjen az összefoglaló, pl. "richard.kormendi@gmail.com"
//   CRON_SECRET        — Vercel automatikusan Bearer tokenként küldi a cron-hívásokban, ha be van állítva; kézi teszthez ?secret= paraméterként is elfogadjuk

import { BetaAnalyticsDataClient } from "@google-analytics/data";

const SECTION_LABELS_HU = {
  about: "Rólam", music: "Zene", releases: "Kiadások", press: "Sajtó",
  shows: "Koncertek", photos: "Fotók", contact: "Kapcsolat",
};

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_CLIENT_EMAIL,
      private_key: (process.env.GA4_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
  });
}

async function runReport(client, propertyId, request) {
  const [response] = await client.runReport({ property: `properties/${propertyId}`, ...request });
  return response;
}

function rows(report) {
  if (!report?.rows) return [];
  return report.rows.map(r => ({
    dims: r.dimensionValues?.map(d => d.value) || [],
    metrics: r.metricValues?.map(m => m.value) || [],
  }));
}

function metricValue(report, index = 0) {
  return report?.rows?.[0]?.metricValues?.[index]?.value ?? "0";
}

function fmtDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m} perc ${rem} mp` : `${rem} mp`;
}

function buildEmailHtml({ overview, sources, sections, events, periodLabel }) {
  const activeUsers = metricValue(overview, 0);
  const sessions = metricValue(overview, 1);
  const avgDuration = metricValue(overview, 2);
  const engagementRate = metricValue(overview, 3);

  const sourceRows = rows(sources).map(r => {
    const [source, medium] = r.dims;
    const [count] = r.metrics;
    return `<tr><td style="padding:6px 12px;color:#f5f1ea;">${source || "(direkt)"} <span style="color:#999;">/ ${medium || "-"}</span></td><td style="padding:6px 12px;color:#e8963a;text-align:right;">${count}</td></tr>`;
  }).join("") || `<tr><td style="padding:6px 12px;color:#999;" colspan="2">Nincs adat erre az időszakra.</td></tr>`;

  const sectionRows = rows(sections).map(r => {
    const [id] = r.dims;
    const [count] = r.metrics;
    return `<tr><td style="padding:6px 12px;color:#f5f1ea;">${SECTION_LABELS_HU[id] || id}</td><td style="padding:6px 12px;color:#e8963a;text-align:right;">${count}</td></tr>`;
  }).join("") || `<tr><td style="padding:6px 12px;color:#999;" colspan="2">Még nincs elég adat (a szekció-követés friss).</td></tr>`;

  const eventRows = rows(events).map(r => {
    const [name] = r.dims;
    const [count] = r.metrics;
    return `<tr><td style="padding:6px 12px;color:#f5f1ea;">${name}</td><td style="padding:6px 12px;color:#e8963a;text-align:right;">${count}</td></tr>`;
  }).join("") || `<tr><td style="padding:6px 12px;color:#999;" colspan="2">Nincs adat.</td></tr>`;

  return `
  <div style="background:#0b0a08;padding:2rem;font-family:-apple-system,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">
      <p style="color:#e8963a;letter-spacing:0.1em;text-transform:uppercase;font-size:0.75rem;margin:0 0 0.5rem;">richardkormendi.com — ${periodLabel}</p>
      <h1 style="color:#f5f1ea;font-size:1.5rem;margin:0 0 1.5rem;">Napi összefoglaló</h1>

      <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
        <tr>
          <td style="padding:10px 12px;background:#1c1814;border-radius:6px 0 0 6px;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Látogatók</div>
            <div style="color:#f5f1ea;font-size:1.3rem;font-weight:700;">${activeUsers}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Munkamenetek</div>
            <div style="color:#f5f1ea;font-size:1.3rem;font-weight:700;">${sessions}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Átlag idő</div>
            <div style="color:#f5f1ea;font-size:1.1rem;font-weight:700;">${fmtDuration(avgDuration)}</div>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px 12px;background:#1c1814;border-radius:0 6px 6px 0;">
            <div style="color:#999;font-size:0.7rem;text-transform:uppercase;">Elköteleződés</div>
            <div style="color:#f5f1ea;font-size:1.1rem;font-weight:700;">${Math.round(Number(engagementRate) * 100)}%</div>
          </td>
        </tr>
      </table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Honnan jöttek</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${sourceRows}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Mi érdekelte őket (szekciók)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${sectionRows}</table>

      <h2 style="color:#f5f1ea;font-size:1rem;margin:1.5rem 0 0.5rem;">Amit csináltak (top események)</h2>
      <table style="width:100%;border-collapse:collapse;background:#141210;border-radius:6px;overflow:hidden;">${eventRows}</table>

      <p style="color:#666;font-size:0.75rem;margin-top:2rem;">Automatikus összefoglaló a Google Analytics 4 adataiból, mai napra.</p>
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
  // Védelem: csak Vercel Cron (Authorization: Bearer CRON_SECRET) vagy kézi teszt (?secret=) engedélyezett
  const authHeader = req.headers.authorization;
  const providedSecret = authHeader?.replace("Bearer ", "") || req.query?.secret;
  if (process.env.CRON_SECRET && providedSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId || !process.env.GA4_CLIENT_EMAIL || !process.env.GA4_PRIVATE_KEY) {
    console.error("Hiányzó GA4 env var(ok)");
    return res.status(500).json({ error: "Server misconfigured: missing GA4 credentials" });
  }
  if (!process.env.RESEND_API_KEY || !process.env.DIGEST_FROM_EMAIL || !process.env.DIGEST_TO_EMAIL) {
    console.error("Hiányzó email env var(ok)");
    return res.status(500).json({ error: "Server misconfigured: missing email credentials" });
  }

  try {
    const client = getClient();
    const dateRanges = [{ startDate: "today", endDate: "today" }];

    const [overview, sources, events, sections] = await Promise.all([
      runReport(client, propertyId, {
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
        ],
      }),
      runReport(client, propertyId, {
        dateRanges,
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      }),
      runReport(client, propertyId, {
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }),
      runReport(client, propertyId, {
        dateRanges,
        dimensions: [{ name: "customEvent:section_id" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }).catch(err => {
        console.warn("section_id egyedi dimenzió még nem elérhető:", err.message);
        return null;
      }),
    ]);

    const now = new Date();
    const periodLabel = now.toLocaleString("hu-HU", { timeZone: "Europe/Budapest", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

    const html = buildEmailHtml({ overview, sources, sections, events, periodLabel });
    await sendEmail(html, periodLabel);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Analytics digest hiba:", err);
    return res.status(500).json({ error: err.message });
  }
}
