/* exported goHome
/* exported clearSearchResults */
/* eslint-disable */
var lunrIndex = false;
var postsStartPosition = 0;
/* eslint-enable */

document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('scroll', checkBottom, true);
  document.onkeydown = checkKey;
  window.onpopstate = handleBrowserBack;
  footerHeightSet();
  initializePage();
});

/** Handles when someone presses back in the browser */
function handleBrowserBack() {
  console.log('Refreshing the page to re-read URL parameters.');
  location.reload();
}

/** Sets the footer spacer to match the footer, no wasted space */
function footerHeightSet() {
  const footerHeight =
    window.getComputedStyle(document.getElementById('footer')).height;
  document.getElementById('footer_spacer').style.height = footerHeight;
}

/** Gets the page ready to be displayed */
async function initializePage() {
  if (!lunrIndex) {
    await initializeSearch('/vg/lunr_serialized.json');
  }
  const searchTerm = getSetValue('searchTerm');
  if (searchTerm) {
    document.getElementById('search').value = getSetValue('searchTerm');
    doSearch({target: {value: searchTerm}}); // This is the expected format
  } else {
    displayTen();
    if ((window.innerHeight + window.pageYOffset) >=
      document.body.scrollHeight-10) {
      postsStartPosition = postsStartPosition+10;
      displayTenMore();
    }
  }
  writeFullPost(getSetValue('content'));
}

/** Clears URL get parameters and displays landing page. */
function goHome() {
  window.history.pushState({}, '', window.location.pathname);
  closeFullPost();
  postsStartPosition = 0;
  document.getElementById('search').value = '';
  displayTen();
}

/** Reads the value of HTTP get values
 * @param {string} key - The key used to search through get values.
 * @return {string} - The value that matches the get parameter */
function getSetValue(key) {
  const regex = new RegExp('&*'+key+'=.+?(?=&|$)');
  const matchingLocation = window.location.search.match(regex);
  if (matchingLocation) {
    return matchingLocation[0].split('=')[1];
  } else {
    return false;
  }
}

/** Checks if we have posts to display at postsStartPosition */
function postPositionReal() {
  const maxPosts =
    document.getElementsByClassName('single_post_container').length;
  if (postsStartPosition >= maxPosts) {
    postsStartPosition = maxPosts - 10;
  } else if (postsStartPosition < 0) {
    postsStartPosition = 0;
  }
  displayPostCount(maxPosts);

  /** Function to update the post count display on page
   * @param {number} maxPosts - How many posts we found on the page */
  function displayPostCount(maxPosts) {
    const currentPostPage = parseInt(((postsStartPosition+10)/10), 10);
    const postPagesTotal = parseInt((maxPosts/10), 10);
    document.getElementById('page_number').innerHTML =
      '<span>Page '+currentPostPage+' of '+postPagesTotal+'</span>';
  }
}

/** Changes the CSS display: to display 10 posts from postsStartPosition */
function displayTen() {
  const posts=document.getElementsByClassName('single_post_container');
  for (let i = 0; i < posts.length; i++) {
    posts[i].style.display = 'none';
  }

  postPositionReal();
  const postsEnd = postsStartPosition+10;
  for (let i = postsStartPosition; i < postsEnd; i++) {
    posts[i].style.display = 'block';
    posts[i].style.order = 0;
  }

  if (document.getElementById('full_post').style.display != 'block') {
    window.scrollTo(0, 0);
  }
}

/** Changes the CSS display: to display 10 posts from postsStartPosition */
function displayTenMore() {
  const posts=document.getElementsByClassName('single_post_container');

  postPositionReal();
  const postsEnd = postsStartPosition+10;
  for (let i = postsStartPosition; i < postsEnd; i++) {
    posts[i].style.display = 'block';
    posts[i].style.order = 0;
  }
}

/** Updates the URL with new HTTP get key/value
 * @param {number} newParam - The new parameter to add to the URL */
function updateURL(newParam) {
  const newKeyValue=newParam.split('=');
  if (window.location.search.search(newKeyValue[0]) > -1) {
    const regex = new RegExp(newKeyValue[0]+'=.+?(?=&|$)');
    const updatedLocationSearch =
      window.location.search.replace(regex, newParam);
    window.history.pushState({}, '', updatedLocationSearch);
  } else {
    if (window.location.search) {
      window.history.pushState({}, '', window.location.search+'&'+newParam);
    } else {
      window.history.pushState({}, '', '?'+newParam);
    }
  }
}

/** Removes HTTP get parameter from URL
 * @param {string} goner - The key to be removed (along with its value) */
function popParamFromURL(goner) {
  const regex = new RegExp('&*'+goner+'=.+?(?=&|$)');
  const updatedLocationSearch = window.location.search.replace(regex, '');
  if (updatedLocationSearch == '?') {
    window.history.pushState({}, '', window.location.pathname);
  } else {
    window.history.pushState({}, '', updatedLocationSearch);
  }
}

/** Searches lunrIndex using lunr.js and displays posts
 * @param {string} value - The search term */
function doSearch(value) {
  document.getElementById('clear_search_results').style.display = 'initial';
  document.getElementById('page_number').style.display = 'none';
  posts=document.getElementsByClassName('single_post_container');
  for (let i = 0; i < posts.length; i++) {
    posts[i].style.display = 'none';
    posts[i].style.order = 0;
  }
  if (value.target.value) {
    lunrResults = lunrIndex.search(value.target.value);
    lunrResults.forEach(displaySearchResult);
    updateURL('searchTerm='+value.target.value);
    window.scrollTo(0, 0);
  } else {
    popParamFromURL('searchTerm');
    displayTen();
    document.getElementById('page_number').style.display = 'initial';
  }

  /** Creates the lunr.js search index variable named lunrIndex
   * @param {string} result - Which post to display
   * @param {string} resultIndex - This will set the display order */
  function displaySearchResult(result, resultIndex) {
    document.getElementById(result.ref).style.display = 'block';
    document.getElementById(result.ref).style.order = resultIndex;
  }
}

/** Creates the lunr.js search index variable named lunrIndex
 * @param {string} url - URL for the lunr.js preprocssed, serialized JSON */
async function initializeSearch(url) {
  const fetchURLResponse = await fetch(url);
  const serializedJSON = await fetchURLResponse.json();
  lunrIndex = lunr.Index.load(serializedJSON);
  document.getElementById('search').addEventListener('input', doSearch);
  document.getElementById('search').style.display = 'block';
}

/** Writes out a post to the full_post element
 * @param {string} url - URL for the page to be displayed */
async function writeFullPost(url) {
  if (url) {
    const fetchURLResponse = await fetch(url);
    const pageContents = await fetchURLResponse.text();
    document.getElementById('full_post').style.display = 'block';
    document.getElementById('full_post').innerHTML = pageContents;
    const searchValue = document.getElementById('search').value;
    if (searchValue != '') {
      window.find(searchValue);
    }
    document.getElementById('all_posts_container').style.display = 'none';
    document.getElementById('search').style.display = 'none';
    document.getElementById('next_page').style.display = 'none';
    document.getElementById('previous_page').style.display = 'none';
    document.getElementById('close_full_post').style.display = 'initial';
    updateURL('content='+url);
    window.scrollTo(0, 0);
  }
}

/** Closes the full_post div and opens back the all_posts_container */
function closeFullPost() {
  document.getElementById('full_post').style.display = 'none';
  document.getElementById('close_full_post').style.display = 'none';
  document.getElementById('all_posts_container').style.display = 'flex';
  document.getElementById('next_page').style.display = 'initial';
  document.getElementById('previous_page').style.display = 'initial';
  document.getElementById('search').style.display = 'block';
  popParamFromURL('content');
  window.scrollTo(0, 0);
}

/** Clears the search results and displays all_posts_container */
function clearSearchResults() {
  document.getElementById('clear_search_results').style.display = 'none';
  document.getElementById('search').value = '';
  popParamFromURL('searchTerm');
  document.getElementById('page_number').style.display = 'initial';
  displayTen();
}

/** Checks if the next posts should be displayed, then calls displayTen()
 * @return {false} - If this function returns, it is an error */
function nextPage() {
  window.removeEventListener('scroll', checkBottom, true);
  if (document.activeElement.id == 'search' ||
    document.getElementById('all_posts_container').style.display == 'none' ||
    document.getElementById('search').value ) {
    return false;
  }
  postsStartPosition = postsStartPosition+10;
  displayTen();
}

/** Checks if the previous posts should be displayed, then calls displayTen()
 * @return {false} - If this function returns, it is an error */
function previousPage() {
  window.removeEventListener('scroll', checkBottom, true);
  if (document.activeElement.id == 'search' ||
    document.getElementById('all_posts_container').style.display == 'none' ||
    document.getElementById('search').value ) {
    return false;
  }
  postsStartPosition = postsStartPosition-10;
  displayTen();
}

/** Checks the keys after an event, then processes them
 * @param {string} event - The event passed from the event listener */
function checkKey(event) {
  /** Check if window is scrolled all the way left, then go previous if true
   * @param {string} event - The event passed from the event listener */
  function checkLeftThenPrevious(event) {
    if (window.pageXOffset == 0) {
      if (previousPage()) {
        event.preventDefault(); // Don't move page, if we reach here
      }
    }
  }

  /** Check if window is scrolled all the way right, then goes to next if true
   * @param {string} event - The event passed from the event listener */
  function checkRightThenNext(event) {
    if ((window.innerWidth + window.pageXOffset) >= document.body.offsetWidth) {
      if (nextPage()) {
        event.preventDefault(); // Don't move page, if we reach here
      }
    }
  }

  event = event || window.event;
  switch (event.which || event.keyCode) {
    case 37: // Left
      checkLeftThenPrevious(event);
      break;
    case 39: // Right
      checkRightThenNext(event);
      break;
  }
}

/** Checks if we are at the bottom of the page, then loads more content
 * @param {string} event - The event passed from the event listener */
function checkBottom(event) {
  if ((window.innerHeight + window.pageYOffset) >=
    document.body.scrollHeight-10) {
    postsStartPosition = postsStartPosition+10;
    displayTenMore();
    document.onkeydown = null;
    document.getElementById('next_page').style.display = 'none';
    document.getElementById('previous_page').style.display = 'none';
  }
}
