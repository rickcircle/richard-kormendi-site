import cinderella from "../assets/images/stage/cinderella.jpg";
import ensemble from "../assets/images/stage/ensemble.jpg";
import inCostume from "../assets/images/stage/in-costume.jpg";
import stageScene from "../assets/images/stage/stage-scene.jpg";
import castPhoto from "../assets/images/stage/cast-photo.jpg";

const stagePhotos = [
  { src: cinderella, hu: "A herceg a Hamupipőkében · Noir Színház", en: "The prince in Cinderella · Noir Theatre" },
  { src: stageScene, hu: "Jelenet egy színházi előadásból", en: "A scene from a stage production" },
  { src: ensemble, hu: "A Gergely Theáter szereplőivel", en: "With the cast of Gergely Theáter" },
  { src: inCostume, hu: "Jelmezben a színpadon", en: "On stage in costume" },
  { src: castPhoto, hu: "A Partiumi Keresztény Egyetem csapata Erdélyben", en: "With the Partium Christian University cast in Transylvania" },
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
