import { localization } from "../localization/ua.js";
import { WORLD_MAP_BOUNDS, WAR_AGGRESSOR_COUNTRIES } from "../config.js";
import { getLanguageCode } from "../helpers.js";
import * as model from "../model.js";
class flagsView {
  _parentElement = document.querySelector("#countries-flags");
  _flagsHeading = document.querySelector(".flags-name");
  _flagsRegionSelector = document.querySelector(".flags-selector");
  _flagsData = document.querySelector(".flags-data");
  _flagsReturnToMap = document.querySelector(".return-flags");
  _moveUpElement = document.querySelector(".countries-flags-up-button");
  _countries;

  _returnToMapListenerAdded = false;
  _flagsRegionSelectorListenerAdded = false;
  _moveUpListenerAdded = false;

  returnToMap(
    mapView,
    aboutView,
    statisticView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this.hideFlags();
    aboutView.hideAboutProject();
    statisticView.hideStatistic();
    mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
    mapView.showMap();
    mapView.invalidateSize();
    sideNavigationView.showSideNavigation();
    topNavigationView.enableSideBarToggle();
    countriesSelectView.enableCountriesSelect();
    sessionStorage.setItem("currentWindow", "map");
    topNavigationView.initItemMenuStyle();
  }

  flagsRegionSelectHandler() {
    const flagsRegionSelector = function () {
      this.filterCountries();
      this.renderFlagsData();
    };
    if (!this._flagsRegionSelectorListenerAdded) {
      this._flagsRegionSelector.addEventListener(
        "change",
        flagsRegionSelector.bind(this)
      );
      this._flagsRegionSelectorListenerAdded = true;
    }
  }

  setFlagsRegionDefaultValue() {
    this._flagsRegionSelector.value = "All Countries";
  }

  filterCountries() {
    if (this._flagsRegionSelector.value === "All Countries") {
      this._countries = model.worldCountries.countries.slice();
    } else if (this._flagsRegionSelector.value === "Europe") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Europe");
    } else if (this._flagsRegionSelector.value === "Americas") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Americas");
    } else if (this._flagsRegionSelector.value === "Africa") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Africa");
    } else if (this._flagsRegionSelector.value === "Asia") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Asia");
    } else if (this._flagsRegionSelector.value === "Oceania") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Oceania");
    } else if (this._flagsRegionSelector.value === "Antarctic") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.region === "Antarctic");
    }
  }

  addReturnToMapHandlerClick(
    mapView,
    aboutView,
    statisticView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._flagsReturnToMap.addEventListener(
        "click",
        this.returnToMap.bind(
          this,
          mapView,
          aboutView,
          statisticView,
          sideNavigationView,
          topNavigationView,
          countriesSelectView
        )
      );
      this._returnToMapListenerAdded = true;
    }
  }

  getRegionColor(region) {
    if (region === "Europe") return "deepskyblue";
    if (region === "Asia") return "orange";
    if (region === "Africa") return "black";
    if (region === "Americas") return "red";
    if (region === "Oceania") return "green";
    if (region === "Antarctic") return "darkblue";
  }

  addMoveUpCountriesHandler() {
    const moveUp = function () {
      this._parentElement.scrollIntoView();
    };
    if (!this._moveUpListenerAdded) {
      this._moveUpElement.addEventListener("click", moveUp.bind(this));
      this._moveUpListenerAdded = true;
    }
  }

  renderFlagsData() {
    this._flagsData.innerHTML = "";
    const countryRow = document.createElement("div");
    countryRow.className = "row";
    countryRow.style.display = "flex";
    countryRow.style.flexWrap = "wrap";
    const countriesNumberContainer = document.createElement("div");
    countriesNumberContainer.style.color = "black";
    countriesNumberContainer.style.fontWeight = "bold";
    countriesNumberContainer.style.marginBottom = "3px";
    countriesNumberContainer.style.fontSize = "0.8rem";
    countriesNumberContainer.style.textAlign = "center";
    const countriesSpan = document.createElement("span");
    countriesSpan.textContent =
      localization[model.worldCountries.language]["Countries"] + ": ";
    const countriesNumber = document.createElement("span");
    this.filterCountries();
    countriesNumber.textContent = this._countries.length;
    countriesNumberContainer.appendChild(countriesSpan);
    countriesNumberContainer.appendChild(countriesNumber);
    this._flagsData.appendChild(countriesNumberContainer);
    this._countries.forEach((country) => {
      const countryHtml = `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 column">
      <div class="card text-center">
  <img src="${
    country.flags.png
  }" loading="lazy" style="width: 115px; height: 65px; border-radius: 5px; border: 2px solid black; object-fit: cover; margin-top:10px;" class="card-img-top" alt="${
        localization[model.worldCountries.language]["countries"][
          country.name.common
        ]
      }">
      
  <div class="card-body" style="width: 100%; padding: 0.5rem 0.5rem 0.5rem 0.5rem">
  <div class="country-name" style="font-size: 1.2rem; font-weight: bold; color: darkblue;">${
    localization[model.worldCountries.language]["countries"][
      country.name.common
    ]
  }</div>
   ${
     WAR_AGGRESSOR_COUNTRIES.includes(country.name.common)
       ? `<div style="color: red">${
           localization[model.worldCountries.language]["War Aggressor"]
         }</div>`
       : ""
   }
    <div class="country-region" style="width: fit-content; border: thick double white; border-radius: 12px; color: white; background-color: ${this.getRegionColor(
      country.region
    )}; padding: 3px 10px; margin: 0 auto; margin-top: 5px;"><i class="fas fa-globe-europe"></i><span class="country-region-text" style="margin-left:5px;">${
        country.region
          ? localization[model.worldCountries.language][country.region]
          : " -"
      }<span></div>
    <div class="country-capital" style="margin-top: 5px;"><i class="fa-solid fa-city"></i><span style="margin-left:5px;" class="country-capital-text">${
      country.capital
        ? localization[model.worldCountries.language]["capitals"][
            country.capital[0]
          ]
        : "-"
    }</span></div>
    <div style="margin-top:5px;">
    <a href="https://${getLanguageCode()}.wikipedia.org/wiki/${
        localization[model.worldCountries.language]["countries"][
          country.name.common
        ]
      }" class="hover-effect" target="_blank" rel="external" style="color:#85C1E9; text-decoration: none;">${
        localization[model.worldCountries.language]["Wikipedia"]
      }</a></div>
  </div>
</div></div>`;
      countryRow.insertAdjacentHTML("beforeend", countryHtml);
    });
    this._flagsData.appendChild(countryRow);
  }

  showFlagsInfo() {
    this.showFlags();
  }

  showFlags() {
    this._parentElement.classList.remove("not-displayed");
  }

  hideFlags() {
    this._parentElement.classList.add("not-displayed");
  }

  translateElements() {
    this._flagsReturnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO WORLD MAP"]
    }`;
    this._flagsHeading.textContent = `${
      localization[model.worldCountries.language]["World Countries Flags"]
    }`;
    const options = Array.from(this._flagsRegionSelector.options);
    options.forEach((option) => {
      option.textContent =
        localization[model.worldCountries.language][option.value];
    });
    this.renderFlagsData();
  }
}

export default new flagsView();
