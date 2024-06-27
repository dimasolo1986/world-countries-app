import * as model from "../model.js";
import { localization } from "../localization/ua.js";
import { getRandomInt } from "../helpers.js";
import { DEFAULT_RIGHT_SCORE } from "../config.js";
import { showQuizResultWindow } from "../helpers.js";
import { GEOGRAPHICAL_CENTER, DEFAULT_ZOOM_LEVEL } from "../config.js";
import {
  FLAG_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_NAME_BY_FLAG_QUIZ,
  COUNTRY_CAPITAL_BY_FLAG_QUIZ,
  FLAG_BY_COUNTRY_CAPITAL_QUIZ,
  COUNTRY_NAME_BY_CAPITAL_QUIZ,
  COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ,
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
  _finishedQuizLabel = document.querySelector(".finished-quiz");
  _returnToMap = document.querySelector(".return");
  _scoreElement = document.querySelector(".score-name");
  _scoreValue = document.querySelector(".score");
  _cardOptionsElements = document.querySelectorAll(".card");
  _countries;
  _questionCountrySelected;
  _randomCountries = [];
  _statisticView;

  _returnToMapListenerAdded = false;
  _cardListenerAdded = false;
  _finishQuizListenerAdded = false;
  _nextQuestionListenerAdded = false;
  _startQuizListenerAdded = false;
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
    this._countriesSelector.value = "Only Independent Countries";
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
    this.startQuizHandler();
    this.selectRandomCountries();
    this.renderCountryQuestion();
    this.renderCountryCards();
    this.addCardClickHandler();
  }

  countriesSelectHandler() {
    const countriesSelector = function () {
      if (this._countriesSelector.value === "Only Independent Countries") {
        this._countries = this._countries.filter(
          (country) => country.independent
        );
      } else {
        this._countries = model.worldCountries.countries.slice();
      }
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
      this._finishedQuizLabel.classList.add("not-displayed");
      this._cardOptionsElements.forEach((cardOption) => {
        cardOption.classList.remove("wrong-answer");
        cardOption.classList.remove("right-answer");
      });
      this.enableCardOptions();
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
      this._finishedQuizLabel.classList.remove("not-displayed");
      this._cardOptionsElements.forEach((cardOption) => {
        cardOption.classList.remove("wrong-answer");
        cardOption.classList.remove("right-answer");
      });
      this.disableCardOptions();
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

  cardHandler(flag) {
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
      const currentScore = +this._scoreValue.textContent;
      this._scoreValue.textContent = currentScore + DEFAULT_RIGHT_SCORE;
    } else {
      flag.classList.add("wrong-answer");
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
    }
    this._nextQuestion.disabled = false;
    const currentQuestionNumber = +this._questionCurrentNumber.textContent;
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber === questionsAllNumber) {
      this._nextQuestion.disabled = true;
      this._startQuiz.disabled = false;
      this._finishQuiz.disabled = true;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.showResultWindow();
    }
    this.disableCardOptions();
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
          this.cardHandler.bind(this, cardOption)
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

  nextButtonHandler() {
    if (!this._nextQuestionListenerAdded) {
      this._nextQuestion.addEventListener(
        "click",
        this.nextQuestionClickHandler.bind(this)
      );
      this._nextQuestionListenerAdded = true;
    }
  }

  clearQuiz() {
    if (this._countriesSelector.value === "Only Independent Countries") {
      this._countries = model.worldCountries.countries
        .slice()
        .filter((country) => country.independent);
    } else {
      this._countries = model.worldCountries.countries.slice();
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
    this._finishedQuizLabel.classList.add("not-displayed");
    this._randomCountries = [];
    this._scoreValue.textContent = 0;
    this._questionCurrentNumber.textContent = 1;
    this._finishQuiz.disabled = false;
    this._nextQuestion.disabled = true;
    this._startQuiz.disabled = true;
    if (this._quizType === FLAG_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Name Quiz"
        ]
      }`;
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
      this._questionCountry.classList.remove("not-displayed");
    }
    if (this._quizType === FLAG_BY_COUNTRY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Flag By Country Capital Quiz"
        ]
      }`;
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
      this._questionCountry.classList.remove("not-displayed");
    }
    if (this._quizType === COUNTRY_NAME_BY_CAPITAL_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Capital Quiz"
        ]
      }`;
      this._questionCountry.classList.remove("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Capital By Country Name Quiz"
        ]
      }`;
      this._questionCountry.classList.remove("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.add("not-displayed");
    }
    if (this._quizType === COUNTRY_NAME_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Name By Flag Quiz"
        ]
      }`;
      this._questionCountry.classList.add("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.remove("not-displayed");
    }
    if (this._quizType === COUNTRY_CAPITAL_BY_FLAG_QUIZ) {
      this._quizHeading.textContent = this._quizHeading.textContent = `${
        localization[model.worldCountries.language][
          "Guess Country Capital By Flag Quiz"
        ]
      }`;
      this._questionCountry.classList.add("not-displayed");
      this._questionCountry.textContent = "";
      this._questionImgCountry.classList.remove("not-displayed");
    }
    this.enableCardOptions();
  }

  nextQuestionClickHandler() {
    this._randomCountries = [];
    this._cardOptionsElements.forEach((cardOption) => {
      cardOption.classList.remove("wrong-answer");
      cardOption.classList.remove("right-answer");
    });
    this._nextQuestion.disabled = true;
    const currentQuestionNumber = this.updateCurrentQuestionNumber();
    const questionsAllNumber = +this._questionsAllNumber.textContent;
    if (currentQuestionNumber <= questionsAllNumber) {
      this.selectRandomCountries();
      this.renderCountryQuestion();
      this.renderCountryCards();
    } else {
      this._nextQuestion.disabled = true;
      this._finishQuiz.disabled = true;
      this._startQuiz.disabled = false;
      this._finishedQuizLabel.classList.remove("not-displayed");
      this.showResultWindow();
    }
    this.enableCardOptions();
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
      } else {
        for (let index = 0; index < 4; index++) {
          this._quizResultRatingStar.textContent += "⭐";
        }
        rating = 4;
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
      this._quizResultRatingStar.textContent = "0️⃣";
    }
    const statistic = {
      quizType: this._quizType,
      dateTime: currentDateTime(),
      rating: rating,
      score: +this._scoreValue.textContent,
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
      confirm(
        `${
          localization[model.worldCountries.language][
            "Are you sure you want to leave this quiz? Current quiz data will not be saved!"
          ]
        }`
      )
    ) {
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

  translateElements() {
    this._quizHeading.textContent = `${
      localization[model.worldCountries.language][
        "Guess Flag By Country Name Quiz"
      ]
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
          "Guess Country Name By Flag Quiz"
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
          "Guess Country Name By Capital Quiz"
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
          "Guess Capital By Country Name Quiz"
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
          "Guess Flag By Country Capital Quiz"
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
          "Guess Country Capital By Flag Quiz"
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
