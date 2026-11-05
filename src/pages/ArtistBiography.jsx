const biography = {
  hu: [
    {
      title: "Saját dalok és zenei pálya",
      text: "Körmendi Richárd esztergomi énekes, gitáros és dalszerző. Az Éberálom indie rock zenekar frontembereként kezdte a zenei pályáját. Ma magyarul és angolul ír dalokat. A klasszikus énektanulmányai során szerzett tudást a saját dalai, az örökzöldek és a klasszikus darabok előadásában egyaránt kamatoztatja.",
    },
    {
      title: "Énekesi és színészi tanulmányok",
      text: "2024-ben klasszikus énekes-előadóművészként végzett a nagyváradi Partiumi Keresztény Egyetem magánének szakán. Énekmestere Berle Senford Rosenberg volt. Korábban Kővári Juditnál tanult klasszikus és musicaléneklést a Kővirágok Énekiskolában, színészi képzést pedig a Thália Tanodában kapott.",
    },
    {
      title: "Színpadi szerepek",
      text: "Jancsit játszotta a János vitézben, Szécsi Pált alakította az énekes emlékére rendezett előadásokon, a Thália Tanodában pedig Lysander és III. Richárd szerepében lépett színpadra. Egyetemi koncertjein Mozart-áriákat, német műdalokat és nápolyi dalokat is énekelt.",
    },
    {
      title: "Digitális háttér",
      text: "Informatikai mérnöki végzettsége is van. Tizennégy év webfejlesztés után ma digitális projekteket vezet, és mesterséges intelligenciára épülő megoldásokat fejleszt. Alkotóként ma a saját dalaira és a színpadi munkára helyezi a hangsúlyt.",
    },
  ],
  en: [
    {
      title: "Songwriting and early career",
      text: "Richard Körmendi is a singer, guitarist and songwriter from Esztergom, Hungary. He began his music career fronting the indie rock band Éberálom and now writes songs in Hungarian and English. He draws on his classical training when performing original songs, popular standards and classical repertoire.",
    },
    {
      title: "Vocal and acting training",
      text: "He graduated in classical vocal performance from Partium Christian University in Oradea in 2024, where he studied with Berle Senford Rosenberg. He previously studied classical and musical theatre singing with Judit Kővári at the Kővirágok School of Singing and trained as an actor at Thália Tanoda.",
    },
    {
      title: "Stage roles",
      text: "He played Jancsi in János vitéz and portrayed Hungarian singer Pál Szécsi in tribute performances. At Thália Tanoda he played Lysander and Richard III. His university concerts included Mozart arias, German art songs and Neapolitan songs.",
    },
    {
      title: "Digital background",
      text: "With a background in computer engineering, he spent 14 years working as a web developer before moving into digital project management and AI development. As an artist, he now focuses on songwriting and performing.",
    },
  ],
};

export default function ArtistBiography({ lang }) {
  return (
    <section id="palyam" className="epk-section epk-section-tinted" aria-labelledby="artist-bio-heading">
      <div className="epk-wrap">
        <h2 id="artist-bio-heading">{lang === "hu" ? "Pályám" : "Biography"}</h2>
        <div className="epk-editorial epk-biography">
          {biography[lang].map(({ title, text }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
