L.Control.Player = L.Control.extend({
  options: {
    position: "topright",
    cssClass: "leaflet-control-country-player",
    template:
      '<div class="playerButton"></div><div class="playerButtonStart">▶</div><div class="playerButtonEnd">⏹</div>',
  },
  onAdd: function (map) {
    this._isPaused = false;
    this._div = L.DomUtil.create("div", this.options.cssClass);
    $(this._div).html(this.options.template);
    this._startButton = $(this._div).find(".playerButtonStart")[0];
    this._pauseButton = $(this._div).find(".playerButtonPause")[0];
    this._endButton = $(this._div).find(".playerButtonEnd")[0];
    const delaySelect = $(this._div).find(".playerDelaySelect")[0];
    this._countryCountElement = $(this._div).find("#countryCount")[0];
    this._startButton.addEventListener("click", this.playCountires.bind(this));
    this._endButton.addEventListener(
      "click",
      this.stopPlayCountries.bind(this)
    );
    this._pauseButton.addEventListener(
      "click",
      this.pausePlayCountries.bind(this)
    );
    delaySelect.addEventListener("change", this.delayChange.bind(this));
    return this._div;
  },
  onRemove: function (map) {
    this.options.mapView._sideNavigationView._selectedCountry = undefined;
    this.options.mapView._sideNavigationView._removeAllSelection();
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
  delayChange: function () {
    this.stopPlayCountries();
  },
  playCountires: function () {
    this._isPaused = false;
    this._pauseButton.style.color = "white";
    this._pauseButton.style.pointerEvents = "auto";
    this._startButton.style.color = "blue";
    this._startButton.style.pointerEvents = "none";
    this._endButton.style.color = "white";
    this._endButton.style.pointerEvents = "auto";
    const delaySelect = $(this._div).find(".playerDelaySelect")[0];
    const delayValue = +delaySelect.value;
    const play = function () {
      if (!this._isPaused) {
        if (index >= this.options.model.worldCountries.countries.length) {
          this.stopPlayCountries();
        } else {
          const country = this.options.model.worldCountries.countries[index];
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
    this._pauseButton.style.color = "blue";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.color = "white";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.color = "white";
    this._endButton.style.pointerEvents = "auto";
    this._isPaused = true;
  },
  terminatePlayCountries: function () {
    this._isPaused = false;
    this._pauseButton.style.color = "white";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.color = "white";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.color = "blue";
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
    this._pauseButton.style.color = "white";
    this._pauseButton.style.pointerEvents = "none";
    this._startButton.style.color = "white";
    this._startButton.style.pointerEvents = "auto";
    this._endButton.style.color = "blue";
    this._endButton.style.pointerEvents = "none";
    this.options.mapView._sideNavigationView._selectedCountry = undefined;
    this.options.mapView._sideNavigationView._removeAllSelection();
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
