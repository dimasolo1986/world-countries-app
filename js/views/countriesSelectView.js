import * as model from "../model.js";
import { localization } from "../localization/ua.js";
class countriesSelectView {
  _parentElement = document.querySelector("#tree-select-countries");
  _errorMessage = "Failed to load countries!";
  _placeholder = "Search Or Select Counties...";
  _treeSelect;

  constructor() {
    this._treeSelect = new Treeselect({
      parentHtmlContainer: this._parentElement,
      placeholder: this._placeholder,
      tagsCountText: "Selected",
      showTags: false,
      showCount: false,
      openLevel: 2,
      value: [],
      options: [],
    });
  }

  buildCountriesObject(worldCountries) {
    const countriesObject = {};
    worldCountries.countries.forEach((element) => {
      const country =
        localization[model.worldCountries.language]["countries"][
          element.name.common
        ];
      const firstCountryLetter = country.charAt(0);
      if (firstCountryLetter in countriesObject) {
        countriesObject[firstCountryLetter].push(country);
      } else {
        countriesObject[firstCountryLetter] = [country];
      }
    });
    return countriesObject;
  }

  renderOptions(worldCountries) {
    const options = [
      {
        name: localization[model.worldCountries.language]["All Countries"],
        value: localization[model.worldCountries.language]["All Countries"],
        children: Object.entries(this.buildCountriesObject(worldCountries)).map(
          (entry) => {
            return {
              name: entry[0],
              value: entry[0],
              children: entry[1].map((entry) => {
                return {
                  name: entry,
                  value: entry,
                  children: [],
                };
              }),
            };
          }
        ),
      },
    ];
    this._treeSelect.options = options;
    this._treeSelect.placeholder =
      localization[model.worldCountries.language][
        "Search Or Select Counties..."
      ];
    this._treeSelect.tagsCountText =
      localization[model.worldCountries.language]["Selected"];
    this._treeSelect.mount();
  }

  countriesSelectionHandler(handler) {
    this._treeSelect.srcElement.addEventListener("input", (event) => {
      handler(event.detail);
    });
  }

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }
}

export default new countriesSelectView();
