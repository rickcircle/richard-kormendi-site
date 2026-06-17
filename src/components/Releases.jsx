import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";

import coverYouBecomeMyOnly from "../assets/images/cover-you-become-my-only.jpg";
import coverLikeAnEmber     from "../assets/images/cover-like-an-ember.jpg";
import coverEnthralling     from "../assets/images/cover-enthralling.jpg";
import coverIOwnTheNight    from "../assets/images/cover-i-own-the-night.jpg";
import coverColdUrbanSighs  from "../assets/images/cover-cold-urban-sighs.jpg";
import coverLightInTheDark  from "../assets/images/cover-light-in-the-dark.jpg";
import coverMyRemedy        from "../assets/images/cover-my-remedy.jpg";

const ACCENT = "#e8963a";

const RELEASES = [
  { title: "You Become My Only", year: "2026", cover: coverYouBecomeMyOnly, spotifyId: "3bCpO4FDUqgNGp4D4aIYTJ", isNew: true },
  { title: "Like An Ember",      year: "2026", cover: coverLikeAnEmber,     spotifyId: "07fRNFTqUkQynMTCABulTu" },
  { title: "Enthralling",        year: "2026", cover: coverEnthralling,     spotifyId: "0OLEeHMSvzzWmmruZK1kky" },
  { title: "I Own The Night",    year: "2026", cover: coverIOwnTheNight,    spotifyId: "0tRNo8hJHoJKAX4BJZdNed" },
  { title: "Cold Urban Sighs",   year: "2026", cover: coverColdUrbanSighs,  spotifyId: "0v7PuGpgnJGanvBaCaqIK0" },
  { title: "Light In The Dark",  year: "2026", cover: coverLightInTheDark,  spotifyId: "6z5motWF2BpV9joKbiwaKD" },
  { title: "My Remedy",          year: "2026", cover: coverMyRemedy,        spotifyId: "3ezfX2qHayGF374BPqJ99j" },
];

export default function Releases() {
  const { lang } = useLang();
  const label   = lang === "hu" ? "Diszkográfia" : "Discography";
  const heading = lang === "hu" ? "Összes kiadás." : "All releases.";

  return (
    <section id="releases" style={{ background: "#0d0d0d", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem" }}>
            {label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "3rem", color: "#fff" }}>
            {heading}
          </h2>
        </motion.div>

        <div className="releases-grid">
          {RELEASES.map((release, i) => (
            <ReleaseCard key={release.spotifyId} release={release} delay={i * 0.06} />
          ))}
        </div>
      </div>

      <style>{`
        .releases-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 700px) {
          .releases-grid { grid-template-columns: repeat(3, 1fr); }
          .releases-grid > *:last-child:nth-child(3n+1) {
            grid-column: 1 / -1;
            width: calc(33.333% - 0.84rem);
            margin: 0 auto;
          }
        }
        @media (max-width: 480px) {
          .releases-grid { grid-template-columns: repeat(2, 1fr); }
          .releases-grid > *:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            width: calc(50% - 0.625rem);
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}

function ReleaseCard({ release, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={`https://open.spotify.com/album/${release.spotifyId}`}
      target="_blank" rel="noreferrer"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "block", position: "relative" }}
    >
      {/* Cover */}
      <div style={{
        position: "relative",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        borderRadius: "4px",
        marginBottom: "0.75rem",
      }}>
        <img
          src={release.cover}
          alt={release.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s",
          borderRadius: "4px",
        }}>
          <span style={{
            fontSize: "0.75rem", letterSpacing: "0.1em", color: "#fff",
            textTransform: "uppercase", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Listen
          </span>
        </div>

        {/* NEW badge */}
        {release.isNew && (
          <span style={{
            position: "absolute", top: "0.6rem", left: "0.6rem",
            background: ACCENT, color: "#fff",
            fontSize: "0.6rem", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 700,
            padding: "2px 7px", borderRadius: "2px",
          }}>
            New
          </span>
        )}
      </div>

      {/* Meta */}
      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>
        {release.title}
      </p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#666", letterSpacing: "0.04em" }}>
        Single · {release.year}
      </p>
    </motion.a>
  );
}
