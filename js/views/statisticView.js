import { localization } from "../localization/ua.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import * as model from "../model.js";
import {
  FLAG_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_NAME_BY_FLAG_QUIZ,
  COUNTRY_CAPITAL_BY_FLAG_QUIZ,
  FLAG_BY_COUNTRY_CAPITAL_QUIZ,
  COUNTRY_NAME_BY_CAPITAL_QUIZ,
  COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ,
  COUNTRY_ON_MAP_QUIZ,
  COUNTRY_NAME_BY_COUNTRY_ON_MAP,
} from "../config.js";
class statisticView {
  _parentElement = document.querySelector("#statistic-quizzes");
  _statisticHeading = document.querySelector(".statistic-name");
  _statisticData = document.querySelector(".statistic-data");
  _statisticReturnToMap = document.querySelector(".return-statistic");

  _returnToMapListenerAdded = false;

  returnToMap(
    mapView,
    aboutView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this.hideStatistic();
    aboutView.hideAboutProject();
    mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
    mapView.showMap();
    mapView.invalidateSize();
    sideNavigationView.showSideNavigation();
    topNavigationView.enableSideBarToggle();
    countriesSelectView.enableCountriesSelect();
    sessionStorage.setItem("currentWindow", "map");
    topNavigationView.initItemMenuStyle();
  }

  addReturnToMapHandlerClick(
    mapView,
    aboutView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._statisticReturnToMap.addEventListener(
        "click",
        this.returnToMap.bind(
          this,
          mapView,
          aboutView,
          sideNavigationView,
          topNavigationView,
          countriesSelectView
        )
      );
      this._returnToMapListenerAdded = true;
    }
  }

  renderStatisticData() {
    this._statisticData.innerHTML = "";
    const currentStatistic = localStorage.getItem("statistic-data");
    if (currentStatistic) {
      const currentStatisticData = JSON.parse(currentStatistic);
      currentStatisticData.forEach((statistic, index) => {
        const quizIndex = document.createElement("span");
        quizIndex.classList.add("quiz-index");
        quizIndex.style.fontWeight = "bold";
        quizIndex.textContent = index + 1 + ". ";
        const quizType = document.createElement("span");
        quizType.classList.add("quiz-type");
        quizType.style.fontWeight = "bold";
        const quizDateValue = document.createElement("span");
        quizDateValue.classList.add("quiz-data-value");
        quizDateValue.textContent = statistic.dateTime;
        const quizScoreText = document.createElement("span");
        quizScoreText.classList.add("quiz-score-text");
        quizScoreText.textContent = `${
          localization[model.worldCountries.language]["Score"]
        }`;
        const quizScoreData = document.createElement("span");
        quizScoreData.classList.add("quiz-score-value");
        quizScoreData.style.color = "darkgreen";
        quizScoreData.style.fontWeight = "bold";
        quizScoreData.textContent = " " + statistic.score;
        const quizCorrectAnswersText = document.createElement("span");
        quizCorrectAnswersText.classList.add("quiz-correct-answers-text");
        quizCorrectAnswersText.textContent = `${
          localization[model.worldCountries.language]["Correct Answers:"]
        }`;
        const quizCorrectAnswersNumber = document.createElement("span");
        quizCorrectAnswersNumber.classList.add("quiz-correct-answers-number");
        quizCorrectAnswersNumber.style.color = "darkgreen";
        quizCorrectAnswersNumber.textContent =
          " " + statistic.rightAnswers + " ";
        const quizCorrectAnswersDelimeter = document.createElement("span");
        quizCorrectAnswersDelimeter.classList.add(
          "quiz-correct-answers-delimeter"
        );
        quizCorrectAnswersDelimeter.textContent = `${
          localization[model.worldCountries.language]["of"]
        }`;
        const quizAnsweredNumber = document.createElement("span");
        quizAnsweredNumber.classList.add("quiz-answered-number");
        quizAnsweredNumber.textContent = " " + statistic.answeredNumber;
        const quiz = statistic.quizType;
        quizType.dataset.type = quiz;
        const quizRatingText = document.createElement("span");
        quizRatingText.classList.add("quiz-rating-text");
        quizRatingText.textContent = `${
          localization[model.worldCountries.language]["Rating:"]
        }`;
        const quizRatingValue = document.createElement("span");
        quizRatingValue.classList.add("quiz-rating-value");
        const rating = +statistic.rating;
        if (rating === 0) {
          quizRatingValue.textContent = "☆";
        } else {
          for (let index = 0; index < rating; index++) {
            quizRatingValue.textContent += "⭐";
          }
        }
        switch (quiz) {
          case FLAG_BY_COUNTRY_NAME_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Flag By Country Name Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_FLAG_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Flag Quiz"
              ]
            }`;
            break;
          case COUNTRY_CAPITAL_BY_FLAG_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Country Capital By Flag Quiz"
              ]
            }`;
            break;
          case FLAG_BY_COUNTRY_CAPITAL_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Flag By Country Capital Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_CAPITAL_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Capital Quiz"
              ]
            }`;
            break;
          case COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Capital By Country Name Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_COUNTRY_ON_MAP:
            quizType.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Country On Map Quiz"
              ]
            }`;
            break;
          case COUNTRY_ON_MAP_QUIZ:
            quizType.textContent = `${
              localization[model.worldCountries.language]["Country On Map Quiz"]
            }`;
            break;
        }
        const space1 = document.createElement("span");
        space1.textContent = " | ";
        const space2 = document.createElement("span");
        space2.textContent = " | ";
        const space3 = document.createElement("span");
        space3.textContent = " | ";
        const space4 = document.createElement("span");
        space4.textContent = " | ";
        this._statisticData.appendChild(quizIndex);
        this._statisticData.appendChild(quizType);
        this._statisticData.appendChild(space1);
        this._statisticData.appendChild(quizDateValue);
        this._statisticData.appendChild(space2);
        this._statisticData.appendChild(quizScoreText);
        this._statisticData.appendChild(quizScoreData);
        this._statisticData.appendChild(space3);
        this._statisticData.appendChild(quizCorrectAnswersText);
        this._statisticData.appendChild(quizCorrectAnswersNumber);
        this._statisticData.appendChild(quizCorrectAnswersDelimeter);
        this._statisticData.appendChild(quizAnsweredNumber);
        this._statisticData.appendChild(space4);
        this._statisticData.appendChild(quizRatingText);
        this._statisticData.appendChild(quizRatingValue);
        this._statisticData.appendChild(document.createElement("br"));
      });
    } else {
      const statisticData = document.createElement("p");
      statisticData.classList.add("statistic-no-data");
      statisticData.style.color = "black";
      statisticData.textContent = `${
        localization[model.worldCountries.language][
          "There Are No Quiz Passing Statistics..."
        ]
      }`;
      this._statisticData.appendChild(statisticData);
    }
  }

  addNewStatistic(statistic) {
    const currentStatistic = localStorage.getItem("statistic-data");
    if (currentStatistic) {
      const statisticData = JSON.parse(currentStatistic);
      if (statisticData.length === 50) {
        statisticData.pop();
        statisticData.unshift(statistic);
        localStorage.setItem("statistic-data", JSON.stringify(statisticData));
      } else {
        statisticData.unshift(statistic);
        localStorage.setItem("statistic-data", JSON.stringify(statisticData));
      }
    } else {
      localStorage.setItem("statistic-data", JSON.stringify([statistic]));
    }
  }

  showStatisticInfo() {
    this.showStatistic();
  }

  showStatistic() {
    this._parentElement.classList.remove("not-displayed");
  }

  hideStatistic() {
    this._parentElement.classList.add("not-displayed");
  }

  translateElements() {
    this._statisticReturnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO MAP"]
    }`;
    this._statisticHeading.textContent = `${
      localization[model.worldCountries.language][
        "Quiz Passing Statistics (last 50 records)"
      ]
    }`;
    const noData = this._statisticData.querySelector(".statistic-no-data");
    if (noData) {
      noData.textContent = `${
        localization[model.worldCountries.language][
          "There Are No Quiz Passing Statistics..."
        ]
      }`;
    }
    const quizTypes = this._statisticData.querySelectorAll(".quiz-type");
    if (quizTypes) {
      quizTypes.forEach((quiz) => {
        const quizType = quiz.dataset.type;
        switch (quizType) {
          case FLAG_BY_COUNTRY_NAME_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Flag By Country Name Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_FLAG_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Flag Quiz"
              ]
            }`;
            break;
          case COUNTRY_CAPITAL_BY_FLAG_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Country Capital By Flag Quiz"
              ]
            }`;
            break;
          case FLAG_BY_COUNTRY_CAPITAL_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Flag By Country Capital Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_CAPITAL_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Capital Quiz"
              ]
            }`;
            break;
          case COUNTRY_CAPITAL_BY_COUNTRY_NAME_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Capital By Country Name Quiz"
              ]
            }`;
            break;
          case COUNTRY_NAME_BY_COUNTRY_ON_MAP:
            quiz.textContent = `${
              localization[model.worldCountries.language][
                "Country Name By Country On Map Quiz"
              ]
            }`;
            break;
          case COUNTRY_ON_MAP_QUIZ:
            quiz.textContent = `${
              localization[model.worldCountries.language]["Country On Map Quiz"]
            }`;
            break;
        }
      });
    }
    const quizScoreTexts =
      this._statisticData.querySelectorAll(".quiz-score-text");
    if (quizScoreTexts) {
      quizScoreTexts.forEach((scoreText) => {
        scoreText.textContent = `${
          localization[model.worldCountries.language]["Score"]
        }`;
      });
    }
    const quizRatingTexts =
      this._statisticData.querySelectorAll(".quiz-rating-text");
    if (quizRatingTexts) {
      quizRatingTexts.forEach((ratingText) => {
        ratingText.textContent = `${
          localization[model.worldCountries.language]["Rating:"]
        }`;
      });
    }
    const quizCorrectAnswersTexts = this._statisticData.querySelectorAll(
      ".quiz-correct-answers-text"
    );
    if (quizCorrectAnswersTexts) {
      quizCorrectAnswersTexts.forEach((correctAnswersText) => {
        correctAnswersText.textContent = `${
          localization[model.worldCountries.language]["Correct Answers:"]
        }`;
      });
    }
    const quizCorrectAnswersDelimeters = this._statisticData.querySelectorAll(
      ".quiz-correct-answers-delimeter"
    );
    if (quizCorrectAnswersDelimeters) {
      quizCorrectAnswersDelimeters.forEach((correctAnswersDelimeter) => {
        correctAnswersDelimeter.textContent = `${
          localization[model.worldCountries.language]["of"]
        }`;
      });
    }
  }
}

export default new statisticView();
