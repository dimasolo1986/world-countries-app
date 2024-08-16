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
      openCallback: () => {
        Array.from(this._parentElement.querySelectorAll("[src]")).forEach(
          (item) => {
            if (!item.childNodes[1]) {
              return;
            }
            if (item.childNodes[1] && item.childNodes[1].childNodes.length > 1)
              return;
            const src = item.getAttribute("src");
            const iconElement = document.createElement("img");
            iconElement.textContent = iconElement.setAttribute(
              "style",
              "height: 15px; width: 20px; position: relative; border: 1px solid; margin-right: 5px; margin-bottom: 2px;"
            );
            iconElement.setAttribute("src", src);
            item.childNodes[1].insertBefore(
              iconElement,
              item.childNodes[1].childNodes[0]
            );
          }
        );
      },
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
        countriesObject[firstCountryLetter].push([country, element.flags.png]);
      } else {
        countriesObject[firstCountryLetter] = [[country, element.flags.png]];
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
                  name: entry[0],
                  value: entry[0],
                  htmlAttr: { src: entry[1] },
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

  disableCountriesSelect() {
    this._parentElement.style.opacity = 0.65;
    this._treeSelect.disabled = true;
    this._treeSelect.mount();
  }

  enableCountriesSelect() {
    this._parentElement.style.opacity = 1;
    this._treeSelect.disabled = false;
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
