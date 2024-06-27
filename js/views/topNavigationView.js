import * as model from "../model.js";
import { localization } from "../localization/ua.js";
import {
  FLAG_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_NAME_BY_FLAG_QUIZ,
  COUNTRY_CAPITAL_BY_FLAG_QUIZ,
  FLAG_BY_COUNTRY_CAPITAL_QUIZ,
  COUNTRY_NAME_BY_CAPITAL_QUIZ,
  COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_ON_MAP_QUIZ,
} from "../config.js";
class topNavigationView {
  _parentElement = document.querySelector(".sb-topnav");
  _sidebarToggle = document.body.querySelector("#sidebarToggle");
  _menuLink = document.querySelector("#navbarDropdown");
  _logoCountriesElement = document.querySelector(".logo-countries");
  _worldMapLink = document.querySelector("#world-map-link");
  _flagByCountryNameQuizLink = document.querySelector(
    "#flag-by-country-name-quiz-link"
  );
  _countryNameByFlagQuizLink = document.querySelector(
    "#country-name-by-flag-quiz-link"
  );
  _countryCapitalByFlagQuizLink = document.querySelector(
    "#country-capital-by-flag-quiz-link"
  );
  _flagByCountryCapitalQuizLink = document.querySelector(
    "#flag-by-capital-quiz-link"
  );
  _countryNameByCapitalQuizLink = document.querySelector(
    "#country-name-by-capital-quiz-link"
  );
  _countryCapitalByCountryNameQuizLink = document.querySelector(
    "#capital-by-country-name-quiz-link"
  );
  _countryOnMapQuizLink = document.querySelector("#country-on-map-quiz-link");
  _aboutLink = document.querySelector("#about");
  _statisticLink = document.querySelector("#statistic");
  _dropdownMenuElements = document.querySelectorAll(".dropdown-menu li");

  resetItemMenuStyle() {
    this._dropdownMenuElements.forEach(
      (item) => (item.style.backgroundColor = "white")
    );
  }

  initItemMenuStyle() {
    this.resetItemMenuStyle();
    const currentWindow = sessionStorage.getItem("currentWindow");
    if (currentWindow) {
      switch (currentWindow) {
        case "map":
          this._worldMapLink.closest("li").style.backgroundColor = "lightgrey";
          break;
        case "about-project":
          this._aboutLink.closest("li").style.backgroundColor = "lightgrey";
          break;
        case "statistic":
          this._statisticLink.closest("li").style.backgroundColor = "lightgrey";
          break;
        case FLAG_BY_COUNTRY_NAME_QUIZ:
          this._flagByCountryNameQuizLink.closest("li").style.backgroundColor =
            "lightgrey";
          break;
        case COUNTRY_NAME_BY_FLAG_QUIZ:
          this._countryNameByFlagQuizLink.closest("li").style.backgroundColor =
            "lightgrey";
          break;
        case COUNTRY_CAPITAL_BY_FLAG_QUIZ:
          this._countryCapitalByFlagQuizLink.closest(
            "li"
          ).style.backgroundColor = "lightgrey";
          break;
        case FLAG_BY_COUNTRY_CAPITAL_QUIZ:
          this._flagByCountryCapitalQuizLink.closest(
            "li"
          ).style.backgroundColor = "lightgrey";
          break;
        case COUNTRY_NAME_BY_CAPITAL_QUIZ:
          this._countryNameByCapitalQuizLink.closest(
            "li"
          ).style.backgroundColor = "lightgrey";
          break;
        case COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ:
          this._countryCapitalByCountryNameQuizLink.closest(
            "li"
          ).style.backgroundColor = "lightgrey";
          break;
        case COUNTRY_ON_MAP_QUIZ:
          this._countryOnMapQuizLink.closest("li").style.backgroundColor =
            "lightgrey";
          break;
      }
    } else {
      this._worldMapLink.closest("li").style.backgroundColor = "lightgrey";
    }
  }

  addHandlerQuizClick(handler) {
    const handlerQuizClick = function (link) {
      const quizType = link.dataset.quiz;
      this.resetItemMenuStyle();
      link.closest("li").style.backgroundColor = "lightgrey";
      sessionStorage.setItem("currentWindow", quizType);
      handler(quizType);
    };
    this._flagByCountryNameQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._flagByCountryNameQuizLink)
      );
    this._countryNameByFlagQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._countryNameByFlagQuizLink)
      );
    this._countryCapitalByFlagQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._countryCapitalByFlagQuizLink)
      );
    this._flagByCountryCapitalQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._flagByCountryCapitalQuizLink)
      );
    this._countryNameByCapitalQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._countryNameByCapitalQuizLink)
      );
    this._countryCapitalByCountryNameQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._countryCapitalByCountryNameQuizLink)
      );
    this._countryOnMapQuizLink
      .closest("li")
      .addEventListener(
        "click",
        handlerQuizClick.bind(this, this._countryOnMapQuizLink)
      );
  }

  addHandlerWorldMapClick(handler) {
    const handlerWorldMapClick = function (link) {
      this.resetItemMenuStyle();
      link.closest("li").style.backgroundColor = "lightgrey";
      sessionStorage.setItem("currentWindow", "map");
      handler();
    };
    this._worldMapLink
      .closest("li")
      .addEventListener(
        "click",
        handlerWorldMapClick.bind(this, this._worldMapLink)
      );
  }

  addHandlerAboutClick(handler) {
    const handlerAboutClick = function (link) {
      this.resetItemMenuStyle();
      link.closest("li").style.backgroundColor = "lightgrey";
      sessionStorage.setItem("currentWindow", "about-project");
      handler();
    };
    this._aboutLink
      .closest("li")
      .addEventListener("click", handlerAboutClick.bind(this, this._aboutLink));
  }

  addHandlerStatisticClick(handler) {
    const handlerStatisticClick = function (link) {
      this.resetItemMenuStyle();
      link.closest("li").style.backgroundColor = "lightgrey";
      sessionStorage.setItem("currentWindow", "statistic");
      handler();
    };
    this._statisticLink
      .closest("li")
      .addEventListener(
        "click",
        handlerStatisticClick.bind(this, this._statisticLink)
      );
  }

  translateElements() {
    this._flagByCountryNameQuizLink.textContent = `${
      localization[model.worldCountries.language]["Flag By Country Name Quiz"]
    }`;
    this._countryNameByFlagQuizLink.textContent = `${
      localization[model.worldCountries.language]["Country Name By Flag Quiz"]
    }`;
    this._countryCapitalByFlagQuizLink.textContent = `${
      localization[model.worldCountries.language][
        "Country Capital By Flag Quiz"
      ]
    }`;
    this._flagByCountryCapitalQuizLink.textContent = `${
      localization[model.worldCountries.language][
        "Flag By Country Capital Quiz"
      ]
    }`;
    this._countryNameByCapitalQuizLink.textContent = `${
      localization[model.worldCountries.language][
        "Country Name By Capital Quiz"
      ]
    }`;
    this._countryCapitalByCountryNameQuizLink.textContent = `${
      localization[model.worldCountries.language][
        "Capital By Country Name Quiz"
      ]
    }`;
    this._countryOnMapQuizLink.textContent = `${
      localization[model.worldCountries.language]["Country On Map Quiz"]
    }`;
    this._aboutLink.textContent = `${
      localization[model.worldCountries.language]["About Project"]
    }`;
    this._statisticLink.textContent = `${
      localization[model.worldCountries.language]["Quiz Passing Statistics"]
    }`;
    this._worldMapLink.textContent = `${
      localization[model.worldCountries.language]["World Map"]
    }`;
    this._menuLink.textContent = `${
      localization[model.worldCountries.language]["MENU"]
    }`;
  }

  hideSideNavigation() {
    document.body.classList.add("sb-sidenav-toggled");
  }

  showSideNavigation() {
    document.body.classList.remove("sb-sidenav-toggled");
  }

  disableSideBarToggle() {
    this._sidebarToggle.disabled = true;
    this._sidebarToggle.style.cursor = "none";
  }

  enableSideBarToggle() {
    this._sidebarToggle.disabled = false;
    this._sidebarToggle.style.cursor = "pointer";
  }

  initSideBar = function () {
    window.addEventListener("DOMContentLoaded", (event) => {
      if (this._sidebarToggle) {
        this._sidebarToggle.addEventListener("click", (event) => {
          event.preventDefault();
          document.body.classList.toggle("sb-sidenav-toggled");
          sessionStorage.setItem(
            "sb|sidebar-toggle",
            document.body.classList.contains("sb-sidenav-toggled")
          );
        });
      }
    });
  };
}

export default new topNavigationView();
