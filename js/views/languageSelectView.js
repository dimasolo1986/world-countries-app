class languageSelectView {
  _languageElement = document.querySelector("#language-selector");

  addHandlerSelect(handler) {
    this._languageElement.addEventListener("change", function () {
      handler(this.value);
    });
  }
}

export default new languageSelectView();
