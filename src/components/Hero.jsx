import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import heroPhoto from "../assets/images/photo_main.png";

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
          bottom: "-30%",
          zIndex: 0,
        }}
      >
        <img
          src={heroPhoto}
          alt="Richard Körmendi"
          className="hero-photo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            display: "block",
          }}
        />
        <style>{`
          @media (max-width: 768px) {
            .hero-photo { object-position: 45% 0% !important; }
          }
        `}</style>
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

        {/* Subtitle — fade in késve */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {tx.subtitle}
        </motion.p>

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
            style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.25)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
