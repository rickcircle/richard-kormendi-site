import cinderella from "../assets/images/stage/cinderella.jpg";
import ensemble from "../assets/images/stage/ensemble.jpg";
import inCostume from "../assets/images/stage/in-costume.jpg";
import stageScene from "../assets/images/stage/stage-scene.jpg";
import castPhoto from "../assets/images/stage/cast-photo.jpg";

const stagePhotos = [
  { src: cinderella, hu: "A herceg a Hamupipőkében · Noir Színház", en: "The prince in Cinderella · Noir Theatre" },
  { src: stageScene, hu: "Szécsi Pál szerepében a Szécsi Pál-emlékesten", en: "As Pál Szécsi at a tribute evening" },
  { src: ensemble, hu: "Az Ami késik, nem múlik! premierjén a Gergely Theáter szereplőivel", en: "With the cast of Gergely Theáter at the premiere of Ami késik, nem múlik!" },
  { src: inCostume, hu: "Hamupipőke – promófotózás · Noir Színház, Duna Palota", en: "Cinderella promotional photo shoot · Noir Theatre, Duna Palota" },
  { src: castPhoto, hu: "A János vitéz címszerepében az erdélyi turnén · Partiumi Keresztény Egyetem", en: "In the title role of János vitéz on tour in Transylvania · Partium Christian University" },
];

export default function ArtistStagePhotos({ lang }) {
  return (
    <section className="epk-section epk-section-tinted" aria-labelledby="stage-photos-heading">
      <div className="epk-wrap">
        <h2 id="stage-photos-heading">{lang === "hu" ? "Színpadi fotók" : "Stage photos"}</h2>
        <div className="epk-grid epk-stage-grid">
          {stagePhotos.map(photo => (
            <figure className="epk-card epk-stage-photo" key={photo.src}>
              <img src={photo.src} alt="" loading="lazy" decoding="async" />
              <figcaption>{photo[lang]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
