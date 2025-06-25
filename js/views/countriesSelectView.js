import * as model from "../model.js";
import { localization } from "../localization/ua.js";
class countriesSelectView {
  _parentElement = document.querySelector("#tree-select-countries");
  _errorMessage = "Failed to load countries!";
  _placeholder = "Search Or Select Countries...";
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
              "height: 19px; width: 19px; position: relative; border: 1px solid; margin-right: 5px; margin-bottom: 2px; border-radius: 50%;"
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

  disableEnableOptions(selectedItems) {
    if (selectedItems.length === 0) {
      this._treeSelect.options.forEach((option) => (option.disabled = false));
      this._treeSelect.mount();
      this._treeSelect.toggleOpenClose();
    } else if (
      selectedItems.includes(
        localization[model.worldCountries.language]["Europe"]
      ) ||
      selectedItems.includes(
        localization[model.worldCountries.language]["Americas"]
      ) ||
      selectedItems.includes(
        localization[model.worldCountries.language]["Oceania"]
      ) ||
      selectedItems.includes(
        localization[model.worldCountries.language]["Africa"]
      ) ||
      selectedItems.includes(
        localization[model.worldCountries.language]["Asia"]
      ) ||
      selectedItems.includes(
        localization[model.worldCountries.language]["Antarctic"]
      )
    ) {
      this._treeSelect.options[6].disabled = true;
      this._treeSelect.mount();
      this._treeSelect.toggleOpenClose();
    } else if (
      !selectedItems.includes(
        localization[model.worldCountries.language]["Europe"]
      ) &&
      !selectedItems.includes(
        localization[model.worldCountries.language]["Americas"]
      ) &&
      !selectedItems.includes(
        localization[model.worldCountries.language]["Oceania"]
      ) &&
      !selectedItems.includes(
        localization[model.worldCountries.language]["Africa"]
      ) &&
      !selectedItems.includes(
        localization[model.worldCountries.language]["Asia"]
      ) &&
      !selectedItems.includes(
        localization[model.worldCountries.language]["Antarctic"]
      )
    ) {
      this._treeSelect.options[6].disabled = false;
      this._treeSelect.options[0].disabled = true;
      this._treeSelect.options[1].disabled = true;
      this._treeSelect.options[2].disabled = true;
      this._treeSelect.options[3].disabled = true;
      this._treeSelect.options[4].disabled = true;
      this._treeSelect.options[5].disabled = true;
      this._treeSelect.mount();
      this._treeSelect.toggleOpenClose();
    }
  }

  renderOptions(worldCountries) {
    const options = [
      {
        name: localization[model.worldCountries.language]["Europe"],
        value: localization[model.worldCountries.language]["Europe"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["Americas"],
        value: localization[model.worldCountries.language]["Americas"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["Asia"],
        value: localization[model.worldCountries.language]["Asia"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["Africa"],
        value: localization[model.worldCountries.language]["Africa"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["Oceania"],
        value: localization[model.worldCountries.language]["Oceania"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["Antarctic"],
        value: localization[model.worldCountries.language]["Antarctic"],
        children: [],
        disabled: false,
      },
      {
        name: localization[model.worldCountries.language]["All Countries"],
        value: localization[model.worldCountries.language]["All Countries"],
        disabled: false,
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
        "Search Or Select Countries..."
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
