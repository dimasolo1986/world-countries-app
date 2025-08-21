import { localization } from "../localization/ua.js";
import * as model from "../model.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import { removeCenterElementsMainLayout } from "../helpers.js";
class donateAuthorView {
  _parentElement = document.querySelector("#donate-author-page");
  _donateAuthorQRCode = document.querySelector("#donate-qr-code");
  _donateHeading = document.querySelector(".donate-link");
  _donateText = document.querySelector(".donate-text");
  _donateShareWebSite = document.querySelector(".share-donate");
  _donateQrCodeText = document.querySelector("#donate-qr-code-text");
  _donateCardText = document.querySelector("#donate-card-number");

  _donateReturnToMap = document.querySelector(".return-donate");

  _returnToMapListenerAdded = false;
  _shareWebSiteListenerAdded = false;
  _makeDonateListenerAdded = false;

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    removeCenterElementsMainLayout();
    this.hideDonateProject();
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

  addShareWebSiteHandlerClick() {
    if (!this._shareWebSiteListenerAdded) {
      this._donateShareWebSite.addEventListener("click", function () {
        if (navigator.share) {
          navigator
            .share({
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
                document.querySelector(".about-project-description")
                  .textContent +
                " " +
                document.querySelector(".about-info").textContent
              }`,
              url: "https://www.worldcountriesquiz.com",
            })
            .then(function () {})
            .catch(function () {});
        }
      });
    }
  }

  addReturnToMapHandlerClick(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._donateReturnToMap.addEventListener(
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

  showDonateInfo() {
    this.showDonateProject();
  }

  showDonateProject() {
    this._parentElement.classList.remove("not-displayed");
  }

  hideDonateProject() {
    this._parentElement.classList.add("not-displayed");
  }

  translateElements() {
    this._donateReturnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO WORLD MAP"]
    }`;
    this._donateHeading.textContent = `${
      localization[model.worldCountries.language]["Make Donate"]
    }`;
    this._donateShareWebSite.textContent = `${
      localization[model.worldCountries.language]["Share"]
    }`;
    this._donateText.textContent = `${
      localization[model.worldCountries.language][
        "If you like this project, you can share it with your friends or support it financially. Thank you!"
      ]
    }`;
    this._donateQrCodeText.textContent = `${
      localization[model.worldCountries.language]["QR Code"]
    }`;
    this._donateCardText.textContent = `${
      localization[model.worldCountries.language]["Card number (UAH):"]
    }`;
  }
}

export default new donateAuthorView();
