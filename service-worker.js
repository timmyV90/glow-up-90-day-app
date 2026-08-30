const CACHE = "glowup90-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./install.js",
  "./icons/icon-192-v2.png",
  "./icons/icon-512-v2.png",
  "./icons/icon-180-v2.png",
  "./vest/",
  "./vest/index.html",
  "./vest/vest.css",
  "./vest/vest.js",
  "./vest/manifest.json",
  "./vest/icon-192-v3.png",
  "./vest/icon-512-v3.png",
  "./vest/icon-180-v3.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

/* network-first, and explicitly bypass the browser's own HTTP cache
   (GitHub Pages sends Cache-Control: max-age=600, which was silently
   serving 10-minute-old files even through "network-first" fetch calls) */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
