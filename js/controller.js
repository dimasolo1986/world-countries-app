import * as model from "./model.js";
import mapView from "./views/mapView.js";
import sideNavigationView from "./views/sideNavigationView.js";
import countriesSelectView from "./views/countriesSelectView.js";
import languageSelectView from "./views/languageSelectView.js";
import topNavigationView from "./views/topNavigationView.js";
import { localization } from "./localization/ua.js";
import { GEOGRAPHICAL_CENTER } from "./config.js";
import { DEFAULT_ZOOM_LEVEL } from "./config.js";
import { sortData } from "./helpers.js";
const init = function () {
  initSideBar();
  mapView.addHandlerRender(mapCountriesMarkerRender);
  sideNavigationView.addHandlerRender(sideNavigationCountriesRender);
  sideNavigationView.addSortCountriesHandler(countriesSortHandler);
  sideNavigationView.addMoveUpCountriesHandler();
  sideNavigationView.addMoveDownCountriesHandler();
  countriesSelectView.addHandlerRender(countriesSelectRender);
  countriesSelectView.countriesSelectionHandler(countriesSelectionHandler);
  languageSelectView.addHandlerSelect(languageSelectHandler);
  // resetLocalStorageOnCloseTab();
};

const languageSelectHandler = function (language) {
  model.worldCountries.language = language;
  sortData(model.worldCountries.countries);
  sortData(model.worldCountries.selectedCountries);
  sideNavigationView.translateSortMoveElements();
  mapView.translateElements();
  renderAll();
};

const renderAll = function () {
  mapView.renderCountriesMarkers(model.worldCountries.countries);
  sideNavigationView.renderSideNavigationCountries(
    model.worldCountries.countries
  );
  countriesSelectView.renderOptions(model.worldCountries);
};

const countriesSelectRender = function () {
  countriesSelectView.renderOptions(model.worldCountries);
};

const countriesSortHandler = function (sortDirection) {
  if (sortDirection === "asc") {
    sortData(model.worldCountries.countries);
    sortData(model.worldCountries.selectedCountries);
  } else {
    sortData(model.worldCountries.countries, "desc");
    sortData(model.worldCountries.selectedCountries, "desc");
  }
  sideNavigationView.renderSideNavigationCountries(
    model.worldCountries.selectedCountries.length !== 0
      ? model.worldCountries.selectedCountries
      : model.worldCountries.countries
  );
};

const countriesSelectionHandler = function (selectedCountriesNames) {
  model.worldCountries.selectedCountries = [];
  sideNavigationView._selectedCountry = undefined;
  document.body.classList.remove("sb-sidenav-toggled");
  mapView.setMapView(GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL);
  if (selectedCountriesNames.length !== 0) {
    selectedCountriesNames.forEach((countryName) => {
      const country = model.worldCountries.countries.find(
        (country) =>
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ] === countryName
      );
      if (country) model.worldCountries.selectedCountries.push(country);
    });
    sideNavigationView.renderSideNavigationCountries(
      model.worldCountries.selectedCountries
    );
    mapView.renderCountriesMarkers(model.worldCountries.selectedCountries);
  } else {
    sideNavigationView.renderSideNavigationCountries(
      model.worldCountries.countries
    );
    mapView.renderCountriesMarkers(model.worldCountries.countries);
  }
};

const mapCountriesMarkerRender = function () {
  mapView.renderCountriesMarkers(model.worldCountries.countries);
};

const sideNavigationCountriesRender = function () {
  sideNavigationView.renderSideNavigationCountries(
    model.worldCountries.countries
  );
};

const resetLocalStorageOnCloseTab = function () {
  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    this.localStorage.removeItem("countries");
  });
};

const initSideBar = function () {
  window.addEventListener("DOMContentLoaded", (event) => {
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector("#sidebarToggle");
    if (sidebarToggle) {
      if (localStorage.getItem("sb|sidebar-toggle") === "true") {
        document.body.classList.toggle("sb-sidenav-toggled");
      }
      sidebarToggle.addEventListener("click", (event) => {
        event.preventDefault();
        document.body.classList.toggle("sb-sidenav-toggled");
        mapView.invalidateSize();
        localStorage.setItem(
          "sb|sidebar-toggle",
          document.body.classList.contains("sb-sidenav-toggled")
        );
      });
    }
  });
};

init();
