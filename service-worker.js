self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open("timer-app").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/icon-192.png",
        "/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
