import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Rejtett oldal — nav-ban NEM látszik
// Közvetlen URL: /audit

const PAGESPEED_URL = "/api/pagespeed";

// Ezeket a Lighthouse "opportunity" auditokat naplózzuk a /api/notify hívásban
// (a saját nyomon követéshez) — a felületen nem jelenik meg belőlük semmi.
const OPPORTUNITY_KEYS = [
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "uses-optimized-images",
  "uses-webp-images",
  "uses-text-compression",
  "offscreen-images",
  "uses-responsive-images",
  "efficient-animated-content",
  "uses-rel-preconnect",
  "uses-long-cache-ttl",
  "dom-size",
  "mainthread-work-breakdown",
];

const SIGNATURE = "Üdvözlettel:\nKörmendi Richárd\nWebfejlesztő\n+36301480917\nrichardkormendi.com";

// Halk, nem direktbe tolakodó utalás arra, hogy vadonatúj oldalt is vállalok —
// minden kimenő üzenet végén ott van, P.s.-ként, nem a fő szövegben.
const PS_NEW_SITE = "P.s.: Ha esetleg egy vadonatúj weboldal is szóba jöhetne a javítás helyett, azt is szívesen vállalom: richardkormendi.com/hire?lang=hu&utm_source=audit_ps";

// Konkrét, alacsony-elköteleződésű CTA — könnyebb rá válaszolni, mint egy
// homályos "keressenek bizalommal"-ra.
const CTA_CALL = "Ha nyitottak rá, megbeszélhetjük a részleteket egy rövid, 5 perces telefonhívás során — mikor lenne erre alkalmas időpont a héten?";

// ── Kritikus hiba detektálás ─────────────────────────────────────────────────
// Csak ezek a dolgok számítanak "kritikusnak" — ezek indokolják önmagukban a
// hideg megkeresést. Minden más (meta leírás, schema, analytics stb.) mostantól
// nem jelenik meg sehol — a tool kizárólag arra való, hogy kiszűrje, van-e
// egyáltalán mit írni.
// FONTOS: ha TÖBB kritikus hiba is fennáll egyszerre, mindegyik bekerül az
// üzenetbe — nem csak az első találat (korábban ez volt a hiba).
function getCriticalIssue(mobileScore, desktopScore, checks = {}, domain = "") {
  // Ha a Lighthouse elhasalt (lásd lighthouseFailed az API válaszban), a
  // pontszámok null-ok lehetnek — null < 40 JS-ben igazra értékelődne ki
  // (0-ra kényszerülne), ezért csak akkor nézzük a mobil-alapú találatokat,
  // ha tényleg van valós szám.
  const scoresAvailable = typeof mobileScore === "number" && typeof desktopScore === "number";
  const bigGap          = scoresAvailable && (desktopScore - mobileScore) > 30;
  const noHttps         = checks.https === false;
  const httpNotEnforced = checks.httpNotEnforced === true;
  const phpEol          = checks.phpEol === true;
  const angularEol      = checks.isAngularJs === true;
  const wpCoreEol       = checks.wpCoreEol === true;
  const jqueryVeryOld   = checks.jqueryVeryOld === true;
  const phpErrorsExposed = checks.phpErrorsExposed === true;
  const deadGoogleAnalytics = checks.deadGoogleAnalytics === true;
  const hasFlash        = checks.hasFlash === true;
  const missingViewport = checks.missingViewport === true;
  // PHP 7.x-ről 8-ra váltani jellemzően csak szerverbeállítás + apró javítás —
  // valódi frissítési út van. PHP 5.x-nél viszont a kód szinte biztos, hogy a
  // rég megszűnt mysql_* függvényeket használja, ami PHP 7+ alatt egyáltalán
  // nem fut le — ott a "javítás" a gyakorlatban ugyanaz, mint egy új oldal.
  const phpMajor        = checks.phpVersion ? parseInt(checks.phpVersion, 10) : null;
  const phpVeryOld      = phpEol && phpMajor !== null && phpMajor < 7;
  // A jQuery-verzió önmagában cserélhető lenne, de itt nem erről van szó: egy
  // 2010-2012-es verziószám azt jelzi, hogy a TELJES oldal (design, kód,
  // minden) évtizede érintetlen — ez ugyanolyan "cseréljük le" jel, mint az
  // AngularJS vagy a nagyon régi PHP.
  const needsRebuild    = angularEol || phpVeryOld || jqueryVeryOld || hasFlash || missingViewport;
  const mobileBroken    = bigGap && mobileScore < 55;
  // Ha mobileBroken is fennáll, azt mutatjuk — a kettő ugyanazt a tünetet írja
  // le más szögből, kettő együtt redundáns lenne.
  const mobileTrulySlow = scoresAvailable && !mobileBroken && mobileScore < 40;

  const types = [];
  const bullets = [];

  if (noHttps) {
    types.push("nohttps");
    bullets.push("nem biztonságos kapcsolaton tölt be — az oldalon beküldött adatok (pl. egy kapcsolat-űrlap) titkosítatlanul utaznak, bárki elolvashatja őket útközben egy közös hálózaton, és a böngészők is \"Nem biztonságos\" figyelmeztetést mutatnak minden látogatónak");
  }
  if (httpNotEnforced) {
    types.push("httpnotenforced");
    bullets.push("van biztonságos (https) verziójuk, de nincs kikényszerítve — aki csak beírja a domaint vagy egy régi linket nyit meg (pl. nyomtatott anyagból), titkosítatlan kapcsolaton landol");
  }
  if (phpEol) {
    types.push("phpeol");
    bullets.push(`a szerver elavult PHP-verziót (${checks.phpVersion}) futtat, amihez már nem érkezik biztonsági frissítés — ha ma találnak benne egy rést, az sosem lesz javítva, és pont az ilyen oldalakat keresik célzottan a feltörésre szakosodott automatizált eszközök`);
  }
  if (angularEol) {
    types.push("angulareol");
    bullets.push("a weboldal felülete egy elavult keretrendszert (AngularJS) használ, amit 2022 januárja óta nem támogat és nem javít a gyártó — ha ma találnak benne egy rést, az sosem lesz javítva, és pont az ilyen elavult keretrendszereket keresik célzottan a feltörésre szakosodott automatizált eszközök");
  }
  if (wpCoreEol) {
    types.push("wpcoreeol");
    bullets.push(`a weboldal egy régóta nem frissített WordPress-alapváltozatot (${checks.wpVersion}) futtat — a WordPress alapból automatikusan frissítene, tehát ez évek óta nem történt meg, ami azt jelenti, hogy évek óta ismert biztonsági résekkel fut, amiket pont az ilyen elhanyagolt oldalak ellen szoktak célzottan kihasználni`);
  }
  if (jqueryVeryOld) {
    types.push("jqueryold");
    bullets.push(`a weboldal egy elavult JavaScript-könyvtárat (jQuery ${checks.jqueryVersion}) használ, aminek már 2016 óta nincs érdemi fejlesztése — ez önmagában is jelzi, hogy a teljes oldal jó eséllyel egy évtizede nem lett érdemben frissítve, sem technikailag, sem dizájnban`);
  }
  if (phpErrorsExposed) {
    types.push("phperrors");
    bullets.push("nyilvánosan látszik rajta egy PHP-hibaüzenet, ami a szerver belső fájlrendszerének elérési útját is elárulja — ez tényleges információszivárgás, amit egy támadó felhasználhat a rendszer feltérképezésére, és emellett is nagyon nem professzionális benyomást kelt a látogatóknak");
  }
  if (deadGoogleAnalytics) {
    types.push("deadga");
    bullets.push("a régi, klasszikus Google Analytics-kódot (ga.js) használják, amit a Google 2023. július 1-én véglegesen leállított — vagyis évek óta nem gyűlik semmilyen valós látogatottsági adat, holott azt hihetik, hogy mérik a forgalmukat");
  }
  if (hasFlash) {
    types.push("flash");
    bullets.push("van rajta Flash-alapú tartalom, amit minden böngésző 2020 vége óta véglegesen kivezetett — ez a tartalom ma senkinek nem jelenik meg, garantáltan");
  }
  if (missingViewport) {
    types.push("noviewport");
    bullets.push("hiányzik róla a mobil-nézetért felelős alapbeállítás (viewport), ami azt jelenti, hogy az oldal garantáltan nem reszponzív — ez erős jele annak, hogy a teljes oldal a mobil-first kor (kb. 2012) előtt készült");
  }
  if (mobileBroken) {
    types.push("mobilebroken");
    bullets.push("asztali gépen jól néz ki, de mobilon sajnos nehézkes a használata — ma már az érdeklődők nagy része telefonon keres, és ez sok látogatót eltérít, mielőtt még kapcsolatba lépnének");
  } else if (mobileTrulySlow) {
    types.push("mobileslow");
    bullets.push(`mobilon igen lassan tölt be — a Google mérése szerint ${mobileScore}/100 pont, ami azt jelenti, hogy egy átlagos kapcsolaton az oldal betöltése több másodpercet vesz igénybe`);
  }

  if (bullets.length === 0) return null;

  const siteRef = domain ? ` (${domain})` : "";
  const closing = bullets.length === 1
    ? (needsRebuild ? "Szívesen segítek ezt modern, biztonságos felületre cserélni." : "Szívesen segítek rendbe tenni ezt.")
    : (needsRebuild ? "Szívesen segítek ezeket modern, biztonságos felületre cserélni." : "Szívesen segítek rendbe tenni ezeket.");
  const body = bullets.length === 1
    ? `Tisztelt Hölgyem/Uram!\n\nMegnéztem a weboldalukat${siteRef}, és azt látom, hogy ${bullets[0]}. Úgy gondolom, hogy ez valós kockázatot jelent, ezért gondoltam, hogy jelezném Önök felé. ${closing}`
    : `Tisztelt Hölgyem/Uram!\n\nMegnéztem a weboldalukat${siteRef}, és pár dolgot találtam, amit érdemes lenne tudniuk:\n\n${bullets.map(b => `• ${b.charAt(0).toUpperCase()}${b.slice(1)}.`).join("\n")}\n\nÚgy gondolom, hogy ezek valós kockázatot jelentenek, ezért gondoltam, hogy jelezném Önök felé. ${closing}`;

  const message = `${body} ${CTA_CALL}\n\n${SIGNATURE}\n\n${PS_NEW_SITE}`;

  // Tárgy: biztonsági jellegű, ha https/php/info-szivárgás érintett, mobil-jellegű,
  // ha a reszponzivitás/teljesítmény érintett, egyébként egy semleges tárgy.
  const hasSecurityIssue = types.some(t => ["nohttps", "httpnotenforced", "phpeol", "angulareol", "wpcoreeol", "jqueryold", "phperrors"].includes(t));
  const hasMobileIssue   = types.some(t => ["mobilebroken", "mobileslow", "noviewport", "flash"].includes(t));
  const subject = hasSecurityIssue && hasMobileIssue
    ? "Pár fontos észrevétel a weboldalukhoz"
    : hasSecurityIssue
    ? "Biztonsági észrevétel a weboldalukhoz"
    : hasMobileIssue
    ? "Weboldal-észrevétel — mobil felhasználói élmény"
    : "Weboldal-észrevétel — érdemes ránézni";

  return { types, message, subject };
}

// ── Csak Facebook-oldal, nincs önálló weboldal ───────────────────────────────
// Ez nem az URL-auditból jön (nincs mit auditálni) — kézzel talált lead-ekhez,
// ahol a cégnek csak Facebook-jelenléte van. Nem "javítás", hanem egyértelműen
// új weboldal a pitch, szóval nincs benne PS_NEW_SITE (az redundáns lenne).
function getNoWebsitePitch(businessName = "", deadDomain = "") {
  const nameRef = businessName.trim() ? ` (${businessName.trim()})` : "";
  const domain = deadDomain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  // Ha van egy halott domain, amit a Facebook oldaluk linkel, ez sokkal
  // konkrétabb, kínosabb (tehát erősebb) nyitás, mint az általános "nincs
  // önálló weboldaluk" — mutatja, hogy tényleg alaposan megnézted őket.
  const opener = domain
    ? `Megnéztem a Facebook oldalukat${nameRef}, és észrevettem, hogy van rajta egy link a weboldalukra (${domain}), de az jelenleg egyáltalán nem érhető el — aki megpróbál rákattintani, nem talál semmit.`
    : `Megnéztem a Facebook oldalukat${nameRef}, és azt látom, hogy jelenleg nincs önálló weboldaluk.`;
  const message = `Tisztelt Hölgyem/Uram!\n\n${opener} Úgy gondolom, hogy ez valós lehetőséget jelent Önöknek, mégpedig a következők miatt:\n\n• Akik Google-ban keresnek rájuk, nem találják meg Önöket — egy Facebook-oldal sokkal gyengébben szerepel a keresésben, mint egy saját weboldal.\n• A Facebook-oldal nem az Önöké — bármikor korlátozhatja az elérést, megváltoztathatja az algoritmust, vagy akár le is tilthatja az oldalt, és ezen Önöknek nincs befolyásuk.\n• Sok érdeklődő bizalmatlanabb egy olyan céggel szemben, akinek nincs saját weboldala.\n\nSzívesen segítek felépíteni egy modern, gyors és ügyfélszerzésre optimalizált weboldalt. Ha nyitottak rá, szívesen átbeszélek Önökkel pár ötletet egy rövid, 5-10 perces kötetlen telefonhívás során — mikor lenne erre alkalmas időpont a héten?\n\n${SIGNATURE}`;
  const subject = domain
    ? "Weboldal-lehetőség — a Facebook oldalukon lévő link nem működik"
    : "Weboldal-lehetőség — jelenleg csak Facebook oldaluk van";
  return { message, subject };
}

// ── Főkomponens ──────────────────────────────────────────────────────────────
export default function Audit() {
  const { lang } = useLang();
  const hu = lang === "hu";

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [proposalStatus, setProposalStatus] = useState("idle"); // idle | loading | done | error
  const [proposalLink, setProposalLink]     = useState(null);
  const [proposalCopied, setProposalCopied] = useState(false);
  const [fbBusinessName, setFbBusinessName] = useState("");
  const [fbDeadDomain, setFbDeadDomain] = useState("");
  const [fbCopied, setFbCopied] = useState(false);

  const handleCopyFb = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setFbCopied(true);
      setTimeout(() => setFbCopied(false), 2500);
    }).catch(() => {});
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handleGenerateProposal = async () => {
    if (!results) return;
    setProposalStatus("loading");
    setProposalLink(null);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: results.url,
          mobileScore:  results.mobile.score,
          desktopScore: results.desktop.score,
          checks: results.checks,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Hiba");
      const fullLink = `https://richardkormendi.com${json.path}`;
      setProposalLink(fullLink);
      setProposalStatus("done");
    } catch {
      setProposalStatus("error");
    }
  };

  const handleCopyProposal = () => {
    if (!proposalLink) return;
    navigator.clipboard.writeText(proposalLink).then(() => {
      setProposalCopied(true);
      setTimeout(() => setProposalCopied(false), 2500);
    }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
    setStatus("loading");
    setResults(null);
    try {
      const res = await fetch(`${PAGESPEED_URL}?url=${encodeURIComponent(cleanUrl)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.detail || json?.error || `HTTP ${res.status}`);
      const { mobile, desktop } = json;
      // A Lighthouse néha elhasal (pl. bot-védelem blokkolja), miközben a
      // saját közvetlen fetch-ünk (checks) sikeres — ilyenkor mobile/desktop
      // null-ok lehetnek, de a HTML-alapú kritikus hibák még mindig érvényesek.
      const parse = (data) => {
        if (!data) return { score: null, issues: [] };
        const audits = data.lighthouseResult?.audits || {};
        const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
        const issues = OPPORTUNITY_KEYS
          .map(k => ({ key: k, audit: audits[k] }))
          .filter(({ audit: a }) => a && a.score !== null && a.score < 1)
          .sort((a, b) => a.audit.score - b.audit.score)
          .slice(0, 8);
        return { score, issues };
      };

      const mobileData  = parse(mobile);
      const desktopData = parse(desktop);
      setResults({ mobile: mobileData, desktop: desktopData, url: cleanUrl, checks: json.checks || {}, lighthouseFailed: !!json.lighthouseFailed });
      setStatus("done");

      // Értesítés + audit log mentése — fire-and-forget, nem blokkolja az UI-t
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          mobileScore:  mobileData.score,
          desktopScore: desktopData.score,
          issues: mobileData.issues.map(({ key, audit: a }) => ({ key, score: a?.score ?? null })),
          checks: json.checks || {},
        }),
      }).catch(() => {}); // silent fail — az audit eredmény fontos, a log nem blokkolhat
    } catch (err) {
      setErrorDetail(err.message || "");
      setStatus("error");
    }
  };

  const resultDomain = results ? (() => { try { return new URL(results.url).hostname; } catch { return ""; } })() : "";
  const critical = results ? getCriticalIssue(results.mobile.score, results.desktop.score, results.checks, resultDomain) : null;
  const outreachMsg = critical?.message || null;
  const outreachSubject = critical?.subject || null;
  const fbPitch = getNoWebsitePitch(fbBusinessName, fbDeadDomain);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <div className="audit-navbar"><Navbar /></div>

      {/* ── Hero ── */}
      <section className="audit-hero" style={{ background: "#fff", padding: "9rem 2rem 5rem", textAlign: "center", borderBottom: "1px solid #e8e8e8" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {hu ? "Ingyenes eszköz" : "Free tool"}
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem", color: "#1a1a1a" }}>
            {hu ? "Weboldal audit" : "Website audit"}
          </h1>
          <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 3rem" }}>
            {hu
              ? "Írd be bármelyik weboldal URL-jét — megmutatjuk, mi lassítja és hogyan lehet javítani."
              : "Enter any website URL — we'll show you what's slowing it down and how to fix it."}
          </p>
          <form onSubmit={handleSubmit} style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder={hu ? "pl. pelda.hu vagy https://pelda.hu" : "e.g. example.com"}
                required
                style={{
                  flex: "1 1 260px", padding: "0.95rem 1.25rem",
                  background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
                  color: "#1a1a1a", fontSize: "0.95rem", fontFamily: "inherit", outline: "none",
                }}
              />
              <button type="submit" disabled={status === "loading"}
                style={{
                  padding: "0.95rem 2rem",
                  background: status === "loading" ? "#f0f0f0" : "#1a1a1a",
                  color: status === "loading" ? "#999" : "#fff",
                  border: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.05em", cursor: status === "loading" ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>
                {status === "loading" ? (hu ? "Elemzés..." : "Analyzing...") : (hu ? "Audit →" : "Run audit →")}
              </button>
            </div>
            {status === "error" && (
              <div style={{ marginTop: "1.5rem", textAlign: "left", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
                <p style={{ fontSize: "0.85rem", color: "#e74c3c", fontWeight: 600 }}>
                  {hu ? "Az oldal nem töltött be / nem elérhető." : "The page didn't load / isn't reachable."}
                  {errorDetail ? <span style={{ display: "block", fontSize: "0.75rem", color: "#aaa", marginTop: "0.25rem", fontWeight: 400 }}>{errorDetail}</span> : null}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#999", lineHeight: 1.6, marginTop: "0.6rem" }}>
                  {hu
                    ? "Ez önmagában is kritikus hiba, és erős ok a megkeresésre — lehet, hogy csak nálad nem töltött be, ellenőrizd az URL-t; de ha valóban nem elérhető az oldal, ez önmagában véve is elég a hideg megkereséshez."
                    : "This alone is a critical issue and a strong reason to reach out — double-check the URL first, but if the site is genuinely unreachable, that's reason enough on its own."}
                </p>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button onClick={() => handleCopy(hu ? "A weboldal nem töltött be" : "The website didn't load")} style={{
                    padding: "0.5rem 1.25rem",
                    background: "transparent",
                    color: "#555", border: "1px solid #ddd", borderRadius: "4px",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    {hu ? "Tárgy másolása" : "Copy subject"}
                  </button>
                  <button onClick={() => handleCopy(hu
                    ? `Tisztelt Hölgyem/Uram!\n\nRá akartam nézni a weboldalukra${url.trim() ? ` (${url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "")})` : ""}, de sajnos nem sikerült betöltenie — vagy nagyon lassú, vagy éppen nem elérhető. Úgy gondolom, hogy ez valós kockázatot jelent, mert minden érdeklődő, aki most Önökre keres, valószínűleg ugyanezt tapasztalja. Szívesen segítek, hogy ez ne fordulhasson elő. ${CTA_CALL}\n\n${SIGNATURE}\n\n${PS_NEW_SITE}`
                    : "Hi! I tried to look at your website, but it didn't load — either very slow or currently unreachable. That's a real problem, since anyone searching for you right now is likely hitting the same issue. Happy to help make sure that doesn't happen."
                  )} style={{
                    padding: "0.5rem 1.25rem",
                    background: copied ? "#0cce6b" : "#1a1a1a",
                    color: "#fff", border: "none", borderRadius: "4px",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "background 0.2s",
                  }}>
                    {copied ? (hu ? "✓ Másolva!" : "✓ Copied!") : (hu ? "Üzenet másolása" : "Copy message")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </section>

      {/* ── Csak Facebook oldal, nincs weboldal ── */}
      <section style={{ padding: "3rem 2rem", background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            📘 Csak Facebook oldaluk van?
          </p>
          <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Ha kézzel találtál egy céget, akinek nincs önálló weboldala, csak Facebook-jelenléte — itt generálhatsz nekik egy kész üzenetet, URL nélkül.
          </p>
          <input
            type="text" value={fbBusinessName} onChange={e => setFbBusinessName(e.target.value)}
            placeholder="Cégnév (opcionális, csak a személyre szabáshoz)"
            style={{
              width: "100%", padding: "0.75rem 1rem", marginBottom: "0.75rem",
              background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
              color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <input
            type="text" value={fbDeadDomain} onChange={e => setFbDeadDomain(e.target.value)}
            placeholder="Halott domain, ha a Facebook oldalukon linkelnek egy nem működő weboldalt (opcionális)"
            style={{
              width: "100%", padding: "0.75rem 1rem", marginBottom: "1.25rem",
              background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
              color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ padding: "1.5rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #1a1a1a" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Tárgy
            </p>
            <p style={{ fontSize: "0.88rem", color: "#333", marginBottom: "1rem" }}>
              {fbPitch.subject}
            </p>
            <p style={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic", whiteSpace: "pre-line" }}>
              "{fbPitch.message}"
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => handleCopyFb(fbPitch.subject)}
                style={{
                  padding: "0.55rem 1.25rem", background: "#fff",
                  color: fbCopied ? "#0cce6b" : "#1a1a1a",
                  border: "1px solid #1a1a1a", borderRadius: "4px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "color 0.2s",
                }}>
                {fbCopied ? "✓ Másolva!" : "Tárgy másolása"}
              </button>
              <button onClick={() => handleCopyFb(fbPitch.message)}
                style={{
                  padding: "0.55rem 1.25rem",
                  background: fbCopied ? "#0cce6b" : "#1a1a1a",
                  color: "#fff", border: "none", borderRadius: "4px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.2s",
                }}>
                {fbCopied ? "✓ Másolva!" : "Üzenet másolása"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Töltés ── */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div className="audit-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "6rem 2rem", background: "#fafafa" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ width: "32px", height: "32px", border: "3px solid #e8e8e8", borderTopColor: "#1a1a1a", borderRadius: "50%", margin: "0 auto 1.5rem" }}
            />
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.5rem" }}>
              {hu ? "Elemzés folyamatban..." : "Analysing your website..."}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#aaa" }}>
              {hu ? "Ez kb. 15–20 másodpercet vesz igénybe" : "This usually takes 15–20 seconds"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Eredmény ── */}
      <AnimatePresence>
        {status === "done" && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {critical ? (
              <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: results.lighthouseFailed ? "0.5rem" : "2rem" }}>
                      {results.url}
                    </p>
                    {results.lighthouseFailed && (
                      <p style={{ fontSize: "0.78rem", color: "#c98a00", background: "#fff8ea", border: "1px solid #f0dfb0", borderRadius: "4px", padding: "0.6rem 0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                        ⚠️ A Google Lighthouse-elemzés nem sikerült ezúttal (a szerver válaszolt, csak az elemzés hasalt el — pl. bot-védelem miatt) — ezért a mobil-teljesítmény alapú találatok most nem futottak, csak a HTTPS/PHP/WordPress/AngularJS-alapú ellenőrzések.
                      </p>
                    )}

                    {/* ── Másolható üzenet ── */}
                    <div style={{ padding: "2rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #1a1a1a" }}>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        📋 Másolható üzenet
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "1rem", lineHeight: 1.5 }}>
                        LinkedIn-en vagy emailben küldheted el — nem hivatkozik eszközre, nem kér semmit:
                      </p>
                      {outreachSubject && (
                        <>
                          <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                            Tárgy
                          </p>
                          <p style={{ fontSize: "0.88rem", color: "#333", marginBottom: "1rem" }}>
                            {outreachSubject}
                          </p>
                        </>
                      )}
                      <p style={{ fontSize: "0.92rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic", whiteSpace: "pre-line" }}>
                        "{outreachMsg}"
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {outreachSubject && (
                          <button onClick={() => handleCopy(outreachSubject)}
                            style={{
                              padding: "0.55rem 1.25rem",
                              background: "#fff",
                              color: copied ? "#0cce6b" : "#1a1a1a",
                              border: "1px solid #1a1a1a", borderRadius: "4px",
                              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                              fontFamily: "inherit", transition: "color 0.2s",
                            }}>
                            {copied ? "✓ Másolva!" : "Tárgy másolása"}
                          </button>
                        )}
                        <button onClick={() => handleCopy(outreachMsg)}
                          style={{
                            padding: "0.55rem 1.25rem",
                            background: copied ? "#0cce6b" : "#1a1a1a",
                            color: "#fff", border: "none", borderRadius: "4px",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                            fontFamily: "inherit", transition: "background 0.2s",
                          }}>
                          {copied ? "✓ Másolva!" : "Üzenet másolása"}
                        </button>
                      </div>
                    </div>

                    {/* ── Ajánlat generálása ── */}
                    <div style={{ marginTop: "1.5rem", padding: "1.75rem 2rem", background: "#fff",
                      borderRadius: "8px", border: "1px solid #e8e8e8" }}>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                        📄 Ajánlat generálása
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                        Egy kattintás — kész, küldhető link az ügyfélnek. Tartalmazza a problémákat, a megoldást és az árat.
                      </p>
                      {proposalStatus === "idle" && (
                        <button onClick={handleGenerateProposal}
                          style={{ padding: "0.65rem 1.5rem", background: "#1a1a1a", color: "#fff",
                            border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit" }}>
                          Ajánlat generálása →
                        </button>
                      )}
                      {proposalStatus === "loading" && (
                        <p style={{ fontSize: "0.85rem", color: "#999" }}>Generálás folyamatban...</p>
                      )}
                      {proposalStatus === "error" && (
                        <p style={{ fontSize: "0.85rem", color: "#ff4e42" }}>Hiba történt, próbáld újra.</p>
                      )}
                      {proposalStatus === "done" && proposalLink && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                            <a href={proposalLink} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "0.85rem", color: "#1a1a1a", fontWeight: 600,
                                wordBreak: "break-all", textDecoration: "underline" }}>
                              {proposalLink}
                            </a>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button onClick={handleCopyProposal}
                              style={{ padding: "0.55rem 1.25rem",
                                background: proposalCopied ? "#0cce6b" : "#1a1a1a",
                                color: "#fff", border: "none", borderRadius: "4px",
                                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                                fontFamily: "inherit", transition: "background 0.2s" }}>
                              {proposalCopied ? "✓ Másolva!" : "Link másolása"}
                            </button>
                            <button onClick={() => { setProposalStatus("idle"); setProposalLink(null); }}
                              style={{ padding: "0.55rem 1.25rem", background: "transparent",
                                color: "#999", border: "1px solid #e8e8e8", borderRadius: "4px",
                                fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                              Új ajánlat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </section>
            ) : (
              <section style={{ padding: "6rem 2rem", background: "#f7f6f3" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <p style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>✅</p>
                    <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.75rem" }}>
                      {hu ? "Nem találtunk kritikus hibát" : "No critical issue found"}
                    </h2>
                    <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.7 }}>
                      {hu
                        ? "Ezen az oldalon nincs elég erős, önmagában is megálló ok a megkeresésre."
                        : "There's no issue on this site strong enough on its own to justify reaching out."}
                    </p>
                    {results.lighthouseFailed && (
                      <p style={{ fontSize: "0.78rem", color: "#c98a00", background: "#fff8ea", border: "1px solid #f0dfb0", borderRadius: "4px", padding: "0.6rem 0.9rem", marginTop: "1.25rem", lineHeight: 1.5, textAlign: "left" }}>
                        ⚠️ A Google Lighthouse-elemzés nem sikerült ezúttal — a mobil-teljesítmény alapú találatok nem futottak le, csak a HTTPS/PHP/WordPress/AngularJS-alapú ellenőrzések. Ha bizonytalan vagy, próbáld újra később.
                      </p>
                    )}
                  </motion.div>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="audit-footer"><Footer /></div>
    </div>
  );
}
