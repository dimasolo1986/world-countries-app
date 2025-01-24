import * as model from "../model.js";
import { localization } from "../localization/ua.js";
import { getRandomInt } from "../helpers.js";
import { DEFAULT_RIGHT_SCORE } from "../config.js";
import { showQuizResultWindow } from "../helpers.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import {
  FLAG_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_NAME_BY_FLAG_QUIZ,
  COUNTRY_CAPITAL_BY_FLAG_QUIZ,
  FLAG_BY_COUNTRY_CAPITAL_QUIZ,
  COUNTRY_NAME_BY_CAPITAL_QUIZ,
  COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ,
  TIME_TO_ANSWER,
} from "../config.js";
import { currentDateTime } from "../helpers.js";
class Quiz {
  _quizElement = document.querySelector("#quiz");
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
  _quizHeading = document.querySelector(".heading");
  _questionContainer = document.querySelector(".question-container");
  _questionCountry = document.querySelector(".question-country");
  _questionImgCountry = document.querySelector(".question-img-country");
  _questionDelimeterElement = document.querySelector(".question-delimeter");
  _questionCurrentNumber = document.querySelector(".question-current-number");
  _questionsAllNumber = document.querySelector(".question-all-number");
  _countriesSelector = document.querySelector(".countries-selector");
  _startQuiz = document.querySelector(".start");
  _nextQuestion = document.querySelector(".next");
  _finishQuiz = document.querySelector(".finish");
  _doNotKnowAnswer = document.querySelector(".do-not-know");
  _finishedQuizLabel = document.querySelector(".finished-quiz");
  _returnToMap = document.querySelector(".return");
  _scoreElement = document.querySelector(".score-name");
  _scoreValue = document.querySelector(".score");
  _cardOptionsElements = document.querySelectorAll(".card");
  _correctIncorrectQuizAnswer = document.querySelector(
    ".correct-incorrect-quiz"
  );
  _questionTimer = document.querySelector(".question-timer-seconds");
  _questionTimerName = document.querySelector(".question-timer-name");
  _timeLeft = TIME_TO_ANSWER;
  _timerId;
  _countries;
  _questionCountrySelected;
  _randomCountries = [];
  _statisticView;

  _returnToMapListenerAdded = false;
  _cardListenerAdded = false;
  _finishQuizListenerAdded = false;
  _nextQuestionListenerAdded = false;
  _startQuizListenerAdded = false;
  _doNotKnowAnswerAdded = false;
  _countriesSelectorListenerAdded = false;

  _quizType;

  initQuiz(
    quizId,
    mapView,
    statisticView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this._statisticView = statisticView;
    this._quizType = quizId;
    mapView.hideMap();
    this._countriesSelector.value = "Difficulty: Normal";
    this.clearQuiz();
    this.showQuiz();
    this.returnToMapButtonHandler(
      mapView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
    this.countriesSelectHandler();
    this.finishQuizHandler();
    this.nextButtonHandler();
    this.doNotKnowAnswerHandler();
    this.startQuizHandler();
    this.selectRandomCountries();
    this.renderCountryQuestion();
    this.renderCountryCards();
    this.addCardClickHandler();
    this.initTimer();
    this._timerId = setInterval(this.timerCountDown.bind(this), 1000);
  }

  initTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
    }
    this._questionTimer.style.color = "darkgreen";
    this._questionTimer.textContent = TIME_TO_ANSWER;
    this._timeLeft = TIME_TO_ANSWER;
  }

  timerCountDown() {
    this._timeLeft--;
    if (this._timeLeft >= 0) {
      if (this._timeLeft <= 10) {
        this._questionTimer.style.color = "red";
      }
      this._questionTimer.innerHTML = String(this._timeLeft);
    } else {
      this._cardOptionsElements.forEach((cardOption) => {
        let element;
        if (
          this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
          this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
        ) {
          element = cardOption.querySelector(".flag-option");
        }
        if (
          this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
          this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
          this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
          this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
        ) {
          element = cardOption.querySelector(".country-option");
        }
        if (
          element.dataset.country === this._questionCountrySelected.name.common
        ) {
          this.cardHandler(cardOption, "timer");
        }
      });
    }
  }

  countriesSelectHandler() {
    const countriesSelector = function () {
      this.clearQuiz();
      this.selectRandomCountries();
      this.renderCountryQuestion();
      this.renderCountryCards();
      this.initTimer();
      this._timerId = setInterval(this.timerCountDown.bind(this), 1000);
    };
    if (!this._countriesSelectorListenerAdded) {
      this._countriesSelector.addEventListener(
        "change",
        countriesSelector.bind(this)
      );
    }
  }

  startQuizHandler() {
    const startQuiz = function () {
      this.clearQuiz();
      this.selectRandomCountries();
      this.renderCountryQuestion();
      this.renderCountryCards();
      this._startQuiz.disabled = true;
      this._finishQuiz.disabled = false;
      this._doNotKnowAnswer.disabled = false;
      this._finishedQuizLabel.classList.add("not-displayed");
      this._cardOptionsElements.forEach((cardOption) => {
        cardOption.classList.remove("wrong-answer");
        cardOption.classList.remove("right-answer");
      });
      this.enableCardOptions();
      this.initTimer();
      this._timerId = setInterval(this.timerCountDown.bind(this), 1000);
    };
    if (!this._startQuizListenerAdded) {
      this._startQuiz.addEventListener("click", startQuiz.bind(this));
    }
  }

  finishQuizHandler() {
    const finishQuiz = function () {
      this._startQuiz.disabled = false;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._doNotKnowAnswer.disabled = true;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._cardOptionsElements.forEach((cardOption) => {
        cardOption.classList.remove("wrong-answer");
        cardOption.classList.remove("right-answer");
      });
      this.disableCardOptions();
      this.initTimer();
      if (
        +this._questionCurrentNumber.textContent === 1 &&
        this._correctIncorrectQuizAnswer.classList.contains("not-displayed")
      ) {
        return;
      }
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this.showResultWindow();
    };
    if (!this._finishQuizListenerAdded) {
      this._finishQuiz.addEventListener("click", finishQuiz.bind(this));
      this._finishQuizListenerAdded = true;
    }
  }

  renderCountryCards() {
    this._cardOptionsElements.forEach((cardOption, index) => {
      const country = this._randomCountries[index];
      if (
        this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
        this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
      ) {
        const flagImg = cardOption.querySelector(".flag-option");
        flagImg.src = country.flags.png;
        flagImg.dataset.country = country.name.common;
      }
      if (
        this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
        this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ
      ) {
        const countryName = cardOption.querySelector(".country-option");
        const countryNameParts =
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ].split(" ");
        this.setFontSizeByWordLength(countryNameParts, countryName);
        countryName.textContent =
          localization[model.worldCountries.language]["countries"][
            country.name.common
          ];
        countryName.dataset.country = country.name.common;
      }
      if (
        this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
      ) {
        const countryCapital = cardOption.querySelector(".country-option");
        const countryCapitalParts =
          localization[model.worldCountries.language]["capitals"][
            country.capital[0]
          ].split(" ");
        this.setFontSizeByWordLength(countryCapitalParts, countryCapital);
        countryCapital.textContent =
          localization[model.worldCountries.language]["capitals"][
            country.capital[0]
          ];
        countryCapital.dataset.country = country.name.common;
      }
    });
  }

  setFontSizeByWordLength(wordParts, element) {
    if (wordParts.length === 2) {
      element.style.fontSize = "1.5rem";
    } else if (wordParts.length > 2 && wordParts.length < 5) {
      element.style.fontSize = "1.2rem";
    } else if (wordParts.length >= 5) {
      element.style.fontSize = "0.9rem";
    } else {
      element.style.fontSize = "1.8rem";
    }
  }

  cardHandler(flag, type) {
    let selectedAnswer;
    if (
      this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
      this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
    ) {
      selectedAnswer = flag.querySelector(".flag-option");
    }
    if (
      this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
      this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
      this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
      this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
    ) {
      selectedAnswer = flag.querySelector(".country-option");
    }
    if (
      this._questionCountrySelected.name.common ===
      selectedAnswer.dataset.country
    ) {
      flag.classList.add("right-answer");
      if (type === "click") {
        const currentScore = +this._scoreValue.textContent;
        this._scoreValue.textContent = currentScore + DEFAULT_RIGHT_SCORE;
        this._correctIncorrectQuizAnswer.classList.remove("not-displayed");
        this._correctIncorrectQuizAnswer.textContent =
          localization[model.worldCountries.language]["Correct"];
        this._correctIncorrectQuizAnswer.style.color = "darkgreen";
      }
      if (
        this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
        this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
      ) {
        this._quizHeading.textContent = `💡 ${
          localization[model.worldCountries.language]["capitals"][
            this._questionCountrySelected.capital[0]
          ]
        } ${localization[model.worldCountries.language]["is the capital of"]} ${
          localization[model.worldCountries.language]["countries"][
            this._questionCountrySelected.name.common
          ]
        }`;
      }
      if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
        this._quizHeading.textContent = `💡 ${
          localization[model.worldCountries.language]["The capital of"]
        } ${
          localization[model.worldCountries.language]["countries"][
            this._questionCountrySelected.name.common
          ]
        } - ${
          localization[model.worldCountries.language]["capitals"][
            this._questionCountrySelected.capital[0]
          ]
        }`;
      }
    } else {
      flag.classList.add("wrong-answer");
      this._correctIncorrectQuizAnswer.classList.remove("not-displayed");
      this._correctIncorrectQuizAnswer.textContent =
        localization[model.worldCountries.language]["Incorrect"];
      this._correctIncorrectQuizAnswer.style.color = "red";
      this._cardOptionsElements.forEach((cardOption) => {
        let element;
        if (
          this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
          this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
        ) {
          element = cardOption.querySelector(".flag-option");
        }
        if (
          this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
          this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
          this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
          this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
        ) {
          element = cardOption.querySelector(".country-option");
        }
        if (
          element.dataset.country === this._questionCountrySelected.name.common
        ) {
          cardOption.classList.add("right-answer");
        }
      });
      if (
        this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
        this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
      ) {
        this._quizHeading.textContent = `💡 ${
          localization[model.worldCountries.language]["capitals"][
            this._questionCountrySelected.capital[0]
          ]
        } ${localization[model.worldCountries.language]["is the capital of"]} ${
          localization[model.worldCountries.language]["countries"][
            this._questionCountrySelected.name.common
          ]
        }`;
      }
      if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
        this._quizHeading.textContent = `💡 ${
          localization[model.worldCountries.language]["The capital of"]
        } ${
          localization[model.worldCountries.language]["countries"][
            this._questionCountrySelected.name.common
          ]
        } - ${
          localization[model.worldCountries.language]["capitals"][
            this._questionCountrySelected.capital[0]
          ]
        }`;
      }
    }
    this._nextQuestion.disabled = false;
    this._doNotKnowAnswer.disabled = true;
    const currentQuestionNumber = +this._questionCurrentNumber.textContent;
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber === questionsAllNumber) {
      this._nextQuestion.disabled = true;
      this._startQuiz.disabled = false;
      this._finishQuiz.disabled = true;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this.showResultWindow();
    }
    this.disableCardOptions();
    clearInterval(this._timerId);
  }

  disableCardOptions() {
    this._cardOptionsElements.forEach((cardOption) => {
      cardOption.style.pointerEvents = "none";
    });
  }

  enableCardOptions() {
    this._cardOptionsElements.forEach((cardOption) => {
      cardOption.style.pointerEvents = "auto";
    });
  }

  addCardClickHandler() {
    if (!this._cardListenerAdded) {
      this._cardOptionsElements.forEach((cardOption) => {
        cardOption.addEventListener(
          "click",
          this.cardHandler.bind(this, cardOption, "click")
        );
      });
      this._cardListenerAdded = true;
    }
  }

  updateCurrentQuestionNumber() {
    const currentQuestionNumber = +this._questionCurrentNumber.textContent + 1;
    this._questionCurrentNumber.textContent = currentQuestionNumber;
    return currentQuestionNumber;
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

  nextButtonHandler() {
    if (!this._nextQuestionListenerAdded) {
      this._nextQuestion.addEventListener(
        "click",
        this.nextQuestionClickHandler.bind(this, this._nextQuestion)
      );
      this._nextQuestionListenerAdded = true;
    }
  }

  clearQuiz() {
    if (this._countriesSelector.value === "Difficulty: Normal") {
      this._questionsAllNumber.textContent = "35";
      this._countries = model.worldCountries.countries
        .slice()
        .filter(
          (country) =>
            country.independent &&
            country.capital &&
            country.name.common !== "Russia"
        );
    } else if (this._countriesSelector.value === "Difficulty: Hard") {
      this._questionsAllNumber.textContent = "35";
      this._countries = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.capital && country.name.common !== "Russia"
        );
    } else if (this._countriesSelector.value === "Difficulty: Very Easy") {
      this._questionsAllNumber.textContent = "10";
      const europe = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.region === "Europe" && country.area > 30000
        );
      const africa = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.region === "Africa" && country.area > 1000000
        );
      const asia = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.region === "Asia" && country.area > 1000000
        );
      const america = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.region === "Americas" && country.area > 700000
        );
      const oceania = model.worldCountries.countries
        .slice()
        .filter(
          (country) => country.region === "Oceania" && country.area > 1000000
        );
      this._countries = [
        ...europe,
        ...asia,
        ...africa,
        ...america,
        ...oceania,
      ].filter((country) => {
        return (
          country.capital &&
          country.independent &&
          country.region !== "Antarctic" &&
          country.subregion !== "Caribbean" &&
          country.subregion !== "Central America" &&
          country.subregion !== "Western Africa" &&
          country.subregion !== "Middle Africa" &&
          country.name.common !== "Russia"
        );
      });
    } else {
      this._questionsAllNumber.textContent = "15";
      this._countries = model.worldCountries.countries
        .slice()
        .filter(
          (country) =>
            country.capital &&
            country.independent &&
            country.region !== "Oceania" &&
            country.region !== "Antarctic" &&
            country.subregion !== "Caribbean" &&
            country.subregion !== "Central America" &&
            country.name.common !== "Russia" &&
            country.area > 250000
        );
    }
    this._cardOptionsElements.forEach((cardOption) => {
      cardOption.classList.remove("wrong-answer");
      cardOption.classList.remove("right-answer");
      const flagOption = cardOption.querySelector(".flag-option");
      const countryOption = cardOption.querySelector(".country-option");
      if (
        this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
        this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ
      ) {
        flagOption.classList.remove("not-displayed");
        countryOption.classList.add("not-displayed");
      }
      if (
        this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
        this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
      ) {
        flagOption.classList.add("not-displayed");
        countryOption.classList.remove("not-displayed");
      }
    });
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._finishedQuizLabel.classList.add("not-displayed");
    this._randomCountries = [];
    this._scoreValue.textContent = 0;
    this._questionCurrentNumber.textContent = 1;
    this._doNotKnowAnswer.disabled = false;
    this._finishQuiz.disabled = false;
    this._nextQuestion.disabled = true;
    this._startQuiz.disabled = true;
    if (this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Name"
        ]
      }`;
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
      this._questionCountry.classList.remove("not-displayed");
    }
    if (this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Capital"
        ]
      }`;
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
      this._questionCountry.classList.remove("not-displayed");
    }
    if (this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Capital"
        ]
      }`;
      this._questionCountry.classList.remove("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Capital By Country Name"
        ]
      }`;
      this._questionCountry.classList.remove("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
    }
    if (this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Flag"
        ]
      }`;
      this._questionCountry.classList.add("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.remove("not-displayed");
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Capital By Flag"
        ]
      }`;
      this._questionCountry.classList.add("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.remove("not-displayed");
    }
    this.enableCardOptions();
  }

  nextQuestionClickHandler(target) {
    if (this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Name"
        ]
      }`;
    }
    if (this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Capital"
        ]
      }`;
    }
    if (this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Capital"
        ]
      }`;
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Capital By Country Name"
        ]
      }`;
    }
    if (this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Flag"
        ]
      }`;
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Capital By Flag"
        ]
      }`;
    }
    if (
      target === this._doNotKnowAnswer &&
      +this._questionCurrentNumber.textContent ===
        +this._questionsAllNumber.textContent
    ) {
      this._doNotKnowAnswer.disabled = true;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this.disableCardOptions();
      this.initTimer();
      this.showResultWindow();
      return;
    }
    this._correctIncorrectQuizAnswer.classList.add("not-displayed");
    this._randomCountries = [];
    this._cardOptionsElements.forEach((cardOption) => {
      cardOption.classList.remove("wrong-answer");
      cardOption.classList.remove("right-answer");
    });
    this._nextQuestion.disabled = true;
    this._doNotKnowAnswer.disabled = false;
    const currentQuestionNumber = this.updateCurrentQuestionNumber();
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber <= questionsAllNumber) {
      this.selectRandomCountries();
      this.renderCountryQuestion();
      this.renderCountryCards();
    } else {
      this._doNotKnowAnswer.disabled = true;
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._correctIncorrectQuizAnswer.classList.add("not-displayed");
      this.disableCardOptions();
      this.initTimer();
      this.showResultWindow();
      return;
    }
    this.enableCardOptions();
    this.initTimer();
    this._timerId = setInterval(this.timerCountDown.bind(this), 1000);
  }

  showResultWindow() {
    this._quizResultScore.textContent = this._scoreValue.textContent;
    this._quizResultAnsweredNumber.textContent =
      this._questionCurrentNumber.textContent;
    this._quizResultRatingStar.textContent = "";
    let rating = 0;
    if (+this._scoreValue.textContent !== 0) {
      const score = +this._scoreValue.textContent / DEFAULT_RIGHT_SCORE;
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
      quizType: this._quizType,
      dateTime: currentDateTime(),
      rating: rating,
      score: +this._scoreValue.textContent,
      rightAnswers: +this._quizResultRightAnswersNumber.textContent,
      answeredNumber: +this._questionCurrentNumber.textContent,
    };
    this._statisticView.addNewStatistic(statistic);
    showQuizResultWindow();
  }

  renderCountryQuestion() {
    this._questionCountrySelected =
      this._randomCountries[
        Math.floor(Math.random() * this._randomCountries.length)
      ];
    if (
      this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ ||
      this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
    ) {
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["countries"][
          this._questionCountrySelected.name.common
        ];
    }
    if (
      this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ ||
      this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ
    ) {
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["capitals"][
          this._questionCountrySelected.capital[0]
        ];
    }
    if (
      this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ ||
      this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ
    ) {
      this._questionImgCountry.src = this._questionCountrySelected.flags.png
        ? this._questionCountrySelected.flags.png
        : this._questionCountrySelected.flags.svg;
    }
  }

  selectRandomCountries() {
    const randomIndex = getRandomInt(0, this._countries.length - 1);
    const country = this._countries[randomIndex];
    while (
      !this._randomCountries.includes(country) &&
      this._randomCountries.length < 4
    ) {
      if (
        this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ ||
        this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ ||
        this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ ||
        this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ
      ) {
        if (!country.capital) {
          this._countries.splice(randomIndex, 1);
          this.selectRandomCountries();
        }
      }
      this._randomCountries.push(country);
      this._countries.splice(randomIndex, 1);
      this.selectRandomCountries();
    }
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
      this.hideQuiz();
      mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
      mapView.showMap();
      mapView.invalidateSize();
      sideNavigationView.showSideNavigation();
      topNavigationView.enableSideBarToggle();
      countriesSelectView.enableCountriesSelect();
      sessionStorage.setItem("currentWindow", "map");
      topNavigationView.initItemMenuStyle();
      this.initTimer();
    } else if (
      confirm(
        `${
          localization[model.worldCountries.language][
            "Are you sure you want to leave this quiz? Current quiz data will not be saved!"
          ]
        }`
      )
    ) {
      this.hideQuiz();
      mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
      mapView.showMap();
      mapView.invalidateSize();
      sideNavigationView.showSideNavigation();
      topNavigationView.enableSideBarToggle();
      countriesSelectView.enableCountriesSelect();
      sessionStorage.setItem("currentWindow", "map");
      topNavigationView.initItemMenuStyle();
      this.initTimer();
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

  translateElements() {
    this._quizHeading.textContent = `${
      localization[model.worldCountries.language]["Guess Flag By Country Name"]
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
    this._startQuiz.textContent = `${
      localization[model.worldCountries.language]["START AGAIN"]
    }`;
    this._doNotKnowAnswer.textContent = `${
      localization[model.worldCountries.language]["DO NOT KNOW"]
    }`;
    this._scoreElement.textContent = `${
      localization[model.worldCountries.language]["SCORE"]
    }`;
    this._questionTimerName.textContent = `${
      localization[model.worldCountries.language]["Time"]
    }`;
    this._correctIncorrectQuizAnswer.textContent =
      localization[model.worldCountries.language][
        this._correctIncorrectQuizAnswer.textContent
      ];
    if (this._questionCountrySelected)
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["countries"][
          this._questionCountrySelected.name.common
        ];
    this._questionDelimeterElement.textContent =
      localization[model.worldCountries.language]["of"];
    this._finishedQuizLabel.textContent =
      localization[model.worldCountries.language]["Finished"];
    const options = Array.from(this._countriesSelector.options);
    options.forEach((option) => {
      option.textContent =
        localization[model.worldCountries.language][option.value];
    });
    if (this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Flag"
        ]
      }`;
      this._cardOptionsElements.forEach((cardOption) => {
        const country = cardOption.querySelector(".country-option");
        country.textContent =
          localization[model.worldCountries.language]["countries"][
            country.dataset.country
          ];
      });
    }
    if (this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Capital"
        ]
      }`;
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["capitals"][
          this._questionCountrySelected.capital[0]
        ];
      this._cardOptionsElements.forEach((cardOption) => {
        const country = cardOption.querySelector(".country-option");
        country.textContent =
          localization[model.worldCountries.language]["countries"][
            country.dataset.country
          ];
      });
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Capital By Country Name"
        ]
      }`;
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["countries"][
          this._questionCountrySelected.name.common
        ];
      this._cardOptionsElements.forEach((cardOption) => {
        const countryElement = cardOption.querySelector(".country-option");
        const countryCapital = model.worldCountries.countries.find(
          (country) => country.name.common === countryElement.dataset.country
        );
        countryElement.textContent =
          localization[model.worldCountries.language]["capitals"][
            countryCapital.capital[0]
          ];
      });
    }
    if (this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Capital"
        ]
      }`;
      this._questionCountry.textContent =
        localization[model.worldCountries.language]["capitals"][
          this._questionCountrySelected.capital[0]
        ];
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Capital By Flag"
        ]
      }`;
      this._cardOptionsElements.forEach((cardOption) => {
        const countryElement = cardOption.querySelector(".country-option");
        const countryCapital = model.worldCountries.countries.find(
          (country) => country.name.common === countryElement.dataset.country
        );
        countryElement.textContent =
          localization[model.worldCountries.language]["capitals"][
            countryCapital.capital[0]
          ];
      });
    }
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

  showQuiz() {
    this._quizElement.classList.remove("not-displayed");
  }

  hideQuiz() {
    this._quizElement.classList.add("not-displayed");
  }
}

export default new Quiz();
