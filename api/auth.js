// Vercel serverless function — GitHub OAuth flow indítása Decap CMS-hez
// Env vars szükségesek (Vercel Dashboard → Settings → Environment Variables):
//   GITHUB_CLIENT_ID  — GitHub OAuth App Client ID
//   GITHUB_CLIENT_SECRET  — GitHub OAuth App Client Secret

export default function handler(req, res) {
  const { host } = req.headers;
  const protocol = host.includes("localhost") ? "http" : "https";
  const base = `${protocol}://${host}`;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${base}/api/callback`,
    scope: "repo,user",
    state: req.query.state || "",
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
