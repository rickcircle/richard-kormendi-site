// Vercel serverless proxy — Google PageSpeed Insights API
// maxDuration: 60s (vercel.json-ban konfigurálva)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });

  const API_KEY = process.env.GOOGLE_PAGESPEED_KEY || "";
  if (!API_KEY) console.warn("⚠️  GOOGLE_PAGESPEED_KEY nincs beállítva");
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";

  const PAGESPEED = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const CATEGORIES = "category=performance&category=seo&category=best-practices";

  // ── PageSpeed hívás (mobil + asztali) ───────────────────────────────────────
  const fetchStrategy = async (strategy) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(
        `${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=${strategy}&${CATEGORIES}${keyParam}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch {
        throw new Error(`Invalid JSON from Google API (status ${response.status})`);
      }
      if (!response.ok) {
        throw new Error(`PageSpeed API ${response.status}: ${data?.error?.message || "unknown"}`);
      }
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") throw new Error(`${strategy} request timed out`);
      throw err;
    }
  };

  // ── Telefonszám-link ellenőrzés (HTML fetch) ─────────────────────────────────
  const checkPhone = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          "Accept": "text/html",
        },
      });
      clearTimeout(timeout);
      const html = await response.text();
      const hasPhoneLink = /href=["']tel:/i.test(html);
      const hasAnyPhone  = /(\+36|06)[\s\-\(]?[0-9]{1,2}[\s\-\(]?[0-9]{3,4}[\s\-]?[0-9]{3,4}/.test(html);
      return { hasPhoneLink, hasAnyPhone };
    } catch {
      return { hasPhoneLink: null, hasAnyPhone: null }; // nem sikerült ellenőrizni
    }
  };

  try {
    const [mobile, desktop, phone] = await Promise.all([
      fetchStrategy("mobile"),
      fetchStrategy("desktop"),
      checkPhone(),
    ]);

    // ── Extra ellenőrzések kinyerése a Lighthouse auditokból ──────────────────
    const audits = mobile.lighthouseResult?.audits || {};
    const checks = {
      https:           url.startsWith("https://"),
      metaDescription: audits["meta-description"]?.score === 1,
      tapTargets:      audits["tap-targets"]?.score === 1,
      fontSizeOk:      audits["font-size"]?.score === 1,
      hasPhoneLink:    phone.hasPhoneLink,
      hasAnyPhone:     phone.hasAnyPhone,
    };

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ mobile, desktop, checks });
  } catch (err) {
    console.error("PageSpeed proxy error:", err.message);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
