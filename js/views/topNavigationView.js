import * as model from "../model.js";
import { localization } from "../localization/ua.js";
class topNavigationView {
  _parentElement = document.querySelector(".sb-topnav");
  _sidebarToggle = document.body.querySelector("#sidebarToggle");
  _logoCountriesElement = document.querySelector(".logo-countries");
  _worldMapLink = document.querySelector("#world-map-link");
  _worldMapLi = document.querySelector("#world-map-li");
  _countryOnMapLi = document.querySelector("#country-on-map-li");
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
  _aboutLi = document.querySelector("#about-li");

  addHandlerQuizClick(handler) {
    this._flagByCountryNameQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._countryNameByFlagQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._countryCapitalByFlagQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._flagByCountryCapitalQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._countryNameByCapitalQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._countryCapitalByCountryNameQuizLink.addEventListener(
      "click",
      function () {
        const quizType = this.dataset.quiz;
        localStorage.setItem("currentWindow", quizType);
        handler(quizType);
      }
    );
    this._countryOnMapQuizLink.addEventListener("click", function () {
      const quizType = this.dataset.quiz;
      localStorage.setItem("currentWindow", quizType);
      handler(quizType);
    });
    this._countryOnMapLi.addEventListener("click", function (e) {
      if (e.target.id === "country-on-map-li") {
        localStorage.setItem("currentWindow", "country-on-map-quiz");
        handler("country-on-map-quiz");
      }
    });
  }

  addHandlerWorldMapClick(handler) {
    this._worldMapLink.addEventListener("click", function (e) {
      if (e.target.id === "world-map-link") {
        localStorage.setItem("currentWindow", "map");
        handler();
      }
    });
    this._worldMapLi.addEventListener("click", function (e) {
      if (e.target.id === "world-map-li") {
        localStorage.setItem("currentWindow", "map");
        handler();
      }
    });
  }

  addHandlerAboutClick(handler) {
    this._aboutLink.addEventListener("click", function (e) {
      if (e.target.id === "about") {
        localStorage.setItem("currentWindow", "about-project");
        handler();
      }
    });
    this._aboutLi.addEventListener("click", function (e) {
      if (e.target.id === "about-li") {
        localStorage.setItem("currentWindow", "about-project");
        handler();
      }
    });
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
    this._worldMapLink.textContent = `${
      localization[model.worldCountries.language]["World Map"]
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
        if (localStorage.getItem("sb|sidebar-toggle") === "true") {
          document.body.classList.toggle("sb-sidenav-toggled");
        }
        this._sidebarToggle.addEventListener("click", (event) => {
          event.preventDefault();
          document.body.classList.toggle("sb-sidenav-toggled");
          localStorage.setItem(
            "sb|sidebar-toggle",
            document.body.classList.contains("sb-sidenav-toggled")
          );
        });
      }
    });
  };
}

export default new topNavigationView();
