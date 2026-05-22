// Vercel serverless proxy — Google PageSpeed Insights API
// maxDuration: 60s (vercel.json-ban konfigurálva)

export default async function handler(req, res) {
  // CORS — Safari is megkapja a választ
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  const API_KEY = process.env.GOOGLE_PAGESPEED_KEY || "";
  if (!API_KEY) console.warn("⚠️  GOOGLE_PAGESPEED_KEY nincs beállítva — rate limit lehetséges");
  const keyParam = API_KEY ? `&key=${API_KEY}` : "";

  const PAGESPEED = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  const fetchStrategy = async (strategy) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
    try {
      const response = await fetch(
        `${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=${strategy}${keyParam}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      // Szöveg alapon olvassuk be, majd próbáljuk parse-olni
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error(`[${strategy}] JSON parse error. Status: ${response.status}. Body: ${text.slice(0, 200)}`);
        throw new Error(`Invalid JSON from Google API (status ${response.status})`);
      }

      if (!response.ok) {
        console.error(`[${strategy}] API error ${response.status}:`, JSON.stringify(data).slice(0, 300));
        throw new Error(`PageSpeed API ${response.status}: ${data?.error?.message || "unknown error"}`);
      }

      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") throw new Error(`${strategy} request timed out after 28s`);
      throw err;
    }
  };

  try {
    const [mobile, desktop] = await Promise.all([
      fetchStrategy("mobile"),
      fetchStrategy("desktop"),
    ]);

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ mobile, desktop });
  } catch (err) {
    console.error("PageSpeed proxy error:", err.message);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
