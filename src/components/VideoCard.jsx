import { Play } from "lucide-react";

export default function VideoCard({ video, hu, playing, onPlay }) {
  const { id, title, credit } = video;
  const thumbnail = (
    <>
      <img src={`https://i.ytimg.com/vi/${id}/${video.featured ? "maxresdefault" : "hqdefault"}.jpg`} alt="" loading="lazy" />
      <span aria-hidden="true">▶</span>
    </>
  );
  return (
    <article className={`epk-card epk-video${video.featured ? " epk-video-featured" : ""}`}>
      <div className="epk-video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={onPlay} aria-label={`${hu ? "Lejátszás" : "Play"} – ${title}`}>
            {thumbnail}
          </button>
        )}
      </div>
      <div className="epk-card-copy epk-video-copy">
        <h3>{title}</h3>
        <div className="epk-video-details">
          <p>{hu ? video.hu : video.en}</p>
          {credit && <p className="epk-video-credit">{hu ? credit.hu : credit.en}</p>}
        </div>
        <button className="epk-video-link" type="button" onClick={onPlay} disabled={playing} aria-label={`${hu ? "Lejátszás" : "Play"} – ${title}`}>
          <Play size={15} aria-hidden="true" />
          <span>{playing ? (hu ? "Lejátszó megnyitva" : "Player open") : (hu ? "Lejátszás itt" : "Play here")}</span>
        </button>
      </div>
    </article>
  );
}
