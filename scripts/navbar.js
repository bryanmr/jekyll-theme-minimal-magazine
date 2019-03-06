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
  document.getElementById("search").value = "";
  display_ten();
}

function set_posts_start() {
  let split_post_start=get_set_value("post_start");
  posts_start_position = parseInt(split_post_start,10);
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
  let max_posts = document.getElementsByClassName("single_post_container").length;
  if(posts_start_position >= max_posts) {
    console.log("Reached end! Old post start position: "+posts_start_position);
    posts_start_position = max_posts - 10;
  } else if(posts_start_position < 0) {
    console.log("Reached start! Old post start position: "+posts_start_position);
    posts_start_position = 0;
  }
  display_post_count(max_posts);
}

function display_post_count(max_posts) {
  let current_post_page = parseInt(((posts_start_position+10)/10),10);
  let post_pages_total = parseInt((max_posts/10),10);
  document.getElementById("page_number").innerHTML = "<span>Page "+current_post_page+" of "+post_pages_total+"</span>";
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
  document.getElementById("clear_search_results").style.display = "initial";
  document.getElementById("page_number").style.display = "none";
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
    document.getElementById("page_number").style.display = "initial";
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
    document.getElementById("search").style.display = "none";
    document.getElementById("next_page").style.display = "none";
    document.getElementById("previous_page").style.display = "none";
    document.getElementById("close_full_post").style.display = "initial";
    update_url("content="+url);
  }
}

function close_full_post() {
  document.getElementById("full_post").style.display = "none";
  document.getElementById("close_full_post").style.display = "none";
  document.getElementById("all_posts_container").style.display = "flex";
  document.getElementById("next_page").style.display = "initial";
  document.getElementById("previous_page").style.display = "initial";
  document.getElementById("search").style.display = "block";
  pop_param_from_url("content");
}

function clear_search_results() {
  document.getElementById("clear_search_results").style.display = "none";
  document.getElementById("search").value = "";
  pop_param_from_url("search_term");
  document.getElementById("page_number").style.display = "initial";
  display_ten();
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
