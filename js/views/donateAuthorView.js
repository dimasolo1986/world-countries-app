import { localization } from "../localization/ua.js";
import * as model from "../model.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
class donateAuthorView {
  _parentElement = document.querySelector("#donate-author-page");
  _donateAuthorQRCode = document.querySelector("#donate-qr-code");
  _donateHeading = document.querySelector(".donate-link");
  _donateQrCodeText = document.querySelector("#donate-qr-code-text");

  _donateReturnToMap = document.querySelector(".return-donate");

  _returnToMapListenerAdded = false;

  returnToMap(
    mapView,
    statisticView,
    flagsView,
    aboutView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this.hideDonateProject();
    statisticView.hideStatistic();
    aboutView.hideAboutProject();
    flagsView.hideFlags();
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
    statisticView,
    flagsView,
    aboutView,
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
          statisticView,
          flagsView,
          aboutView,
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
      localization[model.worldCountries.language]["Donation Page"]
    }`;
    this._donateQrCodeText.textContent = `${
      localization[model.worldCountries.language]["QR Code"]
    }`;
  }
}

export default new donateAuthorView();
