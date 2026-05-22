import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Rejtett oldal — nav-ban NEM látszik
// Közvetlen URL: /audit

const PAGESPEED_URL = "/api/pagespeed";

// ── Metrika konfiguráció emberi magyarázatokkal ──────────────────────────────
const METRIC_CONFIG = {
  "first-contentful-paint": {
    en: "First Contentful Paint", hu: "Első megjelenés", short: "FCP",
    question: { hu: "Mikor jelenik meg először valami az oldalon?", en: "When does the page first show something?" },
    explain: {
      good:   { hu: "Gyors első benyomás — a látogató rögtön lát valamit", en: "Fast first impression — visitor sees content right away" },
      medium: { hu: "Kicsit sokat vár az első megjelenésre", en: "Slightly slow to first show content" },
      bad:    { hu: "A látogató sokáig csak fehér képernyőt lát", en: "Visitor stares at a blank screen for too long" },
    },
  },
  "largest-contentful-paint": {
    en: "Largest Contentful Paint", hu: "Főtartalom betöltése", short: "LCP",
    question: { hu: "Mikor tölt be a főtartalom (pl. a hero kép vagy szöveg)?", en: "When does the main content (e.g. hero image or text) load?" },
    explain: {
      good:   { hu: "A főtartalom gyorsan megjelenik — jó első benyomás", en: "Main content loads quickly — great first impression" },
      medium: { hu: "A főtartalom lassan tölt be", en: "Main content loads slowly" },
      bad:    { hu: "A látogató valószínűleg elveszti a türelmét és elmegy", en: "Visitors likely lose patience and leave" },
    },
  },
  "total-blocking-time": {
    en: "Total Blocking Time", hu: "Lefagyás betöltés közben", short: "TBT",
    question: { hu: "Mennyit 'fagy' az oldal, mielőtt teljesen betölt?", en: "How long does the page freeze while loading?" },
    explain: {
      good:   { hu: "Az oldal nem fagy meg betöltés közben — gördülékeny élmény", en: "Page stays responsive during loading — smooth experience" },
      medium: { hu: "Az oldal időnként nem reagál kattintásra", en: "Page occasionally doesn't respond to clicks" },
      bad:    { hu: "Az oldal hosszan lefagy — nagyon frusztráló élmény", en: "Page freezes for a long time — very frustrating" },
    },
  },
  "cumulative-layout-shift": {
    en: "Cumulative Layout Shift", hu: "Elrendezés stabilitása", short: "CLS",
    question: { hu: "Ugrálnak-e az elemek betöltés közben?", en: "Do elements jump around while loading?" },
    explain: {
      good:   { hu: "Az elemek stabilan a helyükön maradnak — nincs véletlen kattintás", en: "Elements stay stable — no accidental clicks" },
      medium: { hu: "Néhány elem elmozdul betöltés közben", en: "Some elements shift while loading" },
      bad:    { hu: "Az elemek ugrálnak — a látogató véletlenül rossz helyre kattint", en: "Elements jump around — visitors accidentally click the wrong thing" },
    },
  },
  "speed-index": {
    en: "Speed Index", hu: "Vizuális betöltési sebesség", short: "SI",
    question: { hu: "Milyen gyorsan épül fel az oldal vizuálisan?", en: "How quickly does the page visually build up?" },
    explain: {
      good:   { hu: "Az oldal vizuálisan gyorsan épül fel", en: "Page builds up visually fast" },
      medium: { hu: "Az oldal lassan épül fel vizuálisan", en: "Page builds up slowly" },
      bad:    { hu: "A látogató sokáig részlegesen betöltött oldalt lát", en: "Visitor sees a half-loaded page for too long" },
    },
  },
  "interactive": {
    en: "Time to Interactive", hu: "Teljes használhatóság ideje", short: "TTI",
    question: { hu: "Mikor válik teljesen kattinthatóvá és használhatóvá az oldal?", en: "When can visitors fully use and click everything on the page?" },
    explain: {
      good:   { hu: "Az oldal hamar teljesen interaktív — a látogató rögtön tud navigálni", en: "Page becomes fully usable quickly — visitors can navigate right away" },
      medium: { hu: "Az oldal lassan lesz teljesen kattintható", en: "Page takes a while to become fully clickable" },
      bad:    { hu: "A látogató sokáig nem tudja valójában használni az oldalt", en: "Visitors can't really use the page for a long time" },
    },
  },
};

// ── Fejlesztési lehetőségek emberi nyelven ───────────────────────────────────
const ISSUE_HUMAN = {
  "render-blocking-resources":  { hu: "Bizonyos fájlok blokkolják az oldal megjelenését", en: "Some files are blocking the page from appearing" },
  "unused-javascript":          { hu: "Felesleges JavaScript kód lassítja az oldalt", en: "Unused JavaScript code is slowing things down" },
  "unused-css-rules":           { hu: "Felesleges stíluslap-kód terheli az oldalt", en: "Unused CSS is adding unnecessary weight" },
  "uses-optimized-images":      { hu: "A képek nincsenek optimalizálva — kisebbre lehetne tömöríteni őket", en: "Images aren't optimised — they could be compressed" },
  "uses-webp-images":           { hu: "A képek régi formátumban vannak — WebP-ben ~30%-kal kisebbek lennének", en: "Images use an old format — WebP would be ~30% smaller" },
  "uses-text-compression":      { hu: "A szövegfájlok nincsenek tömörítve a szerveren", en: "Text files aren't compressed on the server" },
  "offscreen-images":           { hu: "A képek akkor is letöltődnek, ha még nem láthatóak az oldalon", en: "Images load even before they're visible on screen" },
  "uses-responsive-images":     { hu: "Mobilon is nagy méretű képek töltődnek le", en: "Full-size desktop images load on mobile too" },
  "efficient-animated-content": { hu: "Az animált képek (GIF) túl sok helyet foglalnak", en: "Animated images (GIFs) are too large" },
  "uses-rel-preconnect":        { hu: "Külső szolgáltatásokhoz való csatlakozás lassítja az oldalt", en: "Connecting to external services is slowing things down" },
  "uses-long-cache-ttl":        { hu: "A böngésző nem menti le az oldal elemeit visszatérő látogatóknak", en: "Browser isn't caching assets for returning visitors" },
  "dom-size":                   { hu: "Az oldal HTML struktúrája túl bonyolult", en: "The page's HTML structure is too complex" },
  "mainthread-work-breakdown":  { hu: "Az oldal JavaScript kódja túlterheli a böngészőt", en: "JavaScript is overloading the browser" },
};

const OPPORTUNITY_KEYS = Object.keys(ISSUE_HUMAN);

// ── Segédfüggvények ──────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 90) return "#0cce6b";
  if (s >= 50) return "#ffa400";
  return "#ff4e42";
}
function scoreBg(s) {
  if (s >= 90) return "#f0fdf6";
  if (s >= 50) return "#fffbf0";
  return "#fff5f5";
}
function scoreLabel(s, hu) {
  if (s >= 90) return hu ? "Kiváló" : "Good";
  if (s >= 50) return hu ? "Fejleszthető" : "Needs improvement";
  return hu ? "Kritikus" : "Poor";
}
function metricLevel(s) {
  if (s === null) return "medium";
  if (s >= 90) return "good";
  if (s >= 50) return "medium";
  return "bad";
}

function getSummary(mobile, desktop, hu) {
  const m = mobile.score;
  const bigGap = (desktop.score - m) > 30;
  if (m >= 90) return {
    verdict: hu ? "Az oldalad kiváló teljesítményt nyújt 🎉" : "Your website performs excellently 🎉",
    impact:  hu
      ? "Mobilon és asztali gépen egyaránt gyors és kellemes. Szép munka!"
      : "Fast and smooth on both mobile and desktop. Great work!",
    tone: "good",
  };
  if (bigGap) return {
    verdict: hu ? "Az oldalad mobilon javítható" : "Your website needs mobile improvements",
    impact:  hu
      ? "Asztali gépen jól néz ki, de mobilon van néhány akadály. Ma már az emberek többsége telefonon böngészik."
      : "Looks good on desktop, but there are some hurdles on mobile. Most people browse on their phones these days.",
    tone: "medium",
  };
  if (m >= 70) return {
    verdict: hu ? "Az oldalad jól teljesít, de van hova fejlődni" : "Your website performs well, with room to improve",
    impact:  hu
      ? "Az alapok rendben vannak. Néhány javítással még jobb élményt nyújthat a mobilos látogatóknak."
      : "The basics are solid. A few fixes could make the mobile experience even better.",
    tone: "medium",
  };
  if (m >= 50) return {
    verdict: hu ? "Az oldalad mobilon lassabb a kelleténél" : "Your website loads slowly on mobile",
    impact:  hu
      ? "Mobilon a betöltés hosszabb ideig tart a javasolt szintnél. Ez különösen akkor számít, ha Google keresésből érkeznek látogatók."
      : "The page takes longer to load on mobile than recommended — this matters most for visitors from Google Search.",
    tone: "medium",
  };
  return {
    verdict: hu ? "Az oldalad mobilon fejlesztésre szorul" : "Your website needs mobile improvements",
    impact:  hu
      ? "Mobilon az oldal betöltése és használata nehézkes. Érdemes foglalkozni vele — a javítás általában látványos eredménnyel jár."
      : "The site is slow and hard to use on mobile. It's worth addressing — improvements typically make a noticeable difference.",
    tone: "bad",
  };
}

function generateOutreach(mobileScore, desktopScore, checks = {}) {
  const bigGap      = (desktopScore - mobileScore) > 30;
  const noHttps     = checks.https === false;
  const noPhoneLink = checks.hasPhoneLink === false && checks.hasAnyPhone !== false;
  const noMetaDesc  = checks.metaDescription === false;

  if (noHttps)
    return "Szia! Megnéztem a weboldalatokat, és azt látom, hogy nem biztonságos kapcsolaton tölt be — a böngészők \"Nem biztonságos\" figyelmeztetést mutatnak. Ez bizalmat ront, és a Google is hátrányba sorolja az ilyen oldalakat. Könnyen javítható lenne. Ha érdekel, szívesen segítek.";
  if (noPhoneLink)
    return "Szia! Ránéztem a weboldalatokra, és azt látom, hogy a telefonszám mobilon nem kattintható — hívni csak a szám kézzel történő beírásával lehet. Ma már az érdeklődők nagy része telefonon keres, és sokan egyszerűen nem fognak manuálisan számot beírni. Ez percek alatt javítható. Ha érdekel, megmutatom.";
  if (noMetaDesc)
    return "Szia! Megnéztem a weboldalatokat, és azt látom, hogy Google-ban nincs szöveg az oldal találata alatt — csak az URL jelenik meg. Ez azt jelenti, hogy az érdeklődők kevésbé kattintanak rá. Pár sorral sokkal jobban nézne ki és több látogatót hozna. Ha érdekel, segítek megírni.";
  if (bigGap)
    return "Szia! Megnéztem a weboldalatokat — asztali gépen rendben van, de mobilon nehézkes a használata. Ma már az érdeklődők nagy része telefonon keres, és egy nem mobilbarát oldal sok látogatót eltérít. Pár fejlesztéssel könnyen orvosolható lenne. Ha érdekel, szívesen megmutatom.";
  if (mobileScore < 50)
    return "Szia! Ránéztem a weboldalatokra, és azt látom, hogy mobilon lassabban tölt be a kelleténél. Ma már az ügyfelek nagy része telefonon keres — ha az oldal sokat vár, sokan inkább továbblépnek. Ez megoldható, általában pár héten belül érezhető a különbség. Ha kíváncsi vagy rá, szívesen átbeszéljük.";
  return null;
}

// ── Komponensek ──────────────────────────────────────────────────────────────
function ScoreCircle({ score, label, animate }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  const bg = scoreBg(score);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
      background: bg, borderRadius: "12px", padding: "2rem 2.5rem",
      border: `1px solid ${color}40`,
    }}>
      <motion.svg width="130" height="130" viewBox="0 0 130 130"
        initial={animate ? { opacity: 0, scale: 0.8 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : false}
        transition={{ duration: 0.6, ease: "easeOut" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e8e8e8" strokeWidth="10" />
        <motion.circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} transform="rotate(-90 65 65)"
          initial={{ strokeDashoffset: circ }}
          animate={animate ? { strokeDashoffset: offset } : { strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
          fontSize="28" fontWeight="700" fill={color} fontFamily="Inter, sans-serif">{score}</text>
        <text x="65" y="82" textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fill="#aaa" fontFamily="Inter, sans-serif" letterSpacing="1">/100</text>
      </motion.svg>
      <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{label}</p>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color, fontWeight: 600 }}>
        {scoreLabel(score, false)}
      </span>
    </div>
  );
}

function MetricCard({ metricKey, data, lang }) {
  const config = METRIC_CONFIG[metricKey];
  if (!config || !data) return null;
  const score = data.score !== null ? Math.round(data.score * 100) : null;
  const color = score !== null ? scoreColor(score) : "#888";
  const level = metricLevel(score);
  const hu = lang === "hu";
  return (
    <motion.div variants={staggerItem} style={{
      background: "#fff", border: "1px solid #e8e8e8",
      borderTop: `3px solid ${color}`, borderRadius: "6px", padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: "0.35rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", fontWeight: 600 }}>
          {config.short}
        </span>
        {score !== null && (
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color, textTransform: "uppercase", fontWeight: 600 }}>
            {scoreLabel(score, hu)}
          </span>
        )}
      </div>
      <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>
        {data.displayValue || "–"}
      </p>
      <p style={{ fontSize: "0.78rem", color: "#555", margin: "0.1rem 0 0", lineHeight: 1.4, fontWeight: 500 }}>
        {hu ? config.question.hu : config.question.en}
      </p>
      <p style={{ fontSize: "0.75rem", color, margin: 0, lineHeight: 1.4 }}>
        {hu ? config.explain[level].hu : config.explain[level].en}
      </p>
    </motion.div>
  );
}

function IssueItem({ audit, auditKey, lang }) {
  if (!audit || audit.score === 1 || audit.score === null) return null;
  const savings = audit.details?.overallSavingsMs
    ? `~${(audit.details.overallSavingsMs / 1000).toFixed(1)}s`
    : null;
  const priority = audit.score < 0.5 ? "high" : "medium";
  const priorityColor = priority === "high" ? "#ff4e42" : "#ffa400";
  const priorityLabel = priority === "high"
    ? (lang === "hu" ? "Kritikus" : "Critical")
    : (lang === "hu" ? "Ajánlott" : "Recommended");
  const human = ISSUE_HUMAN[auditKey];
  const hu = lang === "hu";
  return (
    <motion.div variants={staggerItem} style={{
      padding: "1.25rem 1.5rem", background: "#fff", borderRadius: "6px",
      border: "1px solid #e8e8e8", borderLeft: `4px solid ${priorityColor}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: savings ? "0.3rem" : 0 }}>
        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
          {human ? (hu ? human.hu : human.en) : audit.title}
        </p>
        <span style={{
          fontSize: "0.65rem", letterSpacing: "0.08em", color: priorityColor,
          textTransform: "uppercase", fontWeight: 700, flexShrink: 0,
          background: `${priorityColor}15`, padding: "2px 8px", borderRadius: "999px",
        }}>
          {priorityLabel}
        </span>
      </div>
      {savings && (
        <p style={{ fontSize: "0.82rem", color: "#aaa", margin: 0 }}>
          {hu ? `Potenciális időmegtakarítás: ${savings}` : `Potential time saving: ${savings}`}
        </p>
      )}
    </motion.div>
  );
}

// ── Főkomponens ──────────────────────────────────────────────────────────────
export default function Audit() {
  const { lang } = useLang();
  const hu = lang === "hu";

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("mobile");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
      const parse = (data) => {
        const audits = data.lighthouseResult?.audits || {};
        const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
        const metrics = Object.fromEntries(Object.keys(METRIC_CONFIG).map(k => [k, audits[k] || null]));
        const issues = OPPORTUNITY_KEYS
          .map(k => ({ key: k, audit: audits[k] }))
          .filter(({ audit: a }) => a && a.score !== null && a.score < 1)
          .sort((a, b) => a.audit.score - b.audit.score)
          .slice(0, 8);
        return { score, metrics, issues };
      };

      const mobileData  = parse(mobile);
      const desktopData = parse(desktop);
      setResults({ mobile: mobileData, desktop: desktopData, url: cleanUrl, checks: json.checks || {} });
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

  const current = results?.[activeTab];
  const summary = results ? getSummary(results.mobile, results.desktop, hu) : null;
  const summaryBg = summary?.tone === "good" ? "#f0fdf6" : summary?.tone === "bad" ? "#fff5f5" : "#fffbf0";
  const outreachMsg = results ? generateOutreach(results.mobile.score, results.desktop.score, results.checks) : null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .audit-navbar, .audit-footer, .audit-hero, .audit-loading,
          .audit-tabs, .audit-cta, .audit-print-btn { display: none !important; }
          .audit-print-header { display: block !important; }
          body { background: #fff !important; }
          @page { margin: 1.5cm; }
        }
        .audit-print-header { display: none; }
        @media (max-width: 600px) {
          .audit-visitor-grid { grid-template-columns: 1fr !important; }
          .audit-score-circles { flex-direction: column; align-items: center; }
        }
      `}</style>

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
              <p style={{ fontSize: "0.85rem", color: "#e74c3c", marginTop: "1rem" }}>
                {hu ? "Nem sikerült lekérni az adatokat. Ellenőrizd az URL-t és próbáld újra." : "Could not fetch data. Check the URL and try again."}
                {errorDetail ? <span style={{ display: "block", fontSize: "0.75rem", color: "#aaa", marginTop: "0.25rem" }}>{errorDetail}</span> : null}
              </p>
            )}
          </form>
        </motion.div>
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

      {/* ── Eredmények ── */}
      <AnimatePresence>
        {status === "done" && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* ── 1. Összefoglaló ── */}
            <section style={{ padding: "4rem 2rem", background: summaryBg, borderBottom: "1px solid #e8e8e8" }}>
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>

                {/* Csak nyomtatásban látható fejléc */}
                <div className="audit-print-header" style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #1a1a1a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.25rem" }}>Website Audit Report</p>
                      <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>{results.url}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.75rem", color: "#bbb", margin: "0 0 0.15rem" }}>richardkormendi.com</p>
                      <p style={{ fontSize: "0.75rem", color: "#bbb", margin: 0 }}>{new Date().toLocaleDateString("hu-HU")}</p>
                    </div>
                  </div>
                </div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>

                  {/* URL + PDF gomb */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
                    <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", margin: 0 }}>
                      {results.url}
                    </p>
                    <button className="audit-print-btn" onClick={() => window.print()}
                      style={{
                        padding: "0.55rem 1.25rem", background: "#fff", border: "1px solid #ddd",
                        borderRadius: "4px", fontSize: "0.8rem", fontWeight: 500, color: "#555",
                        cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.4rem",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#1a1a1a"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#555"; }}>
                      ↓ {hu ? "Mentés PDF-ként" : "Save as PDF"}
                    </button>
                  </div>

                  {/* Verdikt */}
                  <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.75rem", lineHeight: 1.2 }}>
                    {summary.verdict}
                  </h2>
                  <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.7, maxWidth: "600px", marginBottom: "2.5rem" }}>
                    {summary.impact}
                  </p>

                  {/* Pontszám körök */}
                  <div className="audit-score-circles" style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    <ScoreCircle score={results.mobile.score} label={hu ? "📱 Mobil" : "📱 Mobile"} animate />
                    <ScoreCircle score={results.desktop.score} label={hu ? "🖥 Asztali" : "🖥 Desktop"} animate />
                  </div>

                  {/* Jelmagyarázat */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                    {[
                      ["#0cce6b", hu ? "90–100: Kiváló" : "90–100: Good"],
                      ["#ffa400", hu ? "50–89: Fejleszthető" : "50–89: Needs improvement"],
                      ["#ff4e42", hu ? "0–49: Kritikus" : "0–49: Poor"],
                    ].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                        <span style={{ fontSize: "0.75rem", color: "#999" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ── 2. Gyors ellenőrzések ── */}
            {results.checks && Object.keys(results.checks).length > 0 && (() => {
              const c = results.checks;
              const items = [
                {
                  ok: c.https,
                  label: hu ? "Biztonságos kapcsolat (HTTPS)" : "Secure connection (HTTPS)",
                  good: hu ? "Az oldal biztonságos kapcsolaton keresztül tölt be" : "Site loads over a secure connection",
                  bad:  hu ? "Az oldal nem biztonságos — a Google \"Nem biztonságos\" figyelmeztetést mutat" : "Site is not secure — Google shows a 'Not secure' warning",
                },
                {
                  ok: c.hasPhoneLink,
                  skip: c.hasPhoneLink === null,
                  label: hu ? "Telefonszám mobilon kattintható" : "Phone number tappable on mobile",
                  good: hu ? "A telefonszám egy kattintással hívható mobilról" : "Phone number can be called with one tap on mobile",
                  bad:  hu ? "A telefonszám nem kattintható — mobilon kézzel kell átírni és hívni" : "Phone number isn't tappable — mobile visitors must dial manually",
                  warn: c.hasAnyPhone === false
                    ? (hu ? "Nem találtunk telefonszámot az oldalon" : "No phone number found on the page")
                    : null,
                },
                {
                  ok: c.metaDescription,
                  label: hu ? "Google keresési leírás (meta description)" : "Google search snippet (meta description)",
                  good: hu ? "Van keresési leírás — a Google megmutatja az oldal alatt" : "Search description present — Google shows it below the result",
                  bad:  hu ? "Hiányzik a keresési leírás — a Google találatok közt üres az oldal alatt" : "Missing search description — Google shows nothing below the result",
                },
                {
                  ok: c.tapTargets,
                  skip: c.tapTargets === null || c.tapTargets === undefined,
                  label: hu ? "Gombok és linkek mérete mobilon" : "Button and link size on mobile",
                  good: hu ? "A gombok és linkek könnyen megnyomhatók mobilon" : "Buttons and links are easy to tap on mobile",
                  bad:  hu ? "Néhány gomb vagy link túl kicsi mobilon — könnyű mellé nyomni" : "Some buttons or links are too small on mobile — easy to miss",
                },
              ];
              return (
                <section style={{ padding: "3rem 2rem", background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
                  <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        {hu ? "Gyors ellenőrzések" : "Quick checks"}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        {hu ? "Ezek az alapok — amelyeken sok érdeklődő megfordul." : "These are the basics that many visitors rely on."}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {items.map((item) => {
                          if (item.skip) return null;
                          const icon  = item.ok ? "✅" : "❌";
                          const color = item.ok ? "#0cce6b" : "#ff4e42";
                          const text  = item.ok ? item.good : (item.warn || item.bad);
                          return (
                            <div key={item.label} style={{
                              display: "flex", alignItems: "flex-start", gap: "0.75rem",
                              padding: "0.9rem 1.2rem", background: "#fafafa",
                              border: "1px solid #e8e8e8", borderLeft: `3px solid ${color}`,
                              borderRadius: "6px",
                            }}>
                              <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
                              <div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 0.2rem" }}>{item.label}</p>
                                <p style={{ fontSize: "0.8rem", color: "#777", margin: 0, lineHeight: 1.5 }}>{text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                </section>
              );
            })()}

            {/* ── 3. Mit tapasztalnak a látogatóid? ── */}
            <section style={{ padding: "4rem 2rem", background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {hu ? "Mit tapasztalnak a látogatóid?" : "What do your visitors experience?"}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#999", lineHeight: 1.6, marginBottom: "2rem" }}>
                    {hu
                      ? "Az alábbi adatok azt mutatják, mit érez valójában egy átlagos látogató, amikor megnyitja az oldalt."
                      : "These figures show what an average visitor actually experiences when they open your site."}
                  </p>
                  <div className="audit-visitor-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    {[
                      {
                        icon: "📱",
                        title: hu ? "Mobilon" : "On mobile",
                        value: results.mobile.metrics["interactive"]?.displayValue || `${results.mobile.score}/100`,
                        sub: hu ? "várnak, mire kattinthatnak valamire" : "wait before they can interact",
                        desc: results.mobile.score >= 90
                          ? (hu ? "Gyors és kellemes élmény" : "Fast and enjoyable")
                          : results.mobile.score >= 50
                          ? (hu ? "Érezhető várakozás betöltés közben" : "Noticeable wait while loading")
                          : (hu ? "Sokan el fognak menni, mielőtt betölt" : "Many will leave before it loads"),
                        color: scoreColor(results.mobile.score),
                      },
                      {
                        icon: "🖥️",
                        title: hu ? "Asztali gépen" : "On desktop",
                        value: results.desktop.metrics["interactive"]?.displayValue || `${results.desktop.score}/100`,
                        sub: hu ? "várnak, mire kattinthatnak valamire" : "wait before they can interact",
                        desc: results.desktop.score >= 90
                          ? (hu ? "Gyors és kellemes élmény" : "Fast and enjoyable")
                          : results.desktop.score >= 50
                          ? (hu ? "Elfogadható, de lehetne jobb" : "Acceptable, but could be better")
                          : (hu ? "Lassabb, mint elvárható" : "Slower than expected"),
                        color: scoreColor(results.desktop.score),
                      },
                      {
                        icon: "🔍",
                        title: hu ? "Google keresőben" : "In Google Search",
                        value: results.mobile.score >= 90
                          ? (hu ? "Előnyben" : "Favoured")
                          : results.mobile.score >= 50
                          ? (hu ? "Semleges" : "Neutral")
                          : (hu ? "Hátrányban" : "Penalised"),
                        sub: hu ? "a keresési találatok között" : "in search results",
                        desc: hu
                          ? "A Google a sebesség alapján is rangsorolja az oldalakat — a lassú oldal hátrébb kerül."
                          : "Google ranks pages partly by speed — a slow site ranks lower.",
                        color: scoreColor(results.mobile.score),
                      },
                    ].map((item) => (
                      <div key={item.title} style={{
                        padding: "1.5rem", background: "#fafafa",
                        border: "1px solid #e8e8e8", borderTop: `3px solid ${item.color}`,
                        borderRadius: "6px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                          <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {item.title}
                          </span>
                        </div>
                        <p style={{ fontSize: "1.6rem", fontWeight: 700, color: item.color, margin: "0 0 0.2rem", letterSpacing: "-0.02em" }}>
                          {item.value}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "0 0 0.75rem" }}>{item.sub}</p>
                        <p style={{ fontSize: "0.82rem", color: "#666", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ── 3. Részletes mérőszámok + problémák ── */}
            <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>

                {/* Tab váltó */}
                <div className="audit-tabs" style={{ display: "flex", gap: "0.5rem", marginBottom: "3rem", background: "#e8e8e8", borderRadius: "6px", padding: "4px", width: "fit-content" }}>
                  {[["mobile", hu ? "📱 Mobil" : "📱 Mobile"], ["desktop", hu ? "🖥 Asztali" : "🖥 Desktop"]].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      style={{
                        padding: "0.5rem 1.5rem",
                        background: activeTab === key ? "#1a1a1a" : "transparent",
                        color: activeTab === key ? "#fff" : "#888",
                        border: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Mérőszámok */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ marginBottom: "3.5rem" }}>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {hu ? "Részletes mérőszámok" : "Detailed metrics"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    {hu
                      ? "Minden szám mögött ott van a magyarázat: mit érez a látogató, és ez jó-e vagy sem."
                      : "Each number comes with a plain-language explanation of what the visitor actually experiences."}
                  </p>
                  <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                    {Object.keys(METRIC_CONFIG).map(k => (
                      <MetricCard key={k} metricKey={k} data={current?.metrics[k]} lang={lang} />
                    ))}
                  </motion.div>
                </motion.div>

                {/* Mit kell javítani? */}
                {current?.issues?.length > 0 && (
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                      {hu ? "Mit kell javítani?" : "What needs fixing?"}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                      {hu
                        ? "Az alábbi problémák javításával a legtöbbet nyerheted — fontossági sorrendben."
                        : "Fixing these issues will give you the most speed gains — ordered by priority."}
                    </p>
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {current.issues.map(({ key, audit }, i) => (
                        <IssueItem key={i} audit={audit} auditKey={key} lang={lang} />
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Másolható üzenet ── */}
                {outreachMsg && (
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ marginTop: "3rem", padding: "2rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #1a1a1a" }}>
                    <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                      📋 Másolható üzenet
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "1rem", lineHeight: 1.5 }}>
                      LinkedIn-en vagy emailben küldheted el — nem hivatkozik eszközre, nem kér semmit:
                    </p>
                    <p style={{ fontSize: "0.92rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic" }}>
                      "{outreachMsg}"
                    </p>
                    <button onClick={() => handleCopy(outreachMsg)}
                      style={{
                        padding: "0.55rem 1.25rem",
                        background: copied ? "#0cce6b" : "#1a1a1a",
                        color: "#fff", border: "none", borderRadius: "4px",
                        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", transition: "background 0.2s",
                      }}>
                      {copied ? "✓ Másolva!" : "Másolás"}
                    </button>
                  </motion.div>
                )}

                {/* CTA */}
                <motion.div className="audit-cta" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  style={{ marginTop: "4rem", padding: "3rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", textAlign: "center" }}>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
                    {hu ? "Segíthetünk?" : "Need help?"}
                  </p>
                  <h3 style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.75rem", lineHeight: 1.3 }}>
                    {results.mobile.score >= 90
                      ? (hu ? "Szép munka — még messzebb is mehet." : "Great work — there's still room to grow.")
                      : (hu ? "Tudom, mi a gond. Meg is tudom oldani." : "I know what's wrong. I can fix it.")}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.8, maxWidth: "500px", margin: "0 auto 2rem" }}>
                    {results.mobile.score >= 90
                      ? (hu
                          ? "Az oldalad jól teljesít. Ha szeretnéd a következő szintre emelni — SEO, konverzióoptimalizálás, új funkciók — szívesen segítek."
                          : "Your site performs well. If you'd like to take it further — SEO, conversion optimisation, new features — I'm happy to help.")
                      : (hu
                          ? "14 éve csinálom ezt. Ezeket a problémákat már sokszor megoldottam — általában 1–2 héten belül érezhető javulást tudok elérni. Írj, és megnézzük együtt."
                          : "I've been doing this for 14 years. I've fixed these exact problems many times before — noticeable improvements usually within 1–2 weeks. Get in touch.")}
                  </p>
                  <a href="/hire" style={{
                    display: "inline-block", padding: "0.9rem 2rem", background: "#1a1a1a",
                    color: "#fff", textDecoration: "none", borderRadius: "4px",
                    fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em",
                  }}>
                    {hu ? "Kérek ajánlatot →" : "Get a quote →"}
                  </a>
                </motion.div>

              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>

      <div className="audit-footer"><Footer /></div>
    </div>
  );
}
