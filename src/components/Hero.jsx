import { useEffect, useState } from "react";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import portrait from "../assets/images/portrait-autumn-mobile.jpg";
import portraitWide from "../assets/images/portrait-autumn-wide.jpg";
import mercy from "../assets/images/mercy-canvas.jpg";
import mercyMobile from "../assets/images/mercy-canvas-mobil.jpg";
import regnum from "../assets/images/regnum-marianum-canvas.jpg";
import regnumMobile from "../assets/images/regnum-marianum-canvas-mobil.jpg";
import burning from "../assets/images/burning-devotion-canvas.png";
import burningMobile from "../assets/images/burning-devotion-canvas-mobil.png";
import calling from "../assets/images/calling-for-flame-outnow-wide.jpg";
import callingMobile from "../assets/images/calling-for-flame-outnow-mobile.jpg";
import { track } from "../utils/track";
import "./Hero.css";

const SLIDES = [
  { title: "Richard Körmendi", image: portraitWide, mobile: portrait, self: true, href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { title: "Regnum Marianum (feat. Emily Simon)", image: regnum, mobile: regnumMobile, presave: true, href: "https://distrokid.com/hyperfollow/richardkrmendi/regnum-marianum-feat-emily-simon" },
  { title: "Mercy, I Don’t Want", image: mercy, mobile: mercyMobile, href: "https://open.spotify.com/track/3aCAe8fuF3kW3YYHpJFQYc" },
  { title: "Calling for Flame", image: calling, mobile: callingMobile, href: "https://open.spotify.com/track/5t63pHAbGvKo34ceFM9dYj" },
  { title: "My Burning Devotion", image: burning, mobile: burningMobile, href: "https://open.spotify.com/album/32LLbLolCdLWUH2pzJDZLR" },
];

export default function Hero() {
  const { lang } = useLang();
  const hu = lang === "hu";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manualVersion, setManualVersion] = useState(0);
  const slide = SLIDES[index];
  useEffect(() => {
    if (paused || hovered || focused) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % SLIDES.length), manualVersion ? 12000 : 8000);
    return () => clearTimeout(timer);
  }, [index, paused, hovered, focused, manualVersion]);
  const select = next => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    setManualVersion(v => v + 1);
  };
  const listen = hu ? "Hallgasd meg Spotify-on" : "Listen on Spotify";
  return (
    <section className="artist-hero" aria-label={hu ? "Bemutatkozás és friss dalok" : "Artist and latest music"}
      aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
      <div className={`artist-hero-frame ${slide.self ? "is-portrait" : "is-promo"} ${slide.square ? "is-square" : ""}`}>
        <a className="artist-hero-art" href={slide.href} target="_blank" rel="noreferrer"
          aria-label={`${slide.title} — ${slide.presave ? "Pre-save" : "Spotify"}`}
          onClick={() => track("click", { label: `hero_image: ${slide.title}` })}>
          <picture key={slide.title}>
            <source media="(max-width: 700px)" srcSet={slide.mobile} />
            <img src={slide.image} alt={slide.title} fetchPriority={slide.self ? "high" : "auto"} />
          </picture>
        </a>
        {slide.self && <div className="artist-hero-intro">
          <p className="artist-hero-eyebrow">{t[lang].hero.subtitle}</p>
          <h1>Richard{" "}<br />Körmendi</h1>
          <p className="artist-hero-tagline">{hu ? "Klasszikus tenor a rockzene világában." : "A classical tenor in the world of rock."}</p>
          <a className="artist-hero-cta" href={slide.href} target="_blank" rel="noreferrer"
            onClick={() => track("click", { label: "hero_listen_now" })}>{listen} ↗</a>
          <a className="artist-hero-secondary" href="#music">{hu ? "Hallgass bele" : "Explore the music"} ↓</a>
        </div>}
      </div>
      <div className="artist-hero-footer">
        {!slide.self && <div className="artist-hero-release">
          <span>{slide.presave ? (hu ? "Hamarosan" : "Coming soon") : (hu ? "Már elérhető" : "Out now")}</span>
          <p>{slide.title}</p>
          <a className="artist-hero-cta" href={slide.href} target="_blank" rel="noreferrer"
            onClick={() => track("click", { label: `hero_cta: ${slide.title}` })}>
            {slide.presave ? (hu ? "Mentsd előre" : "Pre-save now") : listen} ↗
          </a>
        </div>}
        <div className="artist-hero-controls">
          <button onClick={() => select(index - 1)} aria-label={hu ? "Előző kép" : "Previous slide"}>‹</button>
          <div className="artist-hero-dots">{SLIDES.map((s, i) => <button key={s.title}
            aria-label={`${hu ? "Kép" : "Slide"} ${i + 1}: ${s.title}`} aria-pressed={index === i}
            onClick={() => select(i)}><span /></button>)}</div>
          <button onClick={() => select(index + 1)} aria-label={hu ? "Következő kép" : "Next slide"}>›</button>
          <button onClick={() => setPaused(v => !v)} aria-label={paused ? (hu ? "Automatikus váltás indítása" : "Start slideshow") : (hu ? "Automatikus váltás szüneteltetése" : "Pause slideshow")} aria-pressed={paused}>{paused ? "▶" : "Ⅱ"}</button>
        </div>
      </div>
    </section>
  );
}
