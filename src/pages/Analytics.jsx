import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Mock adatok (GA4-kompatibilis, reális első hónap) ────────────────────────
const DAILY_DATA = [
  { day: "May 1",  users: 23 }, { day: "May 2",  users: 31 }, { day: "May 3",  users: 19 },
  { day: "May 4",  users: 45 }, { day: "May 5",  users: 52 }, { day: "May 6",  users: 38 },
  { day: "May 7",  users: 29 }, { day: "May 8",  users: 41 }, { day: "May 9",  users: 67 },
  { day: "May 10", users: 58 }, { day: "May 11", users: 44 }, { day: "May 12", users: 71 },
  { day: "May 13", users: 83 }, { day: "May 14", users: 62 }, { day: "May 15", users: 55 },
  { day: "May 16", users: 48 }, { day: "May 17", users: 39 }, { day: "May 18", users: 51 },
  { day: "May 19", users: 64 }, { day: "May 20", users: 72 }, { day: "May 21", users: 58 },
  { day: "May 22", users: 46 }, { day: "May 23", users: 53 }, { day: "May 24", users: 61 },
  { day: "May 25", users: 69 }, { day: "May 26", users: 54 }, { day: "May 27", users: 48 },
  { day: "May 28", users: 43 }, { day: "May 29", users: 37 }, { day: "May 30", users: 32 },
];

const TRAFFIC_SOURCES = [
  { name: "Organic Search", value: 38, sessions: 600 },
  { name: "Direct",         value: 28, sessions: 442 },
  { name: "Social",         value: 24, sessions: 379 },
  { name: "Referral",       value: 10, sessions: 158 },
];

const TOP_PAGES = [
  { rank: 1, page: "/", label: "Home",      views: 1247, avgTime: "2:34", pct: 100 },
  { rank: 2, page: "/epk",   label: "EPK",  views: 312,  avgTime: "3:12", pct: 25  },
  { rank: 3, page: "/hire",  label: "Hire", views: 289,  avgTime: "4:01", pct: 23  },
  { rank: 4, page: "/audit", label: "Audit Tool", views: 187, avgTime: "5:23", pct: 15 },
  { rank: 5, page: "/analytics", label: "Analytics",  views: 94,  avgTime: "6:45", pct: 8 },
];

const INSIGHTS = [
  {
    icon: "📌",
    title: "Direct traffic (28%) signals strong offline presence",
    body: "Nearly a third of visitors arrived by typing the URL directly — a clear sign that real-world introductions, business cards, and word-of-mouth are converting. This is rare for a brand-new domain.",
    rec: "Lean into personal outreach. Each in-person pitch is worth more than most paid clicks.",
  },
  {
    icon: "🎵",
    title: "EPK is the second most visited page",
    body: "312 sessions on the EPK page with an average dwell time of 3:12 — music industry contacts are reading thoroughly, not just glancing. High engagement suggests the content is relevant to their decision process.",
    rec: "Add a direct contact CTA above the fold on the EPK page to reduce friction for bookers.",
  },
  {
    icon: "📱",
    title: "Bounce rate (42.3%) is well below industry average",
    body: "The sector benchmark for personal portfolio sites is 55–65%. A 42.3% bounce rate means visitors are scrolling through multiple sections instead of leaving immediately — the single-page layout is working.",
    rec: "Monitor this as traffic grows. A spike in bounce rate often signals a slow page or broken section on a specific device.",
  },
  {
    icon: "🔍",
    title: "Organic search growing steadily by week 3",
    body: "Daily organic sessions climbed from ~8/day in week 1 to ~25/day by week 3, reflecting Google's indexing and early SEO gains. The /audit tool is drawing long-tail queries around website audits.",
    rec: "Publish one piece of content per month targeting local business + web audit keywords to compound this growth.",
  },
];

const PIE_COLORS = ["#1a1a1a", "#555", "#888", "#bbb"];

// ── Animáció segédfüggvény ───────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Custom Tooltip a AreaChart-hoz ───────────────────────────────────────────
function CustomAreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "6px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "0.82rem" }}>
      <p style={{ margin: "0 0 4px", color: "#999", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600, color: "#1a1a1a" }}>{payload[0].value} users</p>
    </div>
  );
}

// ── Custom Tooltip a PieChart-hoz ────────────────────────────────────────────
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "6px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "0.82rem" }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1a1a" }}>{d.name}</p>
      <p style={{ margin: 0, color: "#555" }}>{d.value}% — {d.sessions} sessions</p>
    </div>
  );
}

// ── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// ── KPI Kártya ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, delay }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay }}
      style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.14em", color: "#999", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#1a1a1a", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "0.78rem", color: "#bbb" }}>{sub}</p>}
    </motion.div>
  );
}

// ── Fő komponens ─────────────────────────────────────────────────────────────
export default function Analytics() {
  useEffect(() => {
    document.title = "Analytics Case Study | Richard Körmendi";
    return () => { document.title = "Richard Körmendi"; };
  }, []);

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "#1a1a1a", padding: "10rem 2rem 6rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ maxWidth: "680px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", fontSize: "0.72rem", letterSpacing: "0.18em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem", border: "1px solid #333", borderRadius: "100px", padding: "4px 14px" }}>
            Portfolio Project · Data Analysis
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.15, color: "#fff", margin: "0 0 1.25rem", letterSpacing: "-0.03em" }}>
            Analytics Case Study:<br />richardkormendi.com
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#888", margin: "0 0 2rem" }}>
            A full breakdown of the first 30 days after launch — traffic patterns, audience behaviour, and actionable recommendations.
          </p>
          <div style={{ display: "inline-flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            {["May 1–30, 2026", "Google Analytics 4", "Demo / Mock Data"].map(tag => (
              <span key={tag} style={{ fontSize: "0.78rem", letterSpacing: "0.08em", color: "#666", background: "#242424", borderRadius: "100px", padding: "4px 12px" }}>{tag}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── KPI KÁRTYÁK ─────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: "2rem" }}>
            Key Performance Indicators
          </motion.p>
          <div className="analytics-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <KpiCard label="Unique Visitors"      value="1,247"   sub="in 30 days"              delay={0}    />
            <KpiCard label="Sessions"             value="1,583"   sub="1.27 sessions / visitor"  delay={0.07} />
            <KpiCard label="Bounce Rate"          value="42.3%"   sub="↓ 13pt below avg."        delay={0.14} />
            <KpiCard label="Avg. Session Duration" value="2m 34s" sub="industry avg. 2m 17s"     delay={0.21} />
          </div>
        </div>
      </section>

      {/* ── LÁTOGATÓI TREND ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: "0.75rem" }}>Daily Traffic</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
              Visitor trend — first 30 days
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "0.5rem" }}>
              Organic growth with clear spikes following social media activity (May 9, May 13, May 20)
            </p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            style={{ background: "#fafafa", borderRadius: "10px", padding: "2rem 1rem 1rem", border: "1px solid #f0f0f0" }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={DAILY_DATA} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a1a1a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#bbb" }} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
                <Tooltip content={CustomAreaTooltip} />
                <Area
                  type="monotone" dataKey="users" stroke="#1a1a1a"
                  fill="url(#gradUsers)" strokeWidth={2}
                  dot={false} activeDot={{ r: 5, fill: "#1a1a1a", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ── TRAFFIC SOURCES + DEVICES ────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: "2rem" }}>
            Traffic Sources
          </motion.p>
          <div className="analytics-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

            {/* Pie chart */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              style={{ background: "#fff", borderRadius: "10px", padding: "2rem", border: "1px solid #e8e8e8" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 1.5rem" }}>Acquisition channels</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={TRAFFIC_SOURCES} cx="50%" cy="50%"
                    innerRadius={58} outerRadius={95}
                    dataKey="value" paddingAngle={2}
                  >
                    {TRAFFIC_SOURCES.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={CustomPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
                {TRAFFIC_SOURCES.map((s, i) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i], flexShrink: 0 }} />
                      <span style={{ color: "#555" }}>{s.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats oldal */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.1 }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Mobile traffic",    value: "71%",  note: "iPhone & Android" },
                { label: "Desktop traffic",   value: "25%",  note: "Laptop & desktop" },
                { label: "Tablet",            value: "4%",   note: "iPad & other" },
                { label: "New visitors",      value: "79%",  note: "vs 21% returning" },
                { label: "Pages / session",   value: "3.2",  note: "industry avg. 2.8" },
                { label: "Top country",       value: "HU",   note: "Hungary — 68% of traffic" },
              ].map((stat, i) => (
                <motion.div key={stat.label} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  style={{ background: "#fff", borderRadius: "8px", padding: "1rem 1.25rem", border: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#999", letterSpacing: "0.05em" }}>{stat.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#bbb" }}>{stat.note}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── TOP PAGES TÁBLÁZAT ───────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: "0.75rem" }}>Top Pages</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
              Most visited pages
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 130px 120px", gap: "1rem", padding: "0.9rem 1.5rem", background: "#f7f6f3", borderBottom: "1px solid #e8e8e8" }}>
              {["#", "Page", "Pageviews", "Avg. Time", "% of total"].map(h => (
                <p key={h} style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", fontWeight: 500 }}>{h}</p>
              ))}
            </div>
            {/* Rows */}
            {TOP_PAGES.map((row, i) => (
              <motion.div key={row.page}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 130px 120px", gap: "1rem", padding: "1rem 1.5rem", borderBottom: i < TOP_PAGES.length - 1 ? "1px solid #f5f5f5" : "none", alignItems: "center", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#ccc", fontWeight: 600 }}>{row.rank}</p>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "#1a1a1a" }}>{row.label}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#bbb", fontFamily: "monospace" }}>{row.page}</p>
                </div>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a" }}>{row.views.toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{row.avgTime}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, height: "4px", background: "#f0f0f0", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${row.pct}%`, height: "100%", background: "#1a1a1a", borderRadius: "2px" }} />
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#999", whiteSpace: "nowrap" }}>{row.pct}%</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INSIGHTS ────────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem 6rem", background: "#1a1a1a" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#555", textTransform: "uppercase", marginBottom: "0.75rem" }}>Analysis</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#fff", margin: 0 }}>
              What the data says
            </h2>
          </motion.div>
          <div className="analytics-insights-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {INSIGHTS.map((item, i) => (
              <motion.div key={i}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.1 }} transition={{ delay: i * 0.08 }}
                style={{ background: "#242424", borderRadius: "10px", padding: "1.75rem", border: "1px solid #2e2e2e", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.7, color: "#888" }}>{item.body}</p>
                <div style={{ borderTop: "1px solid #2e2e2e", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#555", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.3rem" }}>→ Recommendation</p>
                  <p style={{ margin: 0, fontSize: "0.84rem", color: "#aaa", lineHeight: 1.6 }}>{item.rec}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER NOTE ─────────────────────────────────────────────────── */}
      <section style={{ padding: "2rem", background: "#111", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#444", letterSpacing: "0.06em" }}>
          Analysis powered by{" "}
          <span style={{ color: "#666" }}>Google Analytics 4</span>
          {" "}+{" "}
          <span style={{ color: "#666" }}>Claude AI</span>
          {" "}·{" "}
          <span style={{ color: "#333" }}>Demo data based on realistic GA4 benchmarks for a new personal domain</span>
        </p>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 700px) {
          .analytics-kpi-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .analytics-2col {
            grid-template-columns: 1fr !important;
          }
          .analytics-insights-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 520px) {
          .analytics-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
