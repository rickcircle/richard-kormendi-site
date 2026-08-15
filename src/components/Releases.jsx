import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { track } from "../utils/track";

import coverMyBurningDevotion from "../assets/images/cover-my-burning-devotion.jpg";
import coverFallIntoYou     from "../assets/images/cover-fall-into-you.jpg";
import coverStillIGo        from "../assets/images/cover-still-i-go.jpg";
import coverTheAbsent       from "../assets/images/cover-the-absent.jpg";
import coverYouBecomeMyOnly from "../assets/images/cover-you-become-my-only.jpg";
import coverLikeAnEmber     from "../assets/images/cover-like-an-ember.jpg";
import coverEnthralling     from "../assets/images/cover-enthralling.jpg";
import coverIOwnTheNight    from "../assets/images/cover-i-own-the-night.jpg";
import coverColdUrbanSighs  from "../assets/images/cover-cold-urban-sighs.jpg";
import coverLightInTheDark  from "../assets/images/cover-light-in-the-dark.jpg";
import coverMyRemedy        from "../assets/images/cover-my-remedy.jpg";

const ACCENT = "#d16b63";
// Erősebb, telítettebb piros — kizárólag a kiemelt (legfontosabb) elemekhez, hogy
// tényleg elváljon a mindenhol használt lágyabb alap-pirostól.
const ACCENT_STRONG = "#e8342b";

const RELEASES = [
  { title: "My Burning Devotion", year: "2026", cover: coverMyBurningDevotion, spotifyId: "32LLbLolCdLWUH2pzJDZLR", isNew: true },
  { title: "Fall Into You",      year: "2026", cover: coverFallIntoYou,     spotifyId: "539fHNOQNfCHWLW2mWoijM" },
  { title: "Still I Go",         year: "2026", cover: coverStillIGo,        spotifyId: "7gT1yqH7HjtBA3wWcTwtD7" },
  { title: "The Absent",         year: "2026", cover: coverTheAbsent,       spotifyId: "29BOxHtSuQC7qTGJBeKP3D" },
  { title: "You Become My Only", year: "2026", cover: coverYouBecomeMyOnly, spotifyId: "3bCpO4FDUqgNGp4D4aIYTJ" },
  { title: "Like An Ember",      year: "2026", cover: coverLikeAnEmber,     spotifyId: "07fRNFTqUkQynMTCABulTu" },
  { title: "Enthralling",        year: "2026", cover: coverEnthralling,     spotifyId: "0OLEeHMSvzzWmmruZK1kky" },
  { title: "I Own The Night",    year: "2026", cover: coverIOwnTheNight,    spotifyId: "0tRNo8hJHoJKAX4BJZdNed" },
  { title: "Cold Urban Sighs",   year: "2026", cover: coverColdUrbanSighs,  spotifyId: "0v7PuGpgnJGanvBaCaqIK0" },
  { title: "Light In The Dark",  year: "2026", cover: coverLightInTheDark,  spotifyId: "6z5motWF2BpV9joKbiwaKD" },
  { title: "My Remedy",          year: "2026", cover: coverMyRemedy,        spotifyId: "3ezfX2qHayGF374BPqJ99j" },
];

// Az első 2 kiadás (legújabb + soron következő) kap kiemelt, nagyobb kártyát.
const FEATURED_COUNT = 2;

export default function Releases() {
  const { lang } = useLang();
  const label   = lang === "hu" ? "Diszkográfia" : "Discography";
  const heading = lang === "hu" ? "Összes kiadás." : "All releases.";
  const featured = RELEASES.slice(0, FEATURED_COUNT);
  const rest = RELEASES.slice(FEATURED_COUNT);

  return (
    <section id="releases" style={{ background: "#1f1113", padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
            {label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "0.85rem", color: "#fff" }}>
            {heading}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(245,241,234,0.45)", marginBottom: "3rem" }}>
            💿 {RELEASES.length} {lang === "hu" ? "kiadás — és egyre több" : "releases — and counting"}
          </p>
        </motion.div>

        {/* Kiemelt kiadások — nagyobb kártyák */}
        <div className="releases-featured-grid">
          {featured.map((release, i) => (
            <FeaturedReleaseCard key={release.spotifyId || release.title} release={release} delay={i * 0.08} lang={lang} />
          ))}
        </div>

        {/* Korábbi kiadások — kompakt rács */}
        <div className="releases-grid">
          {rest.map((release, i) => (
            <ReleaseCard key={release.spotifyId || release.title} release={release} delay={i * 0.06} lang={lang} />
          ))}
        </div>
      </div>

      <style>{`
        .releases-featured-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .releases-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 700px) {
          .releases-featured-grid { grid-template-columns: 1fr; }
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

function FeaturedReleaseCard({ release, delay, lang }) {
  const [hovered, setHovered] = useState(false);
  const href = release.href || `https://open.spotify.com/album/${release.spotifyId}`;

  return (
    <motion.a
      href={href}
      target="_blank" rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => track("click", { label: `release_featured: ${release.title}` })}
      style={{
        display: "flex", alignItems: "center", gap: "1.25rem",
        padding: "1.25rem",
        border: `1px solid ${ACCENT_STRONG}`,
        borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(232, 52, 43, 0.14), rgba(255,255,255,0.03))",
        boxShadow: "0 0 40px rgba(232, 52, 43, 0.22)",
        textDecoration: "none",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0, width: "clamp(100px, 24vw, 150px)", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "8px" }}>
        <img
          src={release.cover}
          alt={release.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
      </div>
      <div>
        <span style={{
          display: "inline-block", width: "fit-content",
          background: ACCENT_STRONG, color: "#fff",
          fontSize: "0.6rem", letterSpacing: "0.1em", whiteSpace: "nowrap",
          textTransform: "uppercase", fontWeight: 700,
          padding: "3px 8px", borderRadius: "999px",
          marginBottom: "0.6rem",
        }}>
          {release.comingSoon ? (lang === "hu" ? "Hamarosan" : "Coming Soon") : "New"}
        </span>
        <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
          {release.title}
        </p>
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
          {release.comingSoon ? (lang === "hu" ? "Előrendelés most →" : "Pre-save now →") : (lang === "hu" ? "Hallgatás →" : "Listen now →")}
        </p>
      </div>
    </motion.a>
  );
}

function ReleaseCard({ release, delay, lang }) {
  const [hovered, setHovered] = useState(false);
  const href = release.href || `https://open.spotify.com/album/${release.spotifyId}`;

  return (
    <motion.a
      href={href}
      target="_blank" rel="noreferrer"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => track("click", { label: `release: ${release.title}` })}
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
            {release.comingSoon ? (lang === "hu" ? "Előrendelés" : "Pre-Save") : "Listen"}
          </span>
        </div>

        {/* NEW / Coming soon badge */}
        {(release.isNew || release.comingSoon) && (
          <span style={{
            position: "absolute", top: "0.6rem", left: "0.6rem",
            background: ACCENT, color: "#fff",
            fontSize: "0.6rem", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 700,
            padding: "2px 7px", borderRadius: "2px",
          }}>
            {release.comingSoon ? (lang === "hu" ? "Hamarosan" : "Coming Soon") : "New"}
          </span>
        )}
      </div>

      {/* Meta */}
      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>
        {release.title}
      </p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#666", letterSpacing: "0.04em" }}>
        {release.comingSoon ? (lang === "hu" ? "Előrendelés most" : "Pre-save now") : `Single · ${release.year}`}
      </p>
    </motion.a>
  );
}
