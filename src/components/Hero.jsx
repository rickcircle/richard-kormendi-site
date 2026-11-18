import { useLang } from "../context/LanguageContext";
import { edenPark } from "../data/featuredMusic";
import { track } from "../utils/track";
import "./Hero.css";

export default function Hero() {
  const { lang } = useLang();
  const hu = lang === "hu";

  return (
    <section className="artist-hero" aria-labelledby="artist-hero-title">
      <img className="artist-hero-image" src={edenPark.cover} alt="" fetchPriority="high" />
      <div className="artist-hero-copy">
        <p className="artist-hero-eyebrow">{hu ? "Új dal" : "New single"}</p>
        <h1 id="artist-hero-title">{edenPark.title}</h1>
        <p className="artist-hero-name">{hu ? "Körmendi Richárd" : "Richard Körmendi"}</p>
        <a className="artist-hero-cta" href={edenPark.href} target="_blank" rel="noreferrer"
          onClick={() => track("click", { label: "hero_cta: Éden Park" })}>
          {hu ? "Hallgasd meg az Apple Musicon" : "Listen on Apple Music"} ↗
        </a>
      </div>
    </section>
  );
}
