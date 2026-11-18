import { useLang } from "../context/LanguageContext";
import profilePhoto from "../assets/images/portrait-leather-jacket.jpg";

export default function About() {
  const { lang } = useLang();
  const hu = lang === "hu";

  return (
    <section id="about" className="home-section home-about" aria-labelledby="home-about-heading">
      <div className="home-about-layout">
        <div className="home-about-copy">
          <h2 id="home-about-heading">{hu ? "Bemutatkozás" : "About"}</h2>
          <p className="home-about-lead">{hu ? "Klasszikus énekművész és dalszerző" : "Classical singer and songwriter"}</p>
          <p>{hu
            ? "Az Éberálom zenekarban énekeltem, gitároztam és dalokat írtam. Később prózai és zenés darabokban játszottam, majd Nagyváradon klasszikus énekesi diplomát szereztem. Ma magyarul és angolul írok saját dalokat."
            : "I sang, played guitar and wrote songs in Éberálom. I went on to act in plays and musicals before graduating in classical vocal performance in Oradea. I now write my own songs in Hungarian and English."}</p>
          <a className="home-text-link" href={`/bemutatkozas?lang=${lang}`}>
            {hu ? "Pályám és bemutatkozó videóm" : "My background and introduction video"} →
          </a>
        </div>
        <img src={profilePhoto} alt={hu ? "Körmendi Richárd portréja" : "Portrait of Richard Körmendi"} width="1066" height="1500" />
      </div>
    </section>
  );
}
