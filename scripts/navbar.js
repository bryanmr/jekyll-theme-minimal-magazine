---
layout: null
---
var lunr_index = false;

document.addEventListener("DOMContentLoaded", function () {
  initialize_search('/vg/lunr_serialized.json');
});

function do_search(value) {
  lunr_results = lunr_index.search(value.target.value);
  lunr_results.forEach(display_search_result);
}

function display_search_result(result, result_index) {
  console.log("#" + result_index + ": " + result.ref);
}

async function initialize_search(url) {
  lunr_index = lunr.Index.load(JSON.parse(await xhr_request(url)));
  document.getElementById("search").addEventListener("input", do_search);
  document.getElementById("search").style.display = "block";
  console.log("Search Ready");
}

function xhr_request(url) {
  return new Promise(function (resolve, reject) {
    let raw_json = new XMLHttpRequest();
    raw_json.open('GET', url);
    raw_json.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(raw_json.response);
      } else {
        reject({
          status: this.status,
          statusText: raw_json.statusText
        });
      }
    };
    raw_json.onerror = function () {
      reject({
        status: this.status,
        statusText: raw_json.statusText
      });
    };
    raw_json.send();
  });
}
