import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import heroPhoto from "../assets/images/casting/casting-hero-2.jpg";
const heroPhotoMobile = heroPhoto;
import burningDevotionCanvas from "../assets/images/burning-devotion-canvas.png";
import burningDevotionCanvasMobile from "../assets/images/burning-devotion-canvas-mobil.png";
import fallIntoYouCanvas from "../assets/images/fall-into-you-canvas.png";
import fallIntoYouCanvasMobile from "../assets/images/fall-into-you-canvas-mobil.png";
import callingForFlameCanvas from "../assets/images/calling-for-flame-canvas.png";
import callingForFlameCanvasMobile from "../assets/images/calling-for-flame-canvas-mobil.png";
import { track } from "../utils/track";

const ACCENT = "#d16b63";
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SLIDE_INTERVAL_MS = 3000;

// A Hero "canvasa" — a saját fotó és a promó-diák között váltakozik
const SLIDES = [
  {
    kind: "promo",
    image: callingForFlameCanvas,
    mobileImage: callingForFlameCanvasMobile,
    href: "https://distrokid.com/hyperfollow/richardkrmendi/calling-for-flame",
    badge: { en: "Releasing Sept 3", hu: "Szeptember 3-án érkezik" },
    title: "Calling for Flame",
    trackLabel: "hero_slide_calling_for_flame",
  },
  {
    kind: "promo",
    image: burningDevotionCanvas,
    mobileImage: burningDevotionCanvasMobile,
    href: "https://open.spotify.com/album/32LLbLolCdLWUH2pzJDZLR",
    badge: { en: "Out Now", hu: "Már elérhető" },
    title: "My Burning Devotion",
    trackLabel: "hero_slide_burning_devotion",
  },
  {
    kind: "promo",
    image: fallIntoYouCanvas,
    mobileImage: fallIntoYouCanvasMobile,
    href: "https://open.spotify.com/album/539fHNOQNfCHWLW2mWoijM",
    badge: { en: "Out Now", hu: "Már elérhető" },
    title: "Fall Into You",
    trackLabel: "hero_slide_fall_into_you",
  },
  {
    kind: "self",
    href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp",
    trackLabel: "hero_slide_self",
  },
];

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

  // A "canvas" — saját fotó / My Burning Devotion / Fall Into You, 3 mp-enként váltva.
  // A slideIndex a függőségi lista tagja, így egy kézi pötty-váltás mindig újraindítja
  // a 3 mp-es órát ahelyett, hogy egy már ütemezett lépés rögtön felülírná a kattintást.
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlideIndex(i => (i + 1) % SLIDES.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slideIndex]);

  const slide = SLIDES[slideIndex];
  const isSelf = slide.kind === "self";
  const selfSlide = SLIDES.find(s => s.kind === "self");
  // A promó-tartalom mindig a DOM-ban marad (nem remountol), hogy az önmagam-diára visszatérve
  // ne induljon újra a fő badge-ek 2.4–3.0 mp-es belépő animációja.
  const promoSlide = isSelf ? SLIDES.find(s => s.kind === "promo") : slide;

  const goToSlide = i => setSlideIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  const goPrev = () => goToSlide(slideIndex - 1);
  const goNext = () => goToSlide(slideIndex + 1);

  return (
    <section
      ref={sectionRef}
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", background: "#0b0a08" }}
    >
      {/* Canvas — a háttérkép váltakozik */}
      <motion.div
        style={{
          y: photoY,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <AnimatePresence mode="sync">
          {isSelf ? (
            <motion.a
              key="self"
              href={selfSlide.href}
              target="_blank" rel="noreferrer"
              onClick={() => track("click", { label: selfSlide.trackLabel })}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: "pointer" }}
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
                    objectFit: "contain",
                    objectPosition: "center top",
                    display: "block",
                  }}
                />
              </picture>
            </motion.a>
          ) : (
            <motion.a
              key={slide.title}
              href={slide.href}
              target="_blank" rel="noreferrer"
              onClick={() => track("click", { label: `${slide.trackLabel}_image` })}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: "pointer" }}
            >
              <picture style={{ width: "100%", height: "100%", display: "block" }}>
                <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "contain",
                    objectPosition: "center top",
                    display: "block",
                  }}
                />
              </picture>
            </motion.a>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* Kézi navigáció nyilakkal — a kép alatta továbbra is kattintható marad */}
      <button
        onClick={e => { e.stopPropagation(); goPrev(); }}
        aria-label="Previous slide"
        style={arrowButtonStyle("left")}
      >
        ‹
      </button>
      <button
        onClick={e => { e.stopPropagation(); goNext(); }}
        aria-label="Next slide"
        style={arrowButtonStyle("right")}
      >
        ›
      </button>

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

        {/* Saját-dia badge-ei — mindig a DOM-ban, de max-height 0-ra összecsukva, amikor
            nincs aktívan mutatva, hogy ne foglaljon láthatatlan helyet / ne fogja el a kattintást */}
        <div style={{
          maxHeight: isSelf ? "320px" : "0px",
          opacity: isSelf ? 1 : 0,
          overflow: "hidden",
          pointerEvents: isSelf ? "auto" : "none",
          transition: "opacity 0.4s ease, max-height 0.4s ease",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        }}>
          {/* OUT NOW badge */}
          <motion.a
            href="https://open.spotify.com/album/32LLbLolCdLWUH2pzJDZLR"
            target="_blank" rel="noreferrer"
            onClick={() => track("click", { label: "hero_out_now_badge" })}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "fit-content",
              padding: "0.35rem 0.9rem",
              background: `rgba(209, 107, 99, 0.12)`,
              border: `1px solid rgba(209, 107, 99, 0.35)`,
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
            Out Now — My Burning Devotion
          </motion.a>

          {/* Press badge */}
          <motion.a
            href="https://kindlinemagazine.com/richard-kormendi-takes-loves-deepest-surrender-on-latest-release-fall-into-you/"
            target="_blank" rel="noreferrer"
            onClick={() => track("click", { label: "hero_press_badge" })}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "fit-content",
              marginTop: "0.6rem",
              padding: "0.35rem 0.9rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "999px",
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            📰 {lang === "hu" ? "Kritika — Kindline Magazine" : "Featured in Kindline Magazine"}
          </motion.a>

          {/* Listen Now CTA */}
          <motion.a
            href="https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp"
            target="_blank" rel="noreferrer"
            onClick={() => track("click", { label: "hero_listen_now" })}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3.0 }}
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
              boxShadow: "0 0 30px rgba(209, 107, 99,0.35)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Listen Now
          </motion.a>
        </div>

        {/* Promó-dia badge-e — mindig a DOM-ban, de max-height 0-ra összecsukva, amikor
            nincs aktívan mutatva, hogy ne foglaljon láthatatlan helyet / ne fogja el a kattintást */}
        <div style={{
          maxHeight: isSelf ? "0px" : "320px",
          opacity: isSelf ? 0 : 1,
          overflow: "hidden",
          pointerEvents: isSelf ? "none" : "auto",
          transition: "opacity 0.4s ease, max-height 0.4s ease",
        }}>
          <AnimatePresence mode="wait">
            <motion.a
              key={promoSlide.title}
              href={promoSlide.href}
              target="_blank" rel="noreferrer"
              onClick={() => track("click", { label: promoSlide.trackLabel })}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.6rem",
                textDecoration: "none",
              }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.35rem 0.9rem",
                background: "rgba(209, 107, 99, 0.12)",
                border: "1px solid rgba(209, 107, 99, 0.35)",
                borderRadius: "999px",
                color: ACCENT,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0,
                  animation: "pulse-dot 1.8s ease-in-out infinite",
                }} />
                {promoSlide.badge?.[lang]}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.55rem",
                padding: "0.75rem 1.75rem",
                background: ACCENT,
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                boxShadow: "0 0 30px rgba(209, 107, 99,0.35)",
              }}>
                {promoSlide.title} →
              </span>
            </motion.a>
          </AnimatePresence>
        </div>

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes pulse-dot {
            0%,100%{ box-shadow: 0 0 0 0 rgba(209, 107, 99,0.5); }
            50%{ box-shadow: 0 0 0 5px rgba(209, 107, 99,0); }
          }
        `}</style>

        {/* Slide indikátor pöttyök — nagyobb, könnyen koppintható terület mobilon */}
        <div style={{ display: "flex", gap: "0.2rem", marginTop: "1.25rem", position: "relative", zIndex: 3 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: 32, height: 32, padding: 0,
                border: "none", background: "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i === slideIndex ? ACCENT : "rgba(255,255,255,0.25)",
                transition: "background 0.3s",
              }} />
            </button>
          ))}
        </div>

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
            style={{ width: "1px", height: "32px", background: `rgba(209, 107, 99,0.45)` }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function arrowButtonStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: "clamp(0.75rem, 2vw, 1.5rem)",
    transform: "translateY(-50%)",
    zIndex: 3,
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(11,10,8,0.45)",
    color: "#fff",
    fontSize: "1.4rem",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
