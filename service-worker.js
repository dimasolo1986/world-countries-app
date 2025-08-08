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
  "/css/styles.css",
  "/css/quiz_style.css",
  "/css/leaflet-controls.css",
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
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});
