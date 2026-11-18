import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { edenPark } from "../data/featuredMusic";
import burningArt from "../assets/images/my-burning-devotion-hero.jpg";
import emberArt from "../assets/images/like-an-ember-hero.jpg";
import balloon from "../assets/images/eden-park-balloon.gif";
import { track } from "../utils/track";
import "./Hero.css";

const slides = [
  { ...edenPark, theme: "eden", platform: "Apple Music" },
  {
    title: "My Burning Devotion",
    cover: burningArt,
    href: "https://open.spotify.com/album/32LLbLolCdLWUH2pzJDZLR",
    theme: "devotion",
    platform: "Spotify",
  },
  {
    title: "Like an Ember",
    cover: emberArt,
    href: "https://open.spotify.com/album/07fRNFTqUkQynMTCABulTu",
    theme: "ember",
    platform: "Spotify",
  },
];

export default function Hero() {
  const { lang } = useLang();
  const hu = lang === "hu";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const slide = slides[index];

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % slides.length), 11000);
    return () => window.clearTimeout(timer);
  }, [index, paused]);

  function select(nextIndex) {
    setIndex((nextIndex + slides.length) % slides.length);
  }

  const listen = slide.platform === "Apple Music"
    ? (hu ? "Hallgasd meg az Apple Musicon" : "Listen on Apple Music")
    : (hu ? "Hallgasd meg a Spotifyon" : "Listen on Spotify");

  return (
    <section className={`artist-hero artist-hero--${slide.theme}`} aria-label={hu ? "Kiemelt dalok" : "Featured songs"}>
      <img key={slide.theme} className="artist-hero-image" src={slide.cover} alt="" fetchPriority={index === 0 ? "high" : "auto"} />
      {index === 0 && !paused && <img className="artist-hero-balloon" src={balloon} alt="" aria-hidden="true" />}
      <div className="artist-hero-copy" aria-live={paused ? "polite" : "off"}>
        <p className="artist-hero-eyebrow">{index === 0 ? (hu ? "Új dal" : "New single") : (hu ? "Kislemez" : "Single")}</p>
        <h1>{slide.title}</h1>
        <p className="artist-hero-name">{hu ? "Körmendi Richárd" : "Richard Körmendi"}</p>
        <a className="artist-hero-cta" href={slide.href} target="_blank" rel="noreferrer"
          onClick={() => track("click", { label: `hero_cta: ${slide.title}` })}>
          {listen} ↗
        </a>
      </div>
      <div className="artist-hero-switcher" role="group" aria-label={hu ? "Dalok váltása" : "Switch songs"}>
        <button type="button" onClick={() => select(index - 1)} aria-label={hu ? "Előző dal" : "Previous song"}><ArrowLeft size={17} aria-hidden="true" /></button>
        {slides.map((item, i) => (
          <button type="button" key={item.theme} className="artist-hero-dot" aria-label={item.title}
            aria-pressed={i === index} onClick={() => select(i)}>
            <span aria-hidden="true" />
          </button>
        ))}
        <button type="button" onClick={() => select(index + 1)} aria-label={hu ? "Következő dal" : "Next song"}><ArrowRight size={17} aria-hidden="true" /></button>
        <button type="button" onClick={() => setPaused(current => !current)}
          aria-label={paused ? (hu ? "Automatikus váltás indítása" : "Start slideshow") : (hu ? "Automatikus váltás szüneteltetése" : "Pause slideshow")}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
