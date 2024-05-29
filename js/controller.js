import * as model from "./model.js";
import mapView from "./views/mapView.js";
import sideNavigationView from "./views/sideNavigationView.js";
import countriesSelectView from "./views/countriesSelectView.js";
import languageSelectView from "./views/languageSelectView.js";
import topNavigationView from "./views/topNavigationView.js";
import quiz from "./views/quiz.js";
import mapQuiz from "./views/mapQuiz.js";
import aboutView from "./views/aboutView.js";
import { localization } from "./localization/ua.js";
import { GEOGRAPHICAL_CENTER } from "./config.js";
import { DEFAULT_ZOOM_LEVEL } from "./config.js";
import { COUNTRY_ON_MAP_QUIZ } from "./config.js";
import { sortData } from "./helpers.js";
const init = function () {
  mapView.addHandlerRender(mapCountriesMarkerRender);
  topNavigationView.initSideBar();
  translateAllElements();
  sideNavigationView.addHandlerRender(sideNavigationCountriesRender);
  sideNavigationView.addSortCountriesHandler(countriesSortHandler);
  sideNavigationView.addMoveUpCountriesHandler();
  sideNavigationView.addMoveDownCountriesHandler();
  countriesSelectView.addHandlerRender(countriesSelectRender);
  countriesSelectView.countriesSelectionHandler(countriesSelectionHandler);
  languageSelectView.init();
  languageSelectView.addHandlerSelect(languageSelectHandler);
  topNavigationView.addHandlerWorldMapClick(worldMapHandlerClick);
  topNavigationView.addHandlerAboutClick(aboutProjectHandlerClick);
  topNavigationView.addHandlerQuizClick(quizSelectionHandler);
  topNavigationView.initItemMenuStyle();
  aboutView.addReturnToMapHandlerClick(
    mapView,
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
  countriesSelectView.enableCountriesSelect();
  mapView.setMapView(GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL);
  mapView.showMap();
  mapView.invalidateSize();
  topNavigationView.showSideNavigation();
  topNavigationView.enableSideBarToggle();
};

const loadAboutProject = function () {
  mapView.hideMap();
  quiz.hideQuiz();
  mapQuiz.hideQuiz();
  countriesSelectView.disableCountriesSelect();
  aboutView.showAboutProjectInfo();
  topNavigationView.hideSideNavigation();
  topNavigationView.disableSideBarToggle();
};

const loadQuiz = function (quizId) {
  topNavigationView.hideSideNavigation();
  countriesSelectView.disableCountriesSelect();
  aboutView.hideAboutProject();
  if (quizId === COUNTRY_ON_MAP_QUIZ) {
    quiz.hideQuiz();
    mapView.hideMap();
    mapQuiz.showQuiz();
    mapQuiz.initQuiz(
      mapView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
  } else {
    mapQuiz.hideQuiz();
    quiz.initQuiz(
      quizId,
      mapView,
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

const quizSelectionHandler = function (quizId) {
  loadQuiz(quizId);
};

const translateAllElements = function () {
  sideNavigationView.translateSortMoveElements();
  topNavigationView.translateElements();
  quiz.translateElements();
  aboutView.translateElements();
  mapView.translateElements();
  mapQuiz.translateElements();
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
