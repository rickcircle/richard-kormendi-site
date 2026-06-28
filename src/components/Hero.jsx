import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import heroPhoto from "../assets/images/photo_main.png";
import heroPhotoMobile from "../assets/images/photo_main_mobil.png";

const ACCENT = "#e8963a";
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function useScramble(text, active, duration = 1400) {
  const [display, setDisplay] = useState(() => randomize(text));

  function randomize(str) {
    return str.split("").map(c =>
      c === " " || c === "·" ? c : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    ).join("");
  }

  useEffect(() => {
    if (!active) return;
    const totalFrames = Math.round(duration / 16);
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " " || char === "·") return char;
          if (i / text.length < progress) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join("")
      );
      if (frame >= totalFrames) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 16);
    return () => clearInterval(id);
  }, [text, active, duration]);

  return display;
}

function useTypewriter(text, startDelay = 1300, speed = 48) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay, speed]);
  return { displayed, done };
}

export default function Hero() {
  const { lang } = useLang();
  const tx = t[lang].hero;

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: a fotó lassabban mozog
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  // Szöveg scrollra eltűnik
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-8%"]);

  // Scramble csak oldal betöltés után indul
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(id);
  }, []);

  const scrambledName = useScramble("Richard Körmendi", ready, 1600);
  const { displayed: typedSubtitle, done: subtitleDone } = useTypewriter(tx.subtitle, 1350, 46);

  return (
    <section
      ref={sectionRef}
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", background: "#111" }}
    >
      {/* Parallax fotó */}
      <motion.div
        style={{
          y: photoY,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "-15%",
          zIndex: 0,
        }}
      >
        <picture style={{ width: "100%", height: "100%", display: "block" }}>
          <source media="(max-width: 768px)" srcSet={heroPhotoMobile} />
          <img
            src={heroPhoto}
            alt="Richard Körmendi"
            className="hero-photo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
              display: "block",
            }}
          />
        </picture>
      </motion.div>

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.95) 100%)",
      }} />

      {/* Tartalom */}
      <motion.div
        style={{
          opacity: contentOpacity,
          y: contentY,
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(2rem, 5vw, 5rem)",
          paddingTop: "80px",
        }}
      >
        {/* Név — scramble */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontSize: "clamp(2.8rem, 9vw, 8rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#fff",
            margin: "0 0 1rem",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {scrambledName}
        </motion.h1>

        {/* Subtitle — typewriter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: 1.3 }}
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: "0 0 1.25rem",
            minHeight: "1.5em",
          }}
        >
          {typedSubtitle}
          {!subtitleDone && (
            <span style={{
              display: "inline-block",
              width: "2px",
              height: "0.9em",
              background: "rgba(255,255,255,0.55)",
              marginLeft: "3px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }} />
          )}
        </motion.p>

        {/* OUT NOW badge */}
        <motion.a
          href="https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp"
          target="_blank" rel="noreferrer"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "fit-content",
            padding: "0.35rem 0.9rem",
            background: `rgba(232, 150, 58, 0.12)`,
            border: `1px solid rgba(232, 150, 58, 0.35)`,
            borderRadius: "999px",
            color: ACCENT,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <span style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: ACCENT,
            flexShrink: 0,
            animation: "pulse-dot 1.8s ease-in-out infinite",
          }} />
          Out Now — You Become My Only
        </motion.a>

        {/* Listen Now CTA */}
        <motion.a
          href="https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp"
          target="_blank" rel="noreferrer"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.8 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            marginTop: "1rem",
            padding: "0.75rem 1.75rem",
            background: ACCENT,
            borderRadius: "4px",
            color: "#fff",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Listen Now
        </motion.a>

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes pulse-dot {
            0%,100%{ box-shadow: 0 0 0 0 rgba(232,150,58,0.5); }
            50%{ box-shadow: 0 0 0 5px rgba(232,150,58,0); }
          }
        `}</style>

        {/* Scroll indikátor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: "absolute",
            bottom: "clamp(1.5rem, 4vw, 3rem)",
            right: "clamp(2rem, 5vw, 5rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{ width: "1px", height: "32px", background: `rgba(232,150,58,0.45)` }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
