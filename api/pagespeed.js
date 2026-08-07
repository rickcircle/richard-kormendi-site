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

  // ── HTML alapú ellenőrzések ───────────────────────────────────────────────────
  const checkPage = async () => {
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

      // Telefonszám
      const hasPhoneLink = /href=["']tel:/i.test(html);
      const hasAnyPhone  = /(\+36|06)[\s\-\(]?[0-9]{1,2}[\s\-\(]?[0-9]{3,4}[\s\-]?[0-9]{3,4}/.test(html);

      // Strukturált adat (Schema.org)
      const hasSchemaOrg     = /<script[^>]+application\/ld\+json/i.test(html);
      const hasLocalBizSchema = hasSchemaOrg && /LocalBusiness|Organization|HairSalon|FoodEstablishment|Store|Restaurant|MedicalBusiness|HealthAndBeautyBusiness/i.test(html);

      // Google Maps
      const hasMapsEmbed = /maps\.google\.com|google\.com\/maps|maps\.app\.goo\.gl/i.test(html);

      // Social media
      const hasFacebook  = /facebook\.com\/[a-zA-Z0-9]/i.test(html);
      const hasInstagram = /instagram\.com\/[a-zA-Z0-9]/i.test(html);

      // Oldal frissessége — copyright év
      const copyrightMatch = html.match(/[©&copy;]\s*(\d{4})|[Cc]opyright\s+(\d{4})/);
      const copyrightYear  = copyrightMatch ? parseInt(copyrightMatch[1] || copyrightMatch[2]) : null;
      const currentYear    = new Date().getFullYear();
      const siteIsRecent   = copyrightYear ? (currentYear - copyrightYear) <= 2 : null;

      // Google Analytics / Tag Manager
      const hasAnalytics = /gtag\(|google-analytics\.com|googletagmanager\.com|UA-\d|G-[A-Z0-9]/i.test(html);

      // Oldal neve a <title>-ből (a "|" vagy "-" utáni részt levágjuk)
      const titleMatch = html.match(/<title[^>]*>([^<]{2,80})<\/title>/i);
      const pageTitle  = titleMatch
        ? titleMatch[1].trim().replace(/\s*[\|\-–—]\s*.{0,40}$/, "").trim()
        : null;

      // ── Chatbot detektálás ─────────────────────────────────────────────────
      const CHATBOT_PATTERNS = [
        { label: "Tidio",     pattern: /tidio/i },
        { label: "Crisp",     pattern: /crisp\.chat|crispapp\.com/i },
        { label: "Intercom",  pattern: /intercom/i },
        { label: "Drift",     pattern: /drift\.com/i },
        { label: "Tawk.to",   pattern: /tawk\.to/i },
        { label: "LiveChat",  pattern: /livechatinc\.com|livechat\.com/i },
        { label: "Zendesk",   pattern: /zopim|zendesk/i },
        { label: "HubSpot",   pattern: /hs-script-loader|hubspot/i },
        { label: "Freshchat", pattern: /freshchat|freshworks/i },
        { label: "Smartsupp", pattern: /smartsupp/i },
        { label: "JivoChat",  pattern: /jivosite|jivochat/i },
        { label: "Userlike",  pattern: /userlike/i },
        { label: "Olark",     pattern: /olark/i },
        { label: "Chaport",   pattern: /chaport/i },
      ];
      const chatbotMatch = CHATBOT_PATTERNS.find(c => c.pattern.test(html));
      const hasChatbot   = !!chatbotMatch;
      const chatbotName  = chatbotMatch?.label || null;

      // ── Foglalási rendszer detektálás ──────────────────────────────────────
      const BOOKING_PATTERNS = [
        { label: "Calendly",   pattern: /calendly/i },
        { label: "SimplyBook", pattern: /simplybook/i },
        { label: "Booksy",     pattern: /booksy/i },
        { label: "Fresha",     pattern: /fresha\.com/i },
        { label: "OpenTable",  pattern: /opentable/i },
        { label: "Reservio",   pattern: /reservio/i },
        { label: "Planyo",     pattern: /planyo/i },
        { label: "Setmore",    pattern: /setmore/i },
        { label: "Acuity",     pattern: /acuityscheduling/i },
        { label: "Vagaro",     pattern: /vagaro/i },
        { label: "Treatwell",  pattern: /treatwell/i },
        { label: "Appointy",   pattern: /appointy/i },
        { label: "BookingKit", pattern: /bookingkit/i },
        { label: "Square",     pattern: /squareup\.com\/appointments|square\.site/i },
        { label: "Resmio",     pattern: /resmio/i },
        { label: "TheFork",    pattern: /thefork|lafourchette/i },
        { label: "Timely",     pattern: /gettimely/i },
        { label: "Salonic",    pattern: /salonic\.hu/i },
        { label: "Foglaljorvost", pattern: /foglaljorvost\.hu/i },
        { label: "Dentalpocket", pattern: /dentalpocket\.com/i },
        { label: "ManageDoc",  pattern: /managedoc\.com/i },
        // Magyar piaci foglalási platformok (fodrász/kozmetikus/orvosi) — 2026-08-07 kutatás
        { label: "Booked4us",  pattern: /booked4\.us/i },
        { label: "Minup",      pattern: /minup\.io/i },
        { label: "BWNET",      pattern: /bwnet\.hu/i },
        { label: "TimeBeeZ",   pattern: /timebeez\.hu/i },
        { label: "BR Works",   pattern: /brworks\.hu/i },
        { label: "Időpontmester", pattern: /idopontmester\.hu/i },
        { label: "Orvoshoz.hu", pattern: /orvoshoz\.hu/i },
        { label: "Erodium",    pattern: /erodium\.hu/i },
        { label: "Planfy",     pattern: /planfy\.com/i },
        { label: "Időpontok.hu", pattern: /idopontok\.hu/i },
      ];
      const bookingMatch = BOOKING_PATTERNS.find(b => b.pattern.test(html));
      const hasBooking   = !!bookingMatch;
      const bookingName  = bookingMatch?.label || null;

      return { hasPhoneLink, hasAnyPhone, hasSchemaOrg, hasLocalBizSchema, hasMapsEmbed, hasFacebook, hasInstagram, copyrightYear, siteIsRecent, hasAnalytics, pageTitle, hasChatbot, chatbotName, hasBooking, bookingName };
    } catch {
      return { hasPhoneLink: null, hasAnyPhone: null, hasSchemaOrg: null, hasLocalBizSchema: null, hasMapsEmbed: null, hasFacebook: null, hasInstagram: null, copyrightYear: null, siteIsRecent: null, hasAnalytics: null, pageTitle: null, hasChatbot: null, chatbotName: null, hasBooking: null, bookingName: null };
    }
  };

  try {
    const [mobile, desktop, page] = await Promise.all([
      fetchStrategy("mobile"),
      fetchStrategy("desktop"),
      checkPage(),
    ]);

    // ── Extra ellenőrzések kinyerése a Lighthouse auditokból ──────────────────
    const audits = mobile.lighthouseResult?.audits || {};
    const desktopPerf = Math.round((desktop.lighthouseResult?.categories?.performance?.score || 0) * 100);

    // ── Cégminőség-pontszám (0–8) — mennyire befektető / jómódú a vállalkozás ──
    let businessQuality = 0;
    if (url.startsWith("https://"))                    businessQuality++;
    if (page.hasAnalytics)                             businessQuality++;
    if (page.hasFacebook || page.hasInstagram)         businessQuality++;
    if (page.hasLocalBizSchema)                        businessQuality++;
    if (page.hasMapsEmbed)                             businessQuality++;
    if (page.hasPhoneLink)                             businessQuality++;
    if (page.siteIsRecent !== false)                   businessQuality++;
    if (desktopPerf >= 60)                             businessQuality++;

    const checks = {
      // Lighthouse alapú
      https:           url.startsWith("https://"),
      metaDescription: audits["meta-description"]?.score === 1,
      tapTargets:      audits["tap-targets"]?.score === 1,
      fontSizeOk:      audits["font-size"]?.score === 1,
      // HTML alapú
      hasPhoneLink:    page.hasPhoneLink,
      hasAnyPhone:     page.hasAnyPhone,
      hasSchemaOrg:    page.hasSchemaOrg,
      hasLocalBizSchema: page.hasLocalBizSchema,
      hasMapsEmbed:    page.hasMapsEmbed,
      hasFacebook:     page.hasFacebook,
      hasInstagram:    page.hasInstagram,
      copyrightYear:   page.copyrightYear,
      siteIsRecent:    page.siteIsRecent,
      hasAnalytics:    page.hasAnalytics,
      pageTitle:       page.pageTitle,
      // Chatbot + foglalás
      hasChatbot:      page.hasChatbot,
      chatbotName:     page.chatbotName,
      hasBooking:      page.hasBooking,
      bookingName:     page.bookingName,
      // Cégminőség
      businessQuality: businessQuality,
    };

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ mobile, desktop, checks });
  } catch (err) {
    console.error("PageSpeed proxy error:", err.message);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
