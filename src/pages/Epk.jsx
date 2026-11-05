import { useEffect, useState } from "react";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { track } from "../utils/track";
import portraitWide from "../assets/images/portrait-riverside-wide.jpg";
import portraitMobile from "../assets/images/portrait-riverside-mobile.jpg";
import photoPortrait from "../assets/images/photo-img7255.jpg";
import photoPortrait1 from "../assets/images/casting/casting-look-dramatic.jpg";
import photoPortrait2 from "../assets/images/casting/casting-look-edgy.jpg";
import photoSession from "../assets/images/photo-img3953.jpg";
import "./Epk.css";

const email = "richard.kormendi@gmail.com";
const showreelUrl = "https://drive.google.com/file/d/1237A0yrQDL1kFsOK65qSmqpeC4pBJCsS/view";

const pressItems = [
  {
    outlet: "Shock!",
    quote: "Richard talks about returning to his rock roots after years of classical vocal training.",
    quoteHu: "A cikkben Richárd arról mesél, hogyan tért vissza a rockhoz a klasszikus énektanulmányai után.",
    type: { en: "Feature", hu: "Cikk" },
    song: "My Burning Devotion",
    url: "https://www.shockmagazin.hu/ar/richard-kormendi-my-burning-devotion",
  },
  {
    outlet: "Ok Music Play",
    quote: "“The vocalist's expressive voice explodes into an intense chorus whose timbre recalls Serj Tankian, of System of a Down.”",
    quoteHu: "A kritika szerint a refrénben Richárd hangszíne a System of a Down énekesét, Serj Tankiant idézi.",
    type: { en: "Review", hu: "Kritika" },
    song: "You Become My Only",
    url: "https://okmusicplay.com/2026/08/10/guia-de-descobertas-colepitz-ambimatix/",
  },
  {
    outlet: "Indie Dream",
    quote: "“The vocal moment at 2:42 feels like the push you need to realize there's still so much left to do in life.”",
    quoteHu: "A kritika szerint a 2:42-nél megszólaló ének adja meg azt a lendületet, amitől az ember úgy érzi, még sok minden vár rá.",
    type: { en: "Review", hu: "Kritika" },
    song: "Still I Go",
    url: "https://www.indiedream.com.mx/2026/08/richard-kormendi-still-i-go.html",
  },
  {
    outlet: "Sagar Kari",
    quote: "“Fall Into You is a really beautiful song. There's so much pain and emotion in the track, and it comes through in a very raw and genuine way. The song feels unique in its own way, and the overall mood really stays with you. I liked how deeply emotional it feels without trying too hard. Really nice track overall!”",
    quoteHu: "A dal őszintesége és fájdalma fogta meg. Külön kiemelte, hogy az érzelmek erőltetés nélkül is átjönnek.",
    type: { en: "Listener", hu: "Hallgatói vélemény" },
    song: "Fall Into You",
    url: null,
  },
];

const streamingLinks = [
  { name: "Spotify",     url: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { name: "Apple Music", url: "https://music.apple.com/hu/artist/richard-körmendi/1877841316" },
  { name: "Tidal",       url: "https://tidal.com/artist/74624158" },
  { name: "YouTube",     url: "https://www.youtube.com/@richardkormendi6379" },
  { name: "Instagram",   url: "https://www.instagram.com/rickormendi/" },
];

const photos = [
  { src: photoPortrait,    name: "richard-kormendi-portrait.jpg",  label: { en: "Portrait", hu: "Portré" } },
  { src: photoPortrait1,       name: "richard-kormendi-portrait-1.jpg",       label: { en: "Portrait 1", hu: "Portré 1" } },
  { src: photoPortrait2, name: "richard-kormendi-portrait-2.jpg", label: { en: "Portrait 2", hu: "Portré 2" } },
  { src: photoSession,   name: "richard-kormendi-session.jpg",   label: { en: "Recording session", hu: "Felvétel közben" } },
];

const videos = [
  { id: "JJkGesy7V2M", title: "Non ti scordar di me", hu: "Olasz klasszikus · Élőben, zongorakísérettel", en: "Italian classic · Live with piano" },
  { id: "t2cxm6nhKaE", title: "Hero", youtubeOnly: true, hu: "Enrique Iglesias · Akusztikus részlet", en: "Enrique Iglesias · Acoustic excerpt" },
  { id: "grixDWxlOGs", title: "Sweet Child o’ Mine", youtubeOnly: true, hu: "Guns N’ Roses · Akusztikus részlet, mélyebb fekvésben", en: "Guns N’ Roses · Acoustic excerpt in a lower register" },
  { id: "N1f6MujK9gc", title: "Like an Ember", hu: "Saját dal · Zongorás részlet", en: "Original song · Piano excerpt" },
];

const additionalVideos = [
  { id: "qpZUke-3WdE", title: "Regnum Marianum", hu: "Saját dal · Videóklip", en: "Original song · Music video" },
  { id: "PW9BkG3gnlk", title: "My Burning Devotion", hu: "Saját dal · Videóklip", en: "Original song · Music video" },
  { id: "DbmA6e0lOEw", title: "Anthem", youtubeOnly: true, hu: "A Sakk című musical dala · Zongorás változat", en: "Chess · Piano version" },
];

function VideoCard({ video, hu, playing, onPlay, landscape }) {
  const { id, title, youtubeOnly } = video;
  const url = landscape
    ? `https://www.youtube.com/watch?v=${id}`
    : `https://www.youtube.com/shorts/${id}`;
  const thumbnail = (
    <>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span aria-hidden="true">▶</span>
    </>
  );
  return (
    <article className="epk-card epk-video">
      <div className="epk-video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : youtubeOnly ? (
          <a href={url} target="_blank" rel="noreferrer" aria-label={`${title} – YouTube`}>
            {thumbnail}
          </a>
        ) : (
          <button type="button" onClick={onPlay} aria-label={`${hu ? "Lejátszás" : "Play"} – ${title}`}>
            {thumbnail}
          </button>
        )}
      </div>
      <div className="epk-card-copy">
        <h3>{title}</h3>
        <p>{hu ? video.hu : video.en}</p>
        <a href={url} target="_blank" rel="noreferrer" aria-label={`${title} – YouTube`}>
          {hu ? "Megnyitás a YouTube-on" : "Watch on YouTube"} ↗
        </a>
      </div>
    </article>
  );
}

export default function Epk() {
  const { lang } = useLang();
  const hu = lang === "hu";
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = hu ? "Körmendi Richárd – Fellépésajánló" : "Richard Körmendi – Live bookings";
    return () => { document.title = previousTitle; };
  }, [hu]);

  const renderVideo = (video, landscape = false) => (
    <VideoCard
      key={video.id}
      video={video}
      hu={hu}
      playing={playing === video.id}
      landscape={landscape}
      onPlay={() => {
        setPlaying(video.id);
        track("click", { label: `epk_video: ${video.title}` });
      }}
    />
  );

  return (
    <div className="epk" lang={lang}>
      <Navbar />
      <main>
        <section className="epk-hero" aria-labelledby="epk-name">
          <picture className="epk-hero-photo">
            <source media="(max-width: 760px)" srcSet={portraitMobile} />
            <img src={portraitWide} alt={hu ? "Körmendi Richárd portréja" : "Portrait of Richard Körmendi"} fetchPriority="high" />
          </picture>
          <div className="epk-hero-copy">
            <p className="epk-kicker">{hu ? "Fellépésajánló" : "Live bookings"}</p>
            <h1 id="epk-name">{hu ? "Körmendi Richárd" : "Richard Körmendi"}</h1>
            <p className="epk-lead">{hu ? "Klasszikus tenor a rock világában." : "A classical tenor in the world of rock."}</p>
            <div className="epk-actions">
              <a className="epk-button epk-button-primary" href={`mailto:${email}`}
                onClick={() => track("click", { label: "epk_booking_contact" })}>
                {hu ? "Fellépés egyeztetése" : "Booking enquiries"}
              </a>
              <a className="epk-button" href="#videok">{hu ? "Műsorízelítő" : "Watch the showreel"} ↓</a>
            </div>
          </div>
        </section>

        <section id="videok" className="epk-section" aria-labelledby="epk-video-heading">
          <div className="epk-wrap">
            <h2 id="epk-video-heading">{hu ? "Videórészletek" : "Performance clips"}</h2>
            <article className="epk-card epk-showreel">
              <div>
                <p className="epk-kicker">{hu ? "Műsorízelítő" : "Showreel"}</p>
                <h3>{hu ? "Öt dal, 77 másodperc" : "Five songs in 77 seconds"}</h3>
                <p>{hu
                  ? "Szeretni valakit valamiért, Sway, Can’t Help Falling in Love, Feeling Good és Delilah egy otthoni felvételen."
                  : "Recorded at home, with excerpts from Szeretni valakit valamiért, Sway, Can’t Help Falling in Love, Feeling Good and Delilah."}</p>
              </div>
              <a className="epk-button epk-button-primary" href={showreelUrl} target="_blank" rel="noreferrer"
                onClick={() => track("click", { label: "epk_video: showreel" })}>
                {hu ? "Műsorízelítő megtekintése" : "Watch the showreel"} ↗
              </a>
            </article>
            <div className="epk-grid">
              {videos.map(video => renderVideo(video))}
            </div>
          </div>
        </section>

        <section className="epk-section epk-section-tinted" aria-labelledby="epk-about-heading">
          <div className="epk-wrap epk-editorial">
            <div>
              <p className="epk-kicker">{hu ? "A műsor" : "The set"}</p>
              <h2 id="epk-about-heading">{hu ? "Ismerős dalok több korszakból" : "Familiar songs from across the decades"}</h2>
              <p>{hu
                ? "A műsorban magyar rockörökzöldek, angol nyelvű pop- és rockslágerek, Sinatra-dalok és olasz klasszikusok szólalnak meg. A balladák és a lendületesebb slágerek közé egy-egy saját dal is bekerülhet. A dalokat és a műsor hosszát előre egyeztetjük."
                : "The repertoire spans Hungarian rock favourites, English-language pop and rock hits, Sinatra standards and Italian songs. It ranges from ballads to up-tempo hits. The set can also include an original song or two. The set list and running time can be arranged in advance."}</p>
            </div>
            <div>
              <p className="epk-kicker">{hu ? "Az előadó" : "The artist"}</p>
              <h2>{hu ? "Rövid bemutatkozás" : "Short biography"}</h2>
              <p>{hu
                ? "Körmendi Richárd esztergomi énekes, gitáros és dalszerző. Zenei pályáját az Éberálom zenekar frontembereként kezdte, később színészként dolgozott és musicalekben játszott. 2024-ben a nagyváradi Partiumi Keresztény Egyetemen szerzett klasszikus énekdiplomát. Ma magyarul és angolul ír saját dalokat, fellépésein pedig főként örökzöldeket énekel."
                : "Richard Körmendi is a singer, guitarist and songwriter from Esztergom, Hungary. He began his music career as the frontman of Éberálom and went on to perform as an actor and in musical theatre. In 2024 he graduated in classical vocal performance from Partium Christian University in Oradea. He writes songs in English and Hungarian and mainly performs evergreen favourites live."}</p>
            </div>
          </div>
        </section>

        <section className="epk-section" aria-labelledby="epk-more-videos-heading">
          <div className="epk-wrap">
            <h2 id="epk-more-videos-heading">{hu ? "Saját klipek és musical" : "Music videos and musical theatre"}</h2>
            <div className="epk-grid epk-wide-videos">
              {additionalVideos.map(video => renderVideo(video, true))}
            </div>
          </div>
        </section>

        <section className="epk-section" aria-labelledby="epk-press-heading">
          <div className="epk-wrap">
            <h2 id="epk-press-heading">{hu ? "Sajtó és visszajelzések" : "Press and feedback"}</h2>
            <div className="epk-grid epk-press">
              {pressItems.map(item => (
                <article className="epk-card epk-card-copy" key={item.outlet}>
                  <p className="epk-kicker">{item.type[lang]}</p>
                  <h3>{item.song}</h3>
                  <p className="epk-outlet">{item.outlet}</p>
                  <p>{hu ? item.quoteHu : item.quote}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer"
                      onClick={() => track("click", { label: `epk_press: ${item.outlet}` })}>
                      {hu ? "Cikk megnyitása" : "Read the article"} ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
            <div className="epk-listen">
              <h3>{hu ? "Saját dalok és közösségi oldalak" : "Original music and social links"}</h3>
              <div className="epk-actions">
                {streamingLinks.map(link => (
                  <a key={link.name} className="epk-button" href={link.url} target="_blank" rel="noreferrer"
                    onClick={() => track("click", { label: `epk_stream: ${link.name}` })}>{link.name} ↗</a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="epk-section epk-section-tinted" aria-labelledby="epk-photos-heading">
          <div className="epk-wrap">
            <h2 id="epk-photos-heading">{hu ? "Letölthető fotók" : "Press photos"}</h2>
            <div className="epk-grid">
              {photos.map(photo => (
                <a className="epk-card epk-photo" key={photo.name} href={photo.src} download={photo.name}
                  onClick={() => track("click", { label: `epk_photo_download: ${photo.name}` })}>
                  <img src={photo.src} alt="" loading="lazy" />
                  <span>{photo.label[lang]} <span aria-hidden="true">↓</span></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="epk-section epk-contact" aria-labelledby="epk-contact-heading">
          <div className="epk-wrap">
            <h2 id="epk-contact-heading">{hu ? "Fellépés és sajtó" : "Bookings and press"}</h2>
            <p>{hu
              ? "Ha fellépésre hívnál, írd meg, milyen rendezvényre gondoltál, mikor és hol lenne."
              : "For booking enquiries, please include the date, venue and type of event."}</p>
            <a href={`mailto:${email}`} onClick={() => track("click", { label: "epk_booking_contact" })}>{email}</a>
            <p>{hu ? "Esztergom, Magyarország" : "Esztergom, Hungary"}</p>
            <button type="button" className="epk-button epk-print"
              onClick={() => { track("click", { label: "epk_pdf_download" }); window.print(); }}>
              {hu ? "Mentés PDF-ként" : "Save as PDF"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
