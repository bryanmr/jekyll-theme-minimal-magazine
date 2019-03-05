---
layout: null
---
var lunr_index = false;
var posts_start_position = 0;

document.addEventListener("DOMContentLoaded", function () {
  initialize_search('/vg/lunr_serialized.json');
  display_ten();
});

function display_ten() {
  posts=document.getElementsByClassName("single_post_container");
  for(let i = 0; i < posts.length; i++) {
    posts[i].style.display = "none";
  }
  posts_end = posts_start_position+10;
  for(let i = posts_start_position; i < posts_end; i++) {
    posts[i].style.display = "block";
    posts[i].style.order = 0;
  }
}

function do_search(value) {
  posts=document.getElementsByClassName("single_post_container");
  for(let i = 0; i < posts.length; i++) {
    posts[i].style.display = "none";
    posts[i].style.order = 0;
  }
  if(value.target.value) {
    lunr_results = lunr_index.search(value.target.value);
    lunr_results.forEach(display_search_result);
  } else {
    display_ten();
  }
}

function display_search_result(result, result_index) {
  document.getElementById(result.ref).style.display = "block";
  document.getElementById(result.ref).style.order = result_index;
}

async function initialize_search(url) {
  lunr_index = lunr.Index.load(JSON.parse(await xhr_request(url)));
  document.getElementById("search").addEventListener("input", do_search);
  document.getElementById("search").style.display = "block";
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
