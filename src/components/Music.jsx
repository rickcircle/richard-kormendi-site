import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import { track } from "../utils/track";

const ACCENT = "#d16b63";
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/artist/5UW4cZ0M83TG2nJWYvkVkp?utm_source=generator&theme=0";

const VIDEOS = [
  { id: "3SgUws3Gkuw", title: "You Become My Only", tag: "vocal" },
  { id: "TRn2qxJAvKE", title: "Cold Urban Sighs",    tag: "vocal" },
  { id: "r144oflIpPI", title: "Like An Ember",       tag: "vocal" },
  { id: "jGYNDMMb734", title: "Light In The Dark",   tag: "instrumental" },
  { id: "WODjlfmb5ag", title: "The Absent",          tag: "instrumental" },
];

const ICONS = {
  spotify: (
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  ),
  appleMusic: (
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  ),
  youtube: (
    <path d="M23.498 6.186a2.966 2.966 0 0 0-2.088-2.099C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.41.542A2.966 2.966 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.966 2.966 0 0 0 2.088 2.099c1.905.542 9.41.542 9.41.542s7.505 0 9.41-.542a2.966 2.966 0 0 0 2.088-2.099C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
  ),
  tidal: (
    <path d="M8 6l4 4-4 4-4-4 4-4zm8 0l4 4-4 4-4-4 4-4zm-4 8l4 4-4 4-4-4 4-4z" />
  ),
  instagram: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  ),
};

const streamingLinks = [
  { label: "Spotify",     icon: "spotify",     href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { label: "Apple Music", icon: "appleMusic",  href: "https://music.apple.com/hu/artist/richard-k%C3%B6rmendi/1877841316" },
  { label: "Tidal",       icon: "tidal",       href: "https://tidal.com/artist/74624158" },
  { label: "YouTube",     icon: "youtube",     href: "https://www.youtube.com/@richardkormendi6379" },
  { label: "Instagram",   icon: "instagram",   href: "https://www.instagram.com/rickormendi/" },
];

function PlatformIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      {ICONS[name]}
    </svg>
  );
}

export default function Music() {
  const { lang } = useLang();
  const tx = t[lang].music;
  const [tab, setTab] = useState("listen");
  const [activeVideo, setActiveVideo] = useState(0);

  const tagLabel = tag => {
    if (tag === "vocal") return lang === "hu" ? "Énekes" : "Vocal";
    return lang === "hu" ? "Instrumentális" : "Instrumental";
  };

  return (
    <section id="music" style={{ background: "#0b0a08", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "2rem", color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "rgba(245,241,234,0.65)", marginBottom: "3rem" }}>
            {tx.body}
          </p>

          {/* Fő váltó — Listen / Watch, nagy kártyák */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
            {[
              { key: "listen", label: lang === "hu" ? "Hallgatás" : "Listen", sub: "Spotify" },
              { key: "watch",  label: lang === "hu" ? "Videók"    : "Watch",  sub: "YouTube" },
            ].map(({ key, label, sub }) => (
              <button
                key={key}
                onClick={() => { setTab(key); track("click", { label: `music_tab:${key}` }); }}
                style={{
                  position: "relative",
                  padding: "1rem 1.25rem",
                  borderRadius: "10px",
                  border: `1px solid ${tab === key ? ACCENT : "rgba(255,255,255,0.1)"}`,
                  background: tab === key ? "rgba(209, 107, 99,0.1)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "all 0.25s",
                  boxShadow: tab === key ? "0 0 24px rgba(209, 107, 99,0.18)" : "none",
                }}
              >
                <span style={{
                  display: "block", fontSize: "1rem", fontWeight: 600,
                  color: tab === key ? ACCENT : "#f5f1ea", marginBottom: "0.15rem",
                  letterSpacing: "0.01em",
                }}>
                  {key === "listen" ? "🎧 " : "▶ "}{label}
                </span>
                <span style={{ fontSize: "0.75rem", color: "rgba(245,241,234,0.4)", letterSpacing: "0.03em" }}>
                  {sub}
                </span>
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

                {/* Thumbnail rács — mind az énekes, mind az instrumentális videó, címkével */}
                <div className="video-grid">
                  {VIDEOS.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => { setActiveVideo(i); track("click", { label: `video: ${v.title}` }); }}
                      className="video-thumb"
                      style={{
                        position: "relative",
                        padding: 0,
                        border: `1px solid ${activeVideo === i ? ACCENT : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "6px",
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "none",
                        textAlign: "left",
                        boxShadow: activeVideo === i ? "0 0 18px rgba(209, 107, 99,0.3)" : "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <div style={{ position: "relative", aspectRatio: "16/9" }}>
                        <img
                          src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                          alt={v.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: activeVideo === i ? "rgba(209, 107, 99,0.15)" : "rgba(0,0,0,0.15)",
                        }} />
                        <span style={{
                          position: "absolute", top: "0.4rem", left: "0.4rem",
                          background: v.tag === "vocal" ? ACCENT : "rgba(11,10,8,0.75)",
                          color: "#fff", fontSize: "0.55rem", fontWeight: 700,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          padding: "2px 6px", borderRadius: "3px",
                          border: v.tag === "vocal" ? "none" : "1px solid rgba(255,255,255,0.25)",
                        }}>
                          {tagLabel(v.tag)}
                        </span>
                      </div>
                      <p style={{
                        margin: 0, padding: "0.5rem 0.6rem", fontSize: "0.75rem",
                        fontWeight: 500, color: activeVideo === i ? "#f5f1ea" : "rgba(245,241,234,0.6)",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {v.title}
                      </p>
                    </button>
                  ))}
                </div>
                <style>{`
                  .video-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
                  @media (max-width: 560px) { .video-grid { grid-template-columns: repeat(2, 1fr); } }
                `}</style>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listen everywhere — platform ikonokkal */}
          <div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>
              {lang === "hu" ? "Hallgass mindenhol" : "Listen everywhere"}
            </p>
            <div className="streaming-grid">
              {streamingLinks.map(link => {
                const primary = link.label === "Spotify";
                return (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="streaming-link"
                    onClick={() => track("click", { label: `stream: ${link.label}` })}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.6rem",
                      padding: "0.7rem 1.1rem",
                      border: `1px solid ${primary ? ACCENT : "rgba(255,255,255,0.12)"}`,
                      borderRadius: "8px", textDecoration: "none",
                      color: primary ? "#fff" : "#f5f1ea",
                      fontSize: "0.85rem", fontWeight: primary ? 700 : 500, letterSpacing: "0.02em",
                      background: primary ? ACCENT : "rgba(255,255,255,0.03)",
                      boxShadow: primary ? "0 0 24px rgba(209, 107, 99,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = primary ? ACCENT : "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = primary ? "#fff" : "#f5f1ea";
                      e.currentTarget.style.borderColor = primary ? ACCENT : "rgba(255,255,255,0.12)";
                    }}>
                    <PlatformIcon name={link.icon} />
                    {link.label}
                  </a>
                );
              })}
            </div>
            <style>{`
              .streaming-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
              .streaming-link { flex: 1 1 150px; justify-content: center; }
              @media (max-width: 520px) { .streaming-link { flex: 1 1 calc(50% - 0.3rem); } }
            `}</style>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
