L.Control.Weather = L.Control.extend({
  options: {
    position: "bottomleft",
    units: "internal",
    lang: "en",
    event: "moveend",
    cssClass: "leaflet-control-weather",
    iconUrlTemplate: "https://openweathermap.org/img/w/:icon",
    template:
      '<div class="weatherIcon"><img src=":iconurl"></div><div><span id="coordinates">Coordinates</span>: :latitude, :longitude</div><div><span id="tempreture">Tempreture</span>: :temperature°C</div><div><span id="humidity">Humidity</span>: :humidity%</div><div><span id="wind">Wind</span>: :winddirection :windspeed m/s</div>',
    translateWindDirection: function (text) {
      return text;
    },
    updateWidget: undefined,
  },
  onAdd: function (map) {
    this._div = L.DomUtil.create("div", this.options.cssClass);
    this._div.innerHTML = this.options.template;
    this._collapse = this._div.querySelector(".collapseButtonWeather");
    this._weatherIcon = this._div.querySelector(".weatherIcon");
    this._weatherIconImg = this._div.querySelector(".weatherIconImg");
    this._weatherCoordinates = this._div.querySelector(".weatherCoordinates");
    this._weatherTemperature = this._div.querySelector(".weatherTemperature");
    this._weatherHumidity = this._div.querySelector(".weatherHumidity");
    this._weatherWind = this._div.querySelector(".weatherWind");
    this._collapse.addEventListener(
      "click",
      function () {
        this._weatherIcon.classList.toggle("not-displayed");
        this._weatherCoordinates.classList.toggle("not-displayed");
        this._weatherTemperature.classList.toggle("not-displayed");
        this._weatherHumidity.classList.toggle("not-displayed");
        this._weatherWind.classList.toggle("not-displayed");
        if (this._weatherIcon.classList.contains("not-displayed")) {
          this._collapse.innerHTML = "⬇";
        } else {
          this._collapse.innerHTML = "⬆";
        }
      }.bind(this)
    );
    this.onMoveEnd = onMoveEnd.bind(this);
    if (!this.options.updateWidget) {
      this.options.updateWidget = this._updateWidget.bind(this);
    }
    this.refresh(this.options.updateWidget.bind(this));
    this._map.on(this.options.event, this.onMoveEnd);

    function onMoveEnd() {
      const _this = this;
      this.refresh(function (weather) {
        _this.options.updateWidget(weather);
      });
    }
    return this._div;
  },
  onRemove: function (map) {
    this._map.off(this.options.event, this.onMoveEnd);
  },
  refresh: function (callback) {
    let center = this._map.getCenter(),
      url =
        "https://api.openweathermap.org/data/2.5/weather?lat=:lat&lon=:lng&lang=:lang&units=:units&appid=:appkey";
    const apiKey = this.options.apiKey;

    url = url.replace(":lang", this.options.lang);
    url = url.replace(":units", this.options.units);
    url = url.replace(":lat", center.lat);
    url = url.replace(":lng", center.lng);
    url = url.replace(":appkey", apiKey);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to get Weather data");
        }
        return response.json();
      })
      .then((weather) => {
        callback(weather);
        this._div.style.display = "block";
      })
      .catch((error) => {
        this._div.style.display = "none";
      });
  },
  _updateWidget: function (weather) {
    const iconUrl = this.options.iconUrlTemplate.replace(
      ":icon",
      weather.weather[0].icon + ".png"
    );
    this._weatherIconImg.src = iconUrl;
    this._div.querySelector(
      ".weatherCoordinatesValue"
    ).textContent = `${+weather.coord.lat.toFixed(
      2
    )}, ${+weather.coord.lon.toFixed(2)}`;
    this._div.querySelector(
      ".weatherTemperatureValue"
    ).textContent = `${weather.main.temp}°C`;
    this._div.querySelector(
      ".weatherHumidityValue"
    ).textContent = `${weather.main.humidity}%`;
    this._div.querySelector(
      ".weatherWindValue"
    ).innerHTML = `${this.mapWindDirection(weather.wind.deg)} ${
      weather.wind.speed
    }`;
  },
  /**
   * Maps from wind direction in degrees to cardinal points
   * According to :
   * http://climate.umn.edu/snow_fence/components/winddirectionanddegreeswithouttable3.htm
   */
  mapWindDirection: function (degrees) {
    let text = "";
    if (inRange(degrees, 11.25, 33.75)) {
      text = "&#8599;";
    } else if (inRange(degrees, 33.75, 56.25)) {
      text = "&#8599;";
    } else if (inRange(degrees, 56.25, 78.75)) {
      text = "&#8599;";
    } else if (inRange(degrees, 78.75, 101.25)) {
      text = "&#8594;";
    } else if (inRange(degrees, 101.25, 123.75)) {
      text = "&#8600;";
    } else if (inRange(degrees, 123.75, 146.25)) {
      text = "&#8600;";
    } else if (inRange(degrees, 146.25, 168.75)) {
      text = "&#8600;";
    } else if (inRange(degrees, 168.75, 191.25)) {
      text = "&#8595;";
    } else if (inRange(degrees, 191.25, 213.75)) {
      text = "&#8601;";
    } else if (inRange(degrees, 213.75, 236.25)) {
      text = "&#8601;";
    } else if (inRange(degrees, 236.25, 258.75)) {
      text = "&#8601;";
    } else if (inRange(degrees, 258.75, 281.25)) {
      text = "&#8592;";
    } else if (inRange(degrees, 281.25, 303.75)) {
      text = "&#8598;";
    } else if (inRange(degrees, 303.75, 326.25)) {
      text = "&#8598;";
    } else if (inRange(degrees, 326.25, 348.75)) {
      text = "&#8598;";
    } else if (inRange(degrees, 348.75, 11.25)) {
      text = "&#8593;";
    }
    return this.options.translateWindDirection(text);

    function inRange(val, min, max) {
      if (max < min) {
        if (val >= min && val < 360) {
          return true;
        }
        if (val > 0 && val < max) {
          return true;
        }
        return false;
      }
      // Al other directions
      if (val >= min && val <= max) {
        return true;
      }
      return false;
    }
  },
});

L.control.weather = function (options) {
  if (!options.apiKey) {
    console.warn(
      "Leaflet.Weather: You must provide an OpenWeather API key.\nPlease see https://openweathermap.org/faq#error401 for more info"
    );
  }
  return new L.Control.Weather(options);
};
