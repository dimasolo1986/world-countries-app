import { GEOGRAPHICAL_CENTER } from "../config.js";
import { DEFAULT_ZOOM_LEVEL } from "../config.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import { WAR_AGGRESSOR_COUNTRIES } from "../config.js";
import {
  COUNTRY_ON_MAP_QUIZ,
  FLAG_BY_COUNTRY_NAME_QUIZ,
  FLAG_BY_COUNTRY_CAPITAL_QUIZ,
  COUNTRY_NAME_BY_CAPITAL_QUIZ,
  COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_NAME_BY_FLAG_QUIZ,
  COUNTRY_CAPITAL_BY_FLAG_QUIZ,
  COUNTRY_NAME_BY_COUNTRY_ON_MAP,
} from "../config.js";
import { localization } from "../localization/ua.js";
import { loadQuizOnMap } from "../controller.js";
import * as model from "../model.js";

class mapView {
  _parentElement = document.querySelector("#map");
  _sideNavigationView;
  _topNavigationView;
  _errorMessage = "Failed to load map!";
  _map;
  _capitalMarker;
  _developmentPlaceMarker;
  _countryBoundary;
  _markers = [];
  _isCountrySelected;

  constructor() {
    this._createMap(GEOGRAPHICAL_CENTER);
  }

  setSideNavigationView(sideNavigationView) {
    this._sideNavigationView = sideNavigationView;
  }

  setTopNavigationView(topNavigationView) {
    this._topNavigationView = topNavigationView;
  }

  _createMap(latLon, defaultZoomLevel = DEFAULT_ZOOM_LEVEL) {
    this._map = L.map("map", {
      minZoom: DEFAULT_ZOOM_LEVEL,
      zoomSnap: 0.25,
      worldCopyJump: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 2,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
        title: "Full Screen",
        titleCancel: "Exit Fullscreen Mode",
        forceSeparateButton: false,
        forcePseudoFullscreen: true,
      },
    })
      .fitWorld()
      .setView(latLon, defaultZoomLevel);
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    ).addTo(this._map);
    this.addDevelopmentPlaceMarker();
    this._addResetZoomToMap();
    L.control
      .bootstrapDropdowns({
        position: "topleft",
        className: "quiz-menu-map",
        menuItems: [
          {
            html: `<span id="country-name-on-map-quiz-menu">${
              localization[model.worldCountries.language][
                "Country Name By Country On Map Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_NAME_BY_COUNTRY_ON_MAP);
              sessionStorage.setItem(
                "currentWindow",
                "country-name-by-country-on-map"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="country-on-map-quiz-menu">${
              localization[model.worldCountries.language]["Country On Map Quiz"]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_ON_MAP_QUIZ);
              sessionStorage.setItem("currentWindow", "country-on-map-quiz");
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="flag-by-country-name-quiz-menu">${
              localization[model.worldCountries.language][
                "Flag By Country Name Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(FLAG_BY_COUNTRY_NAME_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "flag-by-country-name-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="flag-by-country-capital-quiz-menu">${
              localization[model.worldCountries.language][
                "Flag By Country Capital Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(FLAG_BY_COUNTRY_CAPITAL_QUIZ);
              sessionStorage.setItem("currentWindow", "flag-by-capital-quiz");
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="country-name-by-capital-quiz-menu">${
              localization[model.worldCountries.language][
                "Country Name By Capital Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_NAME_BY_CAPITAL_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "country-name-by-capital-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="capital-by-country-name-quiz-menu">${
              localization[model.worldCountries.language][
                "Capital By Country Name Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "capital-by-country-name-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="country-name-by-flag-quiz-menu">${
              localization[model.worldCountries.language][
                "Country Name By Flag Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_NAME_BY_FLAG_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "country-name-by-flag-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
          {
            html: `<span id="country-capital-by-flag-quiz-menu">${
              localization[model.worldCountries.language][
                "Country Capital By Flag Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_CAPITAL_BY_FLAG_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "country-capital-by-flag-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
        ],
      })
      .addTo(this._map);
    const miniLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    );
    const miniMap = new L.Control.MiniMap(miniLayer, {
      position: "topright",
      toggleDisplay: true,
      width: 120,
      height: 120,
      collapsedWidth: 25,
      collapsedHeight: 25,
      minimized: false,
    });
    L.control.mousePosition({ position: "topright" }).addTo(this._map);
    miniMap.addTo(this._map);
  }

  _addResetZoomToMap() {
    (function () {
      const control = new L.Control({ position: "topleft" });
      control.onAdd = function (map) {
        const resetZoom = L.DomUtil.create("a", "resetzoom");
        resetZoom.innerHTML =
          localization[model.worldCountries.language]["Reset"];
        resetZoom.style.cursor = "pointer";
        resetZoom.style.textDecoration = "none";
        resetZoom.style.background = "white";
        resetZoom.style.color = "black";
        resetZoom.style.border = "2px solid rgba(0,0,0,0.1)";
        resetZoom.style.borderRadius = "2px";
        resetZoom.style.padding = "3px";
        resetZoom.style.fontSize = "0.7rem";
        L.DomEvent.disableClickPropagation(resetZoom).addListener(
          resetZoom,
          "click",
          function () {
            map.fitBounds(WORLD_MAP_BOUNDS);
          },
          resetZoom
        );
        return resetZoom;
      };
      return control;
    })().addTo(this._map);
  }

  translateElements() {
    const resetZoom = document.querySelector(".resetzoom");
    if (resetZoom) {
      resetZoom.textContent =
        localization[model.worldCountries.language]["Reset"];
    }
    const countryOnMapQuiz = document.querySelector(
      "#country-on-map-quiz-menu"
    );
    if (countryOnMapQuiz) {
      countryOnMapQuiz.textContent =
        localization[model.worldCountries.language]["Country On Map Quiz"];
    }
    const countryNameOnMapQuiz = document.querySelector(
      "#country-name-on-map-quiz-menu"
    );
    if (countryNameOnMapQuiz) {
      countryNameOnMapQuiz.textContent =
        localization[model.worldCountries.language][
          "Country Name By Country On Map Quiz"
        ];
    }
    const flagByCountryNameQuiz = document.querySelector(
      "#flag-by-country-name-quiz-menu"
    );
    if (flagByCountryNameQuiz) {
      flagByCountryNameQuiz.textContent =
        localization[model.worldCountries.language][
          "Flag By Country Name Quiz"
        ];
    }
    const flagByCountryCapitalQuiz = document.querySelector(
      "#flag-by-country-capital-quiz-menu"
    );
    if (flagByCountryCapitalQuiz) {
      flagByCountryCapitalQuiz.textContent =
        localization[model.worldCountries.language][
          "Flag By Country Capital Quiz"
        ];
    }
    const countryNameByCapitalQuiz = document.querySelector(
      "#country-name-by-capital-quiz-menu"
    );
    if (countryNameByCapitalQuiz) {
      countryNameByCapitalQuiz.textContent =
        localization[model.worldCountries.language][
          "Country Name By Capital Quiz"
        ];
    }
    const countryCapitalByCountryNameQuiz = document.querySelector(
      "#capital-by-country-name-quiz-menu"
    );
    if (countryCapitalByCountryNameQuiz) {
      countryCapitalByCountryNameQuiz.textContent =
        localization[model.worldCountries.language][
          "Capital By Country Name Quiz"
        ];
    }
    const countryNameByFlagQuiz = document.querySelector(
      "#country-name-by-flag-quiz-menu"
    );
    if (countryNameByFlagQuiz) {
      countryNameByFlagQuiz.textContent =
        localization[model.worldCountries.language][
          "Country Name By Flag Quiz"
        ];
    }
    const countryCapitalByFlagQuiz = document.querySelector(
      "#country-capital-by-flag-quiz-menu"
    );
    if (countryCapitalByFlagQuiz) {
      countryCapitalByFlagQuiz.textContent =
        localization[model.worldCountries.language][
          "Country Capital By Flag Quiz"
        ];
    }
    this.removeDevelopmentPlaceMarker();
    this.addDevelopmentPlaceMarker();
  }

  invalidateSize() {
    this._map.invalidateSize();
  }

  clearMap() {
    this._map.remove();
    this._parentElement.innerHTML = "";
  }

  hideMap() {
    this._parentElement.classList.add("not-displayed");
  }

  showMap() {
    this._parentElement.classList.remove("not-displayed");
  }

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  createDevelopmentPlaceIcon() {
    return L.icon({
      iconUrl: `https://upload.wikimedia.org/wikipedia/commons/0/00/Slavutich_gerb.png`,
      iconSize: [20, 30],
      className: "development-place-icon",
    });
  }

  createCapitalMarkerIcon(iconUrl) {
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [30, 30],
      className: "development-place-icon",
    });
  }

  _createMarkerIcon(country) {
    return L.icon({
      iconUrl: `${country.flags.png}`,
      iconSize: [20, 20],
    });
  }

  setMapViewToBounds(bounds) {
    this._map.fitBounds(bounds);
  }

  setMapView(latLon, zoomLevel) {
    this._map.setView(latLon, zoomLevel);
  }

  addCapitalMarker(coatOfArms, latLon, capital) {
    if (latLon && capital)
      this._capitalMarker = L.marker(
        latLon,
        coatOfArms.png
          ? { icon: this.createCapitalMarkerIcon(coatOfArms.png) }
          : {}
      )
        .addTo(this._map)
        .bindTooltip(capital);
  }

  showMarkerPopup(latLon) {
    const marker = this._markers.find(
      (marker) =>
        marker.getLatLng().lat === latLon[0] &&
        marker.getLatLng().lng === latLon[1]
    );
    if (marker) {
      marker.openPopup();
    }
  }

  closeAllPopup() {
    this._map.closePopup();
  }

  addDevelopmentPlaceMarker() {
    this._developmentPlaceMarker = L.marker([51.52, 30.75], {
      icon: this.createDevelopmentPlaceIcon(),
    })
      .bindTooltip(
        localization[model.worldCountries.language][
          "Slavutych, Ukraine - birthplace of the project"
        ]
      )
      .addTo(this._map);
  }

  removeDevelopmentPlaceMarker() {
    if (this._developmentPlaceMarker)
      this._map.removeLayer(this._developmentPlaceMarker);
  }

  removeCapitalMarker() {
    if (this._capitalMarker) this._map.removeLayer(this._capitalMarker);
  }

  _removeAllMarkersFromMap() {
    this._markers.forEach((marker) => this._map.removeLayer(marker));
    this._markers = [];
    this.removeCapitalMarker();
    this.removeCountryBoundary();
  }

  removeCountryBoundary() {
    if (this._countryBoundary) this._map.removeLayer(this._countryBoundary);
  }

  addCountryBoundary(country) {
    const countryCode = country.cca2;
    if (countryCode) {
      const countryGeo = {};
      countryGeo.type = COUNTRIES_GEO.type;
      countryGeo.features = COUNTRIES_GEO.features.filter(
        (feature) => feature.properties.country_a2 === countryCode
      );
      this._countryBoundary = L.geoJson(countryGeo, {
        bubblingMouseEvents: false,
      })
        .on("click", () => {})
        .addTo(this._map);
    }
  }

  setIsCountrySelected(isSelected) {
    this._isCountrySelected = isSelected;
  }

  renderCountriesMarkers(worldCountries) {
    this._removeAllMarkersFromMap();
    worldCountries.forEach((country) => {
      const marker = L.marker(
        country.latlng ? country.latlng : country.capitalInfo.latlng,
        {
          icon: this._createMarkerIcon(country),
          riseOnHover: true,
          opacity: 0.95,
          alt: localization[model.worldCountries.language]["countries"][
            country.name.common
          ],
        }
      )
        .on("mouseover", function () {
          this.setOpacity(1);
        })
        .on("mouseout", function () {
          this.setOpacity(0.95);
        })
        .addTo(this._map)
        .bindTooltip(
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ]
        )
        .bindPopup(
          L.popup({
            maxWidth: 210,
            minWidth: 210,
            maxHeight: 210,
            autoClose: true,
            closeOnClick: true,
            className: `${country.name.common}-popup`,
          })
        ).setPopupContent(`<img src="${
        country.flags.png
      }" style="width:30px; height:20px; border: 1px solid black; border-radius: 2px;"> ${
        country.coatOfArms.png
          ? `<img src="${country.coatOfArms.png}" style="width:30px; height:30px; margin-left: 3px;">`
          : ""
      }
        <span style="font-weight:bold">${
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ]
        }</span> <br />
       
        ${
          WAR_AGGRESSOR_COUNTRIES.includes(country.name.common)
            ? `<span style="color: red">${
                localization[model.worldCountries.language]["War Aggressor"]
              }</span><br>`
            : ""
        }
        <span>${
          localization[model.worldCountries.language]["Capital"]
        }: </span><span style="font-weight:bold">${
        country.capital
          ? localization[model.worldCountries.language]["capitals"][
              country.capital[0]
            ]
          : " "
      }</span>
      <br />
       <span>${
         localization[model.worldCountries.language]["Independent"]
       }: </span><span>${
        country.independent
          ? localization[model.worldCountries.language]["Yes"]
          : localization[model.worldCountries.language]["No"]
      }</span>
      <br />
        <span>${localization[model.worldCountries.language]["Region"]}: ${
        country.region
          ? localization[model.worldCountries.language][country.region]
          : " -"
      }</span><br />
        <span>${localization[model.worldCountries.language]["Subregion"]}: ${
        country.subregion
          ? localization[model.worldCountries.language][country.subregion]
          : " -"
      }</span><br />
        <span>${localization[model.worldCountries.language]["Area"]}: ${
        country.area
          ? country.area.toLocaleString() +
            " " +
            localization[model.worldCountries.language]["square km"]
          : " -"
      }</span><br />
        <span>${localization[model.worldCountries.language]["Population"]}: ${
        country.population
          ? country.population.toLocaleString() +
            " " +
            localization[model.worldCountries.language]["people"]
          : " -"
      }</span><br />
      <a class="side-navigation-country-link hover-effect" style="color:#85C1E9; text-decoration: none;" href="https://${
        model.worldCountries.language === "ua" ? "uk" : "en"
      }.wikipedia.org/wiki/${
        localization[model.worldCountries.language]["countries"][
          country.name.common
        ]
      }" target="_blank" rel="external">${
        localization[model.worldCountries.language]["Wikipedia"]
      }</a>`);
      marker.on("mouseover", function () {
        if (!this.isPopupOpen()) this.openTooltip();
      });
      marker.on(
        "mouseover",
        addCountryBoundary.bind(this, country, "mouse", false)
      );
      marker.on("mouseout", removeCountryBoundary.bind(this, "mouse"));
      marker.on("click", function () {
        this.closeTooltip();
      });
      marker.on(
        "click",
        addCountryBoundary.bind(this, country, "marker", true)
      );
      function addCountryBoundary(country, type, isCountrySelected) {
        if (!this._isCountrySelected || type === "marker") {
          this.removeCountryBoundary();
          this.removeCapitalMarker();
          this.addCountryBoundary(country);
          const sideNavigationCountries = document.querySelector(
            ".sb-sidenav-menu .nav"
          );
          if (sideNavigationCountries) {
            if (type !== "mouse") {
              sideNavigationCountries.childNodes.forEach((child) => {
                if (country.name.common === child.dataset.country) {
                  this._sideNavigationView._selectedCountry = country;
                  child.classList.add(
                    "selected-side-navigation-country-container"
                  );
                  child.scrollIntoView();
                } else {
                  child.classList.remove(
                    "selected-side-navigation-country-container"
                  );
                }
              });
            }
          }
          this._isCountrySelected = isCountrySelected;
        }
      }
      function removeCountryBoundary(type) {
        if (type === "mouse" && this._isCountrySelected) return;
        const sideNavigationCountries = document.querySelector(
          ".sb-sidenav-menu .nav"
        );
        if (sideNavigationCountries) {
          sideNavigationCountries.childNodes.forEach((child) => {
            child.classList.remove(
              "selected-side-navigation-country-container"
            );
          });
        }
        this._sideNavigationView._selectedCountry = undefined;
        this.removeCountryBoundary();
        this.removeCapitalMarker();
        this._sideNavigationView._parentElement.firstElementChild.scrollIntoView();
        if (type === "map") this._isCountrySelected = false;
      }
      this._map.on("click", removeCountryBoundary.bind(this, "map"));
      this._markers.push(marker);
    });
  }
}

export default new mapView();
