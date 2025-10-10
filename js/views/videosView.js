import { localization } from "../localization/ua.js";
import * as model from "../model.js";
import { WORLD_MAP_BOUNDS } from "../config.js";
import { removeCenterElementsMainLayout } from "../helpers.js";
class videosView {
  _parentElement = document.querySelector("#videos-project");
  _videoHeading = document.querySelector(".videos-header");
  _europeCaption = document.querySelector(".europe-countries-video");
  _americasCaption = document.querySelector(".americas-countries-video");
  _asiaCaption = document.querySelector(".asia-countries-video");
  _africaCaption = document.querySelector(".africa-countries-video");
  _oceaniaCaption = document.querySelector(".oceania-countries-video");
  _antarcticCaption = document.querySelector(".antarctic-countries-video");
  _videosReturnToMap = document.querySelector(".return-videos");

  _returnToMapListenerAdded = false;

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    removeCenterElementsMainLayout();
    this.hideVideosProject();
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
      this._videosReturnToMap.addEventListener(
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

  showVideosProjectInfo() {
    this.showVideosProject();
  }

  showVideosProject() {
    this._parentElement.classList.remove("not-displayed");
  }

  hideVideosProject() {
    this._parentElement.classList.add("not-displayed");
  }

  translateElements() {
    this._videosReturnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO WORLD MAP"]
    }`;
    this._videoHeading.textContent = `${
      localization[model.worldCountries.language]["VIDEOS:"]
    }`;
    this._europeCaption.textContent = `${
      localization[model.worldCountries.language]["Europe"]
    }`;
    this._americasCaption.textContent = `${
      localization[model.worldCountries.language]["Americas"]
    }`;
    this._asiaCaption.textContent = `${
      localization[model.worldCountries.language]["Asia"]
    }`;
    this._africaCaption.textContent = `${
      localization[model.worldCountries.language]["Africa"]
    }`;
    this._oceaniaCaption.textContent = `${
      localization[model.worldCountries.language]["Oceania"]
    }`;
    this._antarcticCaption.textContent = `${
      localization[model.worldCountries.language]["Antarctic"]
    }`;
  }
}

export default new videosView();
