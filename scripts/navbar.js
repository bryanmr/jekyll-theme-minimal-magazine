var lunr_index = false;
var posts_start_position = 0;

document.addEventListener("DOMContentLoaded", function () {
  initialize_search('/vg/lunr_serialized.json');
  if(window.location.search) {
    set_posts_start();
    write_full_post(get_set_value("content"));
  }
  if(!get_set_value("search_term")) {
    display_ten();
  }
});

function go_home() {
  window.history.replaceState({}, '', "index.html");
  close_full_post();
  posts_start_position = 0;
  display_ten();
}

function set_posts_start() {
  let split_post_start=get_set_value("post_start");
  let posts_start_position = parseInt(split_post_start,10);
  post_position_real();
}

function get_set_value(key) {
  let regex = new RegExp("&*"+key+"=.+?(?=&|$)");
  let matching_location = window.location.search.match(regex);
  if (matching_location) {
    return matching_location[0].split("=")[1];
  } else {
    return false;
  }
}

function post_position_real() {
  if(posts_start_position >= document.getElementsByClassName("single_post_container").length) {
    console.log("Reached end! Old post start position: "+posts_start_position);
    posts_start_position = document.getElementsByClassName("single_post_container").length - 10;
  } else if(posts_start_position < 0) {
    console.log("Reached start! Old post start position: "+posts_start_position);
    posts_start_position = 0;
  }
}

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
  update_url('post_start='+posts_start_position);
}

function update_url(new_param) {
  let new_key_value=new_param.split("=");
  if(window.location.search.search(new_key_value[0]) > -1) {
    let regex = new RegExp(new_key_value[0]+"=.+?(?=&|$)");
    let updated_location_search = window.location.search.replace(regex, new_param);
    window.history.replaceState({}, '', updated_location_search);
  } else {
    if(window.location.search) {
      window.history.replaceState({}, '', window.location.search+"&"+new_param);
    } else {
      window.history.replaceState({}, '', "?"+new_param);
    }
  }
}

function pop_param_from_url(goner) {
  let regex = new RegExp("&*"+goner+"=.+?(?=&|$)");
  let updated_location_search = window.location.search.replace(regex, "");
  window.history.replaceState({}, '', updated_location_search);
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
    update_url('search_term='+value.target.value);
  } else {
    pop_param_from_url("search_term");
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
  search_onLoad();
}

function search_onLoad() {
  let search_term = get_set_value("search_term");
  if(search_term) {
    document.getElementById("search").value = get_set_value("search_term");
    do_search({target:{value:search_term}}); // This is the expected format
  }
}

async function write_full_post(url) {
  if(url) {
    page_contents = await xhr_request(url);
    document.getElementById("full_post").style.display = "block";
    document.getElementById("full_post").innerHTML = page_contents;
    document.getElementById("all_posts_container").style.display = "none";
    document.getElementById("close_full_post").style.display = "initial";
    update_url("content="+url);
  }
}

function close_full_post() {
  document.getElementById("full_post").style.display = "none";
  document.getElementById("close_full_post").style.display = "none";
  document.getElementById("all_posts_container").style.display = "flex";
  pop_param_from_url("content");
}

function xhr_request(url) {
  return new Promise(function (resolve, reject) {
    let raw_json = new XMLHttpRequest();
    raw_json.open('GET', url);
    raw_json.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(raw_json.responseText);
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
