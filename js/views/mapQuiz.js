import {
  GEOGRAPHICAL_CENTER,
  DEFAULT_RIGHT_MAP_SCORE,
  WORLD_MAP_BOUNDS,
} from "../config.js";
import * as model from "../model.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import { getRandomInt } from "../helpers.js";
import { localization } from "../localization/ua.js";
import { showQuizResultWindow } from "../helpers.js";
import { currentDateTime } from "../helpers.js";
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
  _quizResultAnsweredOutOf = document.querySelector(".right-answers-out-of");
  _quizResultProgressSuccess = document.querySelector("#progress-success");
  _quizResultProgressFailed = document.querySelector("#progress-failed");
  _quizResultRatingText = document.querySelector(".rating-text");
  _quizResultRatingStar = document.querySelector(".rating-star");
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
  _doNotKnowAnswer = document.querySelector(".do-not-know-map");
  _finishedQuizLabel = document.querySelector(".finished-quiz-map");
  _returnToMap = document.querySelector(".return-map");
  _scoreElement = document.querySelector(".score-name-map");
  _scoreValue = document.querySelector(".score-map");
  _correctIncorrectQuizAnswer = document.querySelector(
    ".correct-incorrect-quiz-map"
  );
  _questionTimerBonus = document.querySelector(".question-timer-bonus-map");
  _map;
  _country;
  _countryMarker;
  _timeout;
  _statisticView;
  _countries = [];
  _countryBondaries = [];
  _alreadyCountrySelected = false;
  _finishedQuiz = false;

  _nextQuestionListenerAdded = false;
  _finishQuizListenerAdded = false;
  _returnToMapListenerAdded = false;
  _startQuizListenerAdded = false;
  _doNotKnowAnswerAdded = false;

  initQuiz(
    mapView,
    statisticView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this._statisticView = statisticView;
    this.clearQuiz();
    this.clearTimeout();
    this.resetCountryBoundaries();
    this.createCountries();
    this.createMap(GEOGRAPHICAL_CENTER);
    this._map.fitBounds(WORLD_MAP_BOUNDS);
    this.invalidateSize();
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
    this.doNotKnowAnswerHandler();
    this.startQuizHandler();
  }

  clearTimeout() {
    clearTimeout(this._timeout);
  }

  invalidateSize() {
    this._map.invalidateSize();
  }

  startQuizHandler() {
    const startQuiz = function () {
      this.clearQuiz();
      this._map.fitBounds(WORLD_MAP_BOUNDS);
      this.resetCountryBoundaries();
      this.createCountries();
      this.selectRandomCountry();
      this.renderCountryQuestion();
      this._doNotKnowAnswer.disabled = false;
    };
    if (!this._startQuizListenerAdded) {
      this._startQuiz.addEventListener("click", startQuiz.bind(this));
    }
  }

  showResultWindow() {
    this._quizResultScore.textContent = this._scoreValue.textContent;
    this._quizResultAnsweredNumber.textContent =
      this._questionCurrentNumber.textContent;
    this._quizResultRatingStar.textContent = "";
    let rating = 0;
    if (+this._scoreValue.textContent !== 0) {
      const score = +this._scoreValue.textContent / DEFAULT_RIGHT_MAP_SCORE;
      const scorePersentage =
        (score * 100) / +this._questionCurrentNumber.textContent;
      this._quizResultRightAnswersNumber.textContent = score;
      this._quizResultProgressSuccess.textContent = score;
      this._quizResultProgressSuccess.style.width = `${scorePersentage}%`;
      this._quizResultProgressSuccess.setAttribute("aria-valuenow", `${score}`);
      const failed = +this._questionCurrentNumber.textContent - score;
      this._quizResultProgressFailed.textContent = failed;
      this._quizResultProgressFailed.style.width = `${
        (failed * 100) / +this._questionCurrentNumber.textContent
      }%`;
      this._quizResultProgressFailed.setAttribute("aria-valuenow", `${failed}`);
      if (scorePersentage >= 0 && scorePersentage <= 25) {
        for (let index = 0; index < 1; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 1;
      } else if (scorePersentage > 25 && scorePersentage <= 50) {
        for (let index = 0; index < 2; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 2;
      } else if (scorePersentage > 50 && scorePersentage < 75) {
        for (let index = 0; index < 3; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 3;
      } else if (scorePersentage >= 75 && scorePersentage <= 95) {
        for (let index = 0; index < 4; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 4;
      } else {
        for (let index = 0; index < 5; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 5;
      }
    } else {
      rating = 0;
      this._quizResultRightAnswersNumber.textContent = "0";
      this._quizResultProgressSuccess.textContent = 0;
      this._quizResultProgressSuccess.style.width = `${0}%`;
      this._quizResultProgressSuccess.setAttribute("aria-valuenow", "0");
      this._quizResultProgressFailed.textContent =
        this._questionCurrentNumber.textContent;
      this._quizResultProgressFailed.style.width = `${100}%`;
      this._quizResultProgressFailed.setAttribute(
        "aria-valuenow",
        `${this._questionCurrentNumber.textContent}`
      );
      this._quizResultRatingStar.textContent = "☆";
    }
    const statistic = {
      quizType: "country-on-map-quiz",
      dateTime: currentDateTime(),
      rating: rating,
      score: +this._scoreValue.textContent,
      rightAnswers: +this._quizResultRightAnswersNumber.textContent,
      answeredNumber: +this._questionCurrentNumber.textContent,
    };
    this._statisticView.addNewStatistic(statistic);
    showQuizResultWindow();
  }

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (
      this._finishQuiz.disabled === true &&
      +this._questionCurrentNumber.textContent ===
        +this._questionsAllNumber.textContent
    ) {
      this.clearQuiz();
      this.hideQuiz();
      mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
      mapView.showMap();
      mapView.invalidateSize();
      sideNavigationView.showSideNavigation();
      topNavigationView.enableSideBarToggle();
      countriesSelectView.enableCountriesSelect();
      sessionStorage.setItem("currentWindow", "map");
      topNavigationView.initItemMenuStyle();
    } else if (
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
      mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
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
      this.clearTimeout();
      this._countries = [];
      this._finishedQuiz = true;
      this._startQuiz.disabled = false;
      this._nextQuestion.disabled = true;
      this._doNotKnowAnswer.disabled = true;
      this._finishQuiz.disabled = true;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.resetCountryBoundaries();
      if (
        +this._questionCurrentNumber.textContent === 1 &&
        this._correctIncorrectQuizAnswer.classList.contains("not-displayed")
      ) {
        return;
      }
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this._questionTimerBonus.classList.add("not-displayed");
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
        this.nextQuestionClickHandler.bind(this, this._nextQuestion)
      );
      this._nextQuestionListenerAdded = true;
    }
  }

  nextQuestionClickHandler(target) {
    this._map.fitBounds(WORLD_MAP_BOUNDS);
    this.clearTimeout();
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._questionTimerBonus.classList.add("not-displayed");
    this._alreadyCountrySelected = false;
    this.resetCountryBoundaries();
    this._country = undefined;
    if (
      target === this._doNotKnowAnswer &&
      +this._questionCurrentNumber.textContent ===
        +this._questionsAllNumber.textContent
    ) {
      this._doNotKnowAnswer.disabled = true;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._finishedQuiz = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.showResultWindow();
      return;
    }
    this._nextQuestion.disabled = true;
    this._doNotKnowAnswer.disabled = false;
    const currentQuestionNumber = this.updateCurrentQuestionNumber();
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber <= questionsAllNumber) {
      this.selectRandomCountry();
      this.renderCountryQuestion();
    } else {
      this._doNotKnowAnswer.disabled = true;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._finishedQuiz = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.showResultWindow();
    }
  }

  doNotKnowAnswerHandler() {
    if (!this._doNotKnowAnswerAdded) {
      this._doNotKnowAnswer.addEventListener(
        "click",
        this.nextQuestionClickHandler.bind(this, this._doNotKnowAnswer)
      );
      this._doNotKnowAnswerAdded = true;
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
        worldCopyJump: true,
        zoomAnimation: true,
        zoomAnimationThreshold: 18,
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
      const miniLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 8,
        }
      );
      this._addResetZoomToMap();
      this._map.fitBounds(WORLD_MAP_BOUNDS);
      const miniMap = new L.Control.MiniMap(miniLayer, {
        position: "topright",
        toggleDisplay: true,
        width: 120,
        height: 120,
        collapsedWidth: 25,
        collapsedHeight: 25,
      });
      miniMap.addTo(this._map);
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
    if (this._countryMarker) this._map.removeLayer(this._countryMarker);
    this._countryBondaries.forEach((item) => {
      item.resetStyle();
      item.setStyle({
        weight: 2,
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        opacity: 1,
      });
      item.bringToBack();
    });
  }

  addCountryBoundaries() {
    const context = this;
    const showResult = showQuizResultWindow;
    const dateTime = currentDateTime;
    const addCountryBoundariesClickHandler = function (
      context,
      showResult,
      dateTime,
      countryBoundary,
      countryCode
    ) {
      if (context._finishedQuiz) return;
      context._nextQuestion.disabled = false;
      context._doNotKnowAnswer.disabled = true;
      if (context._country.cca2 === countryCode) {
        if (!context._alreadyCountrySelected) {
          const currentScore = +context._scoreValue.textContent;
          context._scoreValue.textContent =
            currentScore + DEFAULT_RIGHT_MAP_SCORE;
          context._questionTimerBonus.textContent =
            "+" + DEFAULT_RIGHT_MAP_SCORE;
          context._questionTimerBonus.classList.remove("not-displayed");
          context._correctIncorrectQuizAnswer.classList.remove("not-displayed");
          context._correctIncorrectQuizAnswer.textContent =
            localization[model.worldCountries.language]["Correct"];
          context._correctIncorrectQuizAnswer.style.color = "white";
          context._correctIncorrectQuizAnswer.style.backgroundColor = "green";
          countryBoundary.setStyle({
            weight: 3,
            color: "green",
            fillColor: "green",
            fillOpacity: 0.5,
            opacity: 0.8,
          });
          countryBoundary.bringToFront();
          const countryCoordinates = context._country.latlng
            ? context._country.latlng
            : context._country.capitalInfo.latlng;
          if (countryCoordinates) {
            context._countryMarker = L.popup({ closeOnClick: false })
              .setLatLng(countryCoordinates)
              .setContent(
                `<img src="${
                  context._country.flags.png
                }" style="width:25px; height:15px; border: 1px solid black; border-radius: 2px;"><span style="font-weight:bold; color:darkgreen; margin-left:5px;">${
                  localization[model.worldCountries.language]["countries"][
                    context._country.name.common
                  ]
                }</span>`
              )
              .openOn(context._map);
          }
        }
      } else {
        if (!context._alreadyCountrySelected) {
          context._correctIncorrectQuizAnswer.classList.remove("not-displayed");
          context._correctIncorrectQuizAnswer.textContent =
            localization[model.worldCountries.language]["Incorrect"];
          context._correctIncorrectQuizAnswer.style.color = "white";
          context._correctIncorrectQuizAnswer.style.backgroundColor = "red";
          const rightCountryBoundary = context._countryBondaries.find(
            (item) => item.options.style.className === context._country.cca2
          );
          if (rightCountryBoundary) {
            rightCountryBoundary.setStyle({
              weight: 3,
              color: "green",
              fillColor: "green",
              fillOpacity: 0.5,
              opacity: 0.8,
            });
            rightCountryBoundary.bringToFront();
          }
          countryBoundary.setStyle({
            weight: 3,
            color: "red",
            fillColor: "red",
            fillOpacity: 0.5,
            opacity: 0.8,
          });
          countryBoundary.bringToFront();
          const countryCoordinates = context._country.latlng
            ? context._country.latlng
            : context._country.capitalInfo.latlng;
          if (countryCoordinates) {
            context._timeout = setTimeout(() => {
              context._countryMarker = L.popup({ closeOnClick: false })
                .setLatLng(countryCoordinates)
                .setContent(
                  `<img src="${
                    context._country.flags.png
                  }" style="width:25px; height:15px; border: 1px solid black; border-radius: 2px;"><span style="font-weight:bold; color:darkgreen; margin-left:5px;">${
                    localization[model.worldCountries.language]["countries"][
                      context._country.name.common
                    ]
                  }</span>`
                )
                .openOn(context._map);
              context._map.setView(countryCoordinates, 4.5);
            }, 650);
          }
        }
      }
      const currentQuestionNumber = +context._questionCurrentNumber.textContent;
      const questionsAllNumber = +context._questionsAllNumber.textContent;
      if (currentQuestionNumber === questionsAllNumber) {
        context._finishedQuiz = true;
        context._nextQuestion.disabled = true;
        context._startQuiz.disabled = false;
        context._finishQuiz.disabled = true;
        context._finishedQuizLabel.classList.remove("not-displayed");
        context._correctIncorrectQuizAnswer.classList.add("not-displayed");
        context._questionTimerBonus.classList.add("not-displayed");
        context._quizResultScore.textContent = context._scoreValue.textContent;
        context._quizResultAnsweredNumber.textContent =
          context._questionCurrentNumber.textContent;
        let rating = 0;
        if (+context._scoreValue.textContent !== 0) {
          const score = +context._scoreValue.textContent / 300;
          const scorePersentage =
            (score * 100) / +context._questionCurrentNumber.textContent;
          context._quizResultRatingStar.textContent = "";
          context._quizResultRightAnswersNumber.textContent = score;
          context._quizResultProgressSuccess.textContent = score;
          context._quizResultProgressSuccess.style.width = `${scorePersentage}%`;
          context._quizResultProgressSuccess.setAttribute(
            "aria-valuenow",
            `${score}`
          );
          const failed = +context._questionCurrentNumber.textContent - score;
          context._quizResultProgressFailed.textContent = failed;
          context._quizResultProgressFailed.style.width = `${
            (failed * 100) / +context._questionCurrentNumber.textContent
          }%`;
          context._quizResultProgressFailed.setAttribute(
            "aria-valuenow",
            `${failed}`
          );
          if (scorePersentage >= 0 && scorePersentage <= 25) {
            for (let index = 0; index < 1; index++) {
              context._quizResultRatingStar.textContent += "⭐";
            }
            rating = 1;
          } else if (scorePersentage > 25 && scorePersentage <= 50) {
            for (let index = 0; index < 2; index++) {
              context._quizResultRatingStar.textContent += "⭐";
            }
            rating = 2;
          } else if (scorePersentage > 50 && scorePersentage < 75) {
            for (let index = 0; index < 3; index++) {
              context._quizResultRatingStar.textContent += "⭐";
            }
            rating = 3;
          } else if (scorePersentage >= 75 && scorePersentage <= 95) {
            for (let index = 0; index < 4; index++) {
              context._quizResultRatingStar.textContent += "⭐";
            }
            rating = 4;
          } else {
            for (let index = 0; index < 5; index++) {
              context._quizResultRatingStar.textContent += "⭐";
            }
            rating = 5;
          }
        } else {
          rating = 0;
          context._quizResultRightAnswersNumber.textContent = "0";
          context._quizResultProgressSuccess.textContent = 0;
          context._quizResultProgressSuccess.style.width = `${0}%`;
          context._quizResultProgressSuccess.setAttribute("aria-valuenow", "0");
          context._quizResultProgressFailed.textContent =
            context._questionCurrentNumber.textContent;
          context._quizResultProgressFailed.style.width = `${100}%`;
          context._quizResultProgressFailed.setAttribute(
            "aria-valuenow",
            `${context._questionCurrentNumber.textContent}`
          );
          context._quizResultRatingStar.textContent = "☆";
        }
        const statistic = {
          quizType: "country-on-map-quiz",
          dateTime: dateTime(),
          rating: rating,
          score: +context._scoreValue.textContent,
          rightAnswers: +context._quizResultRightAnswersNumber.textContent,
          answeredNumber: +context._questionCurrentNumber.textContent,
        };
        context._statisticView.addNewStatistic(statistic);
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
          style: {
            weight: 2,
            fillOpacity: 0.2,
            className: countryCode,
            opacity: 1,
          },
          onEachFeature: function (feature, countryBoundary) {
            countryBoundary.on("mouseover", function () {
              mouseOver(this, context);
            });
            const mouseOver = function (countryBoundary, context) {
              if (!context._alreadyCountrySelected) {
                countryBoundary.setStyle({
                  weight: 4,
                  fillOpacity: 0.5,
                  opacity: 1,
                  className: countryCode,
                });
                countryBoundary.bringToFront();
              }
            };
            countryBoundary.on("mouseout", function () {
              mouseOut(this, context);
            });
            const mouseOut = function (countryBoundary, context) {
              if (!context._alreadyCountrySelected) {
                countryBoundary.setStyle({
                  weight: 2,
                  fillOpacity: 0.2,
                  opacity: 1,
                  className: countryCode,
                });
                countryBoundary.bringToBack();
              }
            };
            countryBoundary.on("click", function () {
              addCountryBoundariesClickHandler(
                context,
                showResult,
                dateTime,
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
      .filter(
        (country) =>
          country.independent &&
          country.area > 15000 &&
          country.subregion !== "Polynesia" &&
          country.subregion !== "Melanesia"
      );
  }

  clearQuiz() {
    this.clearTimeout();
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._questionTimerBonus.classList.add("not-displayed");
    this._countries = [];
    this._scoreValue.textContent = 0;
    this._questionCurrentNumber.textContent = 1;
    this._finishedQuizLabel.classList.add("not-displayed");
    this._alreadyCountrySelected = false;
    this._doNotKnowAnswer.disabled = false;
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
        resetZoom.innerHTML =
          localization[model.worldCountries.language]["Reset"];
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
            map.fitBounds(WORLD_MAP_BOUNDS);
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
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    const resetZoom = document.querySelector(".reset-zoom-map-quiz");
    if (resetZoom) {
      resetZoom.textContent =
        localization[model.worldCountries.language]["Reset"];
    }
    this._quizHeading.textContent = `${
      localization[model.worldCountries.language]["Guess Country On Map"]
    }`;
    this._returnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO MAP"]
    }`;
    this._nextQuestion.textContent = `${
      localization[model.worldCountries.language]["NEXT QUESTION"]
    }`;
    this._finishQuiz.textContent = `${
      localization[model.worldCountries.language]["FINISH"]
    }`;
    this._doNotKnowAnswer.textContent = `${
      localization[model.worldCountries.language]["DO NOT KNOW"]
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
      localization[model.worldCountries.language]["CORRECT ANSWERS:"]
    }`;
    this._quizResultAnsweredOutOf.textContent = `${
      localization[model.worldCountries.language]["of"]
    }`;
    this._quizResultRatingText.textContent = `${
      localization[model.worldCountries.language]["RATING:"]
    }`;
  }
}

export default new MapQuiz();
