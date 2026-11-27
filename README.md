# Premium Cinema — frontend-only streaming UI

A premium, cinematic movie & TV-series browsing/streaming **front-end**. No backend, no build step:
`index.html` + `style.css` + `app.js` (+ `admin.html`). Vanilla JS, TMDB API v3, LocalStorage, HLS.js (loaded on demand).

## Run it
```bash
# any static server with an SPA fallback (unknown paths -> index.html), e.g.
npx serve -s .            # or: python3 -m http.server  (see note below)
```
* Clean URLs (`/movie/123`, `/watch/123?type=tv&s=1&e=2`, `/search?q=…`) use the **History API**, so the host must serve `index.html` for unknown paths
  (Netlify: `/* /index.html 200` in `_redirects`; Cloudflare Pages does this by default; Apache: `FallbackResource /index.html`; Nginx: `try_files $uri /index.html;`).
* Opening the files directly (`file://`) works too — the router automatically switches to `#/hash` URLs.
* No fallback available? Add `<script>window.PC_ROUTING='hash'</script>` before `app.js` in `index.html`.
* Hosting in a sub-folder? `<script>window.PC_BASE='/my-folder'</script>` in `index.html`.

## TMDB
Without a key the app shows a complete **demo catalogue** (generated artwork, nothing is requested from TMDB) and says so in a banner.
Add your v3 key in **Profile → Settings** (there is a *Test connection* button), in **admin.html → API Configuration**, or in `app.js`: `const TMDB_API_KEY = '…'`.
If a key is set but invalid / offline, the UI shows real error states with a retry button — it never silently falls back to fake data.
Implemented: trending, popular, top rated, now playing, upcoming, popular/top TV, discover-by-genre, movie/TV search, details (+credits, videos, similar in one call), season/episode lists, genre lists.
> A frontend-only app cannot hide an API key. Respect TMDB's terms; show their attribution (included in the footer).

## Video sources
Each title gets sources by this priority: **episode → series/movie → global (`*`) → built-in demo sources**. Manage them in `admin.html → Video Sources`
(label, language note, type `hls | mp4 | iframe`, enable/disable). Only `https://` URLs are accepted.
The built-in demo sources (`DEFAULT_SOURCES` in `app.js`) are public test media (Blender "Big Buck Bunny"). **Use only sources you are authorised to distribute or embed.**
* **HLS** — hls.js is lazy-loaded (native playback on Safari/iPhone). Your CDN must send CORS headers.
* **MP4** — plain `<video>`.
* **iframe** — shown as-is; the embed provider's own player UI cannot be restyled from outside. For a fully branded player use direct HLS/MP4.

## Player
Custom Netflix-style controls (HLS/MP4): seek bar with hover time, ±10 s, volume, speed, quality (HLS), PiP, fullscreen (with iPhone / in-page fallbacks),
auto-hiding controls, double-tap seek on touch, resume position, next-episode countdown, source selector, “lights off” mode.
Keys: `Space/K` play · `←/→` ±10 s · `↑/↓` volume · `M` mute · `F` fullscreen · `P` PiP · `N` next episode · `/` search · `Esc`.

## Admin (`admin.html`) — demo only
Overview widgets, movies / series / seasons / episodes CRUD, poster & backdrop upload preview (resized, stored as data-URLs), sources, categories,
demo users & comments, settings (export / import / reset), API configuration. Everything lives in LocalStorage; **there is no authentication** — anyone can open it.

## Files
```
index.html   shell, SEO meta, routing bootstrap
style.css    design system, layout, player, responsive (mobile-first bottom nav, safe-area aware)
app.js       i18n (tr/en) · demo data · TMDB layer · stores · components · pages · player · router
admin.html   standalone admin dashboard (reuses app.js helpers)
assets/      (empty — drop your own logo / images here)
```
LocalStorage keys: `pc.settings pc.watchlist pc.history pc.catalog pc.sources pc.recent pc.users pc.comments pc.activity pc.cats`.

## Notes
* Performance: lazy images with TMDB `srcset`, skeletons, CSS-transform animations, no frameworks, `prefers-reduced-motion` respected (+ in-app toggle).
* Accessibility: skip link, labelled controls, focus rings, `aria-current`, live regions.
* Test hosts: iPhone Safari (safe-area, `playsinline`, native HLS), desktop Chrome/Firefox/Edge.
