import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Rejtett oldal — nav-ban NEM látszik
// Közvetlen URL: /audit

const PAGESPEED_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

const METRIC_CONFIG = {
  "first-contentful-paint":    { en: "First Contentful Paint",    hu: "Első tartalom megjelenése",   short: "FCP" },
  "largest-contentful-paint":  { en: "Largest Contentful Paint",   hu: "Legnagyobb elem betöltése",   short: "LCP" },
  "total-blocking-time":       { en: "Total Blocking Time",        hu: "Teljes blokkolási idő",       short: "TBT" },
  "cumulative-layout-shift":   { en: "Cumulative Layout Shift",    hu: "Kumulatív elrendezéstolódás", short: "CLS" },
  "speed-index":               { en: "Speed Index",                hu: "Sebesség index",              short: "SI"  },
  "interactive":               { en: "Time to Interactive",        hu: "Interaktivitás ideje",        short: "TTI" },
};

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

function scoreColor(score) {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function scoreBg(score) {
  if (score >= 90) return "#f0fdf6";
  if (score >= 50) return "#fffbf0";
  return "#fff5f5";
}

function scoreLabel(score, hu) {
  if (score >= 90) return hu ? "Kiváló" : "Good";
  if (score >= 50) return hu ? "Fejleszthető" : "Needs improvement";
  return hu ? "Kritikus" : "Poor";
}

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
      <motion.svg
        width="130" height="130" viewBox="0 0 130 130"
        initial={animate ? { opacity: 0, scale: 0.8 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : false}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e8e8e8" strokeWidth="10" />
        <motion.circle
          cx="65" cy="65" r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          transform="rotate(-90 65 65)"
          initial={{ strokeDashoffset: circ }}
          animate={animate ? { strokeDashoffset: offset } : { strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
          fontSize="28" fontWeight="700" fill={color} fontFamily="Inter, sans-serif">
          {score}
        </text>
        <text x="65" y="82" textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fill="#aaa" fontFamily="Inter, sans-serif" letterSpacing="1">
          /100
        </text>
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

  return (
    <motion.div variants={staggerItem}
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderTop: `3px solid ${color}`,
        borderRadius: "6px",
        padding: "1.25rem",
        display: "flex", flexDirection: "column", gap: "0.4rem",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", fontWeight: 600 }}>
          {config.short}
        </span>
        {score !== null && (
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color, textTransform: "uppercase", fontWeight: 600 }}>
            {scoreLabel(score, lang === "hu")}
          </span>
        )}
      </div>
      <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>
        {data.displayValue || "–"}
      </p>
      <p style={{ fontSize: "0.78rem", color: "#999", margin: 0, lineHeight: 1.4 }}>
        {lang === "hu" ? config.hu : config.en}
      </p>
    </motion.div>
  );
}

function IssueItem({ audit, lang }) {
  if (!audit || audit.score === 1 || audit.score === null) return null;
  const savings = audit.details?.overallSavingsMs
    ? `~${(audit.details.overallSavingsMs / 1000).toFixed(1)}s`
    : null;
  const priority = audit.score < 0.5 ? "high" : "medium";
  const priorityColor = priority === "high" ? "#ff4e42" : "#ffa400";
  const priorityLabel = priority === "high"
    ? (lang === "hu" ? "Kritikus" : "Critical")
    : (lang === "hu" ? "Ajánlott" : "Recommended");

  return (
    <motion.div variants={staggerItem}
      style={{
        display: "flex", gap: "1rem",
        padding: "1.25rem 1.5rem",
        background: "#fff",
        borderRadius: "6px",
        border: "1px solid #e8e8e8",
        borderLeft: `4px solid ${priorityColor}`,
        alignItems: "flex-start",
      }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 0.25rem" }}>
            {audit.title}
          </p>
          <span style={{
            fontSize: "0.65rem", letterSpacing: "0.08em", color: priorityColor,
            textTransform: "uppercase", fontWeight: 700, flexShrink: 0,
            background: `${priorityColor}15`, padding: "2px 8px", borderRadius: "999px",
          }}>
            {priorityLabel}
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#999", margin: 0 }}>
          {savings
            ? (lang === "hu" ? `Potenciális megtakarítás: ${savings}` : `Potential savings: ${savings}`)
            : audit.displayValue || ""}
        </p>
      </div>
    </motion.div>
  );
}

export default function Audit() {
  const { lang } = useLang();
  const hu = lang === "hu";

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("mobile");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;

    setStatus("loading");
    setResults(null);

    try {
      const [mobileRes, desktopRes] = await Promise.all([
        fetch(`${PAGESPEED_URL}?url=${encodeURIComponent(cleanUrl)}&strategy=mobile`),
        fetch(`${PAGESPEED_URL}?url=${encodeURIComponent(cleanUrl)}&strategy=desktop`),
      ]);
      if (!mobileRes.ok || !desktopRes.ok) throw new Error("API error");
      const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()]);

      const parse = (data) => {
        const audits = data.lighthouseResult?.audits || {};
        const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
        const metrics = Object.fromEntries(Object.keys(METRIC_CONFIG).map(k => [k, audits[k] || null]));
        const issues = OPPORTUNITY_KEYS
          .map(k => audits[k])
          .filter(a => a && a.score !== null && a.score < 1)
          .sort((a, b) => a.score - b.score)
          .slice(0, 8);
        return { score, metrics, issues };
      };

      setResults({ mobile: parse(mobile), desktop: parse(desktop), url: cleanUrl });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const current = results?.[activeTab];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero — sötét, de kompakt */}
      <section style={{ background: "#1a1a1a", color: "#fff", padding: "9rem 2rem 5rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {hu ? "Ingyenes eszköz" : "Free tool"}
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem" }}>
            {hu ? "Weboldal audit" : "Website audit"}
          </h1>
          <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.7, maxWidth: "460px", margin: "0 auto 3rem" }}>
            {hu
              ? "Írd be a weboldal URL-jét — megmutatjuk a teljesítmény, sebesség és technikai problémákat."
              : "Enter any website URL — we'll show you performance, speed and technical issues."}
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="pl. pelda.hu vagy https://pelda.hu"
                required
                style={{
                  flex: "1 1 260px", padding: "0.95rem 1.25rem",
                  background: "#111", border: "1px solid #333", borderRadius: "4px",
                  color: "#fff", fontSize: "0.95rem", fontFamily: "inherit", outline: "none",
                }}
              />
              <button type="submit" disabled={status === "loading"}
                style={{
                  padding: "0.95rem 2rem",
                  background: status === "loading" ? "#333" : "#fff",
                  color: status === "loading" ? "#666" : "#1a1a1a",
                  border: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.05em", cursor: status === "loading" ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>
                {status === "loading" ? (hu ? "Elemzés..." : "Analyzing...") : (hu ? "Audit →" : "Run audit →")}
              </button>
            </div>
            {status === "error" && (
              <p style={{ fontSize: "0.85rem", color: "#ff6b6b", marginTop: "1rem" }}>
                {hu ? "Nem sikerült lekérni az adatokat. Ellenőrizd az URL-t és próbáld újra." : "Could not fetch data. Check the URL and try again."}
              </p>
            )}
          </form>
        </motion.div>
      </section>

      {/* Loading */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "5rem 2rem", background: "#f7f6f3" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ width: "32px", height: "32px", border: "2px solid #ddd", borderTopColor: "#1a1a1a", borderRadius: "50%", margin: "0 auto 1.5rem" }}
            />
            <p style={{ fontSize: "0.9rem", color: "#999", letterSpacing: "0.05em" }}>
              {hu ? "Google PageSpeed elemzés fut... (~15 mp)" : "Running Google PageSpeed analysis... (~15 sec)"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {status === "done" && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Score section */}
            <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {results.url}
                  </p>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "3rem" }}>
                    {hu ? "Teljesítmény pontszám" : "Performance score"}
                  </p>

                  <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "3rem" }}>
                    <ScoreCircle score={results.mobile.score} label={hu ? "📱 Mobil" : "📱 Mobile"} animate />
                    <ScoreCircle score={results.desktop.score} label={hu ? "🖥 Asztali" : "🖥 Desktop"} animate />
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                    {[["#0cce6b", hu ? "90–100: Kiváló" : "90–100: Good"], ["#ffa400", hu ? "50–89: Fejleszthető" : "50–89: Needs improvement"], ["#ff4e42", hu ? "0–49: Kritikus" : "0–49: Poor"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                        <span style={{ fontSize: "0.75rem", color: "#999" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Metrics + Issues */}
            <section style={{ padding: "5rem 2rem", background: "#fff" }}>
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>

                {/* Tab */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "3rem", background: "#f0f0f0", borderRadius: "6px", padding: "4px", width: "fit-content" }}>
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

                {/* Core Web Vitals */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ marginBottom: "3rem" }}>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                    Core Web Vitals
                  </p>
                  <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "1rem" }}>
                    {Object.keys(METRIC_CONFIG).map(k => (
                      <MetricCard key={k} metricKey={k} data={current?.metrics[k]} lang={lang} />
                    ))}
                  </motion.div>
                </motion.div>

                {/* Issues */}
                {current?.issues?.length > 0 && (
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      {hu ? "Fejlesztési lehetőségek" : "Opportunities to improve"}
                    </p>
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {current.issues.map((issue, i) => (
                        <IssueItem key={i} audit={issue} lang={lang} />
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* CTA */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  style={{ marginTop: "4rem", padding: "3rem", background: "#f7f6f3", borderRadius: "8px", border: "1px solid #e8e8e8", textAlign: "center" }}>
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
                    {hu ? "Segíthetünk?" : "Need help?"}
                  </p>
                  <h3 style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.75rem", lineHeight: 1.3 }}>
                    {hu ? "Javítanád ezeket a problémákat?" : "Want these issues fixed?"}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto 2rem" }}>
                    {hu
                      ? "14 év tapasztalattal segítünk a weboldal optimalizálásban — SEO, sebesség, mobilbarát dizájn."
                      : "14 years of experience in web optimisation — SEO, speed, mobile-friendly design."}
                  </p>
                  <a href="/hire"
                    style={{ display: "inline-block", padding: "0.9rem 2rem", background: "#1a1a1a", color: "#fff", textDecoration: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                    {hu ? "Kérek ajánlatot →" : "Get a quote →"}
                  </a>
                </motion.div>
              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
