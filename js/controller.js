import * as model from "./model.js";
import mapView from "./views/mapView.js";
import sideNavigationView from "./views/sideNavigationView.js";
import countriesSelectView from "./views/countriesSelectView.js";
import languageSelectView from "./views/languageSelectView.js";
import topNavigationView from "./views/topNavigationView.js";
import quiz from "./views/quiz.js";
import mapQuiz from "./views/mapQuiz.js";
import aboutView from "./views/aboutView.js";
import statisticView from "./views/statisticView.js";
import flagsView from "./views/flagsView.js";
import donateAuthorView from "./views/donateAuthorView.js";
import { localization } from "./localization/ua.js";
import { COUNTRY_ON_MAP_QUIZ } from "./config.js";
import { WORLD_MAP_BOUNDS } from "./config.js";
import { sortData, shareQuizResults } from "./helpers.js";
const init = function () {
  languageSelectView.init();
  mapView.addHandlerRender(mapCountriesMarkerRender);
  mapView.setSideNavigationView(sideNavigationView);
  mapView.setTopNavigationView(topNavigationView);
  mapView.setCountriesSelectView(countriesSelectView);
  topNavigationView.initSideBar();
  translateAllElements();
  sideNavigationView.addHandlerRender(sideNavigationCountriesRender);
  sideNavigationView.addSortCountriesHandler(countriesSortHandler);
  sideNavigationView.addMoveUpCountriesHandler();
  sideNavigationView.addMoveDownCountriesHandler();
  sideNavigationView.addCountryInfoModalClickHandler();
  countriesSelectView.addHandlerRender(countriesSelectRender);
  countriesSelectView.countriesSelectionHandler(countriesSelectionHandler);
  languageSelectView.addHandlerSelect(languageSelectHandler);
  topNavigationView.addHandlerWorldMapClick(worldMapHandlerClick);
  topNavigationView.addHandlerAboutClick(aboutProjectHandlerClick);
  topNavigationView.addHandlerStatisticClick(statisticHandlerClick);
  topNavigationView.addHandlerFlagsClick(flagsHandlerClick);
  topNavigationView.addHandlerDonateAuthorClick(donateAuthorClick);
  topNavigationView.addHandlerQuizClick(quizSelectionHandler);
  topNavigationView.initItemMenuStyle();
  aboutView.addReturnToMapHandlerClick(
    mapView,
    statisticView,
    flagsView,
    donateAuthorView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  statisticView.addReturnToMapHandlerClick(
    mapView,
    aboutView,
    flagsView,
    donateAuthorView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  flagsView.addReturnToMapHandlerClick(
    mapView,
    aboutView,
    statisticView,
    donateAuthorView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  donateAuthorView.addReturnToMapHandlerClick(
    mapView,
    statisticView,
    flagsView,
    aboutView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  donateAuthorView.addShareWebSiteHandlerClick();
  flagsView.flagsRegionSelectHandler();
  flagsView.addMoveUpCountriesHandler();
  saveCurrentLanguageHandler();
  loadWindow();
  document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("hide.bs.modal", function () {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    });
    const quizResultsShareButton = document.getElementById("shareQuizResults");
    if (quizResultsShareButton) {
      quizResultsShareButton.addEventListener("click", () => {
        shareQuizResults();
      });
    }
    const shareWebSiteContent = {
      title: `${
        localization[model.worldCountries.language][
          "World Countries And Quizzes"
        ]
      }`,
      text: `${
        localization[model.worldCountries.language][
          "World Countries And Quizzes"
        ]
      } - ${
        document.querySelector(".about-project-description").textContent +
        " " +
        document.querySelector(".about-info").textContent
      }`,
      url: "https://www.worldcountriesquiz.com",
    };
    const shareWebSiteButton = document.getElementById("shareWebSite");
    if (shareWebSiteButton) {
      shareWebSiteButton.addEventListener("click", function () {
        if (navigator.share) {
          navigator
            .share(shareWebSiteContent)
            .then(function () {})
            .catch(function () {});
        }
      });
    }
    const shareWebSiteCountryInfo = document.getElementById(
      "shareCountryInfoModal"
    );
    if (shareWebSiteCountryInfo) {
      shareWebSiteCountryInfo.addEventListener("click", function () {
        if (navigator.share) {
          navigator
            .share(shareWebSiteContent)
            .then(function () {})
            .catch(function () {});
        }
      });
    }
  });
};

const loadWindow = function () {
  const savedWindow = sessionStorage.getItem("currentWindow");
  if (savedWindow) {
    switch (savedWindow) {
      case "map":
        loadWorldMap();
        break;
      case "about-project":
        loadAboutProject();
        break;
      case "statistic":
        loadStatistic();
        break;
      case "donate-author":
        loadDonateAuthor();
        break;
      case "flags":
        loadFlags();
        break;
      default:
        loadQuiz(savedWindow);
        break;
    }
  } else {
    loadWorldMap();
  }
};

const loadWorldMap = function () {
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  aboutView.hideAboutProject();
  statisticView.hideStatistic();
  donateAuthorView.hideDonateProject();
  flagsView.hideFlags();
  countriesSelectView.enableCountriesSelect();
  mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
  mapView.showMap();
  mapView.invalidateSize();
  if (window.screen.width < 650) {
    topNavigationView.hideSideNavigation();
  } else {
    topNavigationView.showSideNavigation();
  }
  topNavigationView.enableSideBarToggle();
};

const loadAboutProject = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  donateAuthorView.hideDonateProject();
  countriesSelectView.disableCountriesSelect();
  statisticView.hideStatistic();
  flagsView.hideFlags();
  aboutView.showAboutProjectInfo();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadStatistic = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  donateAuthorView.hideDonateProject();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.showStatistic();
  flagsView.hideFlags();
  statisticView.renderStatisticData();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadDonateAuthor = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.hideStatistic();
  donateAuthorView.showDonateInfo();
  flagsView.hideFlags();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadFlags = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.hideStatistic();
  donateAuthorView.hideDonateProject();
  flagsView.showFlags();
  flagsView.setFlagsRegionDefaultValue();
  flagsView.renderFlagsData();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadQuiz = function (quizId) {
  topNavigationView.hideSideNavigation();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.hideStatistic();
  flagsView.hideFlags();
  donateAuthorView.hideDonateProject();
  if (quizId === COUNTRY_ON_MAP_QUIZ) {
    quiz.hideQuiz();
    mapView.hideMap();
    mapQuiz.showQuiz();
    mapQuiz.initQuiz(
      mapView,
      statisticView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
  } else {
    mapQuiz.hideQuiz();
    quiz.startQuiz(
      quizId,
      mapView,
      statisticView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
  }
  topNavigationView.disableSideBarToggle();
};

const worldMapHandlerClick = function () {
  loadWorldMap();
};

const aboutProjectHandlerClick = function () {
  loadAboutProject();
};

const statisticHandlerClick = function () {
  loadStatistic();
};

const flagsHandlerClick = function () {
  loadFlags();
};

const donateAuthorClick = function () {
  loadDonateAuthor();
};

const quizSelectionHandler = function (quizId) {
  loadQuiz(quizId);
};

const translateAllElements = function () {
  sideNavigationView.translateSortMoveElements();
  sideNavigationView.translateCountryInfoModalElements();
  topNavigationView.translateElements();
  quiz.translateElements();
  aboutView.translateElements();
  mapView.translateElements();
  mapQuiz.translateElements();
  statisticView.translateElements();
  flagsView.translateElements();
  donateAuthorView.translateElements();
};

const languageSelectHandler = function (language) {
  saveLanguage(language);
  location.reload();
  model.worldCountries.language = language;
  model.loadAllCountries();
  sortData(model.worldCountries.countries);
  sortData(model.worldCountries.selectedCountries);
  sideNavigationView._selectedCountry = undefined;
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
  mapView.stopCountryPlayer();
  mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
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

const saveLanguage = function (language) {
  localStorage.setItem("language", language);
};

const saveCurrentLanguageHandler = function () {
  window.addEventListener("beforeunload", function () {
    const currentLanguage = document.querySelector("#language-selector").value;
    saveLanguage(currentLanguage);
  });
};

init();

export function loadQuizOnMap(quizId) {
  loadQuiz(quizId);
}
