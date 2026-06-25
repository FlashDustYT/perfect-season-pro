const CACHE_NAME = "legacy-league-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./scripts/gameData.js",
  "./scripts/gameLogic.js",
  "./scripts/storage.js",
  "./scripts/app.js",
  "./assets/icon.svg",
  "./assets/arena.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
