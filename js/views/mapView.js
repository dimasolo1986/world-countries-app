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
  COUNTRY_NAME_BY_EMBLEM_QUIZ,
} from "../config.js";
import { localization } from "../localization/ua.js";
import { loadQuizOnMap } from "../controller.js";
import * as model from "../model.js";
import { COUNTRY_BOUNDS } from "../data/countriesBounds.js";
import { defineZoomLevelByCountryArea, getLanguageCode } from "../helpers.js";

class mapView {
  _parentElement = document.querySelector("#map");
  _notifications = [];
  _measure;
  _weather;
  _countryPlayer;
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
    function centerMap(e) {
      this._map.panTo(e.latlng);
    }
    function showCoordinates(e) {
      const notification = L.control
        .notifications({
          timeout: 20000,
          position: "topleft",
          closable: true,
          dismissable: true,
          className: "modern",
        })
        .addTo(this._map);
      this._notifications.push(notification);
      notification.info(
        localization[model.worldCountries.language]["Coordinates"],
        `${localization[model.worldCountries.language]["Latitude"]}, ${
          localization[model.worldCountries.language]["Longitude"]
        }: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
      );
    }
    function zoomIn() {
      this._map.zoomIn();
    }

    function zoomOut() {
      this._map.zoomOut();
    }
    function reset() {
      this._sideNavigationView._selectedCountry = undefined;
      this._sideNavigationView._removeAllSelection();
      this.setIsCountrySelected(false);
      this.removeCapitalMarker();
      this.removeCountryBoundary();
      this.closeAllPopup();
      this.stopCountryPlayer();
      this.setMapViewToBounds(WORLD_MAP_BOUNDS);
    }
    const streetLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    );
    const natGeoWorldMap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
      }
    );
    const openStreetMap = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    const worldTopoMap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
      }
    );
    const siteliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    );
    const baseMaps = {
      WorldStreetMap: streetLayer,
      NatGeoWorldMap: natGeoWorldMap,
      WorldTopoMap: worldTopoMap,
      OpenStreetMap: openStreetMap,
      Satellite: siteliteLayer,
    };
    this._map = L.map("map", {
      contextmenu: true,
      contextmenuItems: [
        {
          text: localization[model.worldCountries.language]["Show Coordinates"],
          callback: showCoordinates,
          context: this,
        },
        "-",
        {
          text: localization[model.worldCountries.language]["Center Map Here"],
          callback: centerMap,
          context: this,
        },
        "-",
        {
          text: localization[model.worldCountries.language]["Zoom In"],
          callback: zoomIn,
          context: this,
        },
        {
          text: localization[model.worldCountries.language]["Zoom Out"],
          callback: zoomOut,
          context: this,
        },
        {
          text: localization[model.worldCountries.language]["Reset"],
          callback: reset,
          context: this,
        },
      ],
      layers: [streetLayer],
      minZoom: DEFAULT_ZOOM_LEVEL,
      zoomSnap: 0.25,
      worldCopyJump: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 2,
      maxBounds: [
        [85.1217211716937, 270.48437500000003],
        [-86.37146534864254, -250.27343750000003],
      ],
      maxBoundsViscosity: 1,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
        title: "Full Screen",
        titleCancel: "Exit Fullscreen Mode",
        forceSeparateButton: false,
        forcePseudoFullscreen: true,
        zoomResetFunction: reset.bind(this),
      },
    })
      .fitWorld()
      .setView(latLon, defaultZoomLevel);
    const measureOptions = {
      position: "topleft",
      mapView: this,
      circleMarker: {
        color: "blue",
        radius: 2,
      },
      lineStyle: {
        color: "blue",
        dashArray: "1,6",
      },
      lengthUnit: {
        display: "km",
        decimal: 2,
        factor: null,
        label: "&#10137; ",
      },
      angleUnit: {
        display: "&deg;",
        decimal: 2,
        factor: null,
        label: "&#10138; ",
      },
    };
    this.addDevelopmentPlaceMarker();
    this._measure = L.control.ruler(measureOptions).addTo(this._map);
    L.control.layers(baseMaps).setPosition("topleft").addTo(this._map);
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
          {
            html: `<span id="country-name-by-emblem-quiz-menu">${
              localization[model.worldCountries.language][
                "Country Name By Coat Of Arms Quiz"
              ]
            }</span>`,
            afterClick: () => {
              loadQuizOnMap(COUNTRY_NAME_BY_EMBLEM_QUIZ);
              sessionStorage.setItem(
                "currentWindow",
                "country-name-by-emblem-quiz"
              );
              this._topNavigationView.initItemMenuStyle();
            },
          },
        ],
      })
      .addTo(this._map);
    this._weather = L.control
      .weather({
        position: "topright",
        apiKey: "4f9049379479c8c94ece03f020cdccab",
        lang: "en",
        units: "metric",
        template: `<div class="weatherButton">${
          localization[model.worldCountries.language][
            "Weather in the center of the map"
          ]
        }</div><div class="weatherIcon"><img class="weatherIconImg" src=""></div><div class="weatherCoordinates"><span id="coordinates">${
          localization[model.worldCountries.language]["Coordinates"]
        }</span>: <span class="weatherCoordinatesValue"></span></div><div class="weatherTemperature"><span id="tempreture">${
          localization[model.worldCountries.language]["Temreture"]
        }</span>: <span class="weatherTemperatureValue"></span></div><div class="weatherHumidity"><span id="humidity">${
          localization[model.worldCountries.language]["Humidity"]
        }</span>: <span class="weatherHumidityValue"></span></div><div class="weatherWind"><span id="wind">${
          localization[model.worldCountries.language]["Wind"]
        }</span>: <span class="weatherWindValue"></span><span id="windUnit">${
          localization[model.worldCountries.language]["m/s"]
        }</span></div><button class="collapseButtonWeather" title="${
          localization[model.worldCountries.language]["Collapse"]
        }">⬆</button>`,
      })
      .addTo(this._map);
    this._countryPlayer = L.control
      .player({
        template: `<div id="countryPlayerHeading" class="playerButton">${
          localization[model.worldCountries.language]["Play World Countries"]
        }</div><div class="playerButtonStart" title="${
          localization[model.worldCountries.language]["Start"]
        }">▶️</div><div class="playerButtonPause" title="${
          localization[model.worldCountries.language]["Pause"]
        }">⏸️</div><div class="playerButtonEnd" title="${
          localization[model.worldCountries.language]["Stop"]
        }">⏹️</div>
        <label id="playerSelectLabel" title="${
          localization[model.worldCountries.language]["Country Display Time"]
        }" for="playerSelect">&#128338;:</label><select id="playerSelect" class="playerDelaySelect"><option value="3" selected>3 sec.</option><option value="5">5 sec.</option><option value="10">10 sec.</option><option value="20">20 sec.</option><option value="30">30 sec.</option><option value="60">60 sec.</option><option value="90">90 sec.</option></select><div class="playerCountriesSelect"><select id="playerCountriesSelect"><option value="All Countries" selected>${
          localization[model.worldCountries.language]["All Countries"]
        }</option><option value="Europe">${
          localization[model.worldCountries.language]["Europe"]
        }</option><option value="Americas">${
          localization[model.worldCountries.language]["Americas"]
        }</option><option value="Africa">${
          localization[model.worldCountries.language]["Africa"]
        }</option><option value="Asia">${
          localization[model.worldCountries.language]["Asia"]
        }</option><option value="Oceania">${
          localization[model.worldCountries.language]["Oceania"]
        }</option><option value="Antarctic">${
          localization[model.worldCountries.language]["Antarctic"]
        }</option></select></div><div class="playerFooter"><span id="countryCount">1</span><span id="allCountriesNumber"> : ${
          model.worldCountries.countries.length
        }</span></div><button class="collapseButtonCountryPlayer" title="${
          localization[model.worldCountries.language]["Collapse"]
        }">⬆</button>`,
        model: model.worldCountries.countries,
        mapView: this,
        countryBounds: COUNTRY_BOUNDS,
        worldBounds: WORLD_MAP_BOUNDS,
        defineZoomLevelByCountryArea: defineZoomLevelByCountryArea,
      })
      .addTo(this._map);
    L.control.scalefactor({ position: "topright" }).addTo(this._map);
    L.control
      .mousePosition({
        position: "topright",
      })
      .addTo(this._map);
  }

  stopCountryPlayer() {
    if (this._countryPlayer && !this._countryPlayer._isPaused) {
      this._countryPlayer.stopPlayCountries();
    }
  }

  terminatePlayCountries() {
    if (this._countryPlayer && !this._countryPlayer._isPaused) {
      this._countryPlayer.terminatePlayCountries();
    }
  }

  translateCountryPlayer() {
    const countryPlayer = document.querySelector("#countryPlayerHeading");
    if (countryPlayer) {
      countryPlayer.textContent =
        localization[model.worldCountries.language]["Play World Countries"];
    }
    const startButton = document.querySelector(".playerButtonStart");
    if (startButton) {
      startButton.title = localization[model.worldCountries.language]["Start"];
    }
    const pauseButton = document.querySelector(".playerButtonPause");
    if (pauseButton) {
      pauseButton.title = localization[model.worldCountries.language]["Pause"];
    }
    const stopButton = document.querySelector(".playerButtonEnd");
    if (stopButton) {
      stopButton.title = localization[model.worldCountries.language]["Stop"];
    }
    const label = document.querySelector("#playerSelectLabel");
    if (label) {
      label.title =
        localization[model.worldCountries.language]["Country Display Time"];
    }
    const collapseButton = document.querySelector(
      ".collapseButtonCountryPlayer"
    );
    if (collapseButton) {
      collapseButton.title =
        localization[model.worldCountries.language]["Collapse"];
    }
    const playerCountriesSelectOptions = document.querySelectorAll(
      "#playerCountriesSelect option"
    );
    if (playerCountriesSelectOptions) {
      playerCountriesSelectOptions.forEach((option) => {
        option.textContent =
          localization[model.worldCountries.language][option.value];
      });
    }
    if (this._countryPlayer) {
      this._countryPlayer.stopPlayCountries();
    }
  }

  translateWeather() {
    const weatherHeading = document.querySelector(".weatherButton");
    if (weatherHeading) {
      weatherHeading.textContent =
        localization[model.worldCountries.language][
          "Weather in the center of the map"
        ];
    }
    const weatherCoordinates = document.querySelector("#coordinates");
    if (weatherCoordinates) {
      weatherCoordinates.textContent =
        localization[model.worldCountries.language]["Coordinates"];
    }
    const weatherTemperature = document.querySelector("#tempreture");
    if (weatherTemperature) {
      weatherTemperature.textContent =
        localization[model.worldCountries.language]["Temreture"];
    }
    const weatherHumidity = document.querySelector("#humidity");
    if (weatherHumidity) {
      weatherHumidity.textContent =
        localization[model.worldCountries.language]["Humidity"];
    }
    const weatherWind = document.querySelector("#wind");
    if (weatherWind) {
      weatherWind.textContent =
        localization[model.worldCountries.language]["Wind"];
    }
    const weatherWindUnit = document.querySelector("#windUnit");
    if (weatherWindUnit) {
      weatherWindUnit.textContent =
        localization[model.worldCountries.language]["m/s"];
    }
    const collapseButton = document.querySelector(".collapseButtonWeather");
    if (collapseButton) {
      collapseButton.title =
        localization[model.worldCountries.language]["Collapse"];
    }
  }

  translateElements() {
    this.translateCountryPlayer();
    this.translateWeather();
    const contextMenuItems = document.querySelectorAll(
      ".leaflet-contextmenu-item"
    );
    if (contextMenuItems) {
      contextMenuItems[0].textContent =
        localization[model.worldCountries.language]["Show Coordinates"];
      contextMenuItems[1].textContent =
        localization[model.worldCountries.language]["Center Map Here"];
      contextMenuItems[2].textContent =
        localization[model.worldCountries.language]["Zoom In"];
      contextMenuItems[3].textContent =
        localization[model.worldCountries.language]["Zoom Out"];
      contextMenuItems[4].textContent =
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
    const countryNameByEmblemQuiz = document.querySelector(
      "#country-name-by-emblem-quiz-menu"
    );
    if (countryNameByEmblemQuiz) {
      countryNameByEmblemQuiz.textContent =
        localization[model.worldCountries.language][
          "Country Name By Coat Of Arms Quiz"
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
    if (this._notifications) {
      this._notifications.forEach((notification) => notification.clear());
      this._notifications = [];
    }
    if (this._measure) {
      this._measure.clear();
    }
    if (this._countryPlayer) {
      this.stopCountryPlayer();
    }
  }

  hideMap() {
    this._parentElement.classList.add("not-displayed");
    if (this._notifications) {
      this._notifications.forEach((notification) => notification.clear());
      this._notifications = [];
    }
    if (this._measure) {
      this._measure.clear();
    }
    if (this._countryPlayer) {
      this.stopCountryPlayer();
    }
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
      marker.enablePermanentHighlight();
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
    this._markers.forEach((marker) => marker.disablePermanentHighlight());
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

  markersDisableCloseOnClick() {
    this._markers.forEach((marker) => {
      const popup = marker.getPopup();
      if (popup) {
        popup.options.closeOnClick = false;
      }
    });
  }

  markersEnableCloseOnClick() {
    this._markers.forEach((marker) => {
      const popup = marker.getPopup();
      if (popup) {
        popup.options.closeOnClick = true;
      }
    });
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
      <a class="side-navigation-country-link hover-effect" style="color:#85C1E9; text-decoration: none;" href="https://${getLanguageCode()}.wikipedia.org/wiki/${
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
      marker.on(
        "click",
        function () {
          if (this._countryPlayer._isPlaying) {
            return;
          }
          this._markers.forEach((marker) => marker.disablePermanentHighlight());
          marker.enablePermanentHighlight();
        }.bind(this)
      );
      function addCountryBoundary(country, type, isCountrySelected) {
        if (this._countryPlayer._isPlaying) {
          return;
        }
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
        if (
          (type === "mouse" && this._isCountrySelected) ||
          this._countryPlayer._isPlaying
        ) {
          return;
        }
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
        if (type === "map") {
          this._isCountrySelected = false;
        }
      }
      this._map.on("click", removeCountryBoundary.bind(this, "map"));
      this._map.on("click", () => {
        if (this._countryPlayer._isPlaying) {
          return;
        }
        marker.disablePermanentHighlight();
      });
      this._markers.push(marker);
    });
  }
}

export default new mapView();
