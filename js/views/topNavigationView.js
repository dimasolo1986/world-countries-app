import * as model from "../model.js";
import { localization } from "../localization/ua.js";
class topNavigationView {
  _parentElement = document.querySelector(".sb-topnav");
  _logoCountriesElement = document.querySelector(".logo-countries");

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  translateLogoCountriesElement() {
    this._logoCountriesElement.textContent = `${
      localization[model.worldCountries.language]["Countries"]
    }`;
  }
}

export default new topNavigationView();
