/* =====================================================================
   PREMIUM CINEMA — app.js  (frontend only · vanilla JS · no backend)
   1 config/utils · 2 i18n · 3 icons · 4 demo data · 5 TMDB/Data
   6 stores · 7 UI helpers · 8 components · 9 pages · 10 player · 11 router
   ===================================================================== */
'use strict';

/* ---------- 1. CONFIG ---------- */
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';          // or set it in Profile → Settings
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = {
  poster: 'https://image.tmdb.org/t/p/w500', backdrop: 'https://image.tmdb.org/t/p/original',
  backdropMd: 'https://image.tmdb.org/t/p/w1280', backdropSm: 'https://image.tmdb.org/t/p/w780',
  still: 'https://image.tmdb.org/t/p/w300', profile: 'https://image.tmdb.org/t/p/w185'
};
const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
const DEMO_TRAILER = 'aqz-KE-bpKQ';                // Blender Foundation (CC-BY) — demo only
/* Demo sources. Replace with sources you are authorised to distribute
   (or manage them from admin.html → Video Sources). */
const DEFAULT_SOURCES = [
  { label: 'Player 1', kind: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', lang: 'Demo · HLS', enabled: true },
  { label: 'Player 2', kind: 'mp4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', lang: 'Demo · MP4', enabled: true },
  { label: 'Player 3', kind: 'iframe', url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ', lang: 'Demo · Embed', enabled: true }
];

/* ---------- utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const clock = sec => { sec = Math.max(0, Math.floor(isFinite(sec) ? sec : 0)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};
const K = { settings: 'pc.settings', wl: 'pc.watchlist', hist: 'pc.history', catalog: 'pc.catalog', sources: 'pc.sources', recent: 'pc.recent', users: 'pc.users', comments: 'pc.comments', activity: 'pc.activity', cats: 'pc.cats' };
const isAdminPage = () => document.body.hasAttribute('data-admin');

/* ---------- 2. i18n + settings ---------- */
const I18N = {
  tr: { home: 'Ana Sayfa', movies: 'Filmler', series: 'Diziler', genres: 'Türler', search: 'Ara', watchlist: 'Listem', profile: 'Profil', history: 'İzleme Geçmişi', settings: 'Ayarlar', watchNow: 'Hemen İzle', trailer: 'Fragman', addList: 'Listeme Ekle', inList: 'Listemde', moreInfo: 'Detaylar', continueWatching: 'İzlemeye Devam Et', rTrending: 'Trend Filmler', rPopular: 'Popüler Filmler', rTop: 'En Yüksek Puanlılar', rNew: 'Yeni Çıkanlar', rTv: 'Popüler Diziler', rUpcoming: 'Yakında', rCatalog: 'Katalogdan', similar: 'Benzer İçerikler', cast: 'Oyuncular', director: 'Yönetmen', creator: 'Yapımcı', overview: 'Özet', originalTitle: 'Orijinal Ad', releaseDate: 'Yayın Tarihi', runtime: 'Süre', rating: 'Puan', season: 'Sezon', episode: 'Bölüm', episodes: 'Bölümler', nextEp: 'Sonraki', prevEp: 'Önceki', sources: 'Kaynak', loadMore: 'Daha Fazla', noResults: 'Sonuç bulunamadı', noResultsSub: 'Farklı bir arama deneyin.', searchPh: 'Film, dizi ara…', searchHint: 'Başlık yazmaya başlayın', recent: 'Son Aramalar', clear: 'Temizle', error: 'Bir şeyler ters gitti', retry: 'Tekrar dene', demoBanner: 'Demo veri gösteriliyor. Gerçek içerik için TMDB API anahtarınızı ekleyin.', setKey: 'Anahtar Ekle', apiKey: 'TMDB API Anahtarı', testKey: 'Bağlantıyı Test Et', language: 'Dil', accent: 'Vurgu Rengi', reduceMotion: 'Animasyonları azalt', autoNext: 'Sonraki bölüme otomatik geç', name: 'Profil adı', save: 'Kaydet', close: 'Kapat', resetData: 'Tüm yerel verileri sıfırla', emptyWL: 'Listeniz boş', emptyWLSub: 'Beğendiğiniz içeriklerin + simgesine dokunun.', emptyHist: 'Henüz bir şey izlemediniz', added: 'Listeye eklendi', removed: 'Listeden çıkarıldı', srcFail: 'Bu oynatıcı çalışmıyor.', tryNext: 'Sonraki oynatıcıyı dene', resumeAt: 'Kaldığınız yerden devam ediliyor', sort: 'Sırala', popular: 'Popüler', top: 'Puan', newest: 'Yeni', upcoming: 'Yakında', all: 'Tümü', tv: 'Dizi', movie: 'Film', notFound: 'Sayfa bulunamadı', notFoundSub: 'Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.', backHome: 'Ana sayfaya dön', nextIn: 'Sonraki bölüm', cancel: 'İptal', goNow: 'Hemen izle', h: 'sa', min: 'dk', demoSrc: 'Bu içerik için kaynak tanımlanmamış; demo kaynak oynatılıyor. Kaynakları admin panelinden ekleyebilirsiniz.', theme: 'Tema', fullscreen: 'Tam ekran', speed: 'Hız', pip: 'Küçük ekran', mute: 'Sessiz', play: 'Oynat', pause: 'Duraklat', seekBack: '10 sn geri', seekFwd: '10 sn ileri', removeHist: 'Geçmişten kaldır', keyOk: 'Bağlantı başarılı.', keyBad: 'Anahtar geçersiz veya bağlantı kurulamadı.', noTrailer: 'Bu içerik için fragman bulunamadı.', demoAdmin: 'Yönetim (demo)', details: 'Ayrıntılar', apiErr: 'TMDB’ye ulaşılamadı. Anahtarınızı ve bağlantınızı kontrol edin.', year: 'Yıl', rec: 'Önerilenler', loading: 'Yükleniyor', lights: 'Işıklar', footer: 'Bu bir ön yüz (frontend) demosudur. Veriler TMDB’den gelir; video kaynakları yalnızca yetkili olduğunuz içeriklerdir.' },
  en: { home: 'Home', movies: 'Movies', series: 'TV Series', genres: 'Genres', search: 'Search', watchlist: 'Watchlist', profile: 'Profile', history: 'Watch History', settings: 'Settings', watchNow: 'Watch Now', trailer: 'Trailer', addList: 'Add to Watchlist', inList: 'In Watchlist', moreInfo: 'Details', continueWatching: 'Continue Watching', rTrending: 'Trending Movies', rPopular: 'Popular Movies', rTop: 'Top Rated', rNew: 'Recently Released', rTv: 'Popular TV Series', rUpcoming: 'Coming Soon', rCatalog: 'From the catalog', similar: 'More Like This', cast: 'Cast', director: 'Director', creator: 'Created by', overview: 'Overview', originalTitle: 'Original title', releaseDate: 'Release date', runtime: 'Runtime', rating: 'Rating', season: 'Season', episode: 'Episode', episodes: 'Episodes', nextEp: 'Next', prevEp: 'Previous', sources: 'Source', loadMore: 'Load more', noResults: 'No results', noResultsSub: 'Try a different search.', searchPh: 'Search movies, series…', searchHint: 'Start typing a title', recent: 'Recent searches', clear: 'Clear', error: 'Something went wrong', retry: 'Try again', demoBanner: 'Showing demo data. Add your TMDB API key for real content.', setKey: 'Add key', apiKey: 'TMDB API key', testKey: 'Test connection', language: 'Language', accent: 'Accent colour', reduceMotion: 'Reduce motion', autoNext: 'Auto-play next episode', name: 'Profile name', save: 'Save', close: 'Close', resetData: 'Reset all local data', emptyWL: 'Your list is empty', emptyWLSub: 'Tap + on anything you like.', emptyHist: 'You haven’t watched anything yet', added: 'Added to your list', removed: 'Removed from your list', srcFail: 'This player is not working.', tryNext: 'Try the next player', resumeAt: 'Resuming where you left off', sort: 'Sort', popular: 'Popular', top: 'Top rated', newest: 'New', upcoming: 'Upcoming', all: 'All', tv: 'Series', movie: 'Movie', notFound: 'Page not found', notFoundSub: 'The page may have moved or never existed.', backHome: 'Back to home', nextIn: 'Next episode', cancel: 'Cancel', goNow: 'Play now', h: 'h', min: 'min', demoSrc: 'No source is configured for this title; a demo source is playing. Add sources in the admin panel.', theme: 'Theme', fullscreen: 'Fullscreen', speed: 'Speed', pip: 'Picture in picture', mute: 'Mute', play: 'Play', pause: 'Pause', seekBack: 'Back 10 s', seekFwd: 'Forward 10 s', removeHist: 'Remove from history', keyOk: 'Connection successful.', keyBad: 'Invalid key or connection failed.', noTrailer: 'No trailer found for this title.', demoAdmin: 'Admin (demo)', details: 'Details', apiErr: 'Could not reach TMDB. Check your key and connection.', year: 'Year', rec: 'Recommended', loading: 'Loading', lights: 'Lights', footer: 'This is a frontend-only demo. Metadata comes from TMDB; video sources are limited to content you are authorised to stream.' }
};
const DEFAULT_SETTINGS = { apiKey: '', lang: 'tr', accent: '#E50924', name: 'Misafir', avatar: 0, reduceMotion: false, autoNext: true };
let S = Object.assign({}, DEFAULT_SETTINGS, LS.get(K.settings, {}));
const t = k => (I18N[S.lang] && I18N[S.lang][k]) || I18N.tr[k] || k;
const apiKey = () => { const k = (S.apiKey || '').trim(); if (k) return k; return TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY' ? TMDB_API_KEY : ''; };
const AVATARS = ['#E50924', '#7c5cff', '#18a5ff', '#17c28b', '#f5a524', '#ff5fa2'];
const ACCENTS = ['#E50924', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];
function hexRgb(h) { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [229, 9, 36]; }
function applyTheme() {
  const r = document.documentElement, [R, G, B] = hexRgb(S.accent);
  r.style.setProperty('--accent', S.accent); r.style.setProperty('--accent-rgb', R + ',' + G + ',' + B);
  r.style.setProperty('--accent-2', `rgb(${Math.round(R * .78)},${Math.round(G * .78)},${Math.round(B * .78)})`);
  r.classList.toggle('reduce-motion', !!S.reduceMotion); r.lang = S.lang;
}
function saveSettings(p) { Object.assign(S, p); LS.set(K.settings, S); applyTheme(); }
applyTheme();

/* ---------- 3. icons ---------- */
const sv = (d, fill) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
const ICON = {
  play: sv('<path d="M8 5.5v13l11-6.5z"/>', 1), pause: sv('<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>', 1),
  plus: sv('<path d="M12 5v14M5 12h14"/>'), check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'), user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  list: sv('<path d="M6 4h12v17l-6-4-6 4z"/>'), info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  left: sv('<path d="m15 5-7 7 7 7"/>'), right: sv('<path d="m9 5 7 7-7 7"/>'), down: sv('<path d="m6 9 6 6 6-6"/>'),
  close: sv('<path d="M6 6l12 12M18 6 6 18"/>'), gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'),
  vol: sv('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'), mute: sv('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="m16 9.5 5 5m0-5-5 5"/>'),
  back10: sv('<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4v5h5"/><text x="12" y="15.5" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">10</text>'),
  fwd10: sv('<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 4v5h-5"/><text x="12" y="15.5" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">10</text>'),
  next: sv('<path d="M6 5.5v13l9-6.5zM17 5.5h2.5v13H17z"/>', 1), prev: sv('<path d="M18 5.5v13L9 12zM6.5 5.5H9v13H6.5z"/>', 1),
  fs: sv('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), fsx: sv('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
  pip: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor"/>'),
  speed: sv('<path d="M5 18a8 8 0 1 1 14 0"/><path d="m12 13 4-4"/>'), home: sv('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
  film: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>'),
  tv: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8M12 18v3"/>'), trash: sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  star: sv('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', 1), share: sv('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>')
};

/* ---------- 4. demo data (works with no API key) ---------- */
const GENRE_FB = {
  tr: { 28: 'Aksiyon', 12: 'Macera', 16: 'Animasyon', 35: 'Komedi', 80: 'Suç', 99: 'Belgesel', 18: 'Dram', 10751: 'Aile', 14: 'Fantastik', 27: 'Korku', 9648: 'Gizem', 10749: 'Romantik', 878: 'Bilim Kurgu', 53: 'Gerilim', 10752: 'Savaş' },
  en: { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 27: 'Horror', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War' }
};
/* custom categories created in admin.html */
Object.entries(LS.get(K.cats, {})).forEach(([id, n]) => { GENRE_FB.tr[id] = n.tr; GENRE_FB.en[id] = n.en || n.tr; });
const GEN = { movie: null, tv: null, lang: '' };            // filled from TMDB when a key exists
const gname = id => (GEN[GEN.cur] && GEN[GEN.cur][id]) || (GEN.all && GEN.all[id]) || GENRE_FB[S.lang][id] || GENRE_FB.tr[id] || String(id);

const artCache = new Map();
function art(title, kind = 'poster', hue) {
  const key = kind + '|' + title; if (artCache.has(key)) return artCache.get(key);
  const h = hue ?? hash(title) % 360, W = kind === 'poster' ? 500 : kind === 'backdrop' ? 1280 : 400, H = kind === 'poster' ? 750 : kind === 'backdrop' ? 720 : 225;
  const per = kind === 'poster' ? 13 : kind === 'backdrop' ? 22 : 16, words = String(title).split(' '), lines = [''];
  words.forEach(w => { const l = lines[lines.length - 1]; if ((l + ' ' + w).trim().length > per && l) lines.push(w); else lines[lines.length - 1] = (l + ' ' + w).trim(); });
  const fs = kind === 'poster' ? 54 : kind === 'backdrop' ? 84 : 30, y0 = H / 2 - (lines.length - 1) * fs * .6;
  const tx = lines.slice(0, 4).map((l, i) => `<tspan x="${kind === 'backdrop' ? W - 70 : W / 2}" y="${y0 + i * fs * 1.2}">${esc(l)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},62%,26%)"/><stop offset="1" stop-color="hsl(${(h + 48) % 360},70%,8%)"/></linearGradient><radialGradient id="r" cx=".8" cy=".15" r=".7"><stop offset="0" stop-color="hsl(${(h + 20) % 360},90%,60%)" stop-opacity=".45"/><stop offset="1" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/><circle cx="${W * .12}" cy="${H * .92}" r="${H * .38}" fill="#fff" opacity=".04"/><text font-family="Inter,system-ui,Segoe UI,sans-serif" font-weight="800" font-size="${fs}" fill="#fff" text-anchor="${kind === 'backdrop' ? 'end' : 'middle'}" ${kind === 'backdrop' ? 'opacity=".14"' : ''} style="letter-spacing:-1px">${tx}</text></svg>`;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); artCache.set(key, url); return url;
}
const DEMO_CAST = ['Aylin Demir', 'Kaan Yıldız', 'Selin Arslan', 'Mert Kaya', 'Defne Aksoy', 'Emre Çelik', 'Nehir Şahin', 'Baran Koç', 'Ece Polat', 'Arda Güneş'];
const DEMO_DIR = ['Zeynep Tan', 'Onur Başaran', 'Lale Erdem', 'Cem Aydın'];
const SEED_MOVIES = [['Gölge Oyunu', 'Shadow Play', 2024, 7.9, 112, [53, 18]], ['Kızıl Perde', 'Crimson Curtain', 2023, 8.2, 128, [18, 9648]], ['Neon Sokaklar', 'Neon Streets', 2022, 7.4, 104, [28, 878]], ['Sessiz Adalar', 'Silent Isles', 2021, 7.1, 117, [12, 18]], ['Çöl Sinyali', 'Desert Signal', 2024, 8.0, 133, [878, 12]], ['Son Durak', 'Last Stop', 2020, 6.9, 98, [53, 27]], ['Mavi Hafıza', 'Blue Memory', 2023, 8.4, 141, [18, 10749]], ['Kuzey Işığı', 'Northern Light', 2022, 7.6, 109, [12, 14]], ['Demir Yürek', 'Iron Heart', 2024, 7.2, 121, [28, 53]], ['Yıldız Tozu', 'Stardust Run', 2021, 7.8, 126, [878, 28]], ['Cam Şehir', 'Glass City', 2023, 7.5, 115, [53, 80]], ['Kayıp Frekans', 'Lost Frequency', 2019, 7.0, 102, [9648, 878]], ['Gümüş Nehir', 'Silver River', 2022, 8.1, 137, [18, 10752]], ['Karanlık Orman', 'Dark Forest', 2020, 6.6, 95, [27, 53]], ['Altın Saat', 'Golden Hour', 2024, 7.7, 108, [10749, 35]], ['Işık Hızı', 'Light Speed', 2023, 7.3, 119, [28, 12]], ['Fırtına Evi', 'Storm House', 2021, 7.9, 124, [27, 9648]], ['Elmas Yolu', 'Diamond Road', 2022, 7.0, 111, [80, 28]], ['Paslı Anahtar', 'Rusty Key', 2019, 7.4, 106, [35, 80]], ['Sonsuz Kış', 'Endless Winter', 2024, 8.3, 139, [18, 14]]];
const SEED_SERIES = [['Açık Kaynak Hikâyeleri', 'Open Source Tales', 2021, 8.5, 48, [18, 878]], ['Kıyı Dosyaları', 'Coast Files', 2022, 8.0, 44, [80, 9648]], ['Uzay Postası', 'Space Courier', 2023, 7.8, 41, [878, 12]], ['Yeraltı', 'Underground', 2020, 8.3, 52, [53, 18]], ['Dalga Boyu', 'Wavelength', 2024, 7.6, 40, [9648, 878]], ['Eski Şehir', 'Old Town', 2019, 7.9, 46, [18, 10749]], ['Mavi Kod', 'Blue Code', 2023, 8.1, 43, [28, 53]], ['Gece Vardiyası', 'Night Shift', 2022, 7.5, 38, [35, 18]]];
function demoOverview(it) {
  const tr = ['Beklenmedik bir gece, sıradan bir hayatı tamamen değiştirir. Sırlar ortaya çıkarken kimseye güvenmek mümkün değildir.', 'Küçük bir kasabada başlayan olay, kısa sürede tüm şehri saran bir gizeme dönüşür.', 'Geçmişiyle yüzleşmek zorunda kalan bir grup, zamana karşı yarışırken gerçeği keşfeder.', 'Her şey bir telefon görüşmesiyle başlar. Sonrasında geri dönüş yoktur.'];
  const en = ['One unexpected night changes an ordinary life forever. As secrets surface, trusting anyone becomes impossible.', 'What begins in a small town soon grows into a mystery that grips the entire city.', 'Forced to face their past, a group races against time and uncovers the truth.', 'It all starts with a single phone call. After that, there is no way back.'];
  return (S.lang === 'en' ? en : tr)[hash(it.title) % 4] + (S.lang === 'en' ? ' (Demo content.)' : ' (Demo içerik.)');
}
function seedCatalog() {
  const out = []; let n = 1;
  SEED_MOVIES.forEach((m, i) => out.push({ id: 'd' + n++, type: 'movie', title: m[0], original: m[1], year: m[2], rating: m[3], runtime: m[4], genres: m[5], overview: '', cast: [0, 1, 2, 3, 4].map(k => DEMO_CAST[(i + k) % 10]), director: DEMO_DIR[i % 4], trailer: '', quality: i % 3 === 0 ? '4K' : 'HD', featured: i < 6, views: 9000 - i * 311 + (i * 53) % 400, added: Date.now() - i * 864e5, demo: true, poster: '', backdrop: '' }));
  SEED_SERIES.forEach((m, i) => out.push({ id: 'd' + n++, type: 'tv', title: m[0], original: m[1], year: m[2], rating: m[3], runtime: m[4], genres: m[5], overview: '', cast: [0, 1, 2, 3, 4].map(k => DEMO_CAST[(i + k + 3) % 10]), director: DEMO_DIR[(i + 1) % 4], trailer: '', quality: 'HD', featured: i < 3, views: 8000 - i * 410, added: Date.now() - (i + 3) * 864e5, demo: true, poster: '', backdrop: '', seasons: [1, 2].map(s => ({ n: s, title: s + '. ' + (S.lang === 'en' ? 'Season' : 'Sezon'), episodes: Array.from({ length: 6 }, (_, e) => ({ n: e + 1, title: (S.lang === 'en' ? 'Episode ' : 'Bölüm ') + (e + 1), overview: '', runtime: m[4], still: '' })) })) }));
  return out;
}
function catalog() { let c = LS.get(K.catalog, null); if (!Array.isArray(c)) { c = seedCatalog(); LS.set(K.catalog, c); } return c; }
function saveCatalog(c) { return LS.set(K.catalog, c); }
const localById = id => catalog().find(x => String(x.id) === String(id));
function normLocal(it) {
  return { id: String(it.id), type: it.type, title: it.title, original: it.original || it.title, overview: it.overview || demoOverview(it), poster: it.poster || art(it.title, 'poster'), backdrop: it.backdrop || art(it.title, 'backdrop'), year: it.year || '', rating: Number(it.rating || 0).toFixed(1), runtime: Number(it.runtime) || 0, genres: (it.genres || []).map(id => ({ id, name: gname(id) })), genreIds: it.genres || [], cast: (it.cast || []).map(n => typeof n === 'string' ? { name: n, role: '', img: null } : n), director: it.director || '', trailer: it.trailer || (it.demo ? DEMO_TRAILER : ''), seasons: (it.seasons || []).map(s => ({ n: s.n, title: s.title, count: (s.episodes || []).length })), quality: it.quality || '', local: true, demo: !!it.demo, date: it.year ? it.year + '-01-01' : '', views: it.views || 0, added: it.added || 0, featured: !!it.featured };
}
function localList(kind, { page = 1, genre = 0, type } = {}) {
  let a = catalog().filter(x => !x.demo || true).map(normLocal); const per = 20;
  if (kind.startsWith('tv') || type === 'tv') a = a.filter(x => x.type === 'tv'); else if (kind !== 'heroMix' && kind !== 'catalog') a = a.filter(x => x.type === 'movie' || kind === 'genre' && type !== 'tv');
  if (kind === 'catalog') a = a.filter(x => !x.demo);
  if (genre) a = a.filter(x => x.genreIds.includes(Number(genre)));
  const by = { trending: (x, y) => (y.views + (y.featured ? 5e3 : 0)) - (x.views + (x.featured ? 5e3 : 0)), heroMix: (x, y) => (y.featured - x.featured) || y.views - x.views, popular: (x, y) => y.views - x.views, tvPopular: (x, y) => y.views - x.views, top: (x, y) => y.rating - x.rating, tvTop: (x, y) => y.rating - x.rating, new: (x, y) => y.year - x.year || y.added - x.added, tvNew: (x, y) => y.year - x.year, upcoming: (x, y) => y.added - x.added, genre: (x, y) => y.views - x.views, catalog: (x, y) => y.added - x.added };
  a.sort(by[kind] || by.popular);
  return { items: a.slice((page - 1) * per, page * per), pages: Math.max(1, Math.ceil(a.length / per)) };
}

/* ---------- 5. TMDB + Data layer ---------- */
const memo = new Map();
async function tmdb(path, params = {}) {
  const key = apiKey(); if (!key) throw new Error('NO_KEY');
  const u = new URL(TMDB_BASE + path); u.searchParams.set('api_key', key); u.searchParams.set('language', S.lang === 'en' ? 'en-US' : 'tr-TR');
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && u.searchParams.set(k, v));
  const ck = u.toString(); if (memo.has(ck)) return memo.get(ck);
  let res; try { res = await fetch(u); } catch (e) { throw new Error('NETWORK'); }
  if (!res.ok) throw new Error(res.status === 401 ? 'BAD_KEY' : 'HTTP_' + res.status);
  const j = await res.json(); memo.set(ck, j); return j;
}
function normItem(r, type) {
  const d = r.release_date || r.first_air_date || '';
  return { id: String(r.id), type, title: r.title || r.name || '', original: r.original_title || r.original_name || '', overview: r.overview || '', poster: r.poster_path ? IMG.poster + r.poster_path : null, backdrop: r.backdrop_path ? IMG.backdrop + r.backdrop_path : null, bp: r.backdrop_path || '', year: d.slice(0, 4), date: d, rating: Number(r.vote_average || 0).toFixed(1), genreIds: r.genre_ids || [], quality: '' };
}
function normDetail(r, type) {
  const b = normItem(r, type), vids = (r.videos && r.videos.results || []).filter(v => v.site === 'YouTube'), tr = vids.find(v => v.type === 'Trailer') || vids[0];
  Object.assign(b, {
    runtime: r.runtime || (r.episode_run_time && r.episode_run_time[0]) || 0, genres: r.genres || [], tagline: r.tagline || '',
    cast: (r.credits && r.credits.cast || []).slice(0, 16).map(c => ({ name: c.name, role: c.character, img: c.profile_path ? IMG.profile + c.profile_path : null })),
    director: ((r.credits && r.credits.crew || []).find(c => c.job === 'Director') || {}).name || (r.created_by || []).map(x => x.name).join(', '),
    trailer: tr ? tr.key : '', similar: (r.similar && r.similar.results || []).filter(x => x.poster_path).slice(0, 18).map(x => normItem(x, type)),
    seasons: (r.seasons || []).filter(s => s.season_number > 0).map(s => ({ n: s.season_number, title: s.name, count: s.episode_count }))
  });
  return b;
}
const Data = {
  demo: () => !apiKey(),
  async list(kind, { page = 1, genre = 0, type = 'movie', sort = 'popular' } = {}) {
    if (this.demo()) return localList(kind, { page, genre, type });
    const p = { page }; let path, tp = 'movie';
    const map = { trending: '/trending/movie/week', popular: '/movie/popular', top: '/movie/top_rated', new: '/movie/now_playing', upcoming: '/movie/upcoming', tvPopular: '/tv/popular', tvTop: '/tv/top_rated', tvNew: '/tv/on_the_air', heroMix: '/trending/all/week' };
    if (kind === 'catalog') { const r = localList('catalog'); return r; }
    if (kind.startsWith('tv')) tp = 'tv';
    if (kind === 'genre') {
      tp = type; path = '/discover/' + tp; p.with_genres = genre;
      const today = new Date().toISOString().slice(0, 10);
      if (sort === 'top') { p.sort_by = 'vote_average.desc'; p['vote_count.gte'] = 300; } else if (sort === 'new') { p.sort_by = tp === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc'; p[tp === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = today; p['vote_count.gte'] = 20; } else p.sort_by = 'popularity.desc';
    } else path = map[kind] || map.popular;
    const j = await tmdb(path, p);
    const items = (j.results || []).filter(r => r.poster_path || r.backdrop_path).map(r => normItem(r, r.media_type || tp)).filter(i => i.type === 'movie' || i.type === 'tv');
    return { items, pages: Math.min(j.total_pages || 1, 500) };
  },
  async detail(type, id) {
    const loc = localById(id); if (loc) { const n = normLocal(loc); n.similar = catalog().filter(x => x.id !== loc.id && x.type === loc.type && (x.genres || []).some(g => (loc.genres || []).includes(g))).slice(0, 14).map(normLocal); return n; }
    if (this.demo()) throw new Error('NOT_FOUND');
    return normDetail(await tmdb(`/${type}/${id}`, { append_to_response: 'credits,videos,similar', include_video_language: 'tr,en,null' }), type);
  },
  async season(type, id, n) {
    const loc = localById(id);
    if (loc) { const s = (loc.seasons || []).find(x => x.n == n); return ((s && s.episodes) || []).map(e => ({ n: e.n, title: e.title, overview: e.overview || '', still: e.still || art(loc.title + ' ' + e.title, 'still', hash(loc.title) % 360), runtime: e.runtime || 0, air: '' })); }
    const j = await tmdb(`/tv/${id}/season/${n}`);
    return (j.episodes || []).map(e => ({ n: e.episode_number, title: e.name, overview: e.overview, still: e.still_path ? IMG.still + e.still_path : null, runtime: e.runtime, air: e.air_date }));
  },
  async search(q, { type = 'all', page = 1 } = {}) {
    q = q.trim().toLowerCase(); const mine = catalog().filter(x => (!this.demo() ? !x.demo : true) && (type === 'all' || x.type === type) && (x.title + ' ' + (x.original || '')).toLowerCase().includes(q)).map(normLocal);
    if (this.demo()) return { items: mine, pages: 1 };
    const path = type === 'all' ? '/search/multi' : '/search/' + type, j = await tmdb(path, { query: q, page, include_adult: 'false' });
    const items = (j.results || []).filter(r => (r.media_type || type) !== 'person' && (r.poster_path || r.backdrop_path)).map(r => normItem(r, r.media_type || type));
    return { items: (page === 1 ? mine : []).concat(items), pages: Math.min(j.total_pages || 1, 50) };
  },
  async genres(type) {
    const lang = S.lang;
    if (this.demo()) { GEN.cur = type; GEN[type] = GENRE_FB[lang]; GEN.all = Object.assign({}, GENRE_FB[lang]); return Object.entries(GENRE_FB[lang]).map(([id, name]) => ({ id: +id, name })); }
    const j = await tmdb(`/genre/${type}/list`); GEN[type] = {}; j.genres.forEach(g => { GEN[type][g.id] = g.name; }); GEN.all = Object.assign(GEN.all || {}, GEN[type]); return j.genres;
  },
  async trailer(it) {
    if (it.trailer) return it.trailer; if (it.local || this.demo()) return it.local ? '' : DEMO_TRAILER;
    const j = await tmdb(`/${it.type}/${it.id}/videos`, { include_video_language: 'tr,en,null' }), v = (j.results || []).filter(x => x.site === 'YouTube');
    return ((v.find(x => x.type === 'Trailer') || v[0]) || {}).key || '';
  },
  async testKey(k) { try { const r = await fetch(`${TMDB_BASE}/configuration?api_key=${encodeURIComponent(k.trim())}`); return r.ok; } catch (e) { return false; } }
};

/* ---------- 6. stores ---------- */
const REG = new Map();                                   // type:id -> light item (for watchlist buttons)
const reg = it => { REG.set(it.type + ':' + it.id, it); return it; };
const lite = it => ({ id: it.id, type: it.type, title: it.title, poster: it.poster, backdrop: it.backdrop, year: it.year, rating: it.rating, quality: it.quality || '', overview: (it.overview || '').slice(0, 400), local: !!it.local });
const WL = {
  list: () => LS.get(K.wl, []), has: it => WL.list().some(x => x.id === it.id && x.type === it.type),
  toggle(it) { let l = WL.list(); const i = l.findIndex(x => x.id === it.id && x.type === it.type); if (i >= 0) { l.splice(i, 1); } else { l.unshift(lite(it)); } LS.set(K.wl, l); return i < 0; }
};
const Hist = {
  list: () => LS.get(K.hist, []),
  get: key => Hist.list().find(x => x.key === key),
  save(e) { let l = Hist.list().filter(x => x.key !== e.key); l.unshift(Object.assign({ ts: Date.now() }, e)); LS.set(K.hist, l.slice(0, 80)); },
  remove(key) { LS.set(K.hist, Hist.list().filter(x => x.key !== key)); },
  clear() { LS.set(K.hist, []); },
  recentShows() { const seen = new Set(), out = []; Hist.list().forEach(h => { const k = h.type + ':' + h.id; if (!seen.has(k)) { seen.add(k); out.push(h); } }); return out; }
};
function getSources(type, id, s, e) {
  const m = LS.get(K.sources, {}), keys = type === 'tv' ? [`tv:${id}:${s}:${e}`, `tv:${id}`, '*'] : [`movie:${id}`, '*'];
  for (const k of keys) { const a = (m[k] || []).filter(x => x.enabled !== false && /^https:\/\//i.test(x.url || '')); if (a.length) return { list: a, demo: false }; }
  return { list: DEFAULT_SOURCES.map(x => Object.assign({}, x)), demo: true };
}
function logActivity(text) { const a = LS.get(K.activity, []); a.unshift({ text, ts: Date.now() }); LS.set(K.activity, a.slice(0, 40)); }

/* ---------- 7. UI helpers ---------- */
const view = () => $('#view');
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg; $('#toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in')); setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); }, 2600);
}
function openModal(html, { cls = '', onMount, onClose } = {}) {
  const el = document.createElement('div'); el.className = 'modal ' + cls; const prev = document.activeElement;
  el.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-box" role="dialog" aria-modal="true" tabindex="-1">${html}<button class="modal-x" type="button" data-close aria-label="${t('close')}">${ICON.close}</button></div>`;
  $('#modalRoot').appendChild(el); document.body.classList.add('modal-open');
  const close = () => { if (el._gone) return; el._gone = true; el.classList.remove('in'); setTimeout(() => { el.remove(); if (!$('.modal')) document.body.classList.remove('modal-open'); if (prev && prev.focus) prev.focus(); if (onClose) onClose(); }, 200); };
  el._close = close; el.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  requestAnimationFrame(() => { el.classList.add('in'); const b = $('.modal-box', el); if (b) b.focus(); });
  if (onMount) onMount(el, close); return { el, close };
}
function setMeta({ title = '', desc = '', image = '' } = {}) {
  const site = 'Premium Cinema', d = desc || (S.lang === 'en' ? 'A premium cinema-style streaming interface. Movies and series, beautifully organised.' : 'Premium sinema deneyimi: filmler ve diziler, özenle düzenlenmiş.');
  document.title = title ? `${title} · ${site}` : site + (S.lang === 'en' ? ' — Cinema, curated' : ' — Sinema, özenle seçildi');
  const set = (sel, v) => { const el = $(sel); if (el) el.setAttribute('content', v); };
  set('meta[name="description"]', d.slice(0, 160)); set('meta[property="og:title"]', document.title); set('meta[property="og:description"]', d.slice(0, 200));
  set('meta[name="twitter:title"]', document.title); if (image && /^https?:/.test(image)) set('meta[property="og:image"]', image);
  const u = location.href; set('meta[property="og:url"]', u); const c = $('link[rel="canonical"]'); if (c && /^https?:/.test(u)) c.setAttribute('href', u.split('#')[0]);
}
const dtype = it => it.type === 'tv' ? 'tv' : 'movie';
const detailHref = it => `/${dtype(it)}/${it.id}`;
const watchHref = (it, s, e) => `/watch/${it.id}?type=${dtype(it)}` + (it.type === 'tv' ? `&s=${s || 1}&e=${e || 1}` : '');
const A = (path, cls, inner, attrs = '') => `<a class="${cls}" href="${esc(Router.href(path))}" data-nav="${esc(path)}" ${attrs}>${inner}</a>`;
const fmtRun = m => !m ? '' : m >= 60 ? `${Math.floor(m / 60)}${t('h')} ${m % 60 ? (m % 60) + t('min') : ''}`.trim() : m + t('min');

/* ---------- 8. components ---------- */
function img(src, alt, kind = 'poster', { eager = false, hero = false } = {}) {
  let srcset = '', sizes = '';
  if (src && src.startsWith(IMG.poster + '/')) { const p = src.slice(IMG.poster.length); srcset = `https://image.tmdb.org/t/p/w342${p} 342w, ${src} 500w, https://image.tmdb.org/t/p/w780${p} 780w`; sizes = '(max-width:640px) 40vw, 220px'; }
  return `<img src="${esc(src || art(alt || '', kind))}"${srcset ? ` srcset="${esc(srcset)}" sizes="${sizes}"` : ''} alt="${esc(alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-fb="${esc(alt || '')}" data-kind="${kind}">`;
}
function card(it, { progress = 0, wide = false, sub = '', remove = '' } = {}) {
  reg(it); const on = WL.has(it), href = remove ? watchHref(it, it.s, it.e) : detailHref(it), pic = wide ? (it.backdrop || it.poster) : it.poster;
  return `<article class="card${wide ? ' card-wide' : ''}"><a class="card-a" href="${esc(Router.href(href))}" data-nav="${esc(href)}" aria-label="${esc(it.title)}"><div class="poster">${img(pic, it.title, wide ? 'backdrop' : 'poster')}${it.quality ? `<span class="badge">${esc(it.quality)}</span>` : ''}${it.type === 'tv' && !wide ? `<span class="badge badge-tv">${t('tv')}</span>` : ''}<div class="card-ov"><span class="play-ic">${ICON.play}</span></div>${progress ? `<span class="prog"><i style="width:${clamp(progress, 2, 100)}%"></i></span>` : ''}</div><h3 class="card-t">${esc(it.title)}</h3><p class="card-s">${sub ? esc(sub) : `${it.year ? esc(it.year) + ' · ' : ''}<span class="star">★</span> ${esc(it.rating)}`}</p></a>${remove ? `<button class="card-add" type="button" data-hist-remove="${esc(remove)}" aria-label="${t('removeHist')}">${ICON.close}</button>` : `<button class="card-add${on ? ' is-on' : ''}" type="button" data-wl="${dtype(it)}:${esc(it.id)}" aria-pressed="${on}" aria-label="${on ? t('inList') : t('addList')}">${on ? ICON.check : ICON.plus}</button>`}</article>`;
}
const rowHTML = (id, title, cards, extra = '') => `<section class="row" id="row-${id}" aria-label="${esc(title)}"><div class="row-head"><h2>${esc(title)}</h2>${extra}<div class="row-nav"><button type="button" data-scroll="-1" aria-label="${S.lang === 'en' ? 'Scroll left' : 'Sola kaydır'}">${ICON.left}</button><button type="button" data-scroll="1" aria-label="${S.lang === 'en' ? 'Scroll right' : 'Sağa kaydır'}">${ICON.right}</button></div></div><div class="track" tabindex="0">${cards}</div></section>`;
const skelCards = n => Array.from({ length: n }, () => '<div class="card skel-card"><div class="poster skel"></div><div class="skel-line"></div><div class="skel-line s"></div></div>').join('');
const skelRow = (id, title = '') => `<section class="row" id="row-${id}" aria-busy="true"><div class="row-head"><h2>${esc(title) || '<span class="skel-line w"></span>'}</h2></div><div class="track">${skelCards(9)}</div></section>`;
const errBox = (msg, retryAttr = 'data-retry') => `<div class="state"><div class="state-ic">!</div><h3>${t('error')}</h3><p>${esc(msg)}</p><button class="btn btn-primary" type="button" ${retryAttr}>${t('retry')}</button></div>`;
const emptyBox = (title, sub, cta = '') => `<div class="state"><div class="state-ic">${ICON.film}</div><h3>${esc(title)}</h3><p>${esc(sub)}</p>${cta}</div>`;
const errMsg = e => e && e.message === 'BAD_KEY' ? t('keyBad') : e && e.message === 'NOT_FOUND' ? t('notFound') : t('apiErr');
const demoBanner = () => Data.demo() ? `<div class="banner" id="demoBanner"><span>${t('demoBanner')}</span><button class="btn btn-sm" type="button" data-open-settings>${t('setKey')}</button></div>` : '';

/* ---------- navigation chrome ---------- */
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M12 9.5v13l11-6.5z" fill="#fff"/></svg>';
function renderNav() {
  const ini = (S.name || '?').trim().charAt(0).toUpperCase();
  $('#nav').innerHTML = `<div class="nav-in">${A('/', 'logo', LOGO + '<span>PREMIUM<b>CINEMA</b></span>', 'aria-label="Premium Cinema"')}
    <nav class="nav-links" aria-label="${S.lang === 'en' ? 'Main' : 'Ana menü'}">${A('/', 'nl', t('home'), 'data-r="/"')}${A('/movies', 'nl', t('movies'), 'data-r="/movies"')}${A('/series', 'nl', t('series'), 'data-r="/series"')}
      <div class="dd"><button class="nl dd-btn" type="button" aria-expanded="false" aria-haspopup="true">${t('genres')} ${ICON.down}</button><div class="dd-menu dd-grid" id="genreMenu" role="menu"></div></div></nav>
    <div class="nav-tools"><button class="icon-btn" type="button" data-go="/search" aria-label="${t('search')}">${ICON.search}</button>
      ${A('/watchlist', 'icon-btn wl-link', ICON.list + '<span class="count" id="wlCount" hidden></span>', `aria-label="${t('watchlist')}"`)}
      <div class="dd dd-right"><button class="avatar-btn" id="profileBtn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${t('profile')}" style="--av:${AVATARS[S.avatar % AVATARS.length]}">${esc(ini)}</button>
        <div class="dd-menu" id="profileMenu" role="menu"><div class="pm-head"><span class="avatar-btn" style="--av:${AVATARS[S.avatar % AVATARS.length]}">${esc(ini)}</span><div><b>${esc(S.name)}</b><small>${t('profile')}</small></div></div>
          ${A('/watchlist', 'pm-i', ICON.list + t('watchlist'))}${A('/watchlist?tab=history', 'pm-i', ICON.play + t('history'))}<button class="pm-i" type="button" data-open-settings>${ICON.gear + t('settings')}</button>
          <div class="pm-theme"><span>${t('theme')}</span><div>${ACCENTS.map(c => `<button type="button" class="sw${c === S.accent ? ' on' : ''}" data-accent="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div></div>
          <a class="pm-i" href="admin.html">${ICON.film + t('demoAdmin')}</a></div></div></div></div>`;
  $('#bottomNav').innerHTML = [['/', t('home'), ICON.home], ['/movies', t('movies'), ICON.film], ['/series', t('series'), ICON.tv], ['/search', t('search'), ICON.search], ['/watchlist', t('watchlist'), ICON.list]].map(([p, l, i]) => A(p, 'bn', i + `<span>${esc(l)}</span>`, `data-r="${p}"`)).join('');
  $('#foot').innerHTML = `<div class="foot-in"><a class="logo" href="${esc(Router.href('/'))}" data-nav="/">${LOGO}<span>PREMIUM<b>CINEMA</b></span></a><p>${t('footer')}</p><p class="tmdb">This product uses the TMDB API but is not endorsed or certified by TMDB.</p></div>`;
  updateWlCount(); Data.genres('movie').then(g => { const m = $('#genreMenu'); if (m) m.innerHTML = g.map(x => A('/movies?genre=' + x.id, 'dd-i', esc(x.name))).join(''); }).catch(() => { });
}
function updateWlCount() { const n = WL.list().length, c = $('#wlCount'); if (c) { c.hidden = !n; c.textContent = n > 99 ? '99+' : n; } }
function setActiveNav(path) {
  const base = '/' + (path.split('?')[0].split('/')[1] || '');
  $$('[data-r]').forEach(a => { const r = a.dataset.r, on = r === '/' ? base === '/' : base === r || (r === '/movies' && base === '/movie') || (r === '/series' && base === '/tv'); a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}

/* ---------- 9. pages ---------- */
let HERO_T = null;
function track(sel) { return $(sel); }

async function pageHome(ctx) {
  const v = view(); setMeta(); $('#nav').classList.remove('solid');
  const hist = Hist.recentShows().slice(0, 14);
  await Data.genres('movie').catch(() => { });
  const gRows = [28, 878, 53, 18].map(id => ({ id: 'g' + id, title: gname(id) + (S.lang === 'en' ? ' Movies' : ' Filmleri'), kind: 'genre', genre: id }));
  const rows = [{ id: 'trending', title: t('rTrending'), kind: 'trending' }, { id: 'popular', title: t('rPopular'), kind: 'popular' }, { id: 'top', title: t('rTop'), kind: 'top' }, { id: 'new', title: t('rNew'), kind: 'new' }, { id: 'tv', title: t('rTv'), kind: 'tvPopular' }, ...gRows];
  if (!ctx.alive()) return;
  v.innerHTML = `<section class="hero" id="hero" aria-label="${S.lang === 'en' ? 'Featured' : 'Öne çıkanlar'}"><div class="hero-skel skel"></div></section><div class="rows">${demoBanner()}
    ${hist.length ? rowHTML('cw', t('continueWatching'), hist.map(h => card(Object.assign({}, h, { rating: '' }), { wide: true, progress: h.d ? h.t / h.d * 100 : 4, sub: h.type === 'tv' ? `${t('season')} ${h.s} · ${t('episode')} ${h.e}` : (h.year || ''), remove: h.key })).join('')) : ''}
    <div id="row-catalog-slot"></div>${rows.map(r => skelRow(r.id, r.title)).join('')}</div>`;
  Data.list('heroMix').then(r => { if (ctx.alive()) mountHero(r.items.filter(i => i.backdrop).slice(0, 6)); }).catch(() => { const h = $('#hero'); if (h) h.remove(); $('#nav').classList.add('solid'); });
  if (!Data.demo()) Data.list('catalog').then(r => { if (ctx.alive() && r.items.length) $('#row-catalog-slot').outerHTML = rowHTML('catalog', t('rCatalog'), r.items.map(i => card(i)).join('')); });
  rows.forEach(r => Data.list(r.kind, { genre: r.genre, type: 'movie' }).then(res => {
    if (!ctx.alive()) return; const el = $('#row-' + r.id); if (!el) return;
    el.outerHTML = res.items.length ? rowHTML(r.id, r.title, res.items.map(i => card(i)).join('')) : '';
  }).catch(e => { if (!ctx.alive()) return; const el = $('#row-' + r.id); if (el) el.outerHTML = `<section class="row" id="row-${r.id}"><div class="row-head"><h2>${esc(r.title)}</h2></div>${errBox(errMsg(e))}</section>`; }));
}
function heroSet(src, el) {
  const it = src; el.alt = ''; if (it.bp) { el.srcset = `${IMG.backdropSm}${it.bp} 780w, ${IMG.backdropMd}${it.bp} 1280w, ${IMG.backdrop}${it.bp} 1920w`; el.sizes = '100vw'; el.src = IMG.backdropMd + it.bp; } else { el.removeAttribute('srcset'); el.src = it.backdrop; }
}
function mountHero(items) {
  const el = $('#hero'); if (!el) return;
  if (!items.length) { el.remove(); $('#nav').classList.add('solid'); return; }
  items.forEach(reg); let i = 0;
  el.innerHTML = `<div class="hero-bg"><img class="hero-img on" alt="" fetchpriority="high" decoding="async"><img class="hero-img" alt="" decoding="async"></div><div class="hero-shade"></div><div class="hero-body"><div class="hero-copy" id="heroCopy"></div></div><div class="hero-dots" role="tablist" aria-label="${S.lang === 'en' ? 'Slides' : 'Slaytlar'}">${items.map((_, k) => `<button type="button" role="tab" data-slide="${k}" aria-label="${k + 1}"></button>`).join('')}</div>`;
  const imgs = $$('.hero-img', el), copy = $('#heroCopy');
  function show(k, first) {
    i = (k + items.length) % items.length; const it = items[i], cur = imgs.find(x => x.classList.contains('on')), nxt = first ? cur : imgs.find(x => x !== cur);
    const swap = () => { if (!first) { nxt.classList.add('on'); cur.classList.remove('on'); } };
    heroSet(it, nxt); if (first) { } else if (nxt.decode) nxt.decode().then(swap, swap); else nxt.onload = swap;
    const on = WL.has(it);
    copy.innerHTML = `<p class="eyebrow">${it.type === 'tv' ? t('tv') : t('movie')}</p><h1>${esc(it.title)}</h1><div class="meta"><span class="chip-r"><b>★</b> ${esc(it.rating)}</span>${it.year ? `<span>${esc(it.year)}</span>` : ''}${it.genreIds && it.genreIds[0] ? `<span>${esc(gname(it.genreIds[0]))}</span>` : ''}${it.quality ? `<span class="chip-q">${esc(it.quality)}</span>` : ''}</div><p class="lead">${esc(it.overview)}</p>
      <div class="actions">${A(watchHref(it), 'btn btn-primary btn-lg', ICON.play + t('watchNow'))}<button class="btn btn-glass btn-lg" type="button" data-trailer="${dtype(it)}:${esc(it.id)}">${t('trailer')}</button><button class="btn btn-glass btn-icon" type="button" data-wl="${dtype(it)}:${esc(it.id)}" aria-pressed="${on}" aria-label="${t('addList')}">${on ? ICON.check : ICON.plus}</button>${A(detailHref(it), 'btn btn-ghost btn-icon', ICON.info, `aria-label="${t('moreInfo')}"`)}</div>`;
    copy.classList.remove('in'); void copy.offsetWidth; copy.classList.add('in');
    $$('.hero-dots button', el).forEach((b, n) => { b.classList.toggle('on', n === i); b.setAttribute('aria-selected', n === i); });
  }
  show(0, true);
  let hold = false; const tick = () => { if (!hold && !document.hidden && !S.reduceMotion && document.body.contains(el)) show(i + 1); };
  clearInterval(HERO_T); HERO_T = setInterval(tick, 8000);
  el.addEventListener('mouseenter', () => hold = true); el.addEventListener('mouseleave', () => hold = false); el.addEventListener('focusin', () => hold = true); el.addEventListener('focusout', () => hold = false);
  el.addEventListener('click', e => { const b = e.target.closest('[data-slide]'); if (b) { show(+b.dataset.slide); clearInterval(HERO_T); } });
  let sx = 0; el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { show(i + (dx < 0 ? 1 : -1)); clearInterval(HERO_T); } }, { passive: true });
}

async function pageBrowse(type, ctx) {
  const v = view(), q = ctx.q, genre = +q.get('genre') || 0, sort = q.get('sort') || 'popular', isTv = type === 'tv';
  setMeta({ title: isTv ? t('series') : t('movies') }); $('#nav').classList.add('solid');
  const sorts = isTv ? ['popular', 'top', 'new'] : ['popular', 'top', 'new', 'upcoming'];
  const kindOf = { popular: isTv ? 'tvPopular' : 'popular', top: isTv ? 'tvTop' : 'top', new: isTv ? 'tvNew' : 'new', upcoming: 'upcoming' };
  const base = isTv ? '/series' : '/movies', qs = (g, s) => base + '?' + [g ? 'genre=' + g : '', s && s !== 'popular' ? 'sort=' + s : ''].filter(Boolean).join('&');
  let genres = []; try { genres = await Data.genres(type); } catch (e) { }
  if (!ctx.alive()) return;
  const gTitle = genre ? gname(genre) : '';
  v.innerHTML = `<section class="page container"><header class="page-head"><h1>${isTv ? t('series') : t('movies')}${gTitle ? ` <span>/ ${esc(gTitle)}</span>` : ''}</h1></header>${demoBanner()}
    <div class="filters"><div class="chips" role="group" aria-label="${t('sort')}">${sorts.map(s => A(qs(genre, s), 'chip' + (s === sort ? ' on' : ''), t(s === 'popular' ? 'popular' : s === 'top' ? 'top' : s === 'new' ? 'newest' : 'upcoming'), s === sort ? 'aria-current="true"' : '')).join('')}</div>
    <div class="chips scroll-x" role="group" aria-label="${t('genres')}">${A(qs(0, sort), 'chip' + (!genre ? ' on' : ''), t('all'))}${genres.map(g => A(qs(g.id, sort), 'chip' + (g.id === genre ? ' on' : ''), esc(g.name))).join('')}</div></div>
    <div class="grid" id="grid">${skelCards(14)}</div><div class="more" id="more"></div></section>`;
  let page = 1, pages = 1;
  async function load() {
    const more = $('#more'), grid = $('#grid'); if (!grid) return;
    try {
      const r = await Data.list(genre ? 'genre' : kindOf[sort], { page, genre, type, sort }); if (!ctx.alive()) return; pages = r.pages;
      if (page === 1) grid.innerHTML = '';
      if (page === 1 && !r.items.length) { grid.innerHTML = ''; more.innerHTML = emptyBox(t('noResults'), t('noResultsSub')); return; }
      grid.insertAdjacentHTML('beforeend', r.items.map(i => card(i)).join(''));
      more.innerHTML = page < pages ? `<button class="btn btn-glass btn-lg" type="button" id="moreBtn">${t('loadMore')}</button>` : '';
      const b = $('#moreBtn'); if (b) b.onclick = () => { b.disabled = true; b.textContent = t('loading') + '…'; page++; load(); };
    } catch (e) { if (!ctx.alive()) return; if (page === 1) grid.innerHTML = ''; more.innerHTML = errBox(errMsg(e)); const rb = $('[data-retry]', more); if (rb) rb.onclick = () => { if (page === 1) grid.innerHTML = skelCards(14); load(); }; }
  }
  load();
}

async function pageDetail(type, id, ctx) {
  const v = view(); $('#nav').classList.remove('solid'); setMeta({ title: t('loading') });
  v.innerHTML = `<div class="d-hero"><div class="d-skel skel"></div></div><div class="container"><div class="skel-line w"></div><div class="skel-line"></div></div>`;
  let it; try { it = await Data.detail(type, id); } catch (e) { if (ctx.alive()) v.innerHTML = `<div class="page container">${e.message === 'NOT_FOUND' ? emptyBox(t('notFound'), t('notFoundSub'), A('/', 'btn btn-primary', t('backHome'))) : errBox(errMsg(e))}</div>`; if (ctx.alive()) { const rb = $('[data-retry]'); if (rb) rb.onclick = () => render(); } return; }
  if (!ctx.alive()) return; reg(it); it.type = type;
  setMeta({ title: it.title + (it.year ? ` (${it.year})` : ''), desc: it.overview, image: it.backdrop });
  const on = WL.has(it), isTv = type === 'tv', last = Hist.recentShows().find(h => h.type === type && h.id === it.id);
  const hasSeasons = isTv && it.seasons.length, wHref = isTv && last ? watchHref(it, last.s, last.e) : watchHref(it, hasSeasons ? it.seasons[0].n : 1, 1);
  const bdp = it.backdrop && it.backdrop.startsWith(IMG.backdrop + '/') ? IMG.backdrop + it.backdrop.slice(IMG.backdrop.length) : it.backdrop;
  v.innerHTML = `<article class="detail"><section class="d-hero"><img class="d-bg" src="${esc(bdp || art(it.title, 'backdrop'))}" alt="" fetchpriority="high" decoding="async"><div class="d-shade"></div>
    <div class="d-main container"><div class="d-poster">${img(it.poster, it.title, 'poster', { eager: true })}</div><div class="d-info"><p class="eyebrow">${isTv ? t('tv') : t('movie')}</p><h1>${esc(it.title)}</h1>${it.original && it.original !== it.title ? `<p class="orig">${esc(it.original)}</p>` : ''}${it.tagline ? `<p class="tagline">${esc(it.tagline)}</p>` : ''}
      <div class="meta"><span class="chip-r"><b>★</b> ${esc(it.rating)}</span>${it.year ? `<span>${esc(it.year)}</span>` : ''}${it.runtime ? `<span>${fmtRun(it.runtime)}</span>` : ''}${isTv && it.seasons.length ? `<span>${it.seasons.length} ${t('season').toLowerCase()}</span>` : ''}${it.quality ? `<span class="chip-q">${esc(it.quality)}</span>` : ''}</div>
      <div class="chips">${it.genres.map(g => A((isTv ? '/series' : '/movies') + '?genre=' + g.id, 'chip', esc(g.name))).join('')}</div>
      <p class="lead">${esc(it.overview || '—')}</p>
      <div class="actions">${A(wHref, 'btn btn-primary btn-lg', ICON.play + (last ? (isTv ? `${t('watchNow')} · S${last.s}E${last.e}` : t('watchNow')) : t('watchNow')))}<button class="btn btn-glass btn-lg" type="button" data-trailer="${type}:${esc(it.id)}">${t('trailer')}</button><button class="btn btn-glass btn-lg" type="button" data-wl="${type}:${esc(it.id)}" aria-pressed="${on}">${on ? ICON.check + t('inList') : ICON.plus + t('addList')}</button></div></div></div></section>
    <div class="container d-body">
      <section class="facts"><dl>${it.original ? `<div><dt>${t('originalTitle')}</dt><dd>${esc(it.original)}</dd></div>` : ''}${it.date ? `<div><dt>${t('releaseDate')}</dt><dd>${esc(new Date(it.date).toLocaleDateString(S.lang === 'en' ? 'en-US' : 'tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }))}</dd></div>` : ''}${it.runtime ? `<div><dt>${t('runtime')}</dt><dd>${fmtRun(it.runtime)}</dd></div>` : ''}<div><dt>${t('rating')}</dt><dd>★ ${esc(it.rating)} / 10</dd></div>${it.director ? `<div><dt>${isTv ? t('creator') : t('director')}</dt><dd>${esc(it.director)}</dd></div>` : ''}</dl></section>
      ${isTv && it.seasons.length ? `<section class="eps" id="eps"><div class="eps-head"><h2>${t('episodes')}</h2><label class="sel"><span class="sr">${t('season')}</span><select id="seasonSel">${it.seasons.map(s => `<option value="${s.n}"${last && last.s == s.n ? ' selected' : ''}>${esc(s.title || t('season') + ' ' + s.n)}</option>`).join('')}</select>${ICON.down}</label></div><div class="ep-list" id="epList">${skelCards(0)}<div class="skel ep-skel"></div></div></section>` : ''}
      ${it.cast.length ? `<section class="cast"><div class="row-head"><h2>${t('cast')}</h2></div><div class="cast-track">${it.cast.map(c => `<div class="cast-i"><div class="cast-av">${c.img ? `<img src="${esc(c.img)}" alt="" loading="lazy" decoding="async">` : `<span>${esc(c.name.split(' ').map(x => x[0]).slice(0, 2).join(''))}</span>`}</div><b>${esc(c.name)}</b><small>${esc(c.role || '')}</small></div>`).join('')}</div></section>` : ''}
      ${it.similar && it.similar.length ? rowHTML('similar', t('similar'), it.similar.map(i => card(i)).join('')) : ''}</div></article>`;
  if (hasSeasons) {
    const sel = $('#seasonSel'), list = $('#epList');
    const loadEps = async n => {
      list.innerHTML = '<div class="skel ep-skel"></div><div class="skel ep-skel"></div>';
      try {
        const eps = await Data.season(type, it.id, n); if (!ctx.alive()) return;
        list.innerHTML = eps.length ? eps.map(e => { const h = Hist.get(`tv:${it.id}:${n}:${e.n}`), pct = h && h.d ? h.t / h.d * 100 : 0; return A(watchHref(it, n, e.n), 'ep', `<div class="ep-th">${img(e.still, e.title, 'still')}<span class="ep-n">${e.n}</span>${pct ? `<span class="prog"><i style="width:${clamp(pct, 2, 100)}%"></i></span>` : ''}<span class="play-ic">${ICON.play}</span></div><div class="ep-tx"><b>${esc(e.title)}</b><small>${[e.runtime ? fmtRun(e.runtime) : '', e.air || ''].filter(Boolean).join(' · ')}</small><p>${esc(e.overview || '')}</p></div>`); }).join('') : emptyBox(t('noResults'), '');
      } catch (e) { if (ctx.alive()) list.innerHTML = errBox(errMsg(e)); }
    };
    sel.onchange = () => loadEps(+sel.value); loadEps(+sel.value);
  }
}

async function pageSearch(ctx) {
  const v = view(), q0 = ctx.q.get('q') || '', type0 = ctx.q.get('type') || 'all';
  setMeta({ title: q0 ? `“${q0}”` : t('search') }); $('#nav').classList.add('solid');
  let type = type0, term = q0, token = 0, page = 1;
  const recent = () => LS.get(K.recent, []);
  v.innerHTML = `<section class="page container search-page"><div class="search-box">${ICON.search}<input id="sInput" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="${t('searchPh')}" aria-label="${t('search')}" value="${esc(term)}"><button type="button" class="icon-btn s-clear" id="sClear" aria-label="${t('clear')}" ${term ? '' : 'hidden'}>${ICON.close}</button></div>
    <div class="chips" id="sTabs" role="group">${[['all', t('all')], ['movie', t('movies')], ['tv', t('series')]].map(([k, l]) => `<button type="button" class="chip${k === type ? ' on' : ''}" data-type="${k}">${l}</button>`).join('')}</div><div id="sBody" aria-live="polite"></div></section>`;
  const input = $('#sInput'), body = $('#sBody');
  function idle() {
    const r = recent();
    body.innerHTML = `${r.length ? `<div class="s-sec"><div class="s-h"><h3>${t('recent')}</h3><button type="button" class="link" id="clearRecent">${t('clear')}</button></div><div class="chips">${r.map(x => `<button type="button" class="chip" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>` : `<p class="hint">${t('searchHint')}</p>`}<div class="s-sec" id="sTrend"><div class="s-h"><h3>${t('rTrending')}</h3></div><div class="grid">${skelCards(7)}</div></div>`;
    Data.list('trending').then(res => { const e = $('#sTrend'); if (e && !term) e.innerHTML = `<div class="s-h"><h3>${t('rTrending')}</h3></div><div class="grid">${res.items.slice(0, 14).map(i => card(i)).join('')}</div>`; }).catch(() => { const e = $('#sTrend'); if (e) e.remove(); });
  }
  async function run(more) {
    const my = ++token, qq = term.trim(); $('#sClear').hidden = !term;
    if (qq.length < 2) { if (!qq) idle(); else body.innerHTML = `<p class="hint">${t('searchHint')}</p>`; return; }
    if (!more) { page = 1; body.innerHTML = `<div class="grid">${skelCards(10)}</div>`; }
    try {
      const r = await Data.search(qq, { type, page }); if (my !== token || !ctx.alive()) return;
      if (!r.items.length && !more) { body.innerHTML = emptyBox(t('noResults'), `“${qq}” — ${t('noResultsSub')}`); return; }
      const html = r.items.map(i => card(i)).join('');
      if (more) { $('.grid', body).insertAdjacentHTML('beforeend', html); } else { body.innerHTML = `<div class="grid">${html}</div><div class="more" id="sMore"></div>`; }
      $('#sMore').innerHTML = page < r.pages ? `<button class="btn btn-glass btn-lg" type="button" id="sMoreBtn">${t('loadMore')}</button>` : '';
      const mb = $('#sMoreBtn'); if (mb) mb.onclick = () => { page++; run(true); };
      const rl = recent().filter(x => x.toLowerCase() !== qq.toLowerCase()); rl.unshift(qq); LS.set(K.recent, rl.slice(0, 8));
    } catch (e) { if (my !== token || !ctx.alive()) return; body.innerHTML = errBox(errMsg(e)); const rb = $('[data-retry]', body); if (rb) rb.onclick = () => run(); }
  }
  const sync = () => Router.go('/search' + (term || type !== 'all' ? '?' + [term ? 'q=' + encodeURIComponent(term) : '', type !== 'all' ? 'type=' + type : ''].filter(Boolean).join('&') : ''), { silent: true, replace: true });
  const debounced = debounce(() => { sync(); run(); }, 350);
  input.addEventListener('input', () => { term = input.value; $('#sClear').hidden = !term; debounced(); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sync(); run(); input.blur(); } });
  $('#sClear').onclick = () => { input.value = ''; term = ''; sync(); run(); input.focus(); };
  $('#sTabs').onclick = e => { const b = e.target.closest('[data-type]'); if (!b) return; type = b.dataset.type; $$('#sTabs .chip').forEach(c => c.classList.toggle('on', c === b)); sync(); run(); };
  body.onclick = e => { const c = e.target.closest('[data-q]'); if (c) { term = c.dataset.q; input.value = term; sync(); run(); } if (e.target.id === 'clearRecent') { LS.del(K.recent); idle(); } };
  run(); if (!term && matchMedia('(hover:hover)').matches) input.focus();
}

async function pageWatchlist(ctx) {
  const v = view(), tab = ctx.q.get('tab') === 'history' ? 'history' : 'list'; setMeta({ title: tab === 'list' ? t('watchlist') : t('history') }); $('#nav').classList.add('solid');
  const wl = WL.list(), hs = Hist.list();
  v.innerHTML = `<section class="page container"><header class="page-head"><h1>${tab === 'list' ? t('watchlist') : t('history')}</h1></header><div class="chips">${A('/watchlist', 'chip' + (tab === 'list' ? ' on' : ''), `${t('watchlist')} (${wl.length})`)}${A('/watchlist?tab=history', 'chip' + (tab === 'history' ? ' on' : ''), `${t('history')} (${hs.length})`)}${tab === 'history' && hs.length ? `<button class="chip" type="button" data-hist-clear>${t('clear')}</button>` : ''}</div>
    ${tab === 'list' ? (wl.length ? `<div class="grid">${wl.map(i => card(i)).join('')}</div>` : emptyBox(t('emptyWL'), t('emptyWLSub'), A('/movies', 'btn btn-primary', t('movies')))) : (hs.length ? `<div class="grid grid-wide">${hs.map(h => card(Object.assign({}, h, { rating: '' }), { wide: true, progress: h.d ? h.t / h.d * 100 : 4, sub: h.type === 'tv' ? `${t('season')} ${h.s} · ${t('episode')} ${h.e}` : (h.year || ''), remove: h.key })).join('')}</div>` : emptyBox(t('emptyHist'), '', A('/', 'btn btn-primary', t('backHome'))))}</section>`;
}
function pageNotFound() { setMeta({ title: '404' }); $('#nav').classList.add('solid'); view().innerHTML = `<div class="page container">${emptyBox(t('notFound'), t('notFoundSub'), A('/', 'btn btn-primary', t('backHome')))}</div>`; }

/* ---------- watch page ---------- */
let PLAYER = null;
function destroyPlayer() { if (PLAYER) { PLAYER.destroy(); PLAYER = null; } document.body.classList.remove('pfs-lock', 'lights-off'); }

async function pageWatch(ctx) {
  const v = view(), id = ctx.m[1], type = ctx.q.get('type') === 'tv' ? 'tv' : 'movie', isTv = type === 'tv';
  const s = +ctx.q.get('s') || 1, e = +ctx.q.get('e') || 1; $('#nav').classList.add('solid'); setMeta({ title: t('loading') });
  v.innerHTML = `<div class="page container watch"><div class="watch-grid"><div class="watch-main"><div class="pl pl-skel skel"></div></div></div></div>`;
  let it; try { it = await Data.detail(type, id); } catch (err) { if (ctx.alive()) { v.innerHTML = `<div class="page container">${err.message === 'NOT_FOUND' ? emptyBox(t('notFound'), t('notFoundSub'), A('/', 'btn btn-primary', t('backHome'))) : errBox(errMsg(err))}</div>`; const rb = $('[data-retry]'); if (rb) rb.onclick = () => render(); } return; }
  if (!ctx.alive()) return; reg(it); it.type = type;
  let eps = []; if (isTv) { try { eps = await Data.season(type, id, s); } catch (_) { } if (!ctx.alive()) return; }
  const epO = eps.find(x => x.n === e) || { n: e, title: `${t('episode')} ${e}`, overview: '', still: null };
  const idx = eps.findIndex(x => x.n === e), seasons = it.seasons || [];
  const nextUrl = !isTv ? '' : idx >= 0 && idx < eps.length - 1 ? watchHref(it, s, eps[idx + 1].n) : seasons.some(x => x.n === s + 1) ? watchHref(it, s + 1, 1) : '';
  const ps = seasons.find(x => x.n === s - 1), prevUrl = !isTv ? '' : idx > 0 ? watchHref(it, s, eps[idx - 1].n) : ps ? watchHref(it, s - 1, ps.count || 1) : '';
  const src = getSources(type, id, s, e), key = isTv ? `tv:${id}:${s}:${e}` : `movie:${id}`, on = WL.has(it);
  setMeta({ title: `${it.title}${isTv ? ` · S${s}E${e}` : ''} — ${t('watchNow')}`, desc: it.overview, image: it.backdrop });
  const ptitle = isTv ? `${it.title} · S${s}E${e}` : it.title, psub = isTv ? epO.title : (it.year || '');
  v.innerHTML = `<div class="page container watch"><nav class="crumbs" aria-label="${S.lang === 'en' ? 'Breadcrumb' : 'Konum'}">${A(detailHref(it), '', esc(it.title))}${isTv ? `<span>›</span><span>${t('season')} ${s}</span><span>›</span><span>${t('episode')} ${e}</span>` : ''}</nav>
    <div class="watch-grid"><div class="watch-main">${src.demo ? `<div class="banner banner-sm"><span>${t('demoSrc')}</span></div>` : ''}<div id="playerHost"></div>
      <div class="src-bar"><div class="src-tabs" role="tablist" aria-label="${t('sources')}">${src.list.map((x, k) => `<button type="button" class="src-tab" role="tab" data-src="${k}"><b>${esc(x.label || 'Player ' + (k + 1))}</b><small>${esc(x.lang || '')}</small></button>`).join('')}</div>
        <div class="src-tools">${prevUrl ? A(prevUrl, 'btn btn-glass btn-sm', ICON.prev + t('prevEp')) : ''}${nextUrl ? A(nextUrl, 'btn btn-primary btn-sm', t('nextEp') + ICON.next) : ''}<button type="button" class="btn btn-glass btn-sm" id="lightsBtn" aria-pressed="false">${t('lights')}</button></div></div>
      <div class="w-info"><h1>${esc(it.title)}</h1>${isTv ? `<p class="sub">${t('season')} ${s} · ${t('episode')} ${e} — ${esc(epO.title)}</p>` : ''}<div class="meta"><span class="chip-r"><b>★</b> ${esc(it.rating)}</span>${it.year ? `<span>${esc(it.year)}</span>` : ''}${it.runtime ? `<span>${fmtRun(it.runtime)}</span>` : ''}${it.quality ? `<span class="chip-q">${esc(it.quality)}</span>` : ''}</div>
        <p class="lead">${esc((isTv && epO.overview) || it.overview || '')}</p>
        <div class="actions"><button class="btn btn-glass" type="button" data-wl="${type}:${esc(it.id)}" aria-pressed="${on}">${on ? ICON.check + t('inList') : ICON.plus + t('addList')}</button><button class="btn btn-glass" type="button" data-trailer="${type}:${esc(it.id)}">${t('trailer')}</button>${A(detailHref(it), 'btn btn-ghost', ICON.info + t('details'))}</div></div></div>
      <aside class="watch-side" aria-label="${isTv ? t('episodes') : t('rec')}">${isTv && seasons.length ? `<div class="side-head"><label class="sel"><span class="sr">${t('season')}</span><select id="sideSeason">${seasons.map(x => `<option value="${x.n}"${x.n === s ? ' selected' : ''}>${esc(x.title || t('season') + ' ' + x.n)}</option>`).join('')}</select>${ICON.down}</label></div><div class="side-list" id="sideList"></div>` : `<div class="side-head"><h3>${t('rec')}</h3></div><div class="side-list">${(it.similar || []).slice(0, 10).map(x => A(detailHref(reg(x)), 'side-ep', `<div class="side-th">${img(x.backdrop || x.poster, x.title, 'still')}</div><div><b>${esc(x.title)}</b><small>${esc(x.year)} · ★ ${esc(x.rating)}</small></div>`)).join('') || `<p class="hint">—</p>`}</div>`}</aside></div>
    ${it.similar && it.similar.length && isTv ? rowHTML('similar', t('similar'), it.similar.map(i => card(i)).join('')) : ''}</div>`;
  /* player */
  const save = (tm, d) => Hist.save({ key, id: it.id, type, title: it.title, poster: it.poster, backdrop: (isTv && epO.still) || it.backdrop, year: it.year, s: isTv ? s : 0, e: isTv ? e : 0, epTitle: isTv ? epO.title : '', t: tm, d });
  let cur = Math.min(+sessionStorage.getItem('pc.src') || 0, src.list.length - 1);
  PLAYER = createPlayer($('#playerHost'), { title: ptitle, sub: psub, poster: (isTv && epO.still) || it.backdrop, nextUrl, prevUrl, onProgress: save, onStart: () => { const h = Hist.get(key); if (!h) save(0, 0); }, onNextSource: () => choose((cur + 1) % src.list.length), onNext: () => nextUrl && Router.go(nextUrl) });
  function choose(k) {
    cur = k; try { sessionStorage.setItem('pc.src', k); } catch (_) { }
    $$('.src-tab').forEach((b, n) => { b.classList.toggle('on', n === k); b.setAttribute('aria-selected', n === k); });
    const h = Hist.get(key); PLAYER.load(src.list[k], { resume: h && h.t > 10 && h.d && h.t < h.d - 30 ? h.t : 0 });
  }
  $('.src-tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-src]'); if (b) choose(+b.dataset.src); });
  $('#lightsBtn').onclick = ev => { const on2 = document.body.classList.toggle('lights-off'); ev.currentTarget.setAttribute('aria-pressed', on2); };
  choose(cur);
  /* side episodes */
  if (isTv && seasons.length) {
    const list = $('#sideList'), fill = async n => {
      list.innerHTML = '<div class="skel ep-skel"></div><div class="skel ep-skel"></div>';
      try { const es = n === s ? eps : await Data.season(type, id, n); if (!ctx.alive()) return; list.innerHTML = es.map(x => A(watchHref(it, n, x.n), 'side-ep' + (n === s && x.n === e ? ' on' : ''), `<div class="side-th">${img(x.still, x.title, 'still')}<span class="ep-n">${x.n}</span></div><div><b>${esc(x.title)}</b><small>${x.runtime ? fmtRun(x.runtime) : ''}</small></div>`)).join(''); const a = $('.side-ep.on', list); if (a) list.scrollTop = Math.max(0, a.offsetTop - 60); } catch (_) { if (ctx.alive()) list.innerHTML = errBox(t('apiErr')); }
    };
    $('#sideSeason').onchange = ev => fill(+ev.target.value); fill(s);
  }
}

/* ---------- 10. video player ---------- */
function loadHls() { return window.Hls ? Promise.resolve() : new Promise((res, rej) => { const el = document.createElement('script'); el.src = HLS_CDN; el.async = true; el.onload = res; el.onerror = () => rej(new Error('hls')); document.head.appendChild(el); }); }

function createPlayer(host, cfg) {
  host.innerHTML = `<div class="pl is-paused" tabindex="-1"><div class="pl-media"></div><div class="pl-loader" hidden><i></i></div>
    <div class="pl-err" hidden><div class="state-ic">!</div><p></p><button type="button" class="btn btn-primary btn-sm" data-act="nextsrc">${t('tryNext')}</button></div>
    <div class="pl-ui" hidden><div class="pl-hit" data-hit></div><div class="pl-top"><strong>${esc(cfg.title || '')}</strong><span>${esc(cfg.sub || '')}</span></div>
      <button type="button" class="pl-big" data-act="toggle" aria-label="${t('play')}"></button><div class="pl-flash" data-flash></div><div class="pl-menu" data-menu hidden></div>
      <div class="pl-bottom"><div class="pl-prog" data-prog role="slider" aria-label="${S.lang === 'en' ? 'Seek' : 'Ara'}" aria-valuemin="0" aria-valuemax="100" tabindex="0"><div class="trk"><i class="buf"></i><i class="played"></i></div><span class="knob"></span><span class="tip">0:00</span></div>
        <div class="pl-row"><div class="grp"><button type="button" data-act="toggle" data-i="play" aria-label="${t('play')}"></button><button type="button" data-act="back" aria-label="${t('seekBack')}">${ICON.back10}</button><button type="button" data-act="fwd" aria-label="${t('seekFwd')}">${ICON.fwd10}</button>
          <div class="vol"><button type="button" data-act="mute" data-i="vol" aria-label="${t('mute')}"></button><input type="range" min="0" max="1" step="0.05" value="1" data-vol aria-label="Volume"></div><span class="time" data-time>0:00 / 0:00</span></div>
          <div class="pl-title"><b>${esc(cfg.sub || cfg.title || '')}</b></div>
          <div class="grp">${cfg.prevUrl ? `<button type="button" data-act="prev" aria-label="${t('prevEp')}">${ICON.prev}</button>` : ''}${cfg.nextUrl ? `<button type="button" data-act="next" aria-label="${t('nextEp')}">${ICON.next}</button>` : ''}<button type="button" data-act="pip" data-i="pip" aria-label="${t('pip')}" hidden>${ICON.pip}</button><button type="button" data-act="menu" aria-label="${t('settings')}">${ICON.gear}</button><button type="button" data-act="fs" data-i="fs" aria-label="${t('fullscreen')}"></button></div></div></div></div>
    <button class="pl-pfs" type="button" data-act="fs" aria-label="${t('fullscreen')}" hidden>${ICON.fs}</button></div>`;
  return setupPlayer(host, cfg);
}

function setupPlayer(host, cfg) {
  const root = $('.pl', host), media = $('.pl-media', root), loader = $('.pl-loader', root), err = $('.pl-err', root), ui = $('.pl-ui', root), pfsBtn = $('.pl-pfs', root);
  const q = sel => $(sel, ui), big = q('.pl-big'), flash = q('[data-flash]'), menu = q('[data-menu]'), prog = q('[data-prog]'), played = q('.played'), buf = q('.buf'), knob = q('.knob'), tip = q('.tip');
  const timeEl = q('[data-time]'), volEl = q('[data-vol]'), bMute = q('[data-i="vol"]'), bFs = q('[data-i="fs"]'), bPlay = q('[data-i="play"]'), bPip = q('[data-i="pip"]');
  const life = new AbortController(); let ac = null, video = null, hls = null, cur = null, idleT = null, flashT = null, clickT = null, nextT = null, lastSave = 0, scrubbing = false, lastTap = 0;
  const on = (el, ev, fn, o) => el.addEventListener(ev, fn, Object.assign({ signal: life.signal }, o || {}));
  const savedVol = parseFloat(localStorage.getItem('pc.vol')), touchy = matchMedia('(hover: none)').matches;
  const setLoading = f => { loader.hidden = !f; };
  const supportsPip = () => !!(document.pictureInPictureEnabled || (video && video.webkitSupportsPresentationMode && video.webkitSupportsPresentationMode('picture-in-picture')));

  /* ----- source loading ----- */
  function teardown() {
    if (ac) { ac.abort(); ac = null; } clearInterval(nextT); nextT = null; $$('.pl-next', root).forEach(n => n.remove());
    if (video) { if (cfg.onProgress && video.duration) cfg.onProgress(video.currentTime, video.duration); try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) { } }
    if (hls) { try { hls.destroy(); } catch (e) { } hls = null; } media.textContent = ''; video = null; menu.hidden = true; err.hidden = true;
  }
  function fail(msg) { setLoading(false); err.hidden = false; $('p', err).textContent = msg || t('srcFail'); ui.classList.add('is-idle'); }
  function load(src, opts = {}) {
    teardown(); cur = src; ac = new AbortController(); setLoading(true);
    root.classList.toggle('is-iframe', src.kind === 'iframe'); root.classList.remove('is-live');
    if (src.kind === 'iframe') {
      const f = document.createElement('iframe'); f.title = cfg.title || 'Player'; f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; f.allowFullscreen = true; f.referrerPolicy = 'no-referrer';
      f.addEventListener('load', () => setLoading(false), { once: true }); f.src = src.url; media.appendChild(f); ui.hidden = true; pfsBtn.hidden = false; root.classList.add('is-live'); if (cfg.onStart) cfg.onStart(); return;
    }
    ui.hidden = false; pfsBtn.hidden = true; ui.classList.remove('is-idle');
    video = document.createElement('video'); video.playsInline = true; video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.preload = 'metadata'; video.controls = false; if (cfg.poster && /^https?:|^data:/.test(cfg.poster)) video.poster = cfg.poster;
    if (!isNaN(savedVol)) video.volume = clamp(savedVol, 0, 1); if (localStorage.getItem('pc.muted') === '1') video.muted = true;
    media.appendChild(video); const vd = video, vo = { signal: ac.signal };
    vd.addEventListener('loadedmetadata', () => { if (opts.resume) { vd.currentTime = opts.resume; toast(`${t('resumeAt')} · ${clock(opts.resume)}`); } root.classList.add('is-live'); const p = vd.play(); if (p && p.catch) p.catch(() => { }); paint(); }, vo);
    vd.addEventListener('waiting', () => setLoading(true), vo); vd.addEventListener('playing', () => { setLoading(false); if (cfg.onStart) cfg.onStart(); }, vo); vd.addEventListener('canplay', () => setLoading(false), vo);
    vd.addEventListener('error', () => fail(), vo);
    ['timeupdate', 'progress', 'durationchange', 'seeked'].forEach(ev => vd.addEventListener(ev, paint, vo));
    ['play', 'pause', 'volumechange', 'ended'].forEach(ev => vd.addEventListener(ev, paintState, vo));
    vd.addEventListener('volumechange', () => { localStorage.setItem('pc.vol', String(vd.volume)); localStorage.setItem('pc.muted', vd.muted ? '1' : '0'); }, vo);
    vd.addEventListener('timeupdate', () => { const n = Date.now(); if (n - lastSave > 5000 && vd.duration) { lastSave = n; cfg.onProgress && cfg.onProgress(vd.currentTime, vd.duration); } }, vo);
    vd.addEventListener('pause', () => { if (vd.duration && !vd.ended) cfg.onProgress && cfg.onProgress(vd.currentTime, vd.duration); }, vo);
    vd.addEventListener('ended', () => { cfg.onProgress && cfg.onProgress(vd.duration, vd.duration); if (cfg.nextUrl && S.autoNext) startNext(); }, vo);
    if (bPip) bPip.hidden = !supportsPip();
    if (src.kind === 'hls') {
      if (vd.canPlayType('application/vnd.apple.mpegurl')) vd.src = src.url;
      else loadHls().then(() => {
        if (video !== vd) return; if (!window.Hls || !Hls.isSupported()) return fail();
        hls = new Hls({ enableWorker: true, maxBufferLength: 40, capLevelToPlayerSize: true }); hls.loadSource(src.url); hls.attachMedia(vd);
        hls.on(Hls.Events.ERROR, (_, d) => { if (!d.fatal) return; if (d.type === Hls.ErrorTypes.NETWORK_ERROR && !hls._r) { hls._r = 1; hls.startLoad(); } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR && !hls._m) { hls._m = 1; hls.recoverMediaError(); } else fail(); });
      }).catch(() => fail());
    } else vd.src = src.url;
    paintState(); paint();
  }

  /* ----- controls ----- */
  const toggle = () => { if (!video) return; if (video.paused) { const p = video.play(); if (p && p.catch) p.catch(() => { }); } else video.pause(); };
  const skip = d => { if (!video || !isFinite(video.duration)) return; video.currentTime = clamp(video.currentTime + d, 0, video.duration); flash.textContent = (d > 0 ? '+' : '−') + Math.abs(d) + (S.lang === 'en' ? ' s' : ' sn'); flash.className = 'pl-flash show ' + (d > 0 ? 'r' : 'l'); clearTimeout(flashT); flashT = setTimeout(() => { flash.className = 'pl-flash'; }, 600); };
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fsOn = () => fsEl() === root || root.classList.contains('is-pfs');
  function pfs(onf) { root.classList.toggle('is-pfs', onf); document.body.classList.toggle('pfs-lock', onf); updateFs(); }
  function toggleFs() {
    if (fsOn()) { if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); pfs(false); return; }
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    if (req) { try { const p = req.call(root); if (p && p.catch) p.catch(() => pfs(true)); } catch (e) { pfs(true); } }
    else if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();       /* iPhone Safari */
    else pfs(true);                                                                       /* iframe on iPhone: in-page fullscreen */
  }
  function updateFs() { const f = fsOn(); root.classList.toggle('is-fs', f); const ic = f ? ICON.fsx : ICON.fs; bFs.innerHTML = ic; pfsBtn.innerHTML = ic; }
  const clockT = () => { const d = video ? video.duration : 0; return clock(video ? video.currentTime : 0) + ' / ' + clock(d); };
  function paint() {
    if (!video) return; const d = video.duration, tt = video.currentTime, pct = isFinite(d) && d > 0 ? tt / d * 100 : 0;
    played.style.width = pct + '%'; knob.style.left = pct + '%'; prog.setAttribute('aria-valuenow', Math.round(pct));
    if (isFinite(d) && d > 0 && video.buffered.length) { let end = 0; for (let i = 0; i < video.buffered.length; i++) if (video.buffered.start(i) <= tt + .5) end = Math.max(end, video.buffered.end(i)); buf.style.width = (end / d * 100) + '%'; }
    timeEl.textContent = clockT();
  }
  function paintState() {
    const p = !video || video.paused; root.classList.toggle('is-paused', p); bPlay.innerHTML = big.innerHTML = p ? ICON.play : ICON.pause;
    const m = video && (video.muted || video.volume === 0); bMute.innerHTML = m ? ICON.mute : ICON.vol; volEl.value = video ? (video.muted ? 0 : video.volume) : 1; showUi();
  }
  function showUi() { ui.classList.remove('is-idle'); clearTimeout(idleT); if (video && !video.paused && menu.hidden) idleT = setTimeout(() => ui.classList.add('is-idle'), 3000); }
  function buildMenu() {
    menu.textContent = '';
    const sec = (name, items) => { const d = document.createElement('div'); d.className = 'pl-sec'; d.innerHTML = `<h4>${esc(name)}</h4>`; const r = document.createElement('div'); r.className = 'pl-opts'; items.forEach(([l, a, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = l; b.setAttribute('aria-pressed', !!a); b.onclick = ev => { ev.stopPropagation(); fn(); buildMenu(); }; r.appendChild(b); }); d.appendChild(r); menu.appendChild(d); };
    sec(t('speed'), [.5, .75, 1, 1.25, 1.5, 2].map(r => [r === 1 ? (S.lang === 'en' ? 'Normal' : 'Normal') : r + 'x', video && video.playbackRate === r, () => { if (video) video.playbackRate = r; }]));
    if (hls && hls.levels && hls.levels.length > 1) sec(S.lang === 'en' ? 'Quality' : 'Kalite', [[S.lang === 'en' ? 'Auto' : 'Otomatik', hls.autoLevelEnabled, () => { hls.currentLevel = -1; }]].concat(hls.levels.map((l, i) => [l.height ? l.height + 'p' : Math.round(l.bitrate / 1000) + 'k', !hls.autoLevelEnabled && hls.currentLevel === i, () => { hls.currentLevel = i; }])));
  }
  function startNext() {
    if (root.querySelector('.pl-next')) return; let left = 8; const box = document.createElement('div'); box.className = 'pl-next';
    box.innerHTML = `<p><b>${t('nextIn')}</b> <span data-l>${left}</span> ${S.lang === 'en' ? 's' : 'sn'}</p><div class="bar"><i></i></div><div class="row"><button type="button" class="btn btn-primary btn-sm" data-go>${t('goNow')}</button><button type="button" class="btn btn-ghost btn-sm" data-cx>${t('cancel')}</button></div>`;
    root.appendChild(box); const l = $('[data-l]', box), bar = $('.bar i', box); requestAnimationFrame(() => { bar.style.width = '12.5%'; });
    const go = () => { clearInterval(nextT); cfg.onNext && cfg.onNext(); };
    nextT = setInterval(() => { left--; if (left <= 0) go(); else { l.textContent = left; bar.style.width = ((8 - left) / 8 * 100) + '%'; } }, 1000);
    $('[data-go]', box).onclick = go; $('[data-cx]', box).onclick = () => { clearInterval(nextT); box.remove(); };
  }

  /* ----- events ----- */
  on(root, 'click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b || !root.contains(b)) return; ev.stopPropagation(); const a = b.dataset.act;
    if (a === 'toggle') toggle(); else if (a === 'back') skip(-10); else if (a === 'fwd') skip(10); else if (a === 'fs') toggleFs();
    else if (a === 'mute') { if (video) { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = .5; } }
    else if (a === 'next') cfg.onNext && cfg.onNext(); else if (a === 'prev' && cfg.prevUrl) Router.go(cfg.prevUrl);
    else if (a === 'nextsrc') cfg.onNextSource && cfg.onNextSource();
    else if (a === 'pip' && video) { if (document.pictureInPictureElement) document.exitPictureInPicture(); else if (video.requestPictureInPicture) video.requestPictureInPicture().catch(() => { }); else if (video.webkitSetPresentationMode) video.webkitSetPresentationMode('picture-in-picture'); }
    else if (a === 'menu') { if (menu.hidden) { buildMenu(); menu.hidden = false; clearTimeout(idleT); } else menu.hidden = true; }
  });
  on(volEl, 'input', () => { if (video) { video.muted = false; video.volume = +volEl.value; } });
  on(q('[data-hit]'), 'click', ev => {
    if (!menu.hidden) { menu.hidden = true; return; }
    const now = Date.now(), r = ev.currentTarget.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width;
    if (now - lastTap < 300) { clearTimeout(clickT); lastTap = 0; if (touchy && x < .35) skip(-10); else if (touchy && x > .65) skip(10); else toggleFs(); return; }
    lastTap = now; clickT = setTimeout(() => { if (touchy) { if (ui.classList.contains('is-idle') || (video && video.paused)) showUi(); else { clearTimeout(idleT); ui.classList.add('is-idle'); } } else toggle(); }, 260);
  });
  ['pointermove', 'pointerdown'].forEach(ev => on(ui, ev, showUi));
  on(ui, 'pointerleave', () => { if (video && !video.paused && menu.hidden) { clearTimeout(idleT); idleT = setTimeout(() => ui.classList.add('is-idle'), 900); } });
  const ratio = ev => { const r = prog.getBoundingClientRect(); return clamp((ev.clientX - r.left) / r.width, 0, 1); };
  const seekTo = ev => { if (video && isFinite(video.duration)) { video.currentTime = ratio(ev) * video.duration; paint(); } };
  on(prog, 'pointerdown', ev => { scrubbing = true; ui.classList.add('is-scrub'); prog.setPointerCapture(ev.pointerId); seekTo(ev); });
  on(prog, 'pointermove', ev => { const r = ratio(ev); tip.textContent = clock(r * (video && video.duration || 0)); tip.style.left = (r * 100) + '%'; if (scrubbing) seekTo(ev); });
  const endScrub = () => { scrubbing = false; ui.classList.remove('is-scrub'); }; on(prog, 'pointerup', endScrub); on(prog, 'pointercancel', endScrub);
  on(prog, 'keydown', ev => { if (ev.key === 'ArrowLeft') { ev.preventDefault(); ev.stopPropagation(); skip(-5); } else if (ev.key === 'ArrowRight') { ev.preventDefault(); ev.stopPropagation(); skip(5); } });
  on(document, 'fullscreenchange', updateFs); on(document, 'webkitfullscreenchange', updateFs);
  on(document, 'keydown', ev => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || !document.body.contains(root) || $('.modal')) return;
    const tag = (ev.target.tagName || '').toLowerCase(); if (['input', 'textarea', 'select'].includes(tag) || ev.target.isContentEditable) return;
    if ((tag === 'button' || tag === 'a') && (ev.key === ' ' || ev.key === 'Enter')) return;
    const k = ev.key, kl = k.toLowerCase(); if (!video) { if (k === 'Escape' && root.classList.contains('is-pfs')) toggleFs(); return; }
    if (k === ' ' || kl === 'k') { ev.preventDefault(); toggle(); } else if (k === 'ArrowLeft') { ev.preventDefault(); skip(-10); } else if (k === 'ArrowRight') { ev.preventDefault(); skip(10); }
    else if (k === 'ArrowUp') { ev.preventDefault(); video.muted = false; video.volume = clamp(video.volume + .1, 0, 1); } else if (k === 'ArrowDown') { ev.preventDefault(); video.volume = clamp(video.volume - .1, 0, 1); }
    else if (kl === 'm') video.muted = !video.muted; else if (kl === 'f') toggleFs(); else if (kl === 'p' && bPip && !bPip.hidden) bPip.click(); else if (kl === 'n' && cfg.nextUrl) cfg.onNext && cfg.onNext();
    else if (k === 'Escape') { if (!menu.hidden) menu.hidden = true; else if (root.classList.contains('is-pfs')) toggleFs(); } else return;
    showUi();
  });
  on(window, 'pagehide', () => { if (video && video.duration) cfg.onProgress && cfg.onProgress(video.currentTime, video.duration); });
  bFs.innerHTML = ICON.fs; paintState();
  return { load, destroy() { life.abort(); teardown(); clearTimeout(idleT); clearTimeout(clickT); if (fsEl() === root) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { } } host.textContent = ''; } };
}

/* ---------- modals: trailer + settings ---------- */
async function openTrailer(ref) {
  const it = REG.get(ref); if (!it) return; const m = openModal('<div class="trailer"><div class="trailer-ph skel"></div></div>', { cls: 'modal-wide' });
  try {
    const key = await Data.trailer(it); if (m.el._gone) return; if (!key) { m.close(); toast(t('noTrailer')); return; }
    $('.trailer', m.el).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(it.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  } catch (e) { m.close(); toast(t('apiErr')); }
}
function openSettings() {
  openModal(`<h2>${t('settings')}</h2><form id="setForm" class="form" autocomplete="off">
    <label class="f"><span>${t('name')}</span><input name="name" value="${esc(S.name)}" maxlength="24"></label>
    <div class="f"><span>${t('apiKey')}</span><div class="f-row"><input name="apiKey" type="password" autocomplete="off" spellcheck="false" placeholder="TMDB v3 API key" value="${esc(S.apiKey)}" aria-label="${t('apiKey')}"><button type="button" class="btn btn-glass" id="keyTest">${t('testKey')}</button></div><small id="keyMsg" class="muted">${Data.demo() ? t('demoBanner') : ''}</small></div>
    <div class="f"><span>${t('language')}</span><div class="chips">${[['tr', 'Türkçe'], ['en', 'English']].map(([k, l]) => `<label class="chip radio${S.lang === k ? ' on' : ''}"><input type="radio" name="lang" value="${k}" ${S.lang === k ? 'checked' : ''}>${l}</label>`).join('')}</div></div>
    <div class="f"><span>${t('accent')}</span><div class="swatches">${ACCENTS.map(c => `<label class="sw${c === S.accent ? ' on' : ''}" style="--c:${c}"><input type="radio" name="accent" value="${c}" ${c === S.accent ? 'checked' : ''} aria-label="${c}"></label>`).join('')}</div></div>
    <label class="chk"><input type="checkbox" name="reduceMotion" ${S.reduceMotion ? 'checked' : ''}> ${t('reduceMotion')}</label><label class="chk"><input type="checkbox" name="autoNext" ${S.autoNext ? 'checked' : ''}> ${t('autoNext')}</label>
    <div class="f-actions"><button class="btn btn-ghost" type="button" id="resetAll">${t('resetData')}</button><button class="btn btn-primary" type="submit">${t('save')}</button></div></form>`, {
    onMount(el, close) {
      const f = $('#setForm', el); $$('.chip.radio input,.sw input', el).forEach(i => i.addEventListener('change', () => { $$('.chip.radio', el).forEach(c => c.classList.toggle('on', c.querySelector('input').checked)); $$('.sw', el).forEach(c => c.classList.toggle('on', c.querySelector('input').checked)); }));
      $('#keyTest', el).onclick = async () => { const msg = $('#keyMsg', el), k = f.apiKey.value.trim(); if (!k) { msg.textContent = t('apiKey') + '?'; return; } msg.className = 'muted'; msg.textContent = t('loading') + '…'; const ok = await Data.testKey(k); msg.className = ok ? 'ok' : 'bad'; msg.textContent = ok ? t('keyOk') : t('keyBad'); };
      $('#resetAll', el).onclick = () => { if (confirm(S.lang === 'en' ? 'Delete all local data (settings, lists, history, admin demo data)?' : 'Tüm yerel veriler (ayarlar, liste, geçmiş, admin demo verisi) silinsin mi?')) { Object.values(K).forEach(k => LS.del(k)); location.reload(); } };
      f.addEventListener('submit', ev => {
        ev.preventDefault(); const d = new FormData(f), changed = (d.get('apiKey') || '').trim() !== (S.apiKey || '') || d.get('lang') !== S.lang;
        saveSettings({ name: (d.get('name') || 'Misafir').trim() || 'Misafir', apiKey: (d.get('apiKey') || '').trim(), lang: d.get('lang') || 'tr', accent: d.get('accent') || S.accent, reduceMotion: d.get('reduceMotion') === 'on', autoNext: d.get('autoNext') === 'on' });
        if (changed) memo.clear(); close(); renderNav(); render(); toast(t('save') + ' ✓');
      });
    }
  });
}

/* ---------- 11. router + global events + boot ---------- */
const SCROLL = {};
const Router = {
  mode: window.PC_ROUTING || (location.protocol === 'file:' ? 'hash' : 'history'), base: (window.PC_BASE || '').replace(/\/$/, ''),
  cur() { if (this.mode === 'hash') return location.hash.slice(1) || '/'; let p = location.pathname + location.search; if (this.base && p.startsWith(this.base)) p = p.slice(this.base.length) || '/'; return p || '/'; },
  href(p) { return this.mode === 'hash' ? '#' + p : this.base + p; },
  go(p, { replace = false, silent = false } = {}) {
    SCROLL[this.cur()] = window.scrollY;
    if (this.mode === 'hash') { if (silent) history.replaceState(null, '', '#' + p); else if (replace) location.replace('#' + p); else location.hash = p; }
    else { history[replace || silent ? 'replaceState' : 'pushState'](null, '', this.base + p); if (!silent) render(); }
    if (!silent) window.scrollTo(0, 0);
  }
};
const ROUTES = [[/^\/?$/, c => pageHome(c)], [/^\/movies\/?$/, c => pageBrowse('movie', c)], [/^\/series\/?$/, c => pageBrowse('tv', c)], [/^\/movie\/([^/]+)\/?$/, c => pageDetail('movie', c.m[1], c)], [/^\/tv\/([^/]+)\/?$/, c => pageDetail('tv', c.m[1], c)], [/^\/watch\/([^/]+)\/?$/, c => pageWatch(c)], [/^\/search\/?$/, c => pageSearch(c)], [/^\/watchlist\/?$/, c => pageWatchlist(c)], [/^\/admin\/?$/, () => { location.href = 'admin.html'; }]];
let RT = 0;
async function render(pop) {
  const my = ++RT, alive = () => my === RT; clearInterval(HERO_T); destroyPlayer(); $$('.modal').forEach(m => m._close && m._close());
  const raw = Router.cur(), u = new URL(raw, 'http://x'), v = view(); setActiveNav(raw); updateWlCount(); $$('.dd.open').forEach(d => d.classList.remove('open'));
  let hit = null; for (const [re, fn] of ROUTES) { const m = re.exec(u.pathname); if (m) { hit = { fn, m }; break; } }
  v.classList.remove('view-in'); void v.offsetWidth; v.classList.add('view-in');
  try { if (hit) await hit.fn({ m: hit.m, q: u.searchParams, alive }); else pageNotFound(); } catch (e) { console.error(e); if (alive()) v.innerHTML = `<div class="page container">${errBox(String(e && e.message || e))}</div>`; const rb = $('[data-retry]', v); if (rb) rb.onclick = () => render(); }
  if (pop === true) setTimeout(() => window.scrollTo(0, SCROLL[raw] || 0), 60);
  $('#nav').classList.toggle('scrolled', window.scrollY > 24);
}
function bindGlobal() {
  document.addEventListener('error', e => { const el = e.target; if (el && el.tagName === 'IMG' && el.dataset.fb !== undefined && !el.dataset.done) { el.dataset.done = 1; el.removeAttribute('srcset'); el.src = art(el.dataset.fb, el.dataset.kind || 'poster'); } }, true);
  document.addEventListener('click', e => {
    const tgt = e.target, nav = tgt.closest('[data-nav]');
    if (nav && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); Router.go(nav.dataset.nav); return; }
    const go = tgt.closest('[data-go]'); if (go) { Router.go(go.dataset.go); return; }
    const wl = tgt.closest('[data-wl]');
    if (wl) {
      e.preventDefault(); const it = REG.get(wl.dataset.wl); if (!it) return; const added = WL.toggle(it); toast(added ? t('added') : t('removed')); updateWlCount();
      $$(`[data-wl="${wl.dataset.wl}"]`).forEach(b => { const iconOnly = b.classList.contains('card-add') || b.classList.contains('btn-icon'); b.classList.toggle('is-on', added); b.setAttribute('aria-pressed', added); b.innerHTML = iconOnly ? (added ? ICON.check : ICON.plus) : (added ? ICON.check + t('inList') : ICON.plus + t('addList')); });
      if (Router.cur().startsWith('/watchlist') && !Router.cur().includes('history')) render(); return;
    }
    const sc = tgt.closest('[data-scroll]'); if (sc) { const tr = sc.closest('.row').querySelector('.track'); tr.scrollBy({ left: +sc.dataset.scroll * tr.clientWidth * .85, behavior: S.reduceMotion ? 'auto' : 'smooth' }); return; }
    const tr = tgt.closest('[data-trailer]'); if (tr) { openTrailer(tr.dataset.trailer); return; }
    if (tgt.closest('[data-open-settings]')) { $$('.dd.open').forEach(d => d.classList.remove('open')); openSettings(); return; }
    const hr = tgt.closest('[data-hist-remove]'); if (hr) { Hist.remove(hr.dataset.histRemove); const c = hr.closest('.card'); c.remove(); if (Router.cur().startsWith('/watchlist')) render(); else { const row = $('#row-cw'); if (row && !$('.card', row)) row.remove(); } return; }
    if (tgt.closest('[data-hist-clear]')) { Hist.clear(); render(); return; }
    const ac = tgt.closest('[data-accent]'); if (ac) { saveSettings({ accent: ac.dataset.accent }); $$('[data-accent]').forEach(b => b.classList.toggle('on', b === ac)); return; }
    const dd = tgt.closest('.dd-btn, .avatar-btn#profileBtn');
    if (dd) { const p = dd.closest('.dd'), open = !p.classList.contains('open'); $$('.dd.open').forEach(d => d.classList.remove('open')); p.classList.toggle('open', open); dd.setAttribute('aria-expanded', open); return; }
    if (!tgt.closest('.dd-menu')) $$('.dd.open').forEach(d => { d.classList.remove('open'); const b = $('button', d); if (b) b.setAttribute('aria-expanded', 'false'); });
  });
  /* drag-to-scroll carousels (mouse) */
  let drag = null;
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; const tr = e.target.closest('.track'); if (tr && tr.scrollWidth > tr.clientWidth) drag = { tr, x: e.clientX, sl: tr.scrollLeft, moved: false }; });
  window.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 6) { drag.moved = true; drag.tr.classList.add('dragging'); } if (drag.moved) drag.tr.scrollLeft = drag.sl - dx; });
  window.addEventListener('pointerup', () => { if (drag) { const d = drag; drag = null; setTimeout(() => d.tr.classList.remove('dragging'), 0); if (d.moved) window.__noClick = Date.now(); } });
  document.addEventListener('click', e => { if (window.__noClick && Date.now() - window.__noClick < 120) { e.preventDefault(); e.stopPropagation(); } }, true);
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase(), typing = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable;
    if (e.key === 'Escape') { const m = $$('.modal').pop(); if (m && m._close) { m._close(); return; } $$('.dd.open').forEach(d => d.classList.remove('open')); }
    else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); Router.go('/search'); }
  });
  window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', window.scrollY > 24), { passive: true });
  window.addEventListener(Router.mode === 'hash' ? 'hashchange' : 'popstate', () => render(true));
  $('#dim').addEventListener('click', () => { document.body.classList.remove('lights-off'); const b = $('#lightsBtn'); if (b) b.setAttribute('aria-pressed', 'false'); });
}
function boot() { renderNav(); bindGlobal(); render(); }
if (!isAdminPage()) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot(); }
