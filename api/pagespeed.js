// Vercel serverless proxy — Google PageSpeed Insights API
// maxDuration: 60s (vercel.json-ban konfigurálva)

import { createClient } from "redis";

const SEEN_KEY = "rk:audits:seen"; // hostname -> ISO dátum, amikor ELŐSZÖR auditáltuk

let clientPromise;
function getRedis() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", err => console.error("Redis kliens hiba:", err.message));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

// Ha ezt a domaint már auditáltuk korábban, visszaadja MIKOR (első alkalom) —
// ha ez az első alkalom, elmenti a mostani időpontot, és null-t ad vissza.
// Sosem dob hibát kifelé — ha a Redis nem elérhető, egyszerűen nincs "már
// megkerested" jelzés, de az audit maga attól még lefut.
async function checkAlreadySearched(hostname) {
  if (!hostname) return null;
  try {
    const client = await getRedis();
    const existing = await client.hGet(SEEN_KEY, hostname);
    if (existing) return existing;
    await client.hSet(SEEN_KEY, hostname, new Date().toISOString());
    return null;
  } catch (err) {
    console.error("checkAlreadySearched hiba:", err.message);
    return null;
  }
}

// Ha egy https:// fetch elhasal, gyakran nem "az oldal nem elérhető" a valódi
// ok, hanem hogy az SSL-tanúsítvány rossz domainre van kiállítva (megosztott
// tárhely, sosem cserélt default cert stb.) — ez egy sokkal konkrétabb,
// erősebb találat, mint az általános "nem töltött be" üzenet, úgyhogy
// külön felismerjük a Node/undici TLS-hibakódjaiból.
function classifyTlsError(err) {
  const code = err?.cause?.code || err?.code || "";
  const msg  = err?.cause?.message || err?.message || "";
  const combined = `${code} ${msg}`;
  if (/ERR_TLS_CERT_ALTNAME_INVALID|altnames|does not match/i.test(combined)) return "hostname_mismatch";
  if (/CERT_HAS_EXPIRED/i.test(combined)) return "expired";
  if (/SELF_SIGNED|UNABLE_TO_VERIFY_LEAF_SIGNATURE|DEPTH_ZERO/i.test(combined)) return "untrusted";
  if (/CERT|TLS|SSL/i.test(combined)) return "other";
  return null;
}

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

  // ── HTTP → HTTPS kikényszerítés ellenőrzése ────────────────────────────────
  // A checkPage() csak azt nézi, amit a felhasználó beírt (jellemzően https).
  // Ez itt külön lekéri a sima http:// verziót, redirect KÖVETÉSE NÉLKÜL, hogy
  // lássuk, tényleg átirányít-e https-re, vagy simán kiszolgálja titkosítatlanul.
  const checkHttpEnforced = async () => {
    try {
      const { hostname } = new URL(url);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`http://${hostname}/`, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        },
      });
      clearTimeout(timeout);
      // 2xx a sima http:// verzión = kritikus: nincs kikényszerítve a HTTPS.
      // 3xx (átirányítás) = rendben. Bármi más (4xx/5xx) = nem ez a probléma.
      return response.status >= 200 && response.status < 300;
    } catch {
      // Nem elérhető http-n (időtúllépés, kapcsolat elutasítva) — ez NEM hiba,
      // sőt jó jel: a szerver eleve nem szolgál ki titkosítatlan kérést.
      return false;
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

      // ── PHP verzió detektálás (X-Powered-By fejléc, ha a szerver felfedi) ──
      // A szerver gyakran letiltja ezt a fejlécet biztonsági okból — ha nincs,
      // egyszerűen nem tudjuk megmondani, nem jelenti azt, hogy nincs PHP.
      const poweredBy = response.headers.get("x-powered-by") || "";
      const phpVersionMatch = poweredBy.match(/PHP\/(\d+)\.(\d+)(?:\.(\d+))?/i);
      const phpVersion = phpVersionMatch
        ? `${phpVersionMatch[1]}.${phpVersionMatch[2]}${phpVersionMatch[3] ? `.${phpVersionMatch[3]}` : ""}`
        : null;
      // 2026 augusztusi állapot szerint minden 8.2 alatti PHP verzió EOL (nincs
      // biztonsági támogatás) — lásd php.net/eol és a kapcsolódó kutatást.
      const phpEol = phpVersionMatch
        ? (parseInt(phpVersionMatch[1]) < 8 || (parseInt(phpVersionMatch[1]) === 8 && parseInt(phpVersionMatch[2]) < 2))
        : null;

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

      // ── AI-átláthatósági jelzés keresése (EU AI Act) ────────────────────────
      // Csak akkor releváns, ha van chatbot. FONTOS KORLÁT: ez csak a nyers,
      // betöltéskor kapott HTML-t nézi — sok chat-widget csak a chat MEGNYITÁSA
      // után írja ki az AI-jelzést (JS-sel, kattintás után), amit ez nem lát.
      // Tehát hiányzó találat NEM bizonyíték a hiányra — mindig nézd meg kézzel
      // is (kattints a chatre), mielőtt bármit állítasz egy ügyfélnek.
      const hasAiDisclosure = hasChatbot
        ? /mesterséges\s?intelligenciá|AI[\s-]?asszisztens|AI[\s-]?ügynök|ez egy chatbot|automated\s?bot|chatting with an AI|talking to an AI|you'?re\s+(chatting|talking)\s+(with|to)\s+an?\s+AI|powered by AI/i.test(html)
        : null;

      // ── GDPR / süti-hozzájárulás hiánya ──────────────────────────────────────
      // Csak akkor releváns, ha TÉNYLEG van követő kód — egy követés nélküli
      // oldalnak nincs mit hozzájárulnia. Konzervatívan jelezzük: csak akkor
      // kritikus, ha SEM ismert consent-eszköz jele, SEM adatvédelmi
      // tájékoztatóra mutató link nincs a HTML-ben — ha bármelyik megvan,
      // inkább nem szólunk, mint hogy hamis találatot adjunk.
      const hasFacebookPixel = /connect\.facebook\.net\/.*fbevents\.js|fbq\(/i.test(html);
      const hasTracking      = hasAnalytics || hasFacebookPixel;
      const hasConsentTool   = /cookiebot|cookieyes|onetrust|complianz|iubenda|cookie-consent|cookieconsent|gdpr-cookie|\bcmplz\b/i.test(html);
      const hasPrivacyPolicyLink = /adatvédelm|adatkezelési\s?tájékoztat|privacy[\s-]?policy/i.test(html);
      const gdprConsentMissing = hasTracking ? (!hasConsentTool && !hasPrivacyPolicyLink) : null;

      // ── CMS azonosítás (WordPress) — a PHP-frissítés kockázatához kell ──────
      // WordPress esetén a mag + a legtöbb bővítmény aktívan karbantartott,
      // jól dokumentált, tehát a PHP-verzióváltás kockázata alacsonyabb.
      // Egyedi/nem azonosítható kódnál nagyobb a bizonytalanság.
      const isWordPress = /wp-content|wp-includes|wp-json|content=["']WordPress/i.test(html);

      // ── WordPress-mag verziója — csak akkor kritikus, ha durván elavult ──────
      // A "generator" meta tag adja ki a pontos magverziót. FONTOS: nem tudjuk
      // innen megmondani, hogy egy egyszerű frissítéssel megoldható-e, vagy a
      // bővítmények/téma annyira egyedi/elhanyagolt, hogy inkább új oldal kell —
      // ezért ez NEM kerül a "needsRebuild" (cserélni) kategóriába, csak a
      // szokásos "rendbe tenni" hívásba, a tényleges scope-ot úgyis csak a
      // kód megnézése után lehet eldönteni.
      const wpVersionMatch = html.match(/content=["']WordPress\s+(\d+)\.(\d+)(?:\.(\d+))?["']/i);
      const wpVersion = wpVersionMatch
        ? `${wpVersionMatch[1]}.${wpVersionMatch[2]}${wpVersionMatch[3] ? `.${wpVersionMatch[3]}` : ""}`
        : null;
      // WP 6.0 (2022 május) óta töltjük a határt — minden ami ez alatt van,
      // évek óta nem frissült mag, holott a WP alapból automatikusan frissít.
      const wpCoreEol = wpVersionMatch ? parseInt(wpVersionMatch[1], 10) < 6 : null;

      // ── AngularJS (1.x) detektálás — kritikus, EOL keretrendszer ─────────────
      // Az AngularJS (ng-app/ng-controller attribútumos, 1.x-es vonal) 2022
      // januárja óta hivatalosan EOL — a Google nem ad ki rá több biztonsági
      // frissítést. FONTOS: ez a modern Angular (2+, app-root komponensekkel)
      // teljesen más keretrendszer, azt ez a minta nem találja meg.
      const isAngularJs = /\bdata-ng-app\b|\bng-app\s*=|\bng-controller\s*=|angular(?:\.min)?\.js["'>]/i.test(html);

      // ── Ősrégi jQuery — proxy a teljes oldal elavultságára ───────────────────
      // Nem önmagában a jQuery a kockázat (az simán cserélhető) — hanem az,
      // hogy egy 1.x/2.x-es verziószám erős jele annak, hogy az EGÉSZ oldal
      // évek/évtizede nem lett érdemben frissítve (design, kód, minden).
      // FONTOS: a verzió gyakran nem a fájlnévben van (jquery-1.7.js), hanem
      // egy CDN-es útvonal-szegmensben (.../jquery/1.11.1/jquery.min.js) — a
      // mintának mindkettőt el kell kapnia, ezért a "/" is elfogadott elválasztó.
      const jqueryVersionMatch = html.match(/jquery[./-](\d+)\.(\d+)(?:\.(\d+))?/i);
      const jqueryVersion = jqueryVersionMatch
        ? `${jqueryVersionMatch[1]}.${jqueryVersionMatch[2]}${jqueryVersionMatch[3] ? `.${jqueryVersionMatch[3]}` : ""}`
        : null;
      // jQuery 3.0 (2016 június) óta van csak aktív fejlesztés — minden 1.x/2.x
      // verzió (utolsó ilyen kiadás: 1.12.4, 2016 május) mára 10+ éves.
      const jqueryVeryOld = jqueryVersionMatch
        ? parseInt(jqueryVersionMatch[1], 10) < 3
        : null;

      // ── PHP hibaüzenet nyilvánosan látszik ────────────────────────────────────
      // A PHP alapértelmezett HTML-es hibaformátuma (display_errors=on éles
      // környezetben) — ez file-elérési utat is elárul, valódi info-szivárgás.
      const phpErrorsExposed = /<b>(Notice|Warning|Fatal error|Deprecated|Parse error)<\/b>:/i.test(html);

      // ── Halott, klasszikus Google Analytics (ga.js/_gaq) ─────────────────────
      // A Google 2023. július 1-én véglegesen leállította a Universal Analytics-
      // ot (aminek a ga.js/_gaq az elődje/társa) — ha ez fut, évek óta nem
      // gyűlik adat, a cég azt hiheti, méri a forgalmát, valójában nem.
      const deadGoogleAnalytics = /_gaq\.push|google-analytics\.com\/ga\.js/i.test(html);

      // ── Flash/SWF tartalom ────────────────────────────────────────────────────
      // A Flash Playert minden böngésző 2020 végén véglegesen kivezette — egy
      // ilyen tartalom ma senkinek nem jelenik meg, nincs "csak javítjuk" út.
      const hasFlash = /\.swf["')]|shockwave-flash|swfobject/i.test(html);

      // ── Hiányzó viewport meta tag ─────────────────────────────────────────────
      // Ha ez nincs a HTML-ben, az oldal garantáltan nem reszponzív — erős jel
      // a mobil-first kor (kb. 2012) előtti buildekre.
      const missingViewport = !/<meta[^>]+name=["']viewport["']/i.test(html);

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

      // ── Cégtípus — NEM kritikus hiba, csak egy fejlesztési ötlet alapja ──────
      // Csak azokat a típusokat vesszük fel, ahol a chatbot-hiány tényleg
      // indokolható (sok ismétlődő, egyszerű kérdés: nyitvatartás, ár,
      // időpont). A címben (nem a teljes body-ban) keresünk, hogy alacsony
      // legyen a hamis találat esélye. A webshopnál platform-ujjlenyomatot
      // nézünk (objektív tény), nem "kosár" jellegű kulcsszót.
      // FONTOS: a NYERS <title> szövegét nézzük (titleMatch[1]), NEM a már
      // levágott pageTitle-t — a "Page Title | Site Name" levágó regex sok
      // kötőjelet tartalmazó címnél (pl. "Müller-Dental Kft. - Fogászat -
      // Fogorvos") túl agresszíven vág, és pont a kulcsszót vágja le.
      const titleLower = (titleMatch?.[1] || "").toLowerCase();
      const isEcommerce  = /woocommerce|shopify|prestashop|shoprenter|unas\.hu/i.test(html);
      const isDental     = /fogászat|fogorvos/i.test(titleLower);
      const isMedical    = /orvosi rendelő|magánrendelés|szemészet|bőrgyógyász|nőgyógyász|klinika/i.test(titleLower);
      const isBeauty     = /kozmetika|fodrász|szépségszalon|manikűr|pedikűr|szolárium/i.test(titleLower);
      const isRestaurant = /étterem|vendéglő|pizzéria/i.test(titleLower);
      // FONTOS SORREND: a title-alapú kategóriák (amit a cég saját magáról
      // mond) ELŐBB jönnek, mint a webshop-platform ujjlenyomat — egy
      // fogászat simán futtathat WooCommerce-t másodlagosan (pl. termékek
      // eladására), attól még elsősorban nem webshop. A karpatidental.hu
      // pont ezt a hibát mutatta: WooCommerce plugin volt rajta, "webshop"-
      // nak jelölte, holott a title egyértelműen fogászatot mond.
      const businessCategory = isDental ? "dental"
        : isMedical ? "medical"
        : isBeauty ? "beauty"
        : isRestaurant ? "restaurant"
        : isEcommerce ? "webshop"
        : null;

      return { hasPhoneLink, hasAnyPhone, hasSchemaOrg, hasLocalBizSchema, hasMapsEmbed, hasFacebook, hasInstagram, copyrightYear, siteIsRecent, hasAnalytics, pageTitle, hasChatbot, chatbotName, hasAiDisclosure, hasBooking, bookingName, phpVersion, phpEol, isWordPress, isAngularJs, wpVersion, wpCoreEol, jqueryVersion, jqueryVeryOld, phpErrorsExposed, deadGoogleAnalytics, hasFlash, missingViewport, businessCategory, gdprConsentMissing, pageReachable: true, tlsError: null };
    } catch (err) {
      // FONTOS: ez akkor is lefut, ha a saját közvetlen fetch-ünk sikertelen
      // (a szerver tényleg nem válaszol), tehát a pageReachable:false az
      // egyetlen megbízható jelzésünk arra, hogy az oldal valóban nem érhető
      // el — ezt használja a fő handler, amikor a Lighthouse is elhasal.
      // A tlsError plusz információ: gyakran nem is elérhetetlen az oldal,
      // csak a tanúsítványa rossz domainre van kiállítva.
      return { hasPhoneLink: null, hasAnyPhone: null, hasSchemaOrg: null, hasLocalBizSchema: null, hasMapsEmbed: null, hasFacebook: null, hasInstagram: null, copyrightYear: null, siteIsRecent: null, hasAnalytics: null, pageTitle: null, hasChatbot: null, chatbotName: null, hasAiDisclosure: null, hasBooking: null, bookingName: null, phpVersion: null, phpEol: null, isWordPress: null, isAngularJs: null, wpVersion: null, wpCoreEol: null, jqueryVersion: null, jqueryVeryOld: null, phpErrorsExposed: null, deadGoogleAnalytics: null, hasFlash: null, missingViewport: null, businessCategory: null, gdprConsentMissing: null, pageReachable: false, tlsError: classifyTlsError(err) };
    }
  };

  try {
    // allSettled: egy Lighthouse-hiba (gyakori, pl. bot-védelem blokkolja a
    // Google elemzőjét) nem szabad hogy elvigye az egész választ — a saját
    // közvetlen fetch-ünk (checkPage) attól függetlenül lefuthat, és
    // megbízhatóbban megmondja, hogy az oldal ténylegesen elérhető-e.
    let hostname = null;
    try { hostname = new URL(url).hostname; } catch { /* marad null */ }

    const [mobileSettled, desktopSettled, pageSettled, httpSettled, seenSettled] = await Promise.allSettled([
      fetchStrategy("mobile"),
      fetchStrategy("desktop"),
      checkPage(),
      checkHttpEnforced(),
      checkAlreadySearched(hostname),
    ]);

    const mobile  = mobileSettled.status  === "fulfilled" ? mobileSettled.value  : null;
    const desktop = desktopSettled.status === "fulfilled" ? desktopSettled.value : null;
    const page = pageSettled.value; // checkPage() saját try/catch-csel sosem dob kifelé
    const httpNotEnforced = httpSettled.value; // checkHttpEnforced() ugyanígy
    const previousAuditAt = seenSettled.status === "fulfilled" ? seenSettled.value : null;

    const lighthouseFailed = !mobile || !desktop;

    if (lighthouseFailed && !page.pageReachable) {
      // Se a Lighthouse, se a saját közvetlen kérésünk nem járt sikerrel —
      // ez tényleg arra utal, hogy az oldal valóban nem érhető el.
      const reason = (mobileSettled.reason || desktopSettled.reason)?.message || "unknown";
      console.error("PageSpeed proxy error (site unreachable):", reason, "tlsError:", page.tlsError);
      return res.status(502).json({ error: "Site unreachable", detail: reason, tlsError: page.tlsError });
    }

    // ── Extra ellenőrzések kinyerése a Lighthouse auditokból ──────────────────
    // Ha csak a Lighthouse hasalt el (de a saját fetch-ünk szerint az oldal
    // válaszol), audits/desktopPerf üresen/0-val marad — a HTML-alapú
    // ellenőrzések (HTTPS, PHP, WordPress stb.) attól még érvényesek.
    const audits = mobile?.lighthouseResult?.audits || {};
    const desktopPerf = desktop ? Math.round((desktop.lighthouseResult?.categories?.performance?.score || 0) * 100) : 0;

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
      httpNotEnforced: httpNotEnforced,
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
      hasAiDisclosure: page.hasAiDisclosure,
      hasBooking:      page.hasBooking,
      bookingName:     page.bookingName,
      // Szerver-oldali elavultság
      phpVersion:      page.phpVersion,
      phpEol:          page.phpEol,
      isWordPress:     page.isWordPress,
      // Frontend-oldali elavultság
      isAngularJs:     page.isAngularJs,
      wpVersion:       page.wpVersion,
      wpCoreEol:       page.wpCoreEol,
      jqueryVersion:   page.jqueryVersion,
      jqueryVeryOld:   page.jqueryVeryOld,
      phpErrorsExposed: page.phpErrorsExposed,
      deadGoogleAnalytics: page.deadGoogleAnalytics,
      hasFlash:        page.hasFlash,
      missingViewport: page.missingViewport,
      businessCategory: page.businessCategory,
      gdprConsentMissing: page.gdprConsentMissing,
      // Cégminőség
      businessQuality: businessQuality,
    };

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ mobile, desktop, checks, lighthouseFailed, previousAuditAt });
  } catch (err) {
    console.error("PageSpeed proxy error:", err.message);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
