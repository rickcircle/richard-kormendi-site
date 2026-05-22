// Vercel serverless function — GitHub OAuth callback Decap CMS-hez

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return sendHtml(res, errorScript("Missing code parameter"));
  }

  let data;
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
    data = await response.json();
  } catch (err) {
    return sendHtml(res, errorScript("Token exchange failed: " + err.message));
  }

  const token = data?.access_token;
  if (!token) {
    const detail = data?.error_description || data?.error || JSON.stringify(data);
    return sendHtml(res, errorScript(detail));
  }

  const payload = JSON.stringify({ token, provider: "github" });
  return sendHtml(res, successScript(payload));
}

function sendHtml(res, script) {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html><html><body>${script}</body></html>`);
}

function successScript(payload) {
  const msg = JSON.stringify(`authorization:github:success:${payload}`);
  return `<script>
    (function() {
      var msg = ${msg};
      var sent = false;

      function send(origin) {
        if (sent) return;
        sent = true;
        window.opener.postMessage(msg, origin || '*');
        setTimeout(function() { window.close(); }, 300);
      }

      // Decap CMS echoes "authorizing:github" back — use that origin for the reply
      window.addEventListener("message", function(e) {
        send(e.origin);
      });

      // Fallback: ha 1 másodpercen belül nincs echo, küldjük '*'-ra
      setTimeout(function() { send('*'); }, 1000);

      // Jelzés a Decap CMS-nek: elindult az auth
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>`;
}

function errorScript(msg) {
  const err = JSON.stringify(`authorization:github:error:${JSON.stringify({ message: msg })}`);
  return `<script>
    (function() {
      if (window.opener) window.opener.postMessage(${err}, '*');
      setTimeout(function() { window.close(); }, 3000);
    })();
  </script>
  <p style="font-family:sans-serif;padding:2rem;color:#c00">
    <strong>Login hiba:</strong><br>${msg}<br><br>
    <a href="/admin/">← Vissza az adminhoz</a>
  </p>`;
}
