import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Mock adatok ───────────────────────────────────────────────────────────────
const DAILY = [
  { day: "May 1",  u: 23 }, { day: "May 2",  u: 31 }, { day: "May 3",  u: 19 },
  { day: "May 4",  u: 45 }, { day: "May 5",  u: 52 }, { day: "May 6",  u: 38 },
  { day: "May 7",  u: 29 }, { day: "May 8",  u: 41 }, { day: "May 9",  u: 67 },
  { day: "May 10", u: 58 }, { day: "May 11", u: 44 }, { day: "May 12", u: 71 },
  { day: "May 13", u: 83 }, { day: "May 14", u: 62 }, { day: "May 15", u: 55 },
  { day: "May 16", u: 48 }, { day: "May 17", u: 39 }, { day: "May 18", u: 51 },
  { day: "May 19", u: 64 }, { day: "May 20", u: 72 }, { day: "May 21", u: 58 },
  { day: "May 22", u: 46 }, { day: "May 23", u: 53 }, { day: "May 24", u: 61 },
  { day: "May 25", u: 69 }, { day: "May 26", u: 54 }, { day: "May 27", u: 48 },
  { day: "May 28", u: 43 }, { day: "May 29", u: 37 }, { day: "May 30", u: 32 },
];

const SOURCES = [
  { name: "Organic Search", pct: 38, sessions: 600,  color: "#1a1a1a" },
  { name: "Direct",         pct: 28, sessions: 442,  color: "#4a4a4a" },
  { name: "Social",         pct: 24, sessions: 379,  color: "#888" },
  { name: "Referral",       pct: 10, sessions: 158,  color: "#bbb" },
];

const TOP_PAGES = [
  { rank: 1, page: "/",         label: "Home",        views: 1247, avgTime: "2:34" },
  { rank: 2, page: "/epk",      label: "EPK",         views: 312,  avgTime: "3:12" },
  { rank: 3, page: "/hire",     label: "Hire",        views: 289,  avgTime: "4:01" },
  { rank: 4, page: "/audit",    label: "Audit Tool",  views: 187,  avgTime: "5:23" },
  { rank: 5, page: "/analytics",label: "Analytics",   views: 94,   avgTime: "6:45" },
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
    body: "312 sessions on the EPK with an average dwell time of 3:12 — music industry contacts are reading thoroughly. High engagement suggests the content is relevant to their decision process.",
    rec: "Add a direct contact CTA above the fold on the EPK page to reduce friction for bookers.",
  },
  {
    icon: "📱",
    title: "Bounce rate (42.3%) is well below industry average",
    body: "The sector benchmark for personal portfolio sites is 55–65%. A 42.3% bounce rate means visitors are scrolling through multiple sections — the single-page layout is working.",
    rec: "Monitor this as traffic grows. A spike often signals a slow page or broken section on a specific device.",
  },
  {
    icon: "🔍",
    title: "Organic search growing steadily by week 3",
    body: "Daily organic sessions climbed from ~8/day in week 1 to ~25/day by week 3, reflecting Google's indexing and early SEO gains. The /audit tool draws long-tail queries.",
    rec: "Publish one piece of content per month targeting local business + web audit keywords to compound this growth.",
  },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── SVG Area Chart ────────────────────────────────────────────────────────────
function AreaChartSVG({ data }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);

  const W = 760, H = 180;
  const PAD = { t: 16, r: 12, b: 32, l: 36 };
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;

  const maxU = Math.max(...data.map(d => d.u));
  const xOf = i => PAD.l + (i / (data.length - 1)) * pw;
  const yOf = v => PAD.t + ph - (v / maxU) * ph;

  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.u), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = linePath
    + ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.t + ph).toFixed(1)}`
    + ` L${pts[0].x.toFixed(1)},${(PAD.t + ph).toFixed(1)} Z`;

  const yTicks = [0, Math.round(maxU * 0.5), maxU];
  const xTicks = data.filter((_, i) => i % 5 === 0);

  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}
        ref={svgRef}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1a1a" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map(v => (
          <line key={v} x1={PAD.l} y1={yOf(v)} x2={PAD.l + pw} y2={yOf(v)}
            stroke="#efefef" strokeWidth="1" />
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#ag)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#1a1a1a" strokeWidth="1.8"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover bars + dots */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(p)} style={{ cursor: "default" }}>
            <rect x={p.x - 12} y={PAD.t} width={24} height={ph}
              fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hovered?.day === p.day ? 4 : 0}
              fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            {hovered?.day === p.day && (
              <line x1={p.x} y1={PAD.t} x2={p.x} y2={PAD.t + ph}
                stroke="#e0e0e0" strokeWidth="1" strokeDasharray="3,3" />
            )}
          </g>
        ))}

        {/* X labels */}
        {xTicks.map((d, j) => (
          <text key={j} x={xOf(j * 5)} y={H - 6} textAnchor="middle"
            fontSize="10" fill="#bbb">{d.day.replace("May ", "")}</text>
        ))}

        {/* Y labels */}
        {yTicks.map(v => (
          <text key={v} x={PAD.l - 6} y={yOf(v) + 4} textAnchor="end"
            fontSize="10" fill="#bbb">{v}</text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          top: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: "6px",
          padding: "8px 14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          pointerEvents: "none",
          fontSize: "0.8rem",
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: "#999" }}>{hovered.day}</span>
          <span style={{ marginLeft: "10px", fontWeight: 700, color: "#1a1a1a" }}>
            {hovered.u} users
          </span>
        </div>
      )}
    </div>
  );
}

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const cx = 100, cy = 100, ro = 88, ri = 54;
  const total = data.reduce((s, d) => s + d.pct, 0);

  let angle = -Math.PI / 2;
  const arcs = data.map(d => {
    const sweep = (d.pct / total) * 2 * Math.PI;
    const a = { start: angle, end: angle + sweep - 0.03, ...d };
    angle += sweep;
    return a;
  });

  const arc = (sa, ea, r) => {
    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
  };

  const slicePath = (sa, ea) => {
    const o = arc(sa, ea, ro);
    const i = arc(ea, sa, ri);
    return `${o} L${(cx + ri * Math.cos(ea)).toFixed(2)},${(cy + ri * Math.sin(ea)).toFixed(2)} ${i} Z`;
  };

  const hov = hovered != null ? arcs[hovered] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg viewBox="0 0 200 200" width="180" height="180">
          {arcs.map((a, i) => (
            <path key={i}
              d={slicePath(a.start, a.end)}
              fill={a.color}
              opacity={hovered === null || hovered === i ? 1 : 0.35}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center label */}
          {hov ? (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1a1a1a">
                {hov.pct}%
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9.5" fill="#999">
                {hov.sessions} sessions
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="600" fill="#1a1a1a">
                1,579
              </text>
              <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#bbb">
                total sessions
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", flex: 1 }}>
        {data.map((d, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default",
              opacity: hovered === null || hovered === i ? 1 : 0.4, transition: "opacity 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.83rem", color: "#555" }}>{d.name}</span>
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a" }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Kártya ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, delay = 0 }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} transition={{ delay }}
      style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px",
        padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.14em", color: "#999", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#1a1a1a", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "0.78rem", color: "#bbb" }}>{sub}</p>}
    </motion.div>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────────────────────
export default function Analytics() {
  useEffect(() => {
    document.title = "Analytics Case Study | Richard Körmendi";
    return () => { document.title = "Richard Körmendi"; };
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={{ background: "#1a1a1a", padding: "10rem 2rem 6rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          style={{ maxWidth: "640px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", fontSize: "0.72rem", letterSpacing: "0.18em",
            color: "#555", textTransform: "uppercase", marginBottom: "1.5rem",
            border: "1px solid #333", borderRadius: "100px", padding: "4px 14px" }}>
            Portfolio Project · Data Analysis
          </span>
          <h1 style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.15,
            color: "#fff", margin: "0 0 1.25rem", letterSpacing: "-0.03em" }}>
            Analytics Case Study:<br />richardkormendi.com
          </h1>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#888", margin: "0 0 2rem" }}>
            A full breakdown of the first 30 days after launch — traffic patterns,
            audience behaviour, and actionable recommendations.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            {["May 1–30, 2026", "Google Analytics 4", "Demo / Mock Data"].map(tag => (
              <span key={tag} style={{ fontSize: "0.78rem", color: "#666",
                background: "#242424", borderRadius: "100px", padding: "4px 12px" }}>{tag}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* KPI */}
      <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999",
              textTransform: "uppercase", marginBottom: "2rem" }}>
            Key Performance Indicators
          </motion.p>
          <div className="a-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <KpiCard label="Unique Visitors"       value="1,247"  sub="in 30 days"               delay={0}    />
            <KpiCard label="Sessions"              value="1,579"  sub="1.27 sessions / visitor"   delay={0.07} />
            <KpiCard label="Bounce Rate"           value="42.3%"  sub="↓ 13pt below avg."         delay={0.14} />
            <KpiCard label="Avg. Session Duration" value="2m 34s" sub="industry avg. 2m 17s"      delay={0.21} />
          </div>
        </div>
      </section>

      {/* AREA CHART */}
      <section style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999",
              textTransform: "uppercase", marginBottom: "0.6rem" }}>Daily Traffic</p>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 600, color: "#1a1a1a", margin: "0 0 0.4rem" }}>
              Visitor trend — first 30 days
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#aaa", margin: 0 }}>
              Spikes on May 9, 13, 20 correspond to social media activity. Hover for daily detail.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ background: "#fafafa", border: "1px solid #f0f0f0",
              borderRadius: "10px", padding: "1.5rem 1rem 0.5rem" }}>
            <AreaChartSVG data={DAILY} />
          </motion.div>
        </div>
      </section>

      {/* TRAFFIC SOURCES + STATS */}
      <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999",
              textTransform: "uppercase", marginBottom: "2rem" }}>
            Traffic Sources
          </motion.p>
          <div className="a-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

            {/* Donut */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ background: "#fff", borderRadius: "10px", padding: "2rem",
                border: "1px solid #e8e8e8" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a" }}>
                Acquisition channels
              </h3>
              <DonutChart data={SOURCES} />
            </motion.div>

            {/* Stat kártyák */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.1 }} transition={{ delay: 0.1 }}
              style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[
                { label: "Mobile traffic",   value: "71%", note: "iPhone & Android",      bar: 71 },
                { label: "Desktop traffic",  value: "25%", note: "Laptop & desktop",       bar: 25 },
                { label: "Tablet",           value: "4%",  note: "iPad & other",           bar: 4 },
                { label: "New visitors",     value: "79%", note: "vs 21% returning",       bar: 79 },
                { label: "Pages / session",  value: "3.2", note: "industry avg. 2.8",      bar: null },
                { label: "Top country",      value: "HU",  note: "Hungary — 68% of traffic", bar: null },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "8px", padding: "0.9rem 1.1rem",
                  border: "1px solid #e8e8e8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: s.bar ? "8px" : 0 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "#999" }}>{s.label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#ccc" }}>{s.note}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a",
                      letterSpacing: "-0.02em" }}>{s.value}</p>
                  </div>
                  {s.bar && (
                    <div style={{ height: "3px", background: "#f0f0f0", borderRadius: "2px" }}>
                      <div style={{ width: `${s.bar}%`, height: "100%", background: "#1a1a1a", borderRadius: "2px" }} />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* TOP PAGES */}
      <section style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#999",
              textTransform: "uppercase", marginBottom: "0.6rem" }}>Top Pages</p>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
              Most visited pages
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
            <div className="a-tbl-hdr" style={{ display: "grid",
              gridTemplateColumns: "36px 1fr 100px 120px 110px",
              gap: "1rem", padding: "0.85rem 1.5rem",
              background: "#f7f6f3", borderBottom: "1px solid #e8e8e8" }}>
              {["#", "Page", "Pageviews", "Avg. Time", "Share"].map(h => (
                <p key={h} style={{ margin: 0, fontSize: "0.7rem", letterSpacing: "0.12em",
                  color: "#aaa", textTransform: "uppercase" }}>{h}</p>
              ))}
            </div>
            {TOP_PAGES.map((row, i) => (
              <motion.div key={row.page}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="a-tbl-row"
                style={{ display: "grid",
                  gridTemplateColumns: "36px 1fr 100px 120px 110px",
                  gap: "1rem", padding: "0.95rem 1.5rem",
                  borderBottom: i < TOP_PAGES.length - 1 ? "1px solid #f5f5f5" : "none",
                  alignItems: "center", transition: "background 0.15s", cursor: "default" }}
                onHoverStart={e => { }}
                onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#ccc", fontWeight: 600 }}>{row.rank}</p>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "#1a1a1a" }}>{row.label}</p>
                  <p style={{ margin: 0, fontSize: "0.73rem", color: "#bbb", fontFamily: "monospace" }}>{row.page}</p>
                </div>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a" }}>
                  {row.views.toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#555" }}>{row.avgTime}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ flex: 1, height: "3px", background: "#f0f0f0", borderRadius: "2px" }}>
                    <div style={{ width: `${Math.round((row.views / 1247) * 100)}%`,
                      height: "100%", background: "#1a1a1a", borderRadius: "2px" }} />
                  </div>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#bbb", whiteSpace: "nowrap" }}>
                    {Math.round((row.views / 1247) * 100)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section style={{ padding: "5rem 2rem 6rem", background: "#1a1a1a" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", color: "#555",
              textTransform: "uppercase", marginBottom: "0.6rem" }}>Analysis</p>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 600, color: "#fff", margin: 0 }}>
              What the data says
            </h2>
          </motion.div>
          <div className="a-insights" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
            {INSIGHTS.map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.1 }} transition={{ delay: i * 0.07 }}
                style={{ background: "#242424", borderRadius: "10px", padding: "1.75rem",
                  border: "1px solid #2e2e2e", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: "0.93rem", fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
                  {item.title}
                </p>
                <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.7, color: "#888" }}>{item.body}</p>
                <div style={{ borderTop: "1px solid #2e2e2e", paddingTop: "0.7rem", marginTop: "0.2rem" }}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", color: "#444",
                    textTransform: "uppercase", letterSpacing: "0.08em" }}>→ Recommendation</p>
                  <p style={{ margin: 0, fontSize: "0.83rem", color: "#aaa", lineHeight: 1.6 }}>{item.rec}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section style={{ padding: "1.75rem 2rem", background: "#111", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.76rem", color: "#444", letterSpacing: "0.05em" }}>
          Analysis powered by{" "}
          <span style={{ color: "#666" }}>Google Analytics 4</span>
          {" "}+{" "}
          <span style={{ color: "#666" }}>Claude AI</span>
          {" · "}
          <span style={{ color: "#333" }}>Demo data based on realistic GA4 benchmarks for a new personal domain</span>
        </p>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 700px) {
          .a-kpi      { grid-template-columns: 1fr 1fr !important; }
          .a-2col     { grid-template-columns: 1fr !important; }
          .a-insights { grid-template-columns: 1fr !important; }
          .a-tbl-hdr  { grid-template-columns: 36px 1fr 80px 90px !important; }
          .a-tbl-row  { grid-template-columns: 36px 1fr 80px 90px !important; }
          .a-tbl-hdr  > p:last-child,
          .a-tbl-row  > div:last-child { display: none !important; }
        }
        @media (max-width: 480px) {
          .a-kpi { grid-template-columns: 1fr !important; }
          .a-tbl-hdr { grid-template-columns: 36px 1fr 80px !important; }
          .a-tbl-row { grid-template-columns: 36px 1fr 80px !important; }
          .a-tbl-hdr > p:nth-child(4),
          .a-tbl-row > p:nth-child(4) { display: none !important; }
        }
      `}</style>
    </>
  );
}
