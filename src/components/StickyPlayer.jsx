import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#e8963a";
const SPOTIFY_URL = "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp";

export default function StickyPlayer() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      setVisible(scrollY > winH * 0.85);
      setNearBottom(scrollY + winH > docH - 140);
      setIsMobile(window.innerWidth < 520);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const show = visible && !dismissed && !nearBottom;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          style={{
            position: "fixed",
            bottom: "1.25rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.6rem" : "0.9rem",
            padding: isMobile ? "0.6rem 0.75rem 0.6rem 0.9rem" : "0.7rem 1rem 0.7rem 1.1rem",
            background: "rgba(18, 18, 18, 0.94)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "999px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          {/* Pulzáló dot */}
          <span style={{
            width: 7, height: 7,
            borderRadius: "50%",
            background: ACCENT,
            flexShrink: 0,
            animation: "pulse-sticky 1.8s ease-in-out infinite",
          }} />

          {/* Szöveg */}
          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <span style={{ color: "#fff", fontWeight: 600 }}>Like An Ember</span>
            <span className="sticky-artist-name"> · Richard Körmendi</span>
          </span>

          {/* Spotify gomb */}
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: isMobile ? "0.3rem 0.7rem" : "0.35rem 0.85rem",
              background: ACCENT,
              borderRadius: "999px",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            {isMobile ? "Play" : "Hallgass"}
          </a>

          {/* Bezárás */}
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              padding: "0 0.15rem",
              fontSize: "1rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Bezárás"
          >
            ×
          </button>
        </motion.div>
      )}
      <style>{`
        @keyframes pulse-sticky {
          0%,100%{ box-shadow: 0 0 0 0 rgba(232,150,58,0.5); }
          50%{ box-shadow: 0 0 0 6px rgba(232,150,58,0); }
        }
        @media (max-width: 520px) { .sticky-artist-name { display: none; } }
      `}</style>
    </AnimatePresence>
  );
}
