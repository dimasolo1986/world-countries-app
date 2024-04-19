import { GEOGRAPHICAL_CENTER } from "../config.js";
import { DEFAULT_ZOOM_LEVEL } from "../config.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import { localization } from "../localization/ua.js";
import * as model from "../model.js";

class mapView {
  _parentElement = document.querySelector("#map");
  _errorMessage = "Failed to load map!";
  _map;
  _capitalMarker;
  _countryBoundary;
  _markers = [];

  constructor() {
    this._createMap(GEOGRAPHICAL_CENTER);
  }

  _createMap(latLon, defaultZoomLevel = DEFAULT_ZOOM_LEVEL) {
    this._map = L.map("map", { minZoom: DEFAULT_ZOOM_LEVEL })
      .fitWorld()
      .setView(latLon, defaultZoomLevel);
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
      }
    ).addTo(this._map);
    this._addResetZoomToMap();
  }

  _addResetZoomToMap() {
    (function () {
      const control = new L.Control({ position: "topleft" });
      control.onAdd = function (map) {
        const resetZoom = L.DomUtil.create("a", "resetzoom");
        resetZoom.innerHTML = "Reset";
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
            map.setView(GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL);
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
  }

  invalidateSize() {
    this._map.invalidateSize();
  }

  clearMap() {
    this._map.remove();
    this._parentElement.innerHTML = "";
  }

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  _createMarkerIcon(country) {
    return L.icon({
      iconUrl: `${country.flags.png}`,
      iconSize: [20, 20],
    });
  }

  setMapView(latLon, zoomLevel) {
    this._map.setView(latLon, zoomLevel);
  }

  addCapitalMarker(latLon, capital) {
    if (latLon && capital)
      this._capitalMarker = L.marker(latLon)
        .addTo(this._map)
        .bindTooltip(capital);
  }

  removeCapitalMarker() {
    if (this._capitalMarker) this._map.removeLayer(this._capitalMarker);
  }

  _removeAllMarkersFromMap() {
    this._markers.forEach((marker) => this._map.removeLayer(marker));
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
            maxWidth: 200,
            minWidth: 200,
            maxHeight: 200,
            autoClose: true,
            closeOnClick: true,
            className: `${country.name.common}-popup`,
          })
        ).setPopupContent(`<img src="${
        country.flags.png
      }" style="width:30px; height:20px; border: 1px solid black;">
        <span style="font-weight:bold">${
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ]
        }</span> <br />
        <span>${
          localization[model.worldCountries.language]["Capital"]
        }: </span><span style="font-weight:bold">${
        country.capital
          ? localization[model.worldCountries.language]["capitals"][
              country.capital[0]
            ]
          : " "
      }</span><br />
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
      }</span><br />`);
      this._markers.push(marker);
    });
  }
}

export default new mapView();
