import { GEOGRAPHICAL_CENTER } from "../config.js";
import { DEFAULT_ZOOM_LEVEL } from "../config.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import { WAR_AGGRESSOR_COUNTRIES } from "../config.js";
import { localization } from "../localization/ua.js";
import * as model from "../model.js";

class mapView {
  _parentElement = document.querySelector("#map");
  _errorMessage = "Failed to load map!";
  _map;
  _capitalMarker;
  _developmentPlaceMarker;
  _countryBoundary;
  _markers = [];

  constructor() {
    this._createMap(GEOGRAPHICAL_CENTER);
  }

  _createMap(latLon, defaultZoomLevel = DEFAULT_ZOOM_LEVEL) {
    this._map = L.map("map", {
      minZoom: DEFAULT_ZOOM_LEVEL,
      zoomSnap: 0.25,
      worldCopyJump: true,
    })
      .fitWorld()
      .setView(latLon, defaultZoomLevel);
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
      }
    ).addTo(this._map);
    this.addDevelopmentPlaceMarker();
    this._addResetZoomToMap();
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
        resetZoom.style.border = "2px solid rgba(0,0,0,0.2)";
        resetZoom.style.borderRadius = "2px";
        resetZoom.style.padding = "1px";
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
      this._countryBoundary = L.geoJson(countryGeo).addTo(this._map);
    }
  }

  renderCountriesMarkers(worldCountries) {
    this._removeAllMarkersFromMap();
    worldCountries.forEach((country) => {
      const marker = L.marker(
        country.latlng ? country.latlng : country.capitalInfo.latlng,
        {
          icon: this._createMarkerIcon(country),
        }
      )
        .addTo(this._map)
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
      }" style="width:30px; height:20px; border: 1px solid black;"> ${
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
      this._markers.push(marker);
    });
  }
}

export default new mapView();
