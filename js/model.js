import { ALL_COUNTRIES_ENDPOINT } from "./config.js";
import { AJAX } from "./helpers.js";
import { sortData } from "./helpers.js";
import { COUNTRIES } from "./data/countries.js";

export const countriesEN = [...COUNTRIES];

export const worldCountries = {
  language: "en",
  countries: [],
  selectedCountries: [],
};

const init = function () {
  loadAllCountries();
};

export const loadAllCountries = function () {
  sortData(countriesEN);
  worldCountries.countries = countriesEN;
  worldCountries.selectedCountries = countriesEN;
};

init();
