const CACHE_NAME = "wcq-cache-v1";
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  "/",
  "/assets/img/Dmytro_Solovei.jpg",
  "/assets/img/donate.png",
  "/assets/img/globe.png",
  "/assets/img/icon-fullscreen.svg",
  "/assets/img/logo.png",
  "/assets/img/measure-colored.png",
  "/assets/img/measure.png",
  "/assets/img/menu.svg",
  "/assets/img/slavutich_emblem.png",
  "/assets/img/toggle.png",
  "/assets/img/toggle.svg",
  "/assets/img/zoom-to-start.png",
  "/assets/img/background-image.png",
  "/css/styles.css",
  "/css/quiz_style.css",
  "/css/leaflet-controls.css",
  "/css/leaflet.css",
  "/css/images/layers-2x.png",
  "/css/images/layers.png",
  "/css/images/marker-icon-2x.png",
  "/css/images/marker-icon.png",
  "/offline.html",
  "/js/data/countries.geo.js",
  "/js/data/countries.js",
  "/js/data/countriesBounds.js",
  "/js/localization/ua.js",
  "/js/views/aboutView.js",
  "/js/views/countriesSelectView.js",
  "/js/views/donateAuthorView.js",
  "/js/views/flagsView.js",
  "/js/views/guessCountriesGame.js",
  "/js/views/languageSelectView.js",
  "/js/views/mapQuiz.js",
  "/js/views/mapView.js",
  "/js/views/quiz.js",
  "/js/views/sideNavigationView.js",
  "/js/views/statisticView.js",
  "/js/views/topNavigationView.js",
  "/js/config.js",
  "/js/Control.FullScreen.js",
  "/js/controller.js",
  "/js/helpers.js",
  "/js/L.Control.MousePosition.js",
  "/js/leaflet-bootstrap-dropdowns.min.js",
  "/js/leaflet-marker-highlight.min.js",
  "/js/leaflet-notifications.js",
  "/js/leaflet-ruler.js",
  "/js/leaflet.contextmenu.js",
  "/js/Leaflet.CountryPlayer.js",
  "/js/leaflet.scalefactor.js",
  "/js/Leaflet.Weather.js",
  "/js/model.js",
  "/js/leaflet.js",
  "/js/bootstrap.bundle.min.js",
  "/js/treeselectjs.umd.js",
  "/index.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-384.png",
  "/icons/icon-256.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.url.endsWith(".mp4")) return;
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.status === 200
          ) {
            const copy = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch((err) => {});
          }
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("", { status: 503, statusText: "Offline" });
        });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
