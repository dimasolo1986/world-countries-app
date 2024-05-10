import mapView from "./mapView.js";
import * as model from "../model.js";
import { localization } from "../localization/ua.js";
import { defineZoomLevelByCountryArea } from "../helpers.js";
import { GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL } from "../config.js";
class sideNavigationView {
  _parentElement = document.querySelector(".sb-sidenav-menu .nav");
  _sideNavigation = document.querySelector(".sb-sidenav");
  _sortElement = document.querySelector("#sb-sidenav-sort");
  _moveUpElement = document.querySelector("#sb-sidenav-up");
  _moveDownElement = document.querySelector("#sb-sidenav-down");
  _selectedCountry;
  _errorMessage = "Failed to load side navigation menu!";

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  addMoveUpCountriesHandler() {
    const moveUp = function () {
      const firstChildElement = this._parentElement.firstElementChild;
      if (firstChildElement) firstChildElement.scrollIntoView();
    };
    this._moveUpElement.addEventListener("click", moveUp.bind(this));
  }

  addMoveDownCountriesHandler() {
    const moveDown = function () {
      const lastChildElement = this._parentElement.lastElementChild;
      if (lastChildElement) lastChildElement.scrollIntoView();
    };
    this._moveDownElement.addEventListener("click", moveDown.bind(this));
  }

  translateSortMoveElements() {
    this._sortElement.innerHTML = `${
      localization[model.worldCountries.language]["Sort"] + " &#8645;"
    }`;
    this._moveUpElement.innerHTML = `${
      localization[model.worldCountries.language]["Up"] + " &uarr;"
    }`;
    this._moveDownElement.innerHTML = `${
      localization[model.worldCountries.language]["Down"] + " &darr;"
    }`;
  }

  addSortCountriesHandler(handler) {
    this._sortElement.addEventListener("click", function () {
      this.dataset.sort === "asc" ? handler("desc") : handler("asc");
      this.dataset.sort = this.dataset.sort === "asc" ? "desc" : "asc";
    });
  }

  _createCountryElement(country) {
    return `<div class="side-navigation-country-img-container hover-effect"><img class="side-navigation-country-img" src="${
      country.flags.png
    }"></div><div class="side-navigation-country-name">${
      localization[model.worldCountries.language]["countries"][
        country.name.common
      ]
    }<br>
    <a class="side-navigation-country-link hover-effect" style="color:#85C1E9; text-decoration: none;" href="https://${
      model.worldCountries.language === "ua" ? "uk" : "en"
    }.wikipedia.org/wiki/${
      localization[model.worldCountries.language]["countries"][
        country.name.common
      ]
    }" target="_blank" rel="external">${
      localization[model.worldCountries.language]["Wikipedia"]
    }</a>
   </div>`;
  }

  _removeAllSelection() {
    this._parentElement.childNodes.forEach((child) =>
      child.classList.remove("selected-side-navigation-country-container")
    );
  }

  addContryClickHandler(countryElement, country) {
    const countryClickFunction = function (e) {
      if (
        countryElement.classList.contains(
          "selected-side-navigation-country-container"
        )
      ) {
        countryElement.classList.remove(
          "selected-side-navigation-country-container"
        );
        this._selectedCountry = undefined;
        mapView.removeCapitalMarker();
        mapView.removeCountryBoundary();
        mapView.setMapView(GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL);
      } else {
        this._removeAllSelection();
        countryElement.classList.add(
          "selected-side-navigation-country-container"
        );
        this._selectedCountry = country;
        const target = e.target;
        if (!target.classList.contains("side-navigation-country-link")) {
          const zoomLevel = defineZoomLevelByCountryArea(country.area);
          mapView.setMapView(
            country.latlng ? country.latlng : country.capitalInfo.latlng,
            zoomLevel
          );
          mapView.removeCapitalMarker();
          mapView.removeCountryBoundary();
          mapView.addCountryBoundary(country);
          mapView.addCapitalMarker(
            country.capitalInfo?.latlng,
            country.capital
              ? localization[model.worldCountries.language]["capitals"][
                  country.capital[0]
                ]
              : ""
          );
        }
      }
    };
    countryElement.addEventListener("click", countryClickFunction.bind(this));
  }

  _createElementFromHTML(htmlString) {
    return document.createRange().createContextualFragment(htmlString);
  }

  _clearSideNavigation() {
    this._parentElement.innerHTML = "";
  }

  hideSideNavigation() {
    this._sideNavigation.classList.add("not-displayed");
  }

  showSideNavigation() {
    document.body.classList.remove("sb-sidenav-toggled");
  }

  renderSideNavigationCountries(worldCountries) {
    this._clearSideNavigation();
    worldCountries.forEach((country) => {
      const countryElementContainer = document.createElement("div");
      countryElementContainer.classList.add(
        "side-navigation-country-container"
      );
      if (this._selectedCountry && this._selectedCountry === country)
        countryElementContainer.classList.add(
          "selected-side-navigation-country-container"
        );
      const countryElement = this._createCountryElement(country);
      countryElementContainer.appendChild(
        this._createElementFromHTML(countryElement)
      );
      this.addContryClickHandler(countryElementContainer, country);
      this._parentElement.appendChild(countryElementContainer);
    });
  }
}

export default new sideNavigationView();
