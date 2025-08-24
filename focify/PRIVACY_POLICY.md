# Focify – Politica de Confidențialitate & Justificări Permisiuni

(English summary follows Romanian section.)

## 1. Descrierea scopului unic
Focify are un **scop unic clar**: reducerea distragerilor pe YouTube pentru a sprijini concentrarea utilizatorului atunci când urmărește conținut important (educațional, profesional sau de învățare). Extensia ascunde elemente neesențiale (Shorts, feed de recomandări, bara laterală de videoclipuri sugerate, comentarii, mini‑player, ecrane de final) și împiedică accesul la pagini generatoare de procrastinare (Shorts, Trending, Explore) pentru a menține un mediu curat de vizionare.

## 2. Date colectate
Focify **NU colectează, NU transmite și NU vinde** niciun fel de date personale sau de utilizare. Toată logica rulează local în browserul utilizatorului. Nu există analytics, tracking, cookie-uri proprii sau servere externe implicate.

## 3. Permisiuni și justificări

### 3.1 declarativeNetRequest
- Folosim doar **3 reguli statice** (vezi `rules/dnr_static.json`).
- Acestea blochează navigarea către: `/shorts`, `/feed/trending`, `/feed/explore` (tip `main_frame`).
- Scop: prevenirea accesului accidental la fluxuri cu potențial ridicat de distragere.
- Nu creăm și nu modificăm dinamic reguli; nu interceptăm alte resurse; nu facem tracking.

### 3.2 Host permissions (https://www.youtube.com/* , https://m.youtube.com/*)
- Necesare pentru a injecta foaia de stil (`yt-focus.css`) și scriptul de conținut care aplică/înlătură clase CSS pentru ascunderea elementelor de distragere.
- Nu accesăm alte domenii și nu trimitem date în afara YouTube.

### 3.3 storage
- Folosim `chrome.storage.sync` pentru a salva exclusiv setările utilizatorului: modul curent (Off/Work), starea fiecărui toggle, lista de canale/cuvinte blocate și setări Pomodoro (dacă sunt activate în versiunile viitoare).
- Nu stocăm istoricul de vizionare, date personale sau identificatori unici suplimentari.
- Datele pot fi șterse de utilizator prin: resetarea setărilor / dezinstalarea extensiei / ștergerea datelor site-ului.

### 3.4 Cod la distanță (remote code)
- Extensia **NU descarcă și NU execută cod de la distanță**.
- Toate scripturile sunt statice, livrate în pachetul extensiei. Nu folosim `eval()`, `Function()` dinamic, module încărcate din rețea sau CDN runtime.

## 4. Utilizare responsabilă a datelor
Respectăm Politicile Chrome Web Store: nu colectăm date, nu corelăm informații cu identitatea utilizatorului și nu transferăm nimic către servere terțe. Toate acțiunile sunt locale și reversibile.

## 5. Securitate
- Nu interceptăm credențiale sau formularistică.
- Nu modificăm cereri în afară de blocările explicite menționate (3 rute principale YouTube).
- Nu expunem API-uri către alte extensii.

## 6. Ștergerea datelor
Utilizatorul poate:
1. Dezinstala extensia (șterge automat stocarea asociată).
2. Deschide `chrome://settings/siteData` și șterge datele aferente.
3. (Opțional) Un buton de reset va fi adăugat într-o versiune viitoare pentru golirea rapidă a setărilor.

## 7. Afiliere
Focify este un proiect independent și **nu este afiliat, sponsorizat sau aprobat** de YouTube / Google. Toate mărcile comerciale aparțin proprietarilor lor.

## 8. Contact
Probleme / întrebări: deschideți un issue în repository-ul proiectului (dacă devine public) sau contact direct prin canalul indicat de distribuitor.

---

# English Summary

## Unique Purpose
Focify has a single, narrow purpose: reduce visual & behavioral distractions on YouTube so users can stay focused on intentional watching (study, work, learning). It hides non-essential UI elements and blocks navigation to high-distraction feeds (Shorts / Trending / Explore).

## Data Collection
No data is collected, transmitted, sold, or analyzed. All logic runs locally. No analytics, no tracking.

## Permission Justifications
- declarativeNetRequest: 3 static main_frame blocking rules only (Shorts, Trending, Explore) to maintain focus; no dynamic rules, no inspection of other traffic.
- Host permissions (youtube.com / m.youtube.com): required to inject CSS & a lightweight content script to toggle distraction-hiding classes.
- storage: stores only user settings (mode, toggles, blocklist, optional Pomodoro config) in chrome.storage.sync; no personal or behavioral data.
- Remote code: none. All code is bundled; no runtime fetch, no eval.

## Compliance
We comply with Chrome Web Store Developer Program Policies: minimal permissions, purpose limitation, no personal data collection.

## Deletion
Uninstalling the extension or clearing site data removes all stored settings.

## Affiliation
Not affiliated with or endorsed by YouTube / Google.

---
_Last updated: 2025-08-24_
