import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/artist/5UW4cZ0M83TG2nJWYvkVkp?utm_source=generator&theme=0";
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/TRn2qxJAvKE";

const streamingLinks = [
  { label: "Spotify",       href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { label: "Apple Music",   href: "#" }, // TODO: replace with Apple Music artist URL
  { label: "YouTube",       href: "https://www.youtube.com/@richardkormendi6379" },
  { label: "Tidal",         href: "#" }, // TODO: replace with Tidal artist URL
  { label: "Amazon Music",  href: "#" }, // TODO: replace with Amazon Music artist URL
  { label: "Instagram",     href: "https://www.instagram.com/rickormendi/" },
];

export default function Music() {
  const { lang } = useLang();
  const tx = t[lang].music;
  const [tab, setTab] = useState("listen");

  return (
    <section id="music" style={{ background: "#ffffff", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "2rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "2rem" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#444", marginBottom: "3rem" }}>
            {tx.body}
          </p>

          {/* Tab váltó — pill stílus */}
          <div style={{
            display: "inline-flex",
            background: "#f0f0f0",
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
                  color: tab === key ? "#fff" : "#888",
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
                      background: "#1a1a1a",
                      borderRadius: "999px",
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
                style={{ marginBottom: "3rem", borderRadius: "4px", overflow: "hidden", position: "relative", aspectRatio: "16/9" }}
              >
                <iframe
                  src={YOUTUBE_EMBED_URL}
                  width="100%" height="100%" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen loading="lazy"
                  title="Cold Urban Sighs – Richard Körmendi"
                  style={{ display: "block", position: "absolute", inset: 0 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
              {lang === "hu" ? "Hallgass mindenhol" : "Listen everywhere"}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {streamingLinks.filter(l => l.href !== "#").map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
                  style={{ padding: "0.6rem 1.25rem", border: "1px solid #ccc", borderRadius: "2px", textDecoration: "none", color: "#1a1a1a", fontSize: "0.85rem", letterSpacing: "0.05em", transition: "all 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.borderColor = "#ccc"; }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
