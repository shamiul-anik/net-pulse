const CACHE_NAME = "net-pulse-v1";
const ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icon.png",
  "/favicon.ico",
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests and avoid caching the actual speed test endpoints
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("speed.cloudflare.com") ||
    event.request.url.includes("api/upload")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
