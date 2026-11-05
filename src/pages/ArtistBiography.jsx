const biography = {
  hu: [
    {
      title: "Énekesi és színészi tanulmányok",
      text: "A Thália Tanodában kezdett színészetet tanulni, majd a Kővirágok Énekiskolában musicaléneklést tanult. 2024-ben a nagyváradi Partiumi Keresztény Egyetemen szerzett diplomát klasszikus énekes-előadóművészként. Énekmesterei Tordai Éva, Kővári Judit és Berle Sanford Rosenberg voltak.",
    },
    {
      title: "Színpadi szerepek",
      text: "Prózai és zenés szerepekben egyaránt játszott. Gergely Róbert produkcióiban több főszerepet kapott, köztük Szécsi Pál szerepét. A padlásban a Rádióst játszotta, klasszikus énektanulmányai alatt pedig a János vitéz címszerepében turnézott Erdélyben.",
    },
    {
      title: "Saját dalok és zenei pálya",
      text: "Az Éberálom zenekarban énekelt, gitározott és dalokat írt. Innen a színészet és a musical felé fordult, majd klasszikus énekesi diplomát szerzett. 2026-ban indította el angol nyelvű szólóprojektjét. A színpad különösen fontos számára. Saját dalait élőben is szeretné megszólaltatni, és az évek során szerzett tapasztalatait magyar örökzöldek és nápolyi dalok előadásában is kamatoztatná.",
    },
    {
      title: "Digitális háttér",
      text: "Informatikai mérnöki végzettsége is van. Tizennégy évig dolgozott webfejlesztőként, később digitális projekteket vezetett, és mesterséges intelligenciára épülő megoldásokat fejlesztett.",
    },
  ],
  en: [
    {
      title: "Vocal and acting training",
      text: "Richard began studying acting at Thália Tanoda and went on to study musical theatre singing at Kővirágok Énekiskola. In 2024 he graduated in classical vocal performance from Partium Christian University in Oradea. His voice teachers were Éva Tordai, Judit Kővári and Berle Sanford Rosenberg.",
    },
    {
      title: "Stage roles",
      text: "He has performed in both plays and musicals. He played several leading roles in Róbert Gergely’s productions, including the Hungarian singer Pál Szécsi. He also played Rádiós in A padlás and toured Transylvania in the title role of János vitéz while studying classical singing.",
    },
    {
      title: "Songwriting and musical career",
      text: "Richard sang, played guitar and wrote songs in the band Éberálom. He went on to work in acting and musical theatre before earning his degree in classical singing. In 2026 he launched his English-language solo project. The stage is central to his work. He wants to perform his own songs live and bring what he has learned to music ranging from Hungarian favourites to Neapolitan songs.",
    },
    {
      title: "Digital background",
      text: "He also holds a degree in computer engineering. He worked as a web developer for 14 years and later managed digital projects and developed AI-based tools.",
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
