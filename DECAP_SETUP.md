# Decap CMS beállítás — lépésről lépésre

## 1. GitHub repo létrehozása

```bash
cd /Users/kormendirichard/richard-kormendi-site
git init
git add .
git commit -m "initial commit"
gh repo create richard-kormendi-site --public --source=. --remote=origin --push
```

## 2. GitHub OAuth App létrehozása

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Töltsd ki:
   - **Application name:** Richard Körmendi CMS
   - **Homepage URL:** https://richard-kormendi-site.vercel.app
   - **Authorization callback URL:** https://richard-kormendi-site.vercel.app/api/callback
3. Kattints "Register application"
4. Mentsd el a **Client ID**-t és generálj egy **Client Secret**-et

## 3. Vercel env változók beállítása

Vercel Dashboard → richard-kormendi-site → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `GITHUB_CLIENT_ID` | (GitHub OAuth App Client ID) |
| `GITHUB_CLIENT_SECRET` | (GitHub OAuth App Client Secret) |

## 4. Vercel GitHub integráció bekötése

Vercel Dashboard → richard-kormendi-site → Settings → Git → Connect Git Repository → válaszd ki a repót

Ezután minden GitHub push automatikusan deployol.

## 5. config.yml frissítése

A `public/admin/config.yml` fájlban cseréld le:
```yaml
repo: GITHUB_USERNAME/richard-kormendi-site
```
→ pl. `repo: kormendirichard/richard-kormendi-site`

## 6. CMS használata

- Admin felület: https://richard-kormendi-site.vercel.app/admin/
- Koncertek hozzáadása: Shows → Koncertlista → + gomb
- Fotó feltöltés: Fotók → Fotógaléria → + gomb (max ~5MB képenként)
- Minden mentés automatikusan commit-ot csinál a GitHub repóba
- Vercel 1-2 perc alatt deployolja az új változást

## Helyi fejlesztés (opcionális)

A CMS csak éles URL-en működik (OAuth miatt). Helyi tesztelhez:
```bash
npx decap-server  # futtatja a local backend proxy-t
```
Majd a `config.yml`-be `backend: name: test-repo`-ra állítva tesztelhető.
