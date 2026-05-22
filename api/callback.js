// Vercel serverless function — GitHub OAuth callback Decap CMS-hez
// Bejön a code, csere access_token-re, postMessage a CMS-nek, bezárja a popupot

function makeHtml(message) {
  return `<!DOCTYPE html><html><body><script>
    (function() {
      var msg = ${JSON.stringify(message)};
      if (window.opener) {
        window.opener.postMessage(msg, '*');
      }
      window.close();
    })();
  </script></body></html>`;
}

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.setHeader("Content-Type", "text/html");
    return res.send(makeHtml('authorization:github:error:{"message":"Missing code"}'));
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
    res.setHeader("Content-Type", "text/html");
    return res.send(makeHtml('authorization:github:error:{"message":"Token exchange failed"}'));
  }

  if (!token) {
    res.setHeader("Content-Type", "text/html");
    return res.send(makeHtml('authorization:github:error:{"message":"No token returned"}'));
  }

  const payload = JSON.stringify({ token, provider: "github" });
  res.setHeader("Content-Type", "text/html");
  res.send(makeHtml(`authorization:github:success:${payload}`));
}
