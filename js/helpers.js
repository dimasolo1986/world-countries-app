import { REQUEST_TIMEOUT_SEC, DEFAULT_COUNTRY_ZOOM_LEVEL } from "./config.js";
import { localization } from "./localization/ua.js";
import * as model from "./model.js";
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const defineZoomLevelByCountryArea = function (countryArea) {
  if (countryArea >= 0 && countryArea <= 500) {
    return 11;
  }
  if (countryArea > 500 && countryArea <= 1000) {
    return 9;
  }
  if (countryArea > 1000 && countryArea <= 100000) {
    return 8;
  }
  if (countryArea > 100000 && countryArea <= 500000) {
    return 7;
  }
  if (countryArea > 500000 && countryArea <= 800000) {
    return 6;
  }
  if (countryArea > 800000 && countryArea <= 5000000) {
    return 5;
  }
  if (countryArea > 5000000 && countryArea <= 10000000) {
    return 4;
  }
  if (countryArea >= 10000000) {
    return 3;
  }
  return DEFAULT_COUNTRY_ZOOM_LEVEL;
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(REQUEST_TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

export const sortData = function (data, direction = "asc") {
  data.sort((a, b) => {
    const result = localization[model.worldCountries.language]["countries"][
      a.name.common
    ].localeCompare(
      localization[model.worldCountries.language]["countries"][b.name.common],
      model.worldCountries.language
    );
    return direction === "asc" ? result : -result;
  });
};

export const getRandomInt = function (
  min = 0,
  max = model.worldCountries.countries.length - 1
) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const showQuizResultWindow = function () {
  const quizResult = new bootstrap.Modal(
    document.getElementById("quizResultModal"),
    {}
  );
  quizResult.show();
};

export const shareQuizResults = function () {
  const quizResultsLabelText = document.getElementById(
    "quizModalResultLabel"
  ).textContent;
  const quizName = document.getElementById("quizModalName").textContent;
  const quizScoreNameResult =
    document.querySelector(".score-name-result").textContent;
  const quizScoreResult = document.querySelector(".score-result").textContent;
  const quizScoreResultPoints = document.querySelector(
    ".score-result-points"
  ).textContent;
  const quizRightAnswersText = document.querySelector(
    ".right-answers-text"
  ).textContent;
  const quizRightAnswersNumberText = document.querySelector(
    ".right-answers-number"
  ).textContent;
  const quizRightAnswersOutOfText = document.querySelector(
    ".right-answers-out-of"
  ).textContent;
  const answeredNumber = document.querySelector(".answered-number").textContent;
  const ratingText = document.querySelector(".rating-text").textContent;
  const ratingStar = document.querySelector(".rating-star").textContent;
  const quizShareResultText = `https://www.worldcountriesquiz.com | ${quizName} | ${currentDateTime()} | ${quizScoreNameResult} ${quizScoreResult} ${quizScoreResultPoints} | ${quizRightAnswersText} ${quizRightAnswersNumberText} ${quizRightAnswersOutOfText} ${answeredNumber} | ${ratingText} ${ratingStar}`;
  if (navigator.share) {
    navigator
      .share({
        title: `https://www.worldcountriesquiz.com | ${quizResultsLabelText} : ${quizName}`,
        text: `${quizShareResultText}`,
        url: "https://www.worldcountriesquiz.com",
      })
      .then(function () {})
      .catch(function () {});
  }
};

export const currentDateTime = function () {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date} ${time}`;
};

export const getLanguageCode = function () {
  if (model.worldCountries.language === "ua") {
    return "uk";
  }
  if (model.worldCountries.language === "en") {
    return "en";
  }
  if (model.worldCountries.language === "de") {
    return "de";
  }
  if (model.worldCountries.language === "fr") {
    return "fr";
  }
  if (model.worldCountries.language === "es") {
    return "es";
  }
  if (model.worldCountries.language === "it") {
    return "it";
  }
  return "en";
};
