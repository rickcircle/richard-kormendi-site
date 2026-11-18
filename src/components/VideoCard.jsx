import { ArrowUpRight, Play } from "lucide-react";

export default function VideoCard({ video, hu, playing, onPlay, landscape }) {
  const { id, title, youtubeOnly, credit } = video;
  const url = video.url ?? (landscape
    ? `https://www.youtube.com/watch?v=${id}`
    : `https://www.youtube.com/shorts/${id}`);
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
      <div className="epk-card-copy epk-video-copy">
        <h3>{title}</h3>
        <div className="epk-video-details">
          <p>{hu ? video.hu : video.en}</p>
          {credit && <p className="epk-video-credit">{hu ? credit.hu : credit.en}</p>}
        </div>
        <a className="epk-video-link" href={url} target="_blank" rel="noreferrer" aria-label={`${title} – YouTube`}>
          <Play size={15} aria-hidden="true" />
          <span>{hu ? "Megnyitás a YouTube-on" : "Watch on YouTube"}</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
