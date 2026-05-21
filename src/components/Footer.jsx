const socials = [
  { label: "Spotify",   href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { label: "YouTube",   href: "https://www.youtube.com/@richardkormendi6379" },
  { label: "Instagram", href: "https://www.instagram.com/rickormendi/" },
  { label: "TikTok",    href: "https://www.tiktok.com/@rick.cormendi" },
  { label: "Upwork",    href: "https://www.upwork.com/freelancers/~01ec8ead6740efa3dc?viewMode=1" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      background: "#111",
      color: "#555",
      padding: "2.5rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem",
      fontSize: "0.8rem",
      letterSpacing: "0.05em",
    }}>
      <span style={{ color: "#aaa" }}>© {year} Richard Körmendi</span>

      <nav style={{ display: "flex", gap: "1.5rem" }}>
        {socials.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#aaa", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#aaa"}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <a
        href="mailto:richard.kormendi@gmail.com"
        style={{ color: "#aaa", textDecoration: "none", transition: "color 0.2s" }}
        onMouseOver={e => e.currentTarget.style.color = "#fff"}
        onMouseOut={e => e.currentTarget.style.color = "#aaa"}
      >
        richard.kormendi@gmail.com
      </a>
    </footer>
  );
}
