import { localization } from "../localization/ua.js";
import * as model from "../model.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import { removeCenterElementsMainLayout } from "../helpers.js";
class aboutView {
  _parentElement = document.querySelector("#about-project");
  _aboutHeading = document.querySelector(".about-heading");
  _aboutInfo = document.querySelector(".about-info");
  _aboutStatistic = document.querySelector(".statistic-info");
  _aboutProjectName = document.querySelector(".about-project-name");
  _aboutProjectDescription = document.querySelector(
    ".about-project-description"
  );
  _aboutAvailableQuizzes = document.querySelector(".about-available-quizzes");
  _aboutFlagByCountryQuizName = document.querySelector(
    ".about-flag-by-country-quiz-name"
  );
  _aboutCountryNameByFlagQuizName = document.querySelector(
    ".about-country-name-by-flag-quiz-name"
  );
  _aboutCountryNameByFlagQuizDescription = document.querySelector(
    ".about-country-name-by-flag-quiz-description"
  );
  _aboutCountryNameByEmblemQuizName = document.querySelector(
    ".about-country-name-by-emblem-quiz-name"
  );
  _aboutCountryNameByEmblemQuizDescription = document.querySelector(
    ".about-country-name-by-emblem-description"
  );
  _aboutFlagByCountryQuizDescription = document.querySelector(
    ".about-flag-by-country-quiz-description"
  );
  _aboutCountryCapitalByFlagQuizName = document.querySelector(
    ".about-country-capital-by-flag-quiz-name"
  );
  _aboutCountryCapitalByFlagQuizDescription = document.querySelector(
    ".about-country-capital-by-flag-quiz-description"
  );
  _aboutFalgByCountryCapitalQuizName = document.querySelector(
    ".about-flag-by-country-capital-quiz-name"
  );
  _aboutFalgByCountryCapitalQuizDescription = document.querySelector(
    ".about-flag-by-country-capital-description"
  );
  _aboutCountryNameByCapitalQuizName = document.querySelector(
    ".about-country-name-by-capital-quiz-name"
  );
  _aboutCountryNameByCapitalQuizDescription = document.querySelector(
    ".about-country-name-by-capital-quiz-description"
  );
  _aboutCountryCapitalByCountryNameQuizName = document.querySelector(
    ".about-capital-by-country-name-quiz-name"
  );
  _aboutCountryCapitalByCountryNameQuizDescription = document.querySelector(
    ".about-capital-by-country-name-quiz-description"
  );
  _aboutCountryOnMapQuizName = document.querySelector(
    ".about-country-on-map-name"
  );
  _aboutCountryOnMapQuizDescription = document.querySelector(
    ".about-country-on-map-description"
  );
  _aboutCountryNameOnCountryMapQuizName = document.querySelector(
    ".about-country-name-by-country-on-map-quiz-name"
  );
  _aboutCountryNameOnCountryMapQuizDescription = document.querySelector(
    ".about-name-by-country-on-map-description"
  );
  _aboutQuizzesQuestionsAndPoints = document.querySelector(
    ".about-questions-points"
  );
  _aboutAvailableGames = document.querySelector(".about-available-games");
  _aboutGuessCountryGameName = document.querySelector(
    ".about-guess-countries-game-name"
  );
  _aboutGuessCountryGameDescription = document.querySelector(
    ".about-guess-countries-game-description"
  );
  _aboutDeveloper = document.querySelector(".about-developer");
  _aboutDeveloperLink = document.querySelector(".about-developer-link");
  _aboutDeveloperEmailDescription = document.querySelector(
    ".about-developer-email-description"
  );
  _aboutUkraineHelpDescription = document.querySelector(
    ".about-ukraine-help-description"
  );
  _aboutDonateAuthorText = document.querySelector(
    ".about-developer-donate-author-description"
  );
  _aboutUkraineHelpLink = document.querySelector(".about-ukraine-help-link");
  _aboutMapLibrary = document.querySelector(".about-map-library");
  _aboutReturnToMap = document.querySelector(".return-about");

  _returnToMapListenerAdded = false;

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    removeCenterElementsMainLayout();
    this.hideAboutProject();
    mapView.setMapViewToBounds(WORLD_MAP_BOUNDS);
    mapView.showMap();
    mapView.invalidateSize();
    sideNavigationView.showSideNavigation();
    topNavigationView.enableSideBarToggle();
    if (window.screen.width < 600) {
      topNavigationView.hideSideNavigation();
    } else {
      topNavigationView.showSideNavigation();
    }
    countriesSelectView.enableCountriesSelect();
    sessionStorage.setItem("currentWindow", "map");
    topNavigationView.initItemMenuStyle();
  }

  addReturnToMapHandlerClick(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._aboutReturnToMap.addEventListener(
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

  showAboutProjectInfo() {
    this.showAboutProject();
  }

  showAboutProject() {
    this._parentElement.classList.remove("not-displayed");
  }

  hideAboutProject() {
    this._parentElement.classList.add("not-displayed");
  }

  translateElements() {
    this._aboutReturnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO WORLD MAP"]
    }`;
    this._aboutProjectName.textContent = `${
      localization[model.worldCountries.language]["World Countries And Quizzes"]
    }`;
    this._aboutProjectDescription.textContent = `${
      localization[model.worldCountries.language][
        "project which is developed for learning Geography and World Countries."
      ]
    }`;
    this._aboutInfo.textContent = `${
      localization[model.worldCountries.language][
        "Here you can find all countries of the world on a map, brief information about selected countries, links to Wikipedia pages of a specific country. It is also possible to take various quizzes with specific difficulty levels: Very Easy, Easy, Normal, Hard."
      ]
    }`;
    this._aboutAvailableQuizzes.textContent = `${
      localization[model.worldCountries.language]["Quizzes:"]
    }`;
    this._aboutAvailableGames.textContent = `${
      localization[model.worldCountries.language]["Games:"]
    }`;
    this._aboutGuessCountryGameName.textContent = `${
      localization[model.worldCountries.language]["Guess Countries Game"]
    }`;
    this._aboutGuessCountryGameDescription.textContent = `${
      localization[model.worldCountries.language][
        "The game 'Guess Countries' helps to learn the location of countries in the world. Choose a given number of countries on the map. The computer will also choose the appropriate number of countries. Attempts to guess the countries take place in turn. The one who guesses the opponent's country gets an additional attempt. The winner is the one who first guesses all the opponent's countries. Follow the messages at the top of the screen after the game starts."
      ]
    }`;
    this._aboutFlagByCountryQuizName.textContent = `${
      localization[model.worldCountries.language]["Flag By Country Name Quiz"]
    }`;
    this._aboutFlagByCountryQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's flag from the suggested country name."
      ]
    }`;
    this._aboutDeveloper.textContent = `${
      localization[model.worldCountries.language][
        "Project was created by Software Developer from Ukraine -"
      ]
    }`;
    this._aboutDeveloperLink.textContent = `${
      localization[model.worldCountries.language]["Dmytro Solovei"]
    }`;
    this._aboutDeveloperLink.href = `
        https://dimasolo.pythonanywhere.com/${model.worldCountries.language}/home`;
    this._aboutUkraineHelpLink.textContent = `${
      localization[model.worldCountries.language]["Come Back Alive"]
    }`;
    this._aboutUkraineHelpLink.href = `${
      model.worldCountries.language === "ua"
        ? "https://savelife.in.ua"
        : "https://savelife.in.ua/en/"
    }
    `;

    this._aboutDeveloperEmailDescription.textContent = `${
      localization[model.worldCountries.language]["You can reach me by e-mail:"]
    }`;
    this._aboutCountryNameByFlagQuizName.textContent = `${
      localization[model.worldCountries.language]["Country Name By Flag Quiz"]
    }`;
    this._aboutCountryNameByEmblemQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Country Name By Coat Of Arms Quiz"
      ]
    }`;
    this._aboutCountryCapitalByFlagQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Country Capital By Flag Quiz"
      ]
    }`;
    this._aboutFalgByCountryCapitalQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Flag By Country Capital Quiz"
      ]
    }`;
    this._aboutCountryNameByCapitalQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Country Name By Capital Quiz"
      ]
    }`;
    this._aboutCountryCapitalByCountryNameQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Capital By Country Name Quiz"
      ]
    }`;
    this._aboutCountryNameOnCountryMapQuizName.textContent = `${
      localization[model.worldCountries.language][
        "Country Name By Country On Map Quiz"
      ]
    }`;
    this._aboutCountryOnMapQuizName.textContent = `${
      localization[model.worldCountries.language]["Country On Map Quiz"]
    }`;
    this._aboutCountryCapitalByCountryNameQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's capital from the suggested country name."
      ]
    }`;
    this._aboutCountryNameByCapitalQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's name from the suggested country capital."
      ]
    }`;
    this._aboutCountryCapitalByFlagQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's capital from the suggested country flag image."
      ]
    }`;
    this._aboutCountryNameByFlagQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's name from the suggested country flag image."
      ]
    }`;
    this._aboutCountryNameByEmblemQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's name from the suggested country coat of arms image."
      ]
    }`;
    this._aboutFalgByCountryCapitalQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's flag from the suggested country's capital."
      ]
    }`;
    this._aboutCountryNameOnCountryMapQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country's name from the suggested country on a map."
      ]
    }`;
    this._aboutCountryOnMapQuizDescription.textContent = `${
      localization[model.worldCountries.language][
        "Guess the country on the map from the suggested country name. The quiz contains 35 questions. Get 300 points for each correct answer."
      ]
    }`;
    this._aboutQuizzesQuestionsAndPoints.textContent = `${
      localization[model.worldCountries.language][
        "Quizzes contain from 10 to 35 questions depending on the difficulty level. Get from 5 to 100 points for each correct answer, depending on the speed of the answer."
      ]
    }`;
    this._aboutUkraineHelpDescription.textContent = `${
      localization[model.worldCountries.language][
        "You can support Ukraine in the fight against Russia's military aggression:"
      ]
    }`;
    this._aboutDonateAuthorText.textContent = `${
      localization[model.worldCountries.language]["Support Project"]
    }`;
    this._aboutMapLibrary.textContent = `${
      localization[model.worldCountries.language]["Used Map Library:"]
    }`;
    this._aboutStatistic.textContent = `${
      localization[model.worldCountries.language][
        "Quiz Passing Statistics shows the last 50 quiz scores and ratings that were passed."
      ]
    }`;
  }
}

export default new aboutView();
