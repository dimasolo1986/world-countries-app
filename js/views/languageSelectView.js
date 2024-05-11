class languageSelectView {
  _languageElement = document.querySelector("#language-selector");

  init() {
    const language = localStorage.getItem("language");
    if (language) {
      this._languageElement.value = language;
    } else {
      this._languageElement.value = "en";
    }
  }
  addHandlerSelect(handler) {
    this._languageElement.addEventListener("change", function () {
      handler(this.value);
    });
  }
}

export default new languageSelectView();
