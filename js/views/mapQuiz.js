import {
  GEOGRAPHICAL_CENTER,
  DEFAULT_RIGHT_MAP_SCORE,
  DEFAULT_ZOOM_LEVEL,
} from "../config.js";
import * as model from "../model.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import { getRandomInt } from "../helpers.js";
import { localization } from "../localization/ua.js";
import { showQuizResultWindow } from "../helpers.js";
class MapQuiz {
  _mapElement = document.querySelector("#mapCountriesQuiz");
  _quizElement = document.querySelector("#mapQuiz");
  _quizResultModalLabel = document.querySelector("#quizModalResultLabel");
  _quizResultModalButton = document.querySelector("#quizResultCloseButton");
  _quizResultScoreName = document.querySelector(".score-name-result");
  _quizResultScore = document.querySelector(".score-result");
  _quizResultScorePoints = document.querySelector(".score-result-points");
  _quizResultRightAnswersText = document.querySelector(".right-answers-text");
  _quizResultRightAnswersNumber = document.querySelector(
    ".right-answers-number"
  );
  _quizResultAnsweredNumber = document.querySelector(".answered-number");
  _quizHeading = document.querySelector(".heading-map");
  _questionContainer = document.querySelector(".question-container-map");
  _questionCountry = document.querySelector(".question-country-map");
  _questionDelimeterElement = document.querySelector(".question-delimeter-map");
  _questionCurrentNumber = document.querySelector(
    ".question-current-number-map"
  );
  _questionsAllNumber = document.querySelector(".question-all-number-map");
  _startQuiz = document.querySelector(".start-map");
  _nextQuestion = document.querySelector(".next-map");
  _finishQuiz = document.querySelector(".finish-map");
  _finishedQuizLabel = document.querySelector(".finished-quiz-map");
  _returnToMap = document.querySelector(".return-map");
  _scoreElement = document.querySelector(".score-name-map");
  _scoreValue = document.querySelector(".score-map");
  _correctIncorrectQuizAnswer = document.querySelector(
    ".correct-incorrect-quiz-map"
  );
  _map;
  _country;
  _countries = [];
  _countryBondaries = [];
  _alreadyCountrySelected = false;
  _finishedQuiz = false;

  _nextQuestionListenerAdded = false;
  _finishQuizListenerAdded = false;
  _returnToMapListenerAdded = false;
  _startQuizListenerAdded = false;

  initQuiz(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this.clearQuiz();
    this.resetCountryBoundaries();
    this.createCountries();
    this.createMap(GEOGRAPHICAL_CENTER);
    this.invalidateSize();
    this._map.setView(GEOGRAPHICAL_CENTER, 1.2);
    this.selectRandomCountry();
    this.renderCountryQuestion();
    this.returnToMapButtonHandler(
      mapView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
    this.finishQuizHandler();
    this.nextButtonHandler();
    this.startQuizHandler();
  }

  invalidateSize() {
    this._map.invalidateSize();
  }

  startQuizHandler() {
    const startQuiz = function () {
      this.clearQuiz();
      this._map.setView(GEOGRAPHICAL_CENTER, 1.2);
      this.resetCountryBoundaries();
      this.createCountries();
      this.selectRandomCountry();
      this.renderCountryQuestion();
    };
    if (!this._startQuizListenerAdded) {
      this._startQuiz.addEventListener("click", startQuiz.bind(this));
    }
  }

  showResultWindow() {
    this._quizResultScore.textContent = this._scoreValue.textContent;
    this._quizResultAnsweredNumber.textContent =
      this._questionCurrentNumber.textContent;
    if (+this._scoreValue.textContent !== 0) {
      this._quizResultRightAnswersNumber.textContent =
        +this._scoreValue.textContent / DEFAULT_RIGHT_MAP_SCORE;
    } else {
      this._quizResultRightAnswersNumber.textContent = "0";
    }
    showQuizResultWindow();
  }

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (
      confirm(
        `${
          localization[model.worldCountries.language][
            "Are you sure you want to leave this quiz? Current quiz data will not be saved!"
          ]
        }`
      )
    ) {
      this.clearQuiz();
      this.hideQuiz();
      mapView.setMapView(GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL);
      mapView.showMap();
      mapView.invalidateSize();
      sideNavigationView.showSideNavigation();
      topNavigationView.enableSideBarToggle();
      countriesSelectView.enableCountriesSelect();
      sessionStorage.setItem("currentWindow", "map");
      topNavigationView.initItemMenuStyle();
    }
  }

  returnToMapButtonHandler(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._returnToMap.addEventListener(
        "click",
        this.returnToMap.bind(
          this,
          mapView,
          sideNavigationView,
          topNavigationView,
          countriesSelectView
        )
      );
      this._returnToMapListenerAdded = true;
    }
  }

  finishQuizHandler() {
    const finishQuiz = function () {
      this._countries = [];
      this._finishedQuiz = true;
      this._startQuiz.disabled = false;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this.resetCountryBoundaries();
      this.showResultWindow();
    };
    if (!this._finishQuizListenerAdded) {
      this._finishQuiz.addEventListener("click", finishQuiz.bind(this));
      this._finishQuizListenerAdded = true;
    }
  }

  nextButtonHandler() {
    if (!this._nextQuestionListenerAdded) {
      this._nextQuestion.addEventListener(
        "click",
        this.nextQuestionClickHandler.bind(this)
      );
      this._nextQuestionListenerAdded = true;
    }
  }

  nextQuestionClickHandler() {
    this._map.setView(GEOGRAPHICAL_CENTER, 1.2);
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._alreadyCountrySelected = false;
    this.resetCountryBoundaries();
    this._country = undefined;
    this._nextQuestion.disabled = true;
    const currentQuestionNumber = this.updateCurrentQuestionNumber();
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber <= questionsAllNumber) {
      this.selectRandomCountry();
      this.renderCountryQuestion();
    } else {
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.showResultWindow();
    }
  }

  updateCurrentQuestionNumber() {
    const currentQuestionNumber = +this._questionCurrentNumber.textContent + 1;
    this._questionCurrentNumber.textContent = currentQuestionNumber;
    return currentQuestionNumber;
  }

  createMap(latLon, defaultZoomLevel = 1.2) {
    if (!this._map) {
      this._map = L.map("mapCountriesQuiz", {
        minZoom: defaultZoomLevel,
        zoomSnap: 0.25,
      })
        .fitWorld()
        .setView(latLon, defaultZoomLevel);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: US National Park Service",
          maxZoom: 8,
        }
      ).addTo(this._map);
      this._addResetZoomToMap();
      this.addCountryBoundaries();
      this.resetTranslateHandler();
    }
  }

  resetTranslateHandler() {
    window.addEventListener("DOMContentLoaded", () => {
      const resetZoom = document.querySelector(".reset-zoom-map-quiz");
      if (resetZoom) {
        resetZoom.textContent =
          localization[model.worldCountries.language]["Reset"];
      }
    });
  }

  selectRandomCountry() {
    const randomIndex = getRandomInt(0, this._countries.length - 1);
    this._country = this._countries[randomIndex];
    this._countries.splice(randomIndex, 1);
  }

  renderCountryQuestion() {
    this._questionCountry.textContent =
      localization[model.worldCountries.language]["countries"][
        this._country.name.common
      ];
  }

  resetCountryBoundaries() {
    this._countryBondaries.forEach((item) => {
      item.resetStyle();
      item.setStyle({ fillColor: "#3388ff", fillOpacity: 0.3 });
    });
  }

  addCountryBoundaries() {
    const context = this;
    const showResult = showQuizResultWindow;
    const addCountryBoundariesClickHandler = function (
      context,
      showResult,
      countryBoundary,
      countryCode
    ) {
      if (context._finishedQuiz) return;
      context._nextQuestion.disabled = false;
      if (context._country.cca2 === countryCode) {
        if (!context._alreadyCountrySelected) {
          const currentScore = +context._scoreValue.textContent;
          context._scoreValue.textContent =
            currentScore + DEFAULT_RIGHT_MAP_SCORE;
          context._correctIncorrectQuizAnswer.classList.remove("not-displayed");
          context._correctIncorrectQuizAnswer.textContent =
            localization[model.worldCountries.language]["Correct"];
          context._correctIncorrectQuizAnswer.style.color = "darkgreen";
          countryBoundary.setStyle({
            fillColor: "darkgreen",
            fillOpacity: 1,
          });
        }
      } else {
        if (!context._alreadyCountrySelected) {
          context._correctIncorrectQuizAnswer.classList.remove("not-displayed");
          context._correctIncorrectQuizAnswer.textContent =
            localization[model.worldCountries.language]["Incorrect"];
          context._correctIncorrectQuizAnswer.style.color = "red";
          const rightCountryBoundary = context._countryBondaries.find(
            (item) => item.options.style.className === context._country.cca2
          );
          if (rightCountryBoundary) {
            rightCountryBoundary.setStyle({
              fillColor: "darkgreen",
              fillOpacity: 1,
            });
          }
          countryBoundary.setStyle({
            fillColor: "red",
            fillOpacity: 1,
          });
        }
      }
      const currentQuestionNumber = +context._questionCurrentNumber.textContent;
      const questionsAllNumber = +context._questionsAllNumber.textContent;
      if (currentQuestionNumber === questionsAllNumber) {
        context._nextQuestion.disabled = true;
        context._startQuiz.disabled = false;
        context._finishQuiz.disabled = true;
        context._finishedQuizLabel.classList.remove("not-displayed");
        context._correctIncorrectQuizAnswer.classList.add("not-displayed");
        context._quizResultScore.textContent = context._scoreValue.textContent;
        context._quizResultAnsweredNumber.textContent =
          context._questionCurrentNumber.textContent;
        if (+context._scoreValue.textContent !== 0) {
          context._quizResultRightAnswersNumber.textContent =
            +context._scoreValue.textContent / 300;
        } else {
          context._quizResultRightAnswersNumber.textContent = "0";
        }
        showResult();
      }
      context._alreadyCountrySelected = true;
    };
    this._countries.forEach((country) => {
      const countryCode = country.cca2;
      if (countryCode) {
        const countryGeo = {};
        countryGeo.type = COUNTRIES_GEO.type;
        countryGeo.features = COUNTRIES_GEO.features.filter(
          (feature) => feature.properties.country_a2 === countryCode
        );
        const countryBoundary = L.geoJson(countryGeo, {
          style: { fillOpacity: 0.3, className: countryCode },
          onEachFeature: function (feature, countryBoundary) {
            countryBoundary.on("click", function () {
              addCountryBoundariesClickHandler(
                context,
                showResult,
                countryBoundary,
                feature.properties.country_a2
              );
            });
          },
        }).addTo(this._map);
        this._countryBondaries.push(countryBoundary);
      }
    });
  }

  createCountries() {
    this._countries = model.worldCountries.countries
      .slice()
      .filter((country) => country.independent && country.area > 15000);
  }

  clearQuiz() {
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._countries = [];
    this._scoreValue.textContent = 0;
    this._questionCurrentNumber.textContent = 1;
    this._finishedQuizLabel.classList.add("not-displayed");
    this._alreadyCountrySelected = false;
    this._finishQuiz.disabled = false;
    this._nextQuestion.disabled = true;
    this._startQuiz.disabled = true;
    this._finishedQuiz = false;
  }

  removeAllCountryBoundaries() {
    this._countryBondaries.forEach((item) => this._map.removeLayer(item));
  }

  _addResetZoomToMap() {
    (function () {
      const control = new L.Control({ position: "topleft" });
      control.onAdd = function (map) {
        const resetZoom = L.DomUtil.create("a", "reset-zoom-map-quiz");
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
            map.setView(GEOGRAPHICAL_CENTER, 1.2);
          },
          resetZoom
        );
        return resetZoom;
      };
      return control;
    })().addTo(this._map);
  }

  showQuiz() {
    this._quizElement.classList.remove("not-displayed");
  }

  hideQuiz() {
    this._quizElement.classList.add("not-displayed");
  }

  translateElements() {
    const resetZoom = document.querySelector(".reset-zoom-map-quiz");
    if (resetZoom) {
      resetZoom.textContent =
        localization[model.worldCountries.language]["Reset"];
    }
    this._quizHeading.textContent = `${
      localization[model.worldCountries.language]["Guess Country On Map Quiz"]
    }`;
    this._returnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO MAP"]
    }`;
    this._nextQuestion.textContent = `${
      localization[model.worldCountries.language]["NEXT QUESTION"]
    }`;
    this._finishQuiz.textContent = `${
      localization[model.worldCountries.language]["FINISH QUIZ"]
    }`;
    this._startQuiz.textContent = `${
      localization[model.worldCountries.language]["START AGAIN"]
    }`;
    this._scoreElement.textContent = `${
      localization[model.worldCountries.language]["SCORE"]
    }`;
    if (this._country)
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["countries"][
          this._country.name.common
        ];
    this._questionDelimeterElement.textContent =
      localization[model.worldCountries.language]["of"];
    this._finishedQuizLabel.textContent =
      localization[model.worldCountries.language]["Finished"];
    this._correctIncorrectQuizAnswer.textContent =
      localization[model.worldCountries.language][
        this._correctIncorrectQuizAnswer.textContent
      ];
    this._quizResultModalLabel.textContent = `${
      localization[model.worldCountries.language]["Quiz Result"]
    }`;
    this._quizResultModalButton.textContent = `${
      localization[model.worldCountries.language]["Close"]
    }`;
    this._quizResultScoreName.textContent = `${
      localization[model.worldCountries.language]["SCORE"]
    }`;
    this._quizResultScorePoints.textContent = `${
      localization[model.worldCountries.language]["Points"]
    }`;
    this._quizResultRightAnswersText.textContent = `${
      localization[model.worldCountries.language]["Correct answers out of"]
    }`;
  }
}

export default new MapQuiz();
