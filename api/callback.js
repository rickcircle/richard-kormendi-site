// Vercel serverless function — GitHub OAuth callback Decap CMS-hez
// Bejön a code, csere access_token-re, postMessage a CMS-nek

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send("Missing code");
    return;
  }

  let token;
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await response.json();
    token = data.access_token;
  } catch {
    res.status(500).send("Token exchange failed");
    return;
  }

  if (!token) {
    const html = `<!DOCTYPE html><html><body><script>
      window.opener.postMessage('authorization:github:error:{"message":"No token returned"}','*');
      window.close();
    </script></body></html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
    return;
  }

  const payload = JSON.stringify({ token, provider: "github" });
  const html = `<!DOCTYPE html><html><body><script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage('authorization:github:success:${payload.replace(/'/g, "\\'")}', e.origin);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script></body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
}
