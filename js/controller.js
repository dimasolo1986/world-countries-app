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
import { localization } from "./localization/ua.js";
import { COUNTRY_ON_MAP_QUIZ } from "./config.js";
import { WORLD_MAP_BOUNDS } from "./config.js";
import { sortData } from "./helpers.js";
const init = function () {
  mapView.addHandlerRender(mapCountriesMarkerRender);
  mapView.setSideNavigationView(sideNavigationView);
  mapView.setTopNavigationView(topNavigationView);
  topNavigationView.initSideBar();
  translateAllElements();
  sideNavigationView.addHandlerRender(sideNavigationCountriesRender);
  sideNavigationView.addSortCountriesHandler(countriesSortHandler);
  sideNavigationView.addMoveUpCountriesHandler();
  sideNavigationView.addMoveDownCountriesHandler();
  sideNavigationView.addCountryInfoModalClickHandler();
  countriesSelectView.addHandlerRender(countriesSelectRender);
  countriesSelectView.countriesSelectionHandler(countriesSelectionHandler);
  languageSelectView.init();
  languageSelectView.addHandlerSelect(languageSelectHandler);
  topNavigationView.addHandlerWorldMapClick(worldMapHandlerClick);
  topNavigationView.addHandlerAboutClick(aboutProjectHandlerClick);
  topNavigationView.addHandlerStatisticClick(statisticHandlerClick);
  topNavigationView.addHandlerQuizClick(quizSelectionHandler);
  topNavigationView.initItemMenuStyle();
  aboutView.addReturnToMapHandlerClick(
    mapView,
    statisticView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  statisticView.addReturnToMapHandlerClick(
    mapView,
    aboutView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  );
  saveCurrentLanguageHandler();
  loadWindow();
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
  countriesSelectView.disableCountriesSelect();
  statisticView.hideStatistic();
  aboutView.showAboutProjectInfo();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadStatistic = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.showStatistic();
  statisticView.renderStatisticData();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadQuiz = function (quizId) {
  topNavigationView.hideSideNavigation();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  statisticView.hideStatistic();
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
    quiz.initQuiz(
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
};

const languageSelectHandler = function (language) {
  model.worldCountries.language = language;
  model.loadAllCountries();
  saveLanguage(language);
  sortData(model.worldCountries.countries);
  sortData(model.worldCountries.selectedCountries);
  translateAllElements();
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
