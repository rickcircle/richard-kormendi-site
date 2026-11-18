import { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { musicVideos } from "../data/featuredMusic";
import { track } from "../utils/track";
import VideoCard from "./VideoCard";

export default function HomeVideos() {
  const { lang } = useLang();
  const hu = lang === "hu";
  const [playing, setPlaying] = useState(null);

  return (
    <section id="music" className="epk home-section home-videos" aria-labelledby="home-videos-heading">
      <div className="epk-wrap">
        <h2 id="home-videos-heading">{hu ? "Videóklipek" : "Music videos"}</h2>
        <div className="epk-grid epk-wide-videos">
          {musicVideos.map(video => (
            <VideoCard key={video.id} video={video} hu={hu} landscape playing={playing === video.id}
              onPlay={() => {
                setPlaying(video.id);
                track("click", { label: `home_video: ${video.title}` });
              }} />
          ))}
        </div>
      </div>
    </section>
  );
}
