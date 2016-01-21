(function () {
  var SERVICE_ADDRESS = 'wss://jifwtfservice.cfapps.io:4443';

  var searchForm;
  var searchField;
  var resultContainer;
  var resultDisplay;
  var resultMessage;
  var resultUrl;
  var lastSearchQuery;
  var lastSearchTimeoutId;
  var socket;

  var results;
  var resultIndex;

  function init() {
    searchForm = document.getElementById('search-form');
    searchField = document.getElementById('search-field');
    resultContainer = document.getElementById('result-container');
    resultDisplay = document.getElementById('result-display');
    resultMessage = document.getElementById('result-message');
    resultUrl = document.getElementById('result-url');

    searchForm.addEventListener('submit', formSubmit);
    searchField.addEventListener('keyup', searchWithDelay);
    searchField.addEventListener('change', search);
    searchField.addEventListener('keydown', searchKeyDown);

    resultUrl.addEventListener('click', resultUrlSelect);

    socket = io(SERVICE_ADDRESS);
    socket.on('results', onResults);

    searchField.focus();
  }

  function formSubmit(e) {
    e.preventDefault();
    search();
    return false;
  }

  function searchKeyDown(e) {
    var TAB_KEY = 9;

    if (e.keyCode == TAB_KEY) {
      if (e.shiftKey) {
        resultIndex--;
      } else {
        resultIndex++;
      }
      if (typeof results !== 'undefined') {
        if (resultIndex < 0) {
          resultIndex = results.length - 1;
        } else if (resultIndex >= results.length) {
          resultIndex = 0;
        }
      }
      displayResult(resultIndex);
      e.preventDefault();
      return false;
    }
  }

  function searchWithDelay() {
    clearTimeout(lastSearchTimeoutId);
    lastSearchTimeoutId = setTimeout(search, 500);
  }

  function search() {
    clearTimeout(lastSearchTimeoutId);
    if (lastSearchQuery == searchField.value) {
      return;
    }
    lastSearchQuery = searchField.value;
    socket.emit('search', 'giphy', lastSearchQuery);
  }

  function onResults(query, newResults) {
    if (query != lastSearchQuery) {
      return;
    }
    results = newResults;
    window.results = results;
    resultIndex = 0;
    displayResult(resultIndex);
  }

  function displayResult(index) {
    if (typeof results === 'undefined' || results == null || results.length == 0) {
      resultDisplay.src = '';
      if (searchField.value.length > 0) {
        resultMessage.innerText = 'No results. Search for something else.';
      } else {
        resultMessage.innerText = '';
      }
      resultUrl.innerText = '';
      return;
    }
    var url = results[index].gif;

    resultDisplay.type = 'video/mp4';
    resultDisplay.src = results[index].mp4;
    resultDisplay.preload = 'auto';
    resultDisplay.autoplay = true;
    resultDisplay.muted = 'muted';
    resultDisplay.loop = 'loop';
    resultDisplay.width = results[index].width;
    resultDisplay.height = results[index].height;

    resultMessage.innerText = "Result " + (index + 1) + " of " + results.length;
    resultUrl.innerText = url;
  }

  function resultUrlSelect(e) {
    selectTextOfElement(resultUrl);
  }

  function selectTextOfElement(element) {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(element);
      window.getSelection().addRange(range);
    }
  }

  window.addEventListener("load", init);
})();
