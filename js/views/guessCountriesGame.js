import { GEOGRAPHICAL_CENTER, WORLD_MAP_BOUNDS } from "../config.js";
import * as model from "../model.js";
import { COUNTRIES_GEO } from "../data/countries.geo.js";
import {
  getRandomInt,
  removeCenterElementsMainLayout,
  removeCardQuizStartContainer,
  showGameResultWindow,
  addCardQuizStartContainer,
  centerElementsMainLayout,
} from "../helpers.js";
import { localization } from "../localization/ua.js";
class GuessCountriesGame {
  _mapElement = document.querySelector("#guessCountriesGameMap");
  _gameElement = document.querySelector("#guessCountriesGame");
  _guessCountriesGameHeading = document.querySelector(
    ".countries-game-heading"
  );
  _gameModalHeading = document.querySelector("#gameResultHeading");
  _gameModalHeadingGuessed = document.querySelector(
    "#gameResultHeadingGuesedCountries"
  );
  _gameModalResultGuessedCountries = document.querySelector(
    "#gameResultGuessing"
  );
  _gameModalResultLabel = document.querySelector("#gameModalResultLabel");
  _gameStartCard = document.querySelector("#start-guess-countries");
  _guessCountriesIndependentLabel = document.querySelector(
    "#guess-countries-independent-label"
  );
  _guessCountriesStartContainer = document.querySelector(
    "#guess-countries-start-container"
  );
  _guessCountriesGamePlayContainer = document.querySelector(
    "#guessCountriesGamePlay"
  );
  _guessCountriesGameSelector = document.querySelector(
    ".guess-countries-game-selector"
  );
  _guessCountriesGameCountriesOnMapSelector = document.querySelector(
    ".guess-countries-game-countries-on-map-selector"
  );
  _guessCountriesMessageField = document.querySelector(
    ".guess-country-game-message"
  );
  _guessCountriesIndependentCheckbox = document.querySelector(
    "#guess-countries-independent"
  );
  _returnToMap = document.querySelector(
    "#return-to-world-map-guess-countries-game"
  );
  _gameRulesContent = document.querySelector("#gameRulesContent");
  _startGameButton = document.querySelector("#start-guess-countries");
  _gameRulesButton = document.querySelector("#gameRulesButton");
  _gameResultShareButton = document.querySelector("#shareGameResults");
  _gameResultModalButton = document.querySelector("#gameResultCloseButton");
  _guessCountriesMap;
  _timeoutIds = [];
  _countries = [];
  _computerCountries = [];
  _countriesNumber;
  _userSelectedCountries = [];
  _userAlreadyGuessedCountries = [];
  _computerSelectedCountries = [];
  _countryBondaries = [];
  _markers = [];
  _userCountryBoundariesStyles = {};
  _userMarkerStyles = {};
  _computerCountryBoundariesStyles = {};
  _computerMarkerStyles = {};
  _popups = {};
  _gameStarted = false;
  _userGuessCountryAttempt = true;

  _returnToMapListenerAdded = false;
  _startGameListenerAdded = false;
  _gameRulesButtonListenerAdded = false;

  initGame(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._startGameListenerAdded) {
      this._startGameButton.addEventListener(
        "click",
        this.startGame.bind(this)
      );
      this._startGameListenerAdded = true;
    }
    if (!this._gameRulesButtonListenerAdded) {
      this._gameRulesButton.addEventListener(
        "click",
        function () {
          this._gameRulesContent.classList.toggle("not-displayed");
        }.bind(this)
      );
      this._gameRulesButtonListenerAdded = true;
    }
    this.returnToMapButtonHandler(
      mapView,
      sideNavigationView,
      topNavigationView,
      countriesSelectView
    );
  }

  startGame() {
    removeCardQuizStartContainer();
    removeCenterElementsMainLayout();
    this._guessCountriesStartContainer.classList.add("not-displayed");
    this._guessCountriesGamePlayContainer.classList.remove("not-displayed");
    this._countriesNumber = parseInt(
      this._guessCountriesGameSelector.value.split(":")[1].trim()
    );
    this._countries = model.worldCountries.countries.map((country) => {
      return {
        countryName: country.name.common,
        countryFlag: country.flags.png,
        countryIndependent: country.independent,
        cca2: country.cca2,
        latlng: country.latlng,
        capitalLatLng: country.capitalInfo.latlng,
      };
    });
    if (this._guessCountriesIndependentCheckbox.checked) {
      this._countries = this._countries.filter(
        (country) => country.countryIndependent
      );
    }
    if (
      this._guessCountriesGameCountriesOnMapSelector.value !==
      "Countries on map: All"
    ) {
      const countriesOnMapList = [];
      const countriesOnMapNumber =
        +this._guessCountriesGameCountriesOnMapSelector.value
          .split(":")[1]
          .trim();
      this._countries = this.selectCountriesOnMap(
        countriesOnMapList,
        countriesOnMapNumber
      );
    }
    this._computerCountries = this._countries.slice();
    const computerCountryList = this._countries.slice();
    this.selectComputerRandomCountries(computerCountryList);
    this.createMap(GEOGRAPHICAL_CENTER);
    this.invalidateSize();
    this._guessCountriesMessageField.textContent =
      localization[model.worldCountries.language]["Select country number"] +
      " 1";
  }

  clearTimeout() {
    this._timeoutIds.forEach((timeout) => {
      clearTimeout(timeout);
    });
  }

  invalidateSize() {
    this._guessCountriesMap.invalidateSize();
  }

  selectCountriesOnMap(countriesToReturn, countriesOnMapNumber) {
    const randomIndex = getRandomInt(0, this._countries.length - 1);
    const countryOnMap = this._countries[randomIndex];
    while (
      countriesToReturn.length < countriesOnMapNumber &&
      !countriesToReturn.includes(countryOnMap)
    ) {
      countriesToReturn.push(countryOnMap);
      this._countries.splice(randomIndex, 1);
      this.selectCountriesOnMap(countriesToReturn, countriesOnMapNumber);
    }
    return countriesToReturn;
  }

  selectComputerRandomCountries(countiesList) {
    const randomIndex = getRandomInt(0, countiesList.length - 1);
    const computerCountry = countiesList[randomIndex];
    while (
      this._computerSelectedCountries.length < this._countriesNumber &&
      !this._computerSelectedCountries.includes(computerCountry) &&
      computerCountry.countryName !== "Russia"
    ) {
      this._computerSelectedCountries.push(computerCountry);
      countiesList.splice(randomIndex, 1);
      this.selectComputerRandomCountries(countiesList);
    }
  }

  selectComputerRandomCountry() {
    const randomIndex = getRandomInt(0, this._computerCountries.length - 1);
    const computerCountry = this._computerCountries[randomIndex];
    this._computerCountries.splice(randomIndex, 1);
    return computerCountry;
  }

  playGameHandler() {
    this._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, { animate: false });
    this.resetCountryBoundaries();
    this._gameModalHeading.innerHTML = "";
    this._gameModalHeadingGuessed.innerHTML = "";
    this._gameModalResultGuessedCountries.innerHTML = "";
    this._timeoutIds = [];
    this._gameStarted = true;
    const playButton = document.querySelector(".guess-country-game-play");
    playButton.disabled = true;
    const mapField = document.getElementById("map-field");
    mapField.textContent = `${
      localization[model.worldCountries.language]["Computer Map"]
    }`;
    this._guessCountriesMessageField.textContent =
      localization[model.worldCountries.language][
        "Your attempt to guess opponent's country"
      ];
    this.enableMapInteraction();
  }

  returnToMap(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    this.hideGame();
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

  returnToMapButtonHandler(
    mapView,
    sideNavigationView,
    topNavigationView,
    countriesSelectView
  ) {
    if (!this._returnToMapListenerAdded) {
      this._returnToMap.addEventListener(
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

  finishGame(configDefault) {
    this._countries = [];
    this._userSelectedCountries = [];
    this._computerSelectedCountries = [];
    this._countryBondaries = [];
    this._markers = [];
    this._timeoutIds = [];
    this._popups = {};
    if (configDefault) {
      this._guessCountriesGameSelector.value = "Countries to select: 15";
      this._guessCountriesIndependentCheckbox.checked = true;
      this._guessCountriesGameCountriesOnMapSelector.value =
        "Countries on map: All";
    }
    this._userAlreadyGuessedCountries = [];
    this._computerCountries = [];
    this._userCountryBoundariesStyles = {};
    this._computerCountryBoundariesStyles = {};
    this._userMarkerStyles = {};
    this._computerMarkerStyles = {};
    this._gameStarted = false;
    this._userGuessCountryAttempt = true;
    this.clearTimeout();
    if (this._guessCountriesMap) {
      this._guessCountriesMap.eachLayer(
        function (layer) {
          this._guessCountriesMap.removeLayer(layer);
        }.bind(this)
      );
      this._guessCountriesMap.off();
    }
    this._mapElement.innerHTML = "";
    this._guessCountriesMessageField.textContent = "";
    this._gameRulesContent.classList.add("not-displayed");
    this._guessCountriesGamePlayContainer.classList.add("not-displayed");
    this._guessCountriesStartContainer.classList.remove("not-displayed");
  }

  finishGameHandler(useConfirm) {
    if (useConfirm) {
      const confirmExit = confirm(
        localization[model.worldCountries.language][
          "Are you sure you want to leave this game?"
        ]
      );
      if (confirmExit) {
        this.finishGame(true);
        addCardQuizStartContainer();
        centerElementsMainLayout();
      }
    } else {
      this.finishGame(true);
      addCardQuizStartContainer();
      centerElementsMainLayout();
    }
  }

  createMap(latLon, defaultZoomLevel = 2.35) {
    if (this._guessCountriesMap && this._guessCountriesMap.remove) {
      this._guessCountriesMap.remove();
    }
    function centerMap(e) {
      this._guessCountriesMap.panTo(e.latlng);
    }
    function zoomIn() {
      this._guessCountriesMap.zoomIn();
    }

    function zoomOut() {
      this._guessCountriesMap.zoomOut();
    }
    function reset() {
      this._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, { animate: false });
    }
    const streetLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    );
    const natGeoWorldMap = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
    );
    const baseMaps = {
      WorldStreetMap: streetLayer,
      NatGeoWorldMap: natGeoWorldMap,
    };
    this._guessCountriesMap = L.map("guessCountriesGameMap", {
      contextmenu: true,
      layers: [streetLayer],
      contextmenuItems: [
        {
          text: localization[model.worldCountries.language]["Center Map Here"],
          callback: centerMap,
          context: this,
        },
        "-",
        {
          text: localization[model.worldCountries.language]["Zoom In"],
          callback: zoomIn,
          context: this,
        },
        {
          text: localization[model.worldCountries.language]["Zoom Out"],
          callback: zoomOut,
          context: this,
        },
        {
          text: localization[model.worldCountries.language]["Reset"],
          callback: reset,
          context: this,
        },
      ],
      minZoom: defaultZoomLevel,
      zoomSnap: 0.25,
      worldCopyJump: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 2,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
        title: "Full Screen",
        titleCancel: "Exit Fullscreen Mode",
        forceSeparateButton: false,
        forcePseudoFullscreen: true,
        addFullScreen: false,
        zoomResetFunction: reset.bind(this),
      },
      maxBounds: [
        [85.1217211716937, 270.48437500000003],
        [-86.37146534864254, -250.27343750000003],
      ],
    })
      .fitWorld()
      .setView(latLon, defaultZoomLevel);
    L.control
      .layers(baseMaps)
      .setPosition("topleft")
      .addTo(this._guessCountriesMap);
    L.Control.UserSelectedCountriesField = L.Control.extend({
      countriesNumber: +this._countriesNumber,
      onAdd: function (map) {
        const container = L.DomUtil.create("div");
        container.id = "user-selected-countries-container";
        container.classList.add("text-center");
        container.style.width = "50px";
        container.style.backgroundColor = "white";
        container.style.opacity = "0.7";
        container.style.borderRadius = "2px";
        container.style.border = "0px solid rgba(0,0,0,0.2)";
        container.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        const userIconContainer = L.DomUtil.create("span");
        userIconContainer.insertAdjacentHTML(
          "afterbegin",
          '<i class="fa-solid fa-user"></i>'
        );
        const userCountriesNumber = L.DomUtil.create("span");
        userCountriesNumber.style.marginLeft = "5px";
        userCountriesNumber.id = "user-countries-number";
        userCountriesNumber.style.fontWeight = "bolder";
        userCountriesNumber.textContent = "0";
        container.appendChild(userIconContainer);
        container.appendChild(userCountriesNumber);
        const index =
          Math.floor(this.countriesNumber / 2) + (this.countriesNumber % 2);
        let countryIndex = 1;
        for (let i = 1; i <= index; i++) {
          const userCountriesContainer = L.DomUtil.create("div");
          userCountriesContainer.classList.add("user-countries-container");
          const countriesTemplate =
            this.countriesNumber !== countryIndex
              ? `<span class="userCountryContainer" id="userCountry${countryIndex.toString()}" style="margin-right:10px;"><span style="color:grey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span><span class="userCountryContainer" id="userCountry${(
                  countryIndex + 1
                ).toString()}"><span style="color:grey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span>`
              : `<span class="userCountryContainer" id="userCountry${countryIndex.toString()}"><span style="color:grey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span>`;
          userCountriesContainer.insertAdjacentHTML(
            "afterbegin",
            countriesTemplate
          );
          container.appendChild(userCountriesContainer);
          countryIndex = countryIndex + 2;
        }
        return container;
      },
      onRemove: function (map) {},
    });
    L.control.userSelectedCountriesField = function (opts) {
      return new L.Control.UserSelectedCountriesField(opts);
    };
    L.control
      .userSelectedCountriesField({ position: "topleft" })
      .addTo(this._guessCountriesMap);
    L.Control.MapField = L.Control.extend({
      onAdd: function (map) {
        const mapFiled = L.DomUtil.create("div");
        mapFiled.id = "map-field";
        mapFiled.style.backgroundColor = "white";
        mapFiled.style.border = "rgba(0, 0, 0, 0.2) 0px solid";
        mapFiled.style.marginTop = "10px";
        mapFiled.style.paddingRight = "3px";
        mapFiled.style.paddingLeft = "3px";
        mapFiled.style.opacity = "0.7";
        mapFiled.style.borderRadius = "2px";
        mapFiled.style.fontWeight = "bolder";
        mapFiled.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        mapFiled.textContent =
          localization[model.worldCountries.language]["Your Map"];
        return mapFiled;
      },

      onRemove: function (map) {},
    });
    L.control.mapfield = function (opts) {
      return new L.Control.MapField(opts);
    };
    L.control.mapfield({ position: "topright" }).addTo(this._guessCountriesMap);
    L.Control.PlayButton = L.Control.extend({
      playFunction: this.playGameHandler.bind(this),
      onAdd: function (map) {
        const playButton = L.DomUtil.create("button");
        playButton.classList.add("btn");
        playButton.classList.add("btn-sm");
        playButton.classList.add("btn-danger");
        playButton.classList.add("guess-country-game-play");
        playButton.style.marginTop = "10px";
        playButton.style.paddinTop = "0.35rem";
        playButton.style.paddinBottom = "0.35rem";
        playButton.disabled = true;
        playButton.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        playButton.textContent =
          localization[model.worldCountries.language]["Play"];
        playButton.addEventListener("click", this.playFunction);
        return playButton;
      },

      onRemove: function (map) {},
    });
    L.control.playbutton = function (opts) {
      return new L.Control.PlayButton(opts);
    };
    L.control
      .playbutton({ position: "topright" })
      .addTo(this._guessCountriesMap);
    L.Control.FinishButton = L.Control.extend({
      finishFunction: this.finishGameHandler.bind(this, true),
      onAdd: function (map) {
        const finishButton = L.DomUtil.create("button");
        finishButton.classList.add("btn");
        finishButton.classList.add("btn-sm");
        finishButton.classList.add("btn-primary");
        finishButton.classList.add("guess-country-game-finish");
        finishButton.style.marginTop = "5px";
        finishButton.style.paddinTop = "0.35rem";
        finishButton.style.paddinBottom = "0.35rem";
        finishButton.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        finishButton.textContent =
          localization[model.worldCountries.language]["Finish"];
        finishButton.addEventListener("click", this.finishFunction);
        return finishButton;
      },
      onRemove: function (map) {},
    });
    L.control.finishbutton = function (opts) {
      return new L.Control.FinishButton(opts);
    };
    L.control
      .finishbutton({ position: "topright" })
      .addTo(this._guessCountriesMap);
    L.Control.GuessedNotGuessedPanel = L.Control.extend({
      onAdd: function (map) {
        const guessedNotGuessedPanel = L.DomUtil.create("div");
        guessedNotGuessedPanel.id = "guessed-not-guessed-panel";
        guessedNotGuessedPanel.style.backgroundColor = "white";
        guessedNotGuessedPanel.style.opacity = "0.7";
        guessedNotGuessedPanel.style.borderRadius = "2px";
        guessedNotGuessedPanel.style.border = "0px solid rgba(0,0,0,0.2)";
        guessedNotGuessedPanel.style.marginTop = "5px";
        guessedNotGuessedPanel.style.padding = "3px";
        guessedNotGuessedPanel.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        const guessedHtml = `<div><span style="width:7px; height:7px; border-radius:50%; border:1px solid black; margin-right:5px;background-color:red; display:inline-block;"></span><span style="font-size:0.6rem;">${
          localization[model.worldCountries.language]["Guessed Country"]
        }</span></div>`;
        const notGuessedHtml = `<div><span style="width:7px; height:7px; border-radius:50%; border:1px solid black; margin-right:5px;background-color:grey; display:inline-block;"></span><span style="font-size:0.6rem;">${
          localization[model.worldCountries.language]["Not Guessed Country"]
        }</span></div>`;
        guessedNotGuessedPanel.insertAdjacentHTML("beforeend", guessedHtml);
        guessedNotGuessedPanel.insertAdjacentHTML("beforeend", notGuessedHtml);

        return guessedNotGuessedPanel;
      },
      onRemove: function (map) {},
    });
    L.control.guessednotguessedpanel = function (opts) {
      return new L.Control.GuessedNotGuessedPanel(opts);
    };
    L.control
      .guessednotguessedpanel({ position: "topright" })
      .addTo(this._guessCountriesMap);
    L.Control.AvailableCountriesPanel = L.Control.extend({
      onAdd: function (map) {
        const availableCountriesPanel = L.DomUtil.create("div");
        availableCountriesPanel.id = "available-countries-panel";
        availableCountriesPanel.classList.add("not-displayed");
        availableCountriesPanel.style.backgroundColor = "white";
        availableCountriesPanel.style.opacity = "0.7";
        availableCountriesPanel.style.borderRadius = "2px";
        availableCountriesPanel.style.border = "0px solid rgba(0,0,0,0.2)";
        availableCountriesPanel.style.marginTop = "5px";
        availableCountriesPanel.style.padding = "3px";
        availableCountriesPanel.style.width = "105px";
        availableCountriesPanel.style.overflow = "hidden";
        availableCountriesPanel.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        const availableCountriesHeader = `<div><span style="font-size:0.6rem;">${
          localization[model.worldCountries.language]["Available Countries:"]
        }</span></div>`;
        availableCountriesPanel.insertAdjacentHTML(
          "beforeend",
          availableCountriesHeader
        );
        const availableCountriesPanelContent = L.DomUtil.create("div");
        availableCountriesPanelContent.id = "available-countries-panel-content";
        availableCountriesPanel.appendChild(availableCountriesPanelContent);

        return availableCountriesPanel;
      },
      onRemove: function (map) {},
    });
    L.control.availablecountriespanel = function (opts) {
      return new L.Control.AvailableCountriesPanel(opts);
    };
    L.control
      .availablecountriespanel({ position: "topright" })
      .addTo(this._guessCountriesMap);
    L.Control.ComputerSelectedCountriesField = L.Control.extend({
      countriesNumber: +this._countriesNumber,
      onAdd: function (map) {
        const container = L.DomUtil.create("div");
        container.id = "computer-selected-countries-container";
        container.classList.add("text-center");
        container.style.width = "50px";
        container.style.marginTop = "12px";
        container.style.backgroundColor = "white";
        container.style.opacity = "0.7";
        container.style.borderRadius = "2px";
        container.style.border = "0px solid rgba(0,0,0,0.2)";
        container.style.boxShadow =
          "0 2px 5px #00000080, inset 0 2px 10px #0000001f";
        const computerIconContainer = L.DomUtil.create("span");
        computerIconContainer.insertAdjacentHTML(
          "afterbegin",
          '<i class="fa-solid fa-desktop"></i>'
        );
        const computerCountriesNumber = L.DomUtil.create("span");
        computerCountriesNumber.style.marginLeft = "5px";
        computerCountriesNumber.id = "computer-countries-number";
        computerCountriesNumber.style.fontWeight = "bolder";
        computerCountriesNumber.textContent = this.countriesNumber;
        container.appendChild(computerIconContainer);
        container.appendChild(computerCountriesNumber);
        const index =
          Math.floor(this.countriesNumber / 2) + (this.countriesNumber % 2);
        let countryIndex = 1;
        for (let i = 1; i <= index; i++) {
          const computerCountriesContainer = L.DomUtil.create("div");
          computerCountriesContainer.classList.add(
            "computer-countries-container"
          );
          const countriesTemplate =
            this.countriesNumber !== countryIndex
              ? `<span class="computerCountryContainer" id="computerCountry${countryIndex.toString()}" style="margin-right:10px;"><span style="color:grey; border:solid 1px grey;  background-color: lightgrey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span><span class="computerCountryContainer" id="computerCountry${(
                  countryIndex + 1
                ).toString()}"><span style="color:grey; background-color: lightgrey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span>`
              : `<span class="computerCountryContainer" id="computerCountry${countryIndex.toString()}"><span style="color:grey; background-color: lightgrey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span></span>`;
          computerCountriesContainer.insertAdjacentHTML(
            "afterbegin",
            countriesTemplate
          );
          container.appendChild(computerCountriesContainer);
          countryIndex = countryIndex + 2;
        }
        return container;
      },
      onRemove: function (map) {},
    });
    L.control.computerSelectedCountriesField = function (opts) {
      return new L.Control.ComputerSelectedCountriesField(opts);
    };
    L.control
      .computerSelectedCountriesField({ position: "topright" })
      .addTo(this._guessCountriesMap);
    this._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, { animate: false });
    this.addCountryBoundaries();
  }

  resetCountryBoundaries() {
    this._countryBondaries.forEach((item) => {
      this._userMarkerStyles[item.options.style.className] = {
        opacity: 1,
      };
      this._computerMarkerStyles[item.options.style.className] = {
        opacity: 1,
      };
      this._userCountryBoundariesStyles[item.options.style.className] = {
        weight: 0,
        fillOpacity: 0.1,
        className: item.options.style.className,
        opacity: 0.5,
        fillColor: "#3388ff",
        color: "#3388ff",
      };
      this._computerCountryBoundariesStyles[item.options.style.className] = {
        weight: 0,
        fillOpacity: 0.1,
        className: item.options.style.className,
        opacity: 0.5,
        fillColor: "#3388ff",
        color: "#3388ff",
      };
      item.setStyle({
        weight: 0,
        fillOpacity: 0.1,
        className: item.options.style.className,
        opacity: 0.5,
        fillColor: "#3388ff",
        color: "#3388ff",
      });
      item.on("mouseover", function () {
        this.setStyle({
          weight: 1,
          fillOpacity: 0.5,
          className: this.options.style.className,
          opacity: 1,
          fillColor: "#3388ff",
          color: "#3388ff",
        });
      });
      item.on("mouseout", function () {
        this.setStyle({
          weight: 0,
          fillOpacity: 0.1,
          className: this.options.style.className,
          opacity: 0,
          fillColor: "#3388ff",
          color: "#3388ff",
        });
      });
      item.bringToBack();
    });
  }

  disableElement(element) {
    element.disabled = true;
  }

  enableElement(element) {
    element.disabled = false;
  }

  addAvailableCountriesPanel() {
    const setViewCountry = function (country) {
      this._guessCountriesMap.setView(
        country.latlng ? country.latlng : country.capitalLatLng,
        4.5
      );
    };
    const availableCountriesPanel = document.getElementById(
      "available-countries-panel"
    );
    const availableCountriesPanelContent = document.getElementById(
      "available-countries-panel-content"
    );
    const guessedNotGuessedPanel = document.getElementById(
      "guessed-not-guessed-panel"
    );
    if (availableCountriesPanelContent) {
      availableCountriesPanelContent.innerHTML = "";
      this._countries.forEach((country) => {
        const container = document.createElement("div");
        container.style.cursor = "pointer";
        const locationIcon = document.createElement("i");
        locationIcon.classList.add("fa-solid");
        locationIcon.classList.add("fa-location-crosshairs");
        locationIcon.style.width = "10px";
        locationIcon.style.height = "10px";
        locationIcon.style.marginRight = "5px";
        const countryImg = document.createElement("img");
        countryImg.src = country.countryFlag;
        countryImg.style =
          "width:8px; height:8px; border-radius:50%; border:1px solid black; box-shadow: 0 2px 5px #00000080, inset 0 2px 10px #0000001f; margin-right:5px;display:inline-block;";
        const countryName = document.createElement("span");
        countryName.textContent =
          localization[model.worldCountries.language]["countries"][
            country.countryName
          ];
        countryName.style = "font-size:0.6rem;";
        container.addEventListener("click", setViewCountry.bind(this, country));
        container.appendChild(locationIcon);
        container.appendChild(countryImg);
        container.appendChild(countryName);
        availableCountriesPanelContent.appendChild(container);
      });
    }
    if (availableCountriesPanel) {
      availableCountriesPanel.classList.remove("not-displayed");
    }
    if (guessedNotGuessedPanel) {
      guessedNotGuessedPanel.classList.add("not-displayed");
    }
  }

  addCountryBoundaries() {
    const context = this;
    const addCountryBoundariesClickHandler = async function (
      context,
      countryBoundary,
      marker,
      countryCode
    ) {
      if (!context._userGuessCountryAttempt) return;
      const playButton = document.querySelector(".guess-country-game-play");
      if (!context._gameStarted) {
        if (countryCode === "RU") {
          context._guessCountriesMessageField.textContent =
            localization[model.worldCountries.language][
              "You can't select a war aggressor country!"
            ];
          return;
        }
        const countryAlreadySelected = context._userSelectedCountries.some(
          (country) => country.cca2 === countryCode
        );
        const countriesNumberSelected = +context._countriesNumber;
        if (
          context._userSelectedCountries.length === countriesNumberSelected &&
          !countryAlreadySelected
        ) {
          if (playButton) {
            context.enableElement(playButton);
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Press 'Play' to start game!"
              ];
          }
          return;
        }
        const country = context._countries.find(
          (country) => country.cca2 === countryCode
        );
        if (!countryAlreadySelected) {
          context._userSelectedCountries.push(country);
          countryBoundary.setStyle({
            weight: 1,
            color: "green",
            fillColor: "green",
            fillOpacity: 0.5,
            opacity: 0.8,
            className: countryCode,
          });
          countryBoundary.bringToFront();
          const countryIndex = context._userSelectedCountries.length.toString();
          const userCountriesNumber = document.getElementById(
            "user-countries-number"
          );
          if (userCountriesNumber) {
            userCountriesNumber.textContent =
              context._userSelectedCountries.length;
          }
          const userCountryElemnt = document.getElementById(
            `userCountry${countryIndex}`
          );
          if (userCountryElemnt) {
            userCountryElemnt.innerHTML = `<img id="${country.cca2}" src="${
              country.countryFlag
            }" alt="${
              localization[model.worldCountries.language]["countries"][
                country.countryName
              ]
            }" title="${
              localization[model.worldCountries.language]["countries"][
                country.countryName
              ]
            }" style="width:13px; height:13px;border:solid 1px grey; border-radius:50%; display:inline-block;vertical-align:baseline; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f;">`;
          }
          if (
            context._userSelectedCountries.length === countriesNumberSelected
          ) {
            if (playButton) {
              context.enableElement(playButton);
              context._guessCountriesMessageField.textContent =
                localization[model.worldCountries.language][
                  "Press 'Play' to start game!"
                ];
            }
            return;
          } else {
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Select country number"
              ] +
              " " +
              (+countryIndex + 1).toString();
          }
        }
        const removeCountryIfAlreadySelected = function (
          context,
          countryCode,
          countryBoundary
        ) {
          context._userSelectedCountries =
            context._userSelectedCountries.filter(
              (country) => country.cca2 !== countryCode
            );
          context._guessCountriesMessageField.textContent =
            localization[model.worldCountries.language][
              "Select country number"
            ] +
            " " +
            (context._userSelectedCountries.length + 1).toString();
          if (playButton) {
            context.disableElement(playButton);
          }
          const userCountries = document.querySelectorAll(
            ".userCountryContainer"
          );
          const userCountriesNumber = document.getElementById(
            "user-countries-number"
          );
          if (userCountriesNumber) {
            userCountriesNumber.textContent =
              context._userSelectedCountries.length;
          }
          for (let i = 0; i < userCountries.length; i++) {
            const country = context._userSelectedCountries[i];
            const userCountry = userCountries[i];
            if (country) {
              userCountry.innerHTML = `<img id="${country.cca2}" src="${
                country.countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  country.countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  country.countryName
                ]
              }" style="width:13px; height:13px;border:solid 1px grey; border-radius:50%; display:inline-block;vertical-align:baseline; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f;">`;
            } else {
              userCountry.innerHTML = `<span style="color:grey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span>`;
            }
          }
          countryBoundary.setStyle({
            weight: 0,
            fillOpacity: 0.1,
            color: "#3388ff",
            fillColor: "#3388ff",
            className: countryCode,
            opacity: 0.5,
          });
        };
        if (countryAlreadySelected) {
          removeCountryIfAlreadySelected(context, countryCode, countryBoundary);
        }
      } else {
        const mapField = document.getElementById("map-field");
        mapField.textContent = `${
          localization[model.worldCountries.language]["Computer Map"]
        }`;
        context._countries = context._countries.filter(
          (country) => country.cca2 !== countryCode
        );
        if (context._countries.length <= 5) {
          context.addAvailableCountriesPanel();
        }
        const country = context._computerSelectedCountries.find(
          (country) => country.cca2 === countryCode
        );
        if (context._userAlreadyGuessedCountries.includes(countryCode)) return;
        context._userAlreadyGuessedCountries.push(countryCode);
        try {
          countryBoundary.closeTooltip();
          countryBoundary.unbindTooltip();
          countryBoundary.off();
          countryBoundary._eventParents = null;
          marker.closeTooltip();
          marker.unbindTooltip();
          marker.off();
        } catch (error) {}
        context.disableMapInteraction();
        const popup = context._popups[countryCode];
        if (popup) popup.openOn(context._guessCountriesMap);
        if (country) {
          countryBoundary.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Already guessed this country. Try another one!"
              ];
          });
          marker.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Already guessed this country. Try another one!"
              ];
          });
          context._userGuessCountryAttempt = true;
          const countryIndex =
            context._computerSelectedCountries.indexOf(country) + 1;
          countryBoundary.setStyle({
            weight: 1,
            color: "red",
            fillColor: "red",
            fillOpacity: 0.5,
            opacity: 0.8,
            className: countryCode,
          });
          marker.setOpacity(0);
          context._userCountryBoundariesStyles[countryCode] = {
            weight: 1,
            color: "red",
            fillColor: "red",
            fillOpacity: 0.5,
            opacity: 0.8,
            className: countryCode,
          };
          context._userMarkerStyles[countryCode] = {
            opacity: 0,
          };
          context._guessCountriesMessageField.innerHTML = `<span>${
            localization[model.worldCountries.language]["You guessed"]
          }</span> <img src="${
            country.countryFlag
          }" style="margin-left:5px; width:20px; height:15px; border-radius:2px; box-shadow: 0 2px 5px #00000080, inset 0 2px 10px #0000001f; vertical-align: sub;"> <span style="margin-left:5px;">${
            localization[model.worldCountries.language]["countries"][
              country.countryName
            ]
          }</span>`;
          const computerCountriesNumber = document.getElementById(
            "computer-countries-number"
          );
          if (computerCountriesNumber) {
            computerCountriesNumber.textContent =
              +computerCountriesNumber.textContent - 1;
          }
          const computerCountryElement = document.getElementById(
            `computerCountry${countryIndex.toString()}`
          );
          if (computerCountryElement) {
            computerCountryElement.innerHTML = `<img id="${
              country.cca2
            }" src="${country.countryFlag}" alt="${
              localization[model.worldCountries.language]["countries"][
                country.countryName
              ]
            }" title="${
              localization[model.worldCountries.language]["countries"][
                country.countryName
              ]
            }" style="width:13px; height:13px;border:solid 1px grey; border-radius:50%; display:inline-block;vertical-align:baseline; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f;">`;
          }
          if (+computerCountriesNumber.textContent === 0) {
            context.showGameResult(true);
            return;
          }
          await context.sleep(1500);
          if (popup) popup.close();
          context._guessCountriesMessageField.textContent =
            localization[model.worldCountries.language][
              "Your attempt to guess opponent's country"
            ];
          context._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, {
            animate: false,
          });
          context.enableMapInteraction();
        } else {
          context._userGuessCountryAttempt = false;
          countryBoundary.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Already tried this country. Try another one!"
              ];
          });
          marker.on("click", (ev) => {
            L.DomEvent.stopPropagation(ev);
            context._guessCountriesMessageField.textContent =
              localization[model.worldCountries.language][
                "Already tried this country. Try another one!"
              ];
          });
          countryBoundary.setStyle({
            weight: 1,
            color: "grey",
            fillColor: "grey",
            fillOpacity: 0.5,
            opacity: 0.8,
            className: countryCode,
          });
          marker.setOpacity(0);
          context._userCountryBoundariesStyles[countryCode] = {
            weight: 1,
            color: "grey",
            fillColor: "grey",
            fillOpacity: 0.5,
            opacity: 0.8,
            className: countryCode,
          };
          context._userMarkerStyles[countryCode] = {
            opacity: 0,
          };
          context._guessCountriesMessageField.textContent = `${
            localization[model.worldCountries.language][
              "Failed attempt to guess country!"
            ]
          }`;
          await context.sleep(1500);
          if (popup) popup.close();
          const computerAttemptToGuessCountry = async function (context) {
            context.disableMapInteraction();
            context._guessCountriesMessageField.textContent = `${
              localization[model.worldCountries.language][
                "Computer is guessing your country..."
              ]
            }`;
            const mapField = document.getElementById("map-field");
            mapField.textContent = `${
              localization[model.worldCountries.language]["Your Map"]
            }`;
            const availableCountriesPanel = document.getElementById(
              "available-countries-panel"
            );
            if (availableCountriesPanel)
              availableCountriesPanel.classList.add("not-displayed");
            const guessedNotGuessedPanel = document.getElementById(
              "guessed-not-guessed-panel"
            );
            if (guessedNotGuessedPanel)
              guessedNotGuessedPanel.classList.remove("not-displayed");
            context._countryBondaries.forEach((countryBoundary) => {
              const countryCode = countryBoundary.options.style.className;
              const style =
                context._computerCountryBoundariesStyles[countryCode];
              countryBoundary.setStyle(style);
            });
            context._markers.forEach((marker) => {
              const countryCode = marker.dataId;
              const style = context._computerMarkerStyles[countryCode];
              marker.setOpacity(style["opacity"]);
            });
            context._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, {
              animate: false,
            });
            await context.sleep(1500);
            const computerGuessedCountry =
              context.selectComputerRandomCountry();
            const computerCountryBoundary = context._countryBondaries.find(
              (item) =>
                item.options.style.className === computerGuessedCountry.cca2
            );
            const userCountryGuessed = context._userSelectedCountries.includes(
              computerGuessedCountry
            );
            if (userCountryGuessed) {
              context._guessCountriesMessageField.innerHTML = `<span>${
                localization[model.worldCountries.language]["Computer guessed"]
              }</span> <img src="${
                computerGuessedCountry.countryFlag
              }" style="margin-left:5px; width:20px; height:15px; border-radius:2px; box-shadow: 0 2px 5px #00000080, inset 0 2px 10px #0000001f; vertical-align: sub;"> <span style="margin-left:5px;">${
                localization[model.worldCountries.language]["countries"][
                  computerGuessedCountry.countryName
                ]
              }</span>`;
              const countryIndex =
                context._userSelectedCountries.indexOf(computerGuessedCountry) +
                1;
              const userCountriesNumber = document.getElementById(
                "user-countries-number"
              );
              if (userCountriesNumber) {
                userCountriesNumber.textContent =
                  +userCountriesNumber.textContent - 1;
              }
              const userCountryElement = document.getElementById(
                `userCountry${countryIndex.toString()}`
              );
              if (userCountryElement) {
                userCountryElement.innerHTML = `<span style="color:grey; border:solid 1px grey; border-radius:50%; display:inline-block; height:13px; width:13px;"></span>`;
              }
              context._userGuessCountryAttempt = false;
              if (+userCountriesNumber.textContent === 0) {
                await context.sleep(1500);
                context.showGameResult(false);
                return;
              }
            } else {
              context._guessCountriesMessageField.textContent = `${
                localization[model.worldCountries.language][
                  "Computer failed to guess your country!"
                ]
              }`;
              context._userGuessCountryAttempt = true;
            }
            const countryCoordinates = computerGuessedCountry.latlng
              ? computerGuessedCountry.latlng
              : computerGuessedCountry.capitalLatLng;
            if (computerCountryBoundary && userCountryGuessed) {
              computerCountryBoundary.setStyle({
                weight: 1,
                color: "red",
                fillColor: "red",
                fillOpacity: 0.5,
                opacity: 0.8,
                className: computerCountryBoundary.options.style.className,
              });
              context._computerCountryBoundariesStyles[
                computerCountryBoundary.options.style.className
              ] = {
                weight: 1,
                color: "red",
                fillColor: "red",
                fillOpacity: 0.5,
                opacity: 0.8,
                className: computerCountryBoundary.options.style.className,
              };
              marker.setOpacity(0);
              context._computerMarkerStyles[
                computerCountryBoundary.options.style.className
              ] = {
                opacity: 0,
              };
            } else if (computerCountryBoundary && !userCountryGuessed) {
              computerCountryBoundary.setStyle({
                weight: 1,
                color: "grey",
                fillColor: "grey",
                fillOpacity: 0.5,
                opacity: 0.8,
                className: computerCountryBoundary.options.style.className,
              });
              context._computerCountryBoundariesStyles[
                computerCountryBoundary.options.style.className
              ] = {
                weight: 1,
                color: "grey",
                fillColor: "grey",
                fillOpacity: 0.5,
                opacity: 0.8,
                className: computerCountryBoundary.options.style.className,
              };
              marker.setOpacity(0);
              context._computerMarkerStyles[
                computerCountryBoundary.options.style.className
              ] = {
                opacity: 0,
              };
            }
            const popup =
              context._popups[computerCountryBoundary.options.style.className];
            if (popup) popup.openOn(context._guessCountriesMap);
            context._guessCountriesMap.setView(countryCoordinates, 4.5);
            await context.sleep(1500);
            if (popup) popup.close();
            context._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, {
              animate: false,
            });
            if (!context._userGuessCountryAttempt) {
              computerAttemptToGuessCountry(context);
            } else {
              if (popup) popup.close();
              context._countryBondaries.forEach((countryBoundary) => {
                const countryCode = countryBoundary.options.style.className;
                const style = context._userCountryBoundariesStyles[countryCode];
                countryBoundary.setStyle(style);
              });
              context._markers.forEach((marker) => {
                const countryCode = marker.dataId;
                const markerStyle = context._userMarkerStyles[countryCode];
                marker.setOpacity(markerStyle["opacity"]);
              });
              context._guessCountriesMap.fitBounds(WORLD_MAP_BOUNDS, {
                animate: false,
              });
              context.enableMapInteraction();
              mapField.textContent = `${
                localization[model.worldCountries.language]["Computer Map"]
              }`;
              context._guessCountriesMessageField.textContent =
                localization[model.worldCountries.language][
                  "Your attempt to guess opponent's country"
                ];
              if (context._countries.length <= 5) {
                const availableCountriesPanel = document.getElementById(
                  "available-countries-panel"
                );
                if (availableCountriesPanel)
                  availableCountriesPanel.classList.remove("not-displayed");
                const guessedNotGuessedPanel = document.getElementById(
                  "guessed-not-guessed-panel"
                );
                if (guessedNotGuessedPanel)
                  guessedNotGuessedPanel.classList.add("not-displayed");
              }
            }
          };
          const timeout = setTimeout(
            computerAttemptToGuessCountry,
            1000,
            context
          );
          context._timeoutIds.push(timeout);
        }
      }
    };
    this._countries.forEach((country) => {
      const countryCode = country.cca2;
      if (countryCode) {
        const countryGeo = {};
        countryGeo.type = COUNTRIES_GEO.type;
        countryGeo.features = COUNTRIES_GEO.features.filter(
          (feature) => feature.properties.country_a2 === countryCode
        );
        const countryTooltip = L.tooltip(
          country.latlng ? country.latlng : country.capitalLatLng
        ).setContent(
          country.countryName !== "Russia"
            ? localization[model.worldCountries.language]["countries"][
                country.countryName
              ]
            : localization[model.worldCountries.language]["countries"][
                country.countryName
              ] +
                " - " +
                localization[model.worldCountries.language]["War Aggressor"]
        );
        countryTooltip.options.sticky = true;
        const countryPopup = L.popup({ closeOnClick: false })
          .setLatLng(country.latlng ? country.latlng : country.capitalLatLng)
          .setContent(
            `<img src="${
              country.countryFlag
            }" style="width:15px; height:15px; border-radius: 50%; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align: sub;"><span style="font-weight:bold; margin-left:5px; ">${
                              localization[model.worldCountries.language][
                                "countries"
                              ][country.countryName]
                            }</span>`
          );
        const countryBoundary = L.geoJson(countryGeo, {
          bubblingMouseEvents: false,
          style: {
            weight: 0,
            fillOpacity: 0.1,
            className: countryCode,
            opacity: 0.5,
          },
          onEachFeature: function (feature, countryBoundary) {
            countryBoundary.on("mouseover", function (ev) {
              L.DomEvent.stopPropagation(ev);
              mouseOver(this, context);
            });
            const mouseOver = function (countryBoundary, context) {
              if (
                !context._userSelectedCountries.some(
                  (country) =>
                    country.cca2 === countryBoundary.options.style.className
                )
              ) {
                countryBoundary.setStyle({
                  weight: 1,
                  fillOpacity: 0.5,
                  opacity: 1,
                  className: countryCode,
                });
                countryBoundary.bringToFront();
              }
            };
            countryBoundary.on("mouseout", function (ev) {
              L.DomEvent.stopPropagation(ev);
              mouseOut(this, context);
            });
            const mouseOut = function (countryBoundary, context) {
              if (
                !context._userSelectedCountries.some(
                  (country) =>
                    country.cca2 === countryBoundary.options.style.className
                )
              ) {
                countryBoundary.setStyle({
                  weight: 0,
                  fillOpacity: 0.1,
                  opacity: 0,
                  className: countryCode,
                });
                countryBoundary.bringToBack();
              }
            };
            countryBoundary.on("click", function (ev) {
              L.DomEvent.stopPropagation(ev);
              addCountryBoundariesClickHandler(
                context,
                countryBoundary,
                marker,
                feature.properties.country_a2
              );
            });
          },
        })
          .bindTooltip(countryTooltip)
          .addTo(this._guessCountriesMap);
        const marker = L.marker(
          country.latlng ? country.latlng : country.capitalLatLng,
          {
            icon: L.icon({
              iconUrl: `${country.countryFlag}`,
              iconSize: [12, 12],
            }),
            riseOnHover: true,
            opacity: 0.95,
            alt: localization[model.worldCountries.language]["countries"][
              country.countryName
            ],
          }
        )
          .on("click", function (ev) {
            L.DomEvent.stopPropagation(ev);
            addCountryBoundariesClickHandler(
              context,
              countryBoundary,
              marker,
              country.cca2
            );
          })
          .bindTooltip(countryTooltip)
          .addTo(this._guessCountriesMap);
        marker.dataId = countryCode;
        this._popups[countryCode] = countryPopup;
        this._markers.push(marker);
        this._countryBondaries.push(countryBoundary);
      }
    });
  }

  showGameResult(userWon) {
    this.enableMapInteraction();
    const playButton = document.querySelector(".guess-country-game-play");
    playButton.disabled = false;
    this._gameModalResultLabel.textContent =
      localization[model.worldCountries.language]["Game Result"];
    if (userWon) {
      this._guessCountriesMessageField.textContent =
        localization[model.worldCountries.language][
          "Congratulations! You won the game!"
        ];
      this._gameModalHeading.textContent =
        localization[model.worldCountries.language][
          "Congratulations! You won the game!"
        ];
      this._gameModalHeading.style.color = "darkgreen";
      this._gameModalHeadingGuessed.textContent =
        localization[model.worldCountries.language][
          "You guessed all the opponent's countries:"
        ];
      const index =
        Math.floor(this._computerSelectedCountries.length / 2) +
        (this._computerSelectedCountries.length % 2);
      let countryIndex = 0;
      const userCountriesContainer = document.createElement("table");
      userCountriesContainer.style.border = "none";
      for (let i = 0; i < index; i++) {
        const countriesTemplate =
          this._computerSelectedCountries.length !== countryIndex + 1
            ? `<tr><td><img src="${
                this._computerSelectedCountries[countryIndex].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/></td> <td><span style="margin-right: 10px;">${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._computerSelectedCountries[countryIndex]
                                  .countryName
                              ]
                            }</span></td><td><img src="${
                this._computerSelectedCountries[countryIndex + 1].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex + 1].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex + 1].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/></td> <td><span>${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._computerSelectedCountries[
                                  countryIndex + 1
                                ].countryName
                              ]
                            }</span></td></tr>`
            : `<tr><td><img src="${
                this._computerSelectedCountries[countryIndex].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._computerSelectedCountries[countryIndex].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/></td><td> <span>${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._computerSelectedCountries[countryIndex]
                                  .countryName
                              ]
                            }</span></td></tr>`;
        userCountriesContainer.insertAdjacentHTML(
          "beforeend",
          countriesTemplate
        );
        countryIndex = countryIndex + 2;
      }
      this._gameModalResultGuessedCountries.appendChild(userCountriesContainer);
    } else {
      this._guessCountriesMessageField.textContent =
        localization[model.worldCountries.language][
          "Sorry! You lost the game!"
        ];
      this._gameModalHeading.textContent =
        localization[model.worldCountries.language][
          "Sorry! You lost the game!"
        ];
      this._gameModalHeading.style.color = "red";
      this._gameModalHeadingGuessed.textContent =
        localization[model.worldCountries.language][
          "Computer guessed all your countries:"
        ];
      const index =
        Math.floor(this._userSelectedCountries.length / 2) +
        (this._userSelectedCountries.length % 2);
      let countryIndex = 0;
      const userCountriesContainer = document.createElement("table");
      userCountriesContainer.style.border = "none";
      for (let i = 0; i < index; i++) {
        const countriesTemplate =
          this._userSelectedCountries.length !== countryIndex + 1
            ? `<tr><td><img src="${
                this._userSelectedCountries[countryIndex].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/> </td><td><span style="margin-right: 10px;">${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._userSelectedCountries[countryIndex]
                                  .countryName
                              ]
                            }</span></td><td><img src="${
                this._userSelectedCountries[countryIndex + 1].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex + 1].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex + 1].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/></td> <td><span>${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._userSelectedCountries[countryIndex + 1]
                                  .countryName
                              ]
                            }</span></td></tr>`
            : `<tr><td><img src="${
                this._userSelectedCountries[countryIndex].countryFlag
              }" alt="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex].countryName
                ]
              }" title="${
                localization[model.worldCountries.language]["countries"][
                  this._userSelectedCountries[countryIndex].countryName
                ]
              }" style="height:15px; width:20px; border-radius:2px; box-shadow: 0 2px 5px #00000080,
                            inset 0 2px 10px #0000001f; vertical-align:baseline;"/></td> <td> <span>${
                              localization[model.worldCountries.language][
                                "countries"
                              ][
                                this._userSelectedCountries[countryIndex]
                                  .countryName
                              ]
                            }</span></td></tr>`;
        userCountriesContainer.insertAdjacentHTML(
          "beforeend",
          countriesTemplate
        );
        countryIndex = countryIndex + 2;
      }
      this._gameModalResultGuessedCountries.appendChild(userCountriesContainer);
    }
    showGameResultWindow();
    this.finishGameHandler(false);
  }

  sleep(ms) {
    return new Promise((resolve) => {
      this._timeoutIds.push(setTimeout(resolve, ms));
    });
  }

  disableMapInteraction() {
    this._countryBondaries.forEach((countryBoundary) => {
      const countryBoundaryEl = document.querySelector(
        `.${countryBoundary.options.style.className}`
      );
      countryBoundaryEl.style.cursor = "none";
      countryBoundaryEl.style.pointerEvents = "none";
    });
    const markers = document.querySelectorAll("img.leaflet-marker-icon");
    markers.forEach((marker) => {
      marker.style.cursor = "none";
      marker.style.pointerEvents = "none";
    });
    if (this._guessCountriesMap) {
      this._guessCountriesMap.dragging.disable();
      this._guessCountriesMap.doubleClickZoom.disable();
      this._guessCountriesMap.scrollWheelZoom.disable();
      this._guessCountriesMap.boxZoom.disable();
      this._guessCountriesMap.keyboard.disable();
      if (this._guessCountriesMap.tap) this._guessCountriesMap.tap.disable();
      document.getElementById("guessCountriesGameMap").style.cursor = "default";
    }
  }

  enableMapInteraction() {
    this._countryBondaries.forEach((countryBoundary) => {
      if (
        !this._userAlreadyGuessedCountries.includes(
          countryBoundary.options.style.className
        )
      ) {
        const countryBoundaryEl = document.querySelector(
          `.${countryBoundary.options.style.className}`
        );
        countryBoundaryEl.style.cursor = "pointer";
        countryBoundaryEl.style.pointerEvents = "auto";
      }
    });
    const markers = document.querySelectorAll("img.leaflet-marker-icon");
    markers.forEach((marker) => {
      marker.style.cursor = "pointer";
      marker.style.pointerEvents = "auto";
    });
    if (this._guessCountriesMap) {
      this._guessCountriesMap.dragging.enable();
      this._guessCountriesMap.doubleClickZoom.enable();
      this._guessCountriesMap.scrollWheelZoom.enable();
      this._guessCountriesMap.boxZoom.enable();
      this._guessCountriesMap.keyboard.enable();
      if (this._guessCountriesMap.tap) this._guessCountriesMap.tap.enable();
      document.getElementById("guessCountriesGameMap").style.cursor = "grab";
    }
  }

  removeAllCountryBoundaries() {
    this._countryBondaries.forEach((item) =>
      this._guessCountriesMap.removeLayer(item)
    );
  }

  showGame() {
    this._gameElement.classList.remove("not-displayed");
  }

  hideGame() {
    removeCenterElementsMainLayout();
    removeCardQuizStartContainer();
    this.clearTimeout();
    this._gameElement.classList.add("not-displayed");
    this._guessCountriesGamePlayContainer.classList.add("not-displayed");
    this._guessCountriesStartContainer.classList.remove("not-displayed");
    this._gameRulesContent.classList.add("not-displayed");
    this.enableMapInteraction();
    this.finishGame(true);
  }

  translateElements() {
    const contextMenuItems = this._mapElement.querySelectorAll(
      ".leaflet-contextmenu-item"
    );
    if (contextMenuItems.length > 5) {
      contextMenuItems[5].textContent =
        localization[model.worldCountries.language]["Center Map Here"];
      contextMenuItems[6].textContent =
        localization[model.worldCountries.language]["Zoom In"];
      contextMenuItems[7].textContent =
        localization[model.worldCountries.language]["Zoom Out"];
      contextMenuItems[8].textContent =
        localization[model.worldCountries.language]["Reset"];
    }
    this._guessCountriesGameHeading.textContent = `${
      localization[model.worldCountries.language]["Guess Countries Game"]
    }`;
    this._returnToMap.textContent = `${
      localization[model.worldCountries.language]["RETURN TO WORLD MAP"]
    }`;
    this._gameStartCard.textContent = `${
      localization[model.worldCountries.language]["START"]
    }`;
    this._gameRulesButton.textContent = `${
      localization[model.worldCountries.language]["Game Rules"]
    }`;
    this._gameRulesContent.textContent = `${
      localization[model.worldCountries.language][
        "The game 'Guess Countries' helps to learn the location of countries in the world. Choose a given number of countries on the map. The computer will also choose the appropriate number of countries. Attempts to guess the countries take place in turn. The one who guesses the opponent's country gets an additional attempt. The winner is the one who first guesses all the opponent's countries. Follow the messages at the top of the screen after the game starts."
      ]
    }`;
    const optionsCountriesForSelection = Array.from(
      this._guessCountriesGameSelector.options
    );
    optionsCountriesForSelection.forEach((option) => {
      option.textContent =
        localization[model.worldCountries.language][option.value];
    });
    const optionsCountriesOnMap = Array.from(
      this._guessCountriesGameCountriesOnMapSelector.options
    );
    optionsCountriesOnMap.forEach((option) => {
      option.textContent =
        localization[model.worldCountries.language][option.value];
    });
    this._guessCountriesIndependentLabel.textContent = `${
      localization[model.worldCountries.language]["Only Independent Countries"]
    }`;
    this._gameResultShareButton.textContent = `${
      localization[model.worldCountries.language]["Share"]
    }`;
    this._gameResultModalButton.textContent = `${
      localization[model.worldCountries.language]["Close"]
    }`;
  }
}

export default new GuessCountriesGame();
