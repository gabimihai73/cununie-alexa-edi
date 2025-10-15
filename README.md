# Cununie Alexa & Edi — site pentru GitHub Pages

Aceasta este versiunea pregătită pentru GitHub Pages a galeriei "Cununie Alexa & Edi" (stil rustic-cowboy).
Include:
- `index.html` — pagina principală (fundal `images/site.jpg`).
- `style.css`, `script.js` — stil și logică.
- `images/` — conține `site.jpg`, `Alexa & Edi.jpg`, `Familie & invitati.jpg`.
- `alexa-edi/` și `familie-invitati/` — directoare goale pentru imagini dacă dorești să le adaugi manual în repo.

## Ce face upload-ul
Pagina folosește upload **unsigned** direct către Cloudinary (fără server):
- Endpoint: `https://api.cloudinary.com/v1_1/<cloudName>/upload`
- `cloudName` și `uploadPreset` sunt hardcodate în `script.js`. Le găsești deja setate la valorile pe care le-ai furnizat.

**Important:** Upload-urile duc fișierele în contul Cloudinary asociat `cloudName`. Cloudinary oferă un plan gratuit, dar verifică limita de stocare / trafic.

## Cum publici pe GitHub Pages
1. Creează un repository (numele vizibil pe GitHub poate fi `Cununie-Alexa-Edi` — GitHub nu acceptă caractere speciale în numele repo).
2. Încarcă conținutul acestui folder în repository (`Upload files` sau git push).
3. În setările repository-ului: `Pages` -> `Branch` -> selectezi `main` (sau `gh-pages`) și salvezi.  
   După câteva minute site-ul va fi activ la `https://<username>.github.io/<repo-name>/`.

## Cum adaugi imagini în galerii
Ai 3 opțiuni:
1. **Manual (static):** Încarci pozele în folderele `alexa-edi/` sau `familie-invitati/` din repo. Apoi editezi `script.js` și adaugi obiecte `{url: "alexa-edi/poza.jpg", name: "poza.jpg"}` în `galleries`.
2. **Upload direct (din site):** Folosește secțiunea `Încarcă poze`. Fișierele vor ajunge în Cloudinary; după upload, vor apărea în galerie (pentru vizitatorii care au făcut upload sau care au aceleași date în localStorage). Aceasta nu modifică automat repo-ul.
3. **Automat (avansat):** Creezi un mic backend sau folosești Cloudinary Admin API pentru a lista resursele din cont și a genera un fișier JSON dinamic; apoi scriptul poate încărca acea listă — necesită chei private și server.

## Notă despre spațiu
Ai menționat necesitatea ~3GB per folder. Cloudinary plan gratuit poate fi suficient temporar, dar pentru volume mari recomand un plan plătit sau un storage dedicat (ex: S3) / soluție de backup.

---
Dacă vrei, pot:
- genera acest pachet ca ZIP (am făcut-o deja) și îți dau link de download,
- sau pot face commit direct într-un repo GitHub dacă-mi dai acces (sau gh-pages token) — eu nu pot accesa GitHub în contul tău fără permisiuni.
