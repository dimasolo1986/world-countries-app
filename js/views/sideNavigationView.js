import mapView from "./mapView.js";
import * as model from "../model.js";
import { localization } from "../localization/ua.js";
import { defineZoomLevelByCountryArea, getLanguageCode } from "../helpers.js";
import { COUNTRY_BOUNDS } from "../data/countriesBounds.js";
import { WORLD_MAP_BOUNDS, WAR_AGGRESSOR_COUNTRIES } from "../config.js";
class sideNavigationView {
  _parentElement = document.querySelector(".sb-sidenav-menu .nav");
  _sideNavigation = document.querySelector(".sb-sidenav");
  _sortElement = document.querySelector("#sb-sidenav-sort");
  _moveUpElement = document.querySelector("#sb-sidenav-up");
  _moveDownElement = document.querySelector("#sb-sidenav-down");
  _countryInfoModal = document.querySelector("#countryInfoModal");
  _countryInfoModalLabel = document.querySelector("#countryInfoLabel");
  _countryInfoModalClose = document.querySelector("#countryInfoModalClose");
  _countryInfoModalBody = document.querySelector(".country-info-modal-body");
  _selectedCountry;
  _errorMessage = "Failed to load side navigation menu!";

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  addCountryInfoModalClickHandler() {
    this._countryInfoModal.addEventListener("show.bs.modal", (event) => {
      this._countryInfoModalBody.innerHTML = "";
      const link = event.relatedTarget;
      const countryName = decodeURIComponent(link.getAttribute("data-country"));
      const countryElement = model.worldCountries.countries.find(
        (country) => country.name.common === countryName
      );
      if (WAR_AGGRESSOR_COUNTRIES.includes(countryElement.name.common)) {
        this._countryInfoModalBody.insertAdjacentHTML(
          "beforeend",
          `<span style="color: red; font-weight: bold;">${
            localization[model.worldCountries.language]["War Aggressor"]
          }</span><br>`
        );
      }
      const countryEmblem = countryElement.coatOfArms.png;
      const countryFlagNameHtml = `<div style="display: inline;"><img
      src=${countryElement.flags.png}
              class="country-flag-modal"
              style="width: 45px; height: 35px; border: 1px solid black; border-radius: 2px;"
            /> ${
              countryEmblem
                ? `<div style="display: inline; margin-left: 10px;"><img
        src=${countryElement.coatOfArms.png}
        class="country-emblem-modal"
        style="width: 45px; height: 45px;"/></div>`
                : ""
            }   <span
              class="country-name-modal"
              style="font-weight: bold; margin-left: 10px; font-size:1.2rem; color:#00008b;"
            >${
              localization[model.worldCountries.language]["countries"][
                countryElement.name.common
              ]
            }</span></div><br/>`;
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        countryFlagNameHtml
      );
      const countryCapital = countryElement.capital;
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        countryCapital
          ? `<span style="font-weight:bold; font-size:1.1rem; color:#00008b;">
            ${localization[model.worldCountries.language]["Capital"]}:
            <span style="font-weight:bold; font-size:1.1rem;">
              ${
                localization[model.worldCountries.language]["capitals"][
                  countryElement.capital[0]
                ]
              }
            </span>
          </span> <br />`
          : `<span style="font-weight:bold; font-size:1.1rem; color:#00008b;">
            ${localization[model.worldCountries.language]["Capital"]}:
            <span>-</span>
          </span> <br />`
      );
      const independent = countryElement.independent;
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span font-weight:bold;>${
          localization[model.worldCountries.language]["Independent"]
        }: </span><span>${
          independent
            ? localization[model.worldCountries.language]["Yes"]
            : localization[model.worldCountries.language]["No"]
        }</span>
       <br />`
      );
      const unMembership = countryElement.unMember;
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span>${
          localization[model.worldCountries.language][
            "United Nations Membership"
          ]
        }: </span><span>${
          unMembership
            ? localization[model.worldCountries.language]["Yes"]
            : localization[model.worldCountries.language]["No"]
        }</span>
       <br />`
      );
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span>${localization[model.worldCountries.language]["Region"]}: ${
          countryElement.region
            ? localization[model.worldCountries.language][countryElement.region]
            : " -"
        }</span><br />`
      );
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span>${localization[model.worldCountries.language]["Subregion"]}: ${
          countryElement.subregion
            ? localization[model.worldCountries.language][
                countryElement.subregion
              ]
            : " -"
        }</span><br />`
      );
      const landlocked = countryElement.landlocked;
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span>${
          localization[model.worldCountries.language]["Access To The Sea"]
        }: </span><span>${
          landlocked
            ? localization[model.worldCountries.language]["No"]
            : localization[model.worldCountries.language]["Yes"]
        }</span>
       <br />`
      );
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        `<span>${localization[model.worldCountries.language]["Area"]}: ${
          countryElement.area
            ? countryElement.area.toLocaleString() +
              " " +
              localization[model.worldCountries.language]["square km"]
            : " -"
        }</span><br />`
      );
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        ` <span>${localization[model.worldCountries.language]["Population"]}: ${
          countryElement.population
            ? countryElement.population.toLocaleString() +
              " " +
              localization[model.worldCountries.language]["people"]
            : " -"
        }</span><br />`
      );
      let borders = countryElement.borders;
      if (borders) {
        borders = borders
          .map((border) => {
            const country = model.worldCountries.countries.find(
              (country) => country.cca3 === border
            );
            if (country) {
              return localization[model.worldCountries.language]["countries"][
                country.name.common
              ];
            }
          })
          .join(", ");
        this._countryInfoModalBody.insertAdjacentHTML(
          "beforeend",
          ` <span>${
            localization[model.worldCountries.language]["Borders"]
          }: ${borders}</span><br />`
        );
      }
      let timezones = countryElement.timezones;
      if (timezones) {
        timezones = timezones.join(", ");
        this._countryInfoModalBody.insertAdjacentHTML(
          "beforeend",
          ` <span>${
            localization[model.worldCountries.language]["Timezones"]
          }: ${timezones}</span><br />`
        );
      }
      this._countryInfoModalBody.insertAdjacentHTML(
        "beforeend",
        ` <span>${
          localization[model.worldCountries.language]["Start Of Week"]
        }: ${
          localization[model.worldCountries.language][
            countryElement.startOfWeek.charAt(0).toUpperCase() +
              countryElement.startOfWeek.slice(1)
          ]
        }</span><br />`
      );
      let internetDomain = countryElement.tld;
      if (internetDomain) {
        internetDomain = internetDomain.join(", ");
        this._countryInfoModalBody.insertAdjacentHTML(
          "beforeend",
          ` <span>${
            localization[model.worldCountries.language]["Internet Domain"]
          }: ${internetDomain}</span>`
        );
      }
    });
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

  translateCountryInfoModalElements() {
    this._countryInfoModalLabel.innerHTML = `${
      localization[model.worldCountries.language]["Country Information"]
    }`;
    this._countryInfoModalClose.innerHTML = `${
      localization[model.worldCountries.language]["Close"]
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
     <a class="side-navigation-country-info-link hover-effect" style="color:#85C1E9; text-decoration: none;" data-bs-toggle="modal" data-bs-target="#countryInfoModal" data-country=${encodeURIComponent(
       country.name.common
     )}>${localization[model.worldCountries.language]["Information"]}</a>
     <span style="color:#ffffff80">|</span>
    <a class="side-navigation-country-link hover-effect" style="color:#85C1E9; text-decoration: none;" href="https://${getLanguageCode()}.wikipedia.org/wiki/${
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
      mapView.terminatePlayCountries();
      const target = e.target;
      if (
        countryElement.classList.contains(
          "selected-side-navigation-country-container"
        ) &&
        !target.classList.contains("side-navigation-country-link") &&
        !target.classList.contains("side-navigation-country-info-link")
      ) {
        countryElement.classList.remove(
          "selected-side-navigation-country-container"
        );
        this._selectedCountry = undefined;
        mapView.setIsCountrySelected(false);
        mapView.removeCapitalMarker();
        mapView.removeCountryBoundary();
        mapView.closeAllPopup();
        mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
      } else {
        if (
          !target.classList.contains("side-navigation-country-link") &&
          !target.classList.contains("side-navigation-country-info-link")
        ) {
          this._removeAllSelection();
          countryElement.classList.add(
            "selected-side-navigation-country-container"
          );
          this._selectedCountry = country;
          mapView.setIsCountrySelected(true);
          const countryBound = COUNTRY_BOUNDS.find(
            (bound) => country.name.common === bound.name
          );
          if (countryBound) {
            mapView.setMapViewToBounds(countryBound.bounds);
          } else {
            const zoomLevel = defineZoomLevelByCountryArea(country.area);
            mapView.setMapView(
              country.latlng ? country.latlng : country.capitalInfo.latlng,
              zoomLevel
            );
          }
          mapView.removeCapitalMarker();
          mapView.removeCountryBoundary();
          mapView.addCountryBoundary(country);
          mapView.showMarkerPopup(
            country.latlng ? country.latlng : country.capitalInfo.latlng
          );
          mapView.addCapitalMarker(
            country.coatOfArms,
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
      countryElementContainer.dataset.country = country.name.common;
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
