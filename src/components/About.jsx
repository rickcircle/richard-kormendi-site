import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import profilePhoto from "../assets/images/photo-img3953.jpg";
import { track } from "../utils/track";

const CARD_BG = "#2b171a";

export default function About() {
  const { lang } = useLang();
  const tx = t[lang].about;

  return (
    <section id="about" style={{ padding: "8rem 2rem", background: "#1f1113" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#c23b3b", textTransform: "uppercase", marginBottom: "1.25rem", textShadow: "0 0 16px rgba(194, 59, 59,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, whiteSpace: "pre-line", margin: 0, color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="bento-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "auto",
          gap: "1rem",
        }}>

          {/* Bio — nagy, 2 oszlop, 2 sor */}
          <BentoTile
            style={{ gridColumn: "span 2", gridRow: "span 2", background: CARD_BG }}
            delay={0}
          >
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Bio
            </p>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(245,241,234,0.8)", margin: 0 }}>
              {tx.bio}
            </p>
          </BentoTile>

          {/* Fotó */}
          <BentoTile
            style={{ gridColumn: "span 2", padding: 0, overflow: "hidden", minHeight: "220px" }}
            delay={0.1}
          >
            <img
              src={profilePhoto}
              alt="Richard Körmendi"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "220px" }}
            />
          </BentoTile>

          {/* Éberálom */}
          <BentoTile style={{ background: CARD_BG }} delay={0.15}>
            <TileLabel>{tx.tiles.eberalom.label}</TileLabel>
            <TileTitle>{tx.tiles.eberalom.title}</TileTitle>
            <TileBody>{tx.tiles.eberalom.body}</TileBody>
          </BentoTile>

          {/* Classical */}
          <BentoTile style={{ background: CARD_BG }} delay={0.2}>
            <TileLabel>{tx.tiles.classical.label}</TileLabel>
            <TileTitle>{tx.tiles.classical.title}</TileTitle>
            <TileBody>{tx.tiles.classical.body}</TileBody>
          </BentoTile>

          {/* Singles — full width */}
          <BentoTile style={{ gridColumn: "span 4", background: CARD_BG }} delay={0.25}>
            <TileLabel>{tx.tiles.singles.label}</TileLabel>
            <TileTitle style={{ whiteSpace: "pre-line" }}>{tx.tiles.singles.title}</TileTitle>
            <TileBody>{tx.tiles.singles.body}</TileBody>
            <a
              href="https://open.spotify.com/album/539fHNOQNfCHWLW2mWoijM"
              target="_blank" rel="noreferrer"
              onClick={() => track("click", { label: "about_spotify_link" })}
              style={{ display: "inline-block", marginTop: "1.25rem", fontSize: "0.8rem", letterSpacing: "0.08em", color: "#f5f1ea", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: "2px", transition: "border-color 0.2s, color 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#c23b3b"; e.currentTarget.style.color = "#c23b3b"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#f5f1ea"; }}
            >
              Listen on Spotify →
            </a>
          </BentoTile>

        </div>
      </div>

      {/* Reszponzív stílusok */}
      <style>{`
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .bento-grid > div:first-child {
            grid-column: span 2 !important;
            grid-row: span 1 !important;
          }
          .bento-grid > div:nth-child(2) {
            grid-column: span 2 !important;
          }
          .bento-grid > div:nth-child(3),
          .bento-grid > div:nth-child(4),
          .bento-grid > div:nth-child(5),
          .bento-grid > div:nth-child(6) {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 520px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-grid > div {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}

function BentoTile({ children, style = {}, delay = 0 }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{
        borderRadius: "8px",
        padding: "1.75rem",
        border: "1px solid rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function TileLabel({ children }) {
  return (
    <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", margin: "0 0 0.75rem" }}>
      {children}
    </p>
  );
}

function TileTitle({ children, style = {} }) {
  return (
    <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.75rem", lineHeight: 1.3, color: "#f5f1ea", ...style }}>
      {children}
    </p>
  );
}

function TileBody({ children }) {
  return (
    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(245,241,234,0.6)", margin: 0 }}>
      {children}
    </p>
  );
}
