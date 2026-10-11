// アプリ本体だけを控えておき、圏外でも前回の画面を開けるようにする(予報そのものは控えない)
const CACHE = "shukko-v16";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname.endsWith("open-meteo.com") || u.hostname.endsWith("gsi.go.jp")) return;
  // 常に新しいものを取りに行き、だめなら控えを使う
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return r; }).catch(() => caches.match(e.request)));
});
