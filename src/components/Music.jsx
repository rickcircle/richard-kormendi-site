import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const ACCENT = "#e8963a";
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/artist/5UW4cZ0M83TG2nJWYvkVkp?utm_source=generator&theme=0";

const VOCAL_VIDEOS = [
  { id: "3SgUws3Gkuw", title: "You Become My Only" },
  { id: "TRn2qxJAvKE", title: "Cold Urban Sighs" },
  { id: "r144oflIpPI", title: "Like An Ember" },
];

const INSTRUMENTAL_VIDEOS = [
  { id: "jGYNDMMb734", title: "Light In The Dark" },
  { id: "WODjlfmb5ag", title: "The Absent" },
];

const streamingLinks = [
  { label: "Spotify",       href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { label: "Apple Music",   href: "https://music.apple.com/hu/artist/richard-k%C3%B6rmendi/1877841316" },
  { label: "YouTube",       href: "https://www.youtube.com/@richardkormendi6379" },
  { label: "Tidal",         href: "https://tidal.com/artist/74624158" },
  { label: "Instagram",     href: "https://www.instagram.com/rickormendi/" },
];

export default function Music() {
  const { lang } = useLang();
  const tx = t[lang].music;
  const [tab, setTab] = useState("listen");
  const [category, setCategory] = useState("vocal");
  const [activeVideo, setActiveVideo] = useState(0);

  const VIDEOS = category === "vocal" ? VOCAL_VIDEOS : INSTRUMENTAL_VIDEOS;

  const selectCategory = key => {
    setCategory(key);
    setActiveVideo(0);
  };

  return (
    <section id="music" style={{ background: "#0b0a08", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "2rem", color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "rgba(245,241,234,0.65)", marginBottom: "3rem" }}>
            {tx.body}
          </p>

          {/* Tab váltó — pill stílus */}
          <div style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "999px",
            padding: "4px",
            gap: "4px",
            marginBottom: "2.5rem",
          }}>
            {[
              { key: "listen", label: lang === "hu" ? "🎵 Hallgass" : "🎵 Listen" },
              { key: "watch",  label: lang === "hu" ? "▶ Nézz"     : "▶ Watch" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  borderRadius: "999px",
                  padding: "0.55rem 1.4rem",
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  color: tab === key ? "#fff" : "rgba(245,241,234,0.5)",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  transition: "color 0.2s",
                  zIndex: 1,
                }}
              >
                {tab === key && (
                  <motion.div
                    layoutId="pill"
                    style={{
                      position: "absolute", inset: 0,
                      background: ACCENT,
                      borderRadius: "999px",
                      boxShadow: "0 0 20px rgba(232,150,58,0.4)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>

          {/* Tab tartalom */}
          <AnimatePresence mode="wait">
            {tab === "listen" ? (
              <motion.div
                key="listen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ marginBottom: "3rem", borderRadius: "12px", overflow: "hidden" }}
              >
                <iframe
                  src={SPOTIFY_EMBED_URL}
                  width="100%" height="352" frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy" title="Spotify – Richard Körmendi"
                  style={{ display: "block" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="watch"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ marginBottom: "3rem" }}
              >
                {/* Vocal / Instrumental al-váltó */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  {[
                    { key: "vocal",        label: lang === "hu" ? "Énekes dalok" : "Vocal Tracks" },
                    { key: "instrumental", label: lang === "hu" ? "Instrumentális" : "Instrumental" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => selectCategory(key)}
                      style={{
                        padding: "0.4rem 1rem",
                        border: `1px solid ${category === key ? ACCENT : "rgba(255,255,255,0.15)"}`,
                        borderRadius: "999px",
                        background: category === key ? ACCENT : "transparent",
                        color: category === key ? "#fff" : "rgba(245,241,234,0.5)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                        boxShadow: category === key ? "0 0 16px rgba(232,150,58,0.35)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ borderRadius: "4px", overflow: "hidden", position: "relative", aspectRatio: "16/9", marginBottom: "1rem" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${VIDEOS[activeVideo].id}`}
                    width="100%" height="100%" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen loading="lazy"
                    title={`${VIDEOS[activeVideo].title} – Richard Körmendi`}
                    style={{ display: "block", position: "absolute", inset: 0 }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {VIDEOS.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVideo(i)}
                      style={{
                        flex: 1,
                        padding: "0.6rem 1rem",
                        border: `1px solid ${activeVideo === i ? ACCENT : "rgba(255,255,255,0.15)"}`,
                        borderRadius: "4px",
                        background: activeVideo === i ? ACCENT : "transparent",
                        color: activeVideo === i ? "#fff" : "rgba(245,241,234,0.5)",
                        fontSize: "0.8rem",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>
              {lang === "hu" ? "Hallgass mindenhol" : "Listen everywhere"}
            </p>
            <div className="streaming-grid">
              {streamingLinks.filter(l => l.href !== "#").map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
                  style={{ padding: "0.6rem 1.25rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "2px", textDecoration: "none", color: "#f5f1ea", fontSize: "0.85rem", letterSpacing: "0.05em", transition: "all 0.2s", textAlign: "center" }}
                  onMouseOver={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
                  onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f1ea"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                  {link.label}
                </a>
              ))}
            </div>
            <style>{`
              .streaming-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.6rem; }
              @media (max-width: 520px) { .streaming-grid { grid-template-columns: repeat(3, 1fr); } }
            `}</style>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
