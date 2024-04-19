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
      tagsCountText: "Countries selected",
      showTags: false,
      showCount: true,
      openLevel: 1,
      value: [],
      options: [],
    });
  }

  renderOptions(worldCountries) {
    const options = [
      {
        name: localization[model.worldCountries.language]["All Countries"],
        value: localization[model.worldCountries.language]["All Countries"],
        children: worldCountries.countries.map((country) => {
          return {
            name: localization[model.worldCountries.language]["countries"][
              country.name.common
            ],
            value:
              localization[model.worldCountries.language]["countries"][
                country.name.common
              ],
            children: [],
          };
        }),
      },
    ];
    this._treeSelect.options = options;
    this._treeSelect.placeholder =
      localization[model.worldCountries.language][
        "Search Or Select Counties..."
      ];
    this._treeSelect.tagsCountText =
      localization[model.worldCountries.language]["Countries selected"];
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
