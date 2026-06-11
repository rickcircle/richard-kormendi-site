import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import profilePhoto from "../assets/images/photo-neon.jpg";

export default function About() {
  const { lang } = useLang();
  const tx = t[lang].about;

  return (
    <section id="about" style={{ padding: "8rem 2rem", background: "#f5f5f2" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, whiteSpace: "pre-line", margin: 0 }}>
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
            style={{ gridColumn: "span 2", gridRow: "span 2", background: "#1a1a1a", color: "#fff" }}
            delay={0}
          >
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Bio
            </p>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#ccc", margin: 0 }}>
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
          <BentoTile style={{ background: "#fff" }} delay={0.15}>
            <TileLabel>{tx.tiles.eberalom.label}</TileLabel>
            <TileTitle>{tx.tiles.eberalom.title}</TileTitle>
            <TileBody>{tx.tiles.eberalom.body}</TileBody>
          </BentoTile>

          {/* Classical */}
          <BentoTile style={{ background: "#fff" }} delay={0.2}>
            <TileLabel>{tx.tiles.classical.label}</TileLabel>
            <TileTitle>{tx.tiles.classical.title}</TileTitle>
            <TileBody>{tx.tiles.classical.body}</TileBody>
          </BentoTile>

          {/* Singles — full width */}
          <BentoTile style={{ gridColumn: "span 4", background: "#fff" }} delay={0.25}>
            <TileLabel>{tx.tiles.singles.label}</TileLabel>
            <TileTitle style={{ whiteSpace: "pre-line" }}>{tx.tiles.singles.title}</TileTitle>
            <TileBody>{tx.tiles.singles.body}</TileBody>
            <a
              href="https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp"
              target="_blank" rel="noreferrer"
              style={{ display: "inline-block", marginTop: "1.25rem", fontSize: "0.8rem", letterSpacing: "0.08em", color: "#1a1a1a", textDecoration: "none", borderBottom: "1px solid #ccc", paddingBottom: "2px", transition: "border-color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#1a1a1a"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#ccc"}
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
        border: "1px solid #e0e0e0",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function TileLabel({ children }) {
  return (
    <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "#aaa", textTransform: "uppercase", margin: "0 0 0.75rem" }}>
      {children}
    </p>
  );
}

function TileTitle({ children, style = {} }) {
  return (
    <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.75rem", lineHeight: 1.3, color: "#1a1a1a", ...style }}>
      {children}
    </p>
  );
}

function TileBody({ children }) {
  return (
    <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#666", margin: 0 }}>
      {children}
    </p>
  );
}
