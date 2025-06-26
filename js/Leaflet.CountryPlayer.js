L.Control.Player = L.Control.extend({
  options: {
    position: "topright",
    cssClass: "leaflet-control-country-player",
    template:
      '<div class="playerButton"></div><div class="playerButtonStart">▶</div><div class="playerButtonEnd">⏹</div>',
  },
  onAdd: function (map) {
    this._isPlaying = false;
    this._isPaused = false;
    this._countries = this.options.model.slice();
    this._div = L.DomUtil.create("div", this.options.cssClass);
    $(this._div).html(this.options.template);
    this._collapse = $(this._div).find(".collapseButtonCountryPlayer")[0];
    this._footer = $(this._div).find(".playerFooter")[0];
    this._countriesSelectContainer = $(this._div).find(
      ".playerCountriesSelect"
    )[0];
    this._countriesSelect = $(this._div).find("#playerCountriesSelect")[0];
    this._label = $(this._div).find("#playerSelectLabel")[0];
    this._select = $(this._div).find("#playerSelectLabel")[0];
    this._startButton = $(this._div).find(".playerButtonStart")[0];
    this._pauseButton = $(this._div).find(".playerButtonPause")[0];
    this._endButton = $(this._div).find(".playerButtonEnd")[0];
    this._pauseButton.style.opacity = "0.5";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.opacity = "1";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.opacity = "0.5";
    this._endButton.style.pointerEvents = "none";
    this._delaySelect = $(this._div).find(".playerDelaySelect")[0];
    this._countryCountElement = $(this._div).find("#countryCount")[0];
    this._allCountriesCountElement = $(this._div).find(
      "#allCountriesNumber"
    )[0];
    this._collapse.addEventListener("click", this.collapse.bind(this));
    this._startButton.addEventListener("click", this.playCountires.bind(this));
    this._endButton.addEventListener(
      "click",
      this.stopPlayCountries.bind(this)
    );
    this._pauseButton.addEventListener(
      "click",
      this.pausePlayCountries.bind(this)
    );
    this._delaySelect.addEventListener("change", this.delayChange.bind(this));
    this._countriesSelect.addEventListener(
      "change",
      this.countriesChange.bind(this)
    );
    return this._div;
  },
  onRemove: function (map) {
    this.options._countries = [];
    this.options.mapView._sideNavigationView._selectedCountry = undefined;
    this.options.mapView._sideNavigationView._removeAllSelection();
    this.options.mapView.markersEnableCloseOnClick();
    this.options.mapView.setIsCountrySelected(false);
    this.options.mapView.removeCapitalMarker();
    this.options.mapView.removeCountryBoundary();
    this.options.mapView.closeAllPopup();
    this.options.mapView.setMapViewToBounds(this.options.worldBounds);
    if (this._timerIntervalId) {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = undefined;
    }
    if (this._timerTimeoutId) {
      clearTimeout(this._timerTimeoutId);
      this._timerTimeoutId = undefined;
    }
  },
  countriesChange: function () {
    if (this._countriesSelect.value === "All Countries") {
      this._countries = this.options.model.slice();
    } else if (this._countriesSelect.value === "Europe") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Europe");
    } else if (this._countriesSelect.value === "Americas") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Americas");
    } else if (this._countriesSelect.value === "Africa") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Africa");
    } else if (this._countriesSelect.value === "Asia") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Asia");
    } else if (this._countriesSelect.value === "Oceania") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Oceania");
    } else if (this._countriesSelect.value === "Antarctic") {
      this._countries = this.options.model
        .slice()
        .filter((country) => country.region === "Antarctic");
    }
    this._allCountriesCountElement.textContent = " : " + this._countries.length;
    this.stopPlayCountries();
  },
  delayChange: function () {
    this.stopPlayCountries();
  },
  collapse: function () {
    this._startButton.classList.toggle("not-displayed");
    this._pauseButton.classList.toggle("not-displayed");
    this._endButton.classList.toggle("not-displayed");
    this._label.classList.toggle("not-displayed");
    this._delaySelect.classList.toggle("not-displayed");
    this._footer.classList.toggle("not-displayed");
    this._countriesSelectContainer.classList.toggle("not-displayed");
    if (this._startButton.classList.contains("not-displayed")) {
      this._collapse.innerHTML = "⬇";
    } else {
      this._collapse.innerHTML = "⬆";
    }
  },
  playCountires: function () {
    this._isPlaying = true;
    this._isPaused = false;
    this._pauseButton.style.opacity = "1";
    this._pauseButton.style.pointerEvents = "auto";
    this._startButton.style.opacity = "0.5";
    this._startButton.style.pointerEvents = "none";
    this._endButton.style.opacity = "1";
    this._endButton.style.pointerEvents = "auto";
    const delayValue = +this._delaySelect.value;
    const play = function () {
      if (!this._isPaused) {
        if (index >= this._countries.length) {
          this.stopPlayCountries();
          this._delaySelect.value = "3";
          this._countriesSelect.value = "All Countries";
        } else {
          const country = this._countries[index];
          const countryBound = this.options.countryBounds.find(
            (bound) => country.name.common === bound.name
          );
          if (countryBound) {
            this.options.mapView.setMapViewToBounds(countryBound.bounds);
          } else {
            const zoomLevel = this.options.defineZoomLevelByCountryArea(
              country.area
            );
            this.options.mapView.setMapView(
              country.latlng ? country.latlng : country.capitalInfo.latlng,
              zoomLevel
            );
          }
          this.options.mapView.markersDisableCloseOnClick();
          this.options.mapView.removeCapitalMarker();
          this.options.mapView.removeCountryBoundary();
          this._countryCountElement.textContent = index + 1;
          this.options.mapView.addCountryBoundary(country);
          this.options.mapView.showMarkerPopup(
            country.latlng ? country.latlng : country.capitalInfo.latlng
          );
          index += 1;
        }
      }
    };
    let index = 0;
    if (!this._timerTimeoutId) {
      this._timerTimeoutId = setTimeout(play.bind(this), 800);
    }
    if (!this._timerIntervalId) {
      this._timerIntervalId = setInterval(play.bind(this), delayValue * 1000);
    }
  },
  updateTemplate: function () {
    $(this._div).html(this.options.template);
  },
  pausePlayCountries: function () {
    this._pauseButton.style.opacity = "0.5";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.opacity = "1";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.opacity = "1";
    this._endButton.style.pointerEvents = "auto";
    this._isPaused = true;
    this._isPlaying = false;
    this.options.mapView._sideNavigationView._selectedCountry = undefined;
    this.options.mapView._sideNavigationView._removeAllSelection();
    this.options.mapView.markersEnableCloseOnClick();
    this.options.mapView.setIsCountrySelected(false);
    this.options.mapView.removeCapitalMarker();
    this.options.mapView.removeCountryBoundary();
    this.options.mapView.closeAllPopup();
    this.options.mapView.setMapViewToBounds(this.options.worldBounds);
  },
  terminatePlayCountries: function () {
    this._isPaused = false;
    this._isPlaying = false;
    this._pauseButton.style.opacity = "0.5";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.opacity = "1";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.opacity = "0.5";
    this._endButton.style.pointerEvents = "none";
    this._countryCountElement.textContent = 1;
    if (this._timerIntervalId) {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = undefined;
    }
    if (this._timerTimeoutId) {
      clearTimeout(this._timerTimeoutId);
      this._timerTimeoutId = undefined;
    }
  },
  stopPlayCountries: function () {
    this._isPaused = false;
    this._isPlaying = false;
    this._pauseButton.style.opacity = "0.5";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.opacity = "1";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.opacity = "0.5";
    this._endButton.style.pointerEvents = "none";
    this.options.mapView._sideNavigationView._selectedCountry = undefined;
    this.options.mapView._sideNavigationView._removeAllSelection();
    this.options.mapView.markersEnableCloseOnClick();
    this.options.mapView.setIsCountrySelected(false);
    this.options.mapView.removeCapitalMarker();
    this.options.mapView.removeCountryBoundary();
    this.options.mapView.closeAllPopup();
    this.options.mapView.setMapViewToBounds(this.options.worldBounds);
    this._countryCountElement.textContent = 1;
    if (this._timerIntervalId) {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = undefined;
    }
    if (this._timerTimeoutId) {
      clearTimeout(this._timerTimeoutId);
      this._timerTimeoutId = undefined;
    }
  },
});

L.control.player = function (options) {
  return new L.Control.Player(options);
};
