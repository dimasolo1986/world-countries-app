import * as model from "../model.js";
import { localization } from "../localization/ua.js";
class countriesSelectView {
  _parentElement = document.querySelector("#tree-select-countries");
  _errorMessage = "Failed to load countries!";
  _placeholder = "Search Or Select Counties...";
  _treeSelect;

  constructor() {
    let isIconsWereInserted = false;
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
        if (isIconsWereInserted) {
          return;
        }
        isIconsWereInserted = true;
        Array.from(this._parentElement.querySelectorAll("[src]")).forEach(
          (item) => {
            const src = item.getAttribute("src");
            const countOfChildNodes = item.childNodes.length;
            const iconElement = document.createElement("img");
            iconElement.textContent = iconElement.setAttribute(
              "style",
              "height: 15px; width: 20px; position: relative; border: 1px solid; margin-left: 5px;"
            );
            iconElement.setAttribute("src", src);
            item.insertBefore(
              iconElement,
              item.childNodes[countOfChildNodes - 1]
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
