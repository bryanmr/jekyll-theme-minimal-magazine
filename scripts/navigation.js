/* exported displayCategory */
/* exported displayTag */
/* exported displayAllTags */
/* exported writeFullPost */
/* exported closeFullPost */
/* exported clearSearchResults */
/* exported closeTagsDisplay */
/* exported previousPage */
/* exported nextPage */
/* exported scrollTOC */
'use strict';
let lunrIndex = false;
let postsStartPosition = 0;
let lastScrollPosition = 0;
let savedNavURL = false;
let firstPageDisplayed = false;
let originalTitle = false;

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('scroll', checkScroll, true);
  document.addEventListener('wheel', checkScrollBottom, true);
  document.addEventListener('keydown', checkKey, true);
  window.addEventListener('popstate', handleBrowserBack, true);
  elementHeightSet('footer', 'footer_spacer');
  originalTitle = document.title;
  initializePage();
});

/** Handles when someone presses back in the browser */
function handleBrowserBack() {
  console.log('Refreshing the page to re-read URL parameters.');
  location.reload();
}

/** Sets the footer spacer to match the footer, no wasted space
 * @param {string} source - Where the height value is being copied from
 * @param {string} target - Where the height value is being copied to */
function elementHeightSet(source, target) {
  const elementHeight =
    window.getComputedStyle(document.getElementById(source)).height;
  document.getElementById(target).style.height = elementHeight;
}

/** Gets the page ready to be displayed */
async function initializePage() {
  if (!lunrIndex) {
    await initializeSearch('/vg/lunr_serialized.json');
  }

  document.getElementById('close_full_post').style.display = 'none';
  document.getElementById('close_tags').style.display = 'none';
  document.getElementById('clear_search_results').style.display = 'none';

  const searchTerm = getSetValue('searchTerm');
  const ourCategory = getSetValue('category');
  const ourTag = getSetValue('tag');
  if (searchTerm) {
    hideNav();
    document.getElementById('search').value =
      decodeURI(getSetValue('searchTerm'));
    doSearch({target: {value: searchTerm}}); // This is the expected format
  } else if (ourCategory) {
    displayCategory(decodeURI(ourCategory));
  } else if (ourTag) {
    displayTag(decodeURI(ourTag));
  } else {
    displayTen();
  }

  writeFullPost(getSetValue('content'));
}

/** Clears what is being displayed, so it can be built back up */
function hideEverything() {
  hideNav();
  hideAllPosts();
  document.getElementById('tags').style.display = 'none';
  document.getElementById('full_post').style.display = 'none';
  document.getElementById('all_posts_container').style.display = 'none';
  document.getElementById('close_full_post').style.display = 'none';
  document.getElementById('close_tags').style.display = 'none';
  document.getElementById('clear_search_results').style.display = 'none';
}

/** Shows the all_posts_container */
function showAllPostsContainer() {
  document.getElementById('all_posts_container').style.display = 'flex';
  document.getElementById('full_post').style.display = 'none';
  document.getElementById('close_full_post').style.display = 'none';
  window.scrollTo(0, 0);
}

/** Shows the all_posts_container */
function showFullPostsContainer() {
  document.getElementById('all_posts_container').style.display = 'none';
  document.getElementById('tags').style.display = 'none';
  document.getElementById('full_post').style.display = 'block';
  document.getElementById('close_full_post').style.display = 'initial';
  hideNav();
}

/** Displays the tag cloud */
function displayAllTags() {
  hideEverything();
  showAllPostsContainer();
  document.getElementById('tags').style.display = 'flex';
  document.getElementById('close_tags').style.display = 'block';
  hideNav(); // Call again to get a resize
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


/** Displays 10 posts from postsStartPosition */
function displayTen() {
  firstPageDisplayed = false;
  if (document.getElementById('full_post').style.display != 'block') {
    window.scrollTo(0, 0);
  }

  hideAllPosts();
  showPosts(10);
}

/** Hide all the posts */
function hideAllPosts() {
  const posts=document.getElementsByClassName('single_post_container');
  for (let i = 0; i < posts.length; i++) {
    posts[i].style.display = 'none';
  }
}

/** Updates the URL with new HTTP get key/value
 * Checks if the value is a search term, then adds it to the search box
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
      console.log('We handle this, but we should not get here.');
    } else {
      window.history.pushState({}, '', '?'+newParam);
    }
  }
}

/** Removes HTTP get parameter from URL
 * @param {string} goner - The key to be removed (along with its value)
 * @return {bool} - Returns false when it did nothing */
function popParamFromURL(goner) {
  if (!window.location.search) {
    return false;
  }
  const regex = new RegExp('&*'+goner+'=.+?(?=&|$)');
  const matchingLocation = window.location.search.match(regex);
  if (matchingLocation) {
    const updatedLocationSearch = window.location.search.replace(regex, '');
    if (updatedLocationSearch == '?') {
      window.history.pushState({}, '', window.location.pathname);
    } else {
      window.history.pushState({}, '', updatedLocationSearch);
    }
  }
}

/** Display a category in all_posts_container
 * @param {string} category - The category to display */
function displayCategory(category) {
  closeTagsDisplay();
  hideNav();
  hideAllPosts();
  document.getElementById('close_tags').style.display = 'block';

  const selectedPosts =
    document.querySelectorAll('[data-categories*="'+category+'"]');
  showAllSelectedPosts(selectedPosts);
  updateURL('category='+category);
}

/** Display all posts contained on selected object
 * @param {object} displayPosts - The object selected for */
function showAllSelectedPosts(displayPosts) {
  for (let i = 0; i < displayPosts.length; i++) {
    displayPosts[i].style.display = 'block';
    displayPosts[i].style.order = 0;
  }
}

/** Display a tag in all_posts_container
 * @param {string} tag - The tag to display */
function displayTag(tag) {
  closeTagsDisplay();
  hideNav();
  hideAllPosts();
  document.getElementById('close_tags').style.display = 'block';

  const selectedPosts =
    document.querySelectorAll('[data-tags*="'+tag+'"]');
  showAllSelectedPosts(selectedPosts);
  updateURL('tag='+tag);
}

/** Searches lunrIndex using lunr.js and displays posts
 * @param {string} value - The search term */
function doSearch(value) {
  document.getElementById('clear_search_results').style.display = 'initial';
  document.getElementById('search').style.display = 'block';
  document.getElementById('search').focus();
  hideNav();
  hideAllPosts();

  if (value.target.value) {
    const lunrResults = lunrIndex.search(value.target.value);
    if (lunrResults.length > 0) {
      lunrResults.forEach(displaySearchResult);
      updateURL('searchTerm='+value.target.value);
      window.scrollTo(0, 0);
    }
  } else {
    popParamFromURL('searchTerm');
    displayTen();
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

/** Replace the TOC div with the contents we expect */
function displayTOC() {
  const postHeaders =
    document.getElementById('full_post').querySelectorAll('h1, h2, h3');

  let TOCContents = '<div id="toc_label">Table of Contents</div>';
  TOCContents += '<div id="toc_head"><a href="#" '+
    'onclick="window.scrollTo(0, 0);return false">Top of Page</a></div>';

  for (let headNumber = 1; headNumber < postHeaders.length; headNumber++) {
    TOCContents +=
      `<div class="toc_'${postHeaders[headNumber].nodeName}">
      <a href="#" onclick="scrollTOC('${postHeaders[headNumber].id}');
      return false">
      ${postHeaders[headNumber].innerHTML}</a></div>`;
  }
  document.getElementById('TOC').innerHTML = TOCContents;
}

/** Scrolls based on TOC links
 * @param {string} Id - The ID we are scrolling to */
function scrollTOC(Id) {
  const elem = document.getElementById(Id);
  elem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
}

/** Writes out a post to the full_post element
 * @param {string} url - URL for the page to be displayed */
async function writeFullPost(url) {
  if (url) {
    const fetchURLResponse = await fetch(url);
    const pageContents = await fetchURLResponse.text();
    document.getElementById('full_post').innerHTML = pageContents;

    if (document.getElementById('page_title').dataset.title) {
      document.title = document.getElementById('page_title').dataset.title;
    }

    window.scrollTo(0, 0);
    showFullPostsContainer();
    displayTOC();

    if (!getSetValue('content')) {
      savedNavURL = window.location.search;
    }
    window.history.pushState({}, '', '?content='+url);
  }
}

/** Closes the full_post div and opens back the all_posts_container */
function closeFullPost() {
  showAllPostsContainer(); // Closes full_post
  showNav();
  popParamFromURL('content');
  document.title = originalTitle;
  if (savedNavURL) {
    window.history.pushState({}, '', savedNavURL);
  }
}

/** Clears the search results and displays all_posts_container */
function clearSearchResults() {
  document.getElementById('clear_search_results').style.display = 'none';
  document.getElementById('tags_nav').style.display = 'initial';
  document.getElementById('categories_nav').style.display = 'initial';
  document.getElementById('search').value = '';
  popParamFromURL('searchTerm');
  savedNavURL = false;
  displayTen();
}

/** Closes the tag cloud */
function closeTagsDisplay() {
  popParamFromURL('tag');
  popParamFromURL('category');
  savedNavURL = false;
  document.getElementById('tags').style.display = 'none';
  document.getElementById('close_tags').style.display = 'none';
  displayTen();
}

/** Checks if the next posts should be displayed, then calls displayTen()
 * @return {bool} - If this function returns, it is an error */
function nextPage() {
  if (notNavigable()) {
    return false;
  }
  postsStartPosition = postsStartPosition+10;
  displayTen();
}

/** Checks if the previous posts should be displayed, then calls displayTen()
 * @return {false} - If this function returns, it is an error */
function previousPage() {
  if (notNavigable()) {
    return false;
  }
  postsStartPosition = postsStartPosition-10;
  displayTen();
}

/** Checks the keys after an event, then processes them
 * @param {object} event - The event passed from the event listener */
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
    case 34: // Page Down
    case 40: // Down
      checkScrollBottom();
      break;
    case 37: // Left
      checkLeftThenPrevious(event);
      break;
    case 39: // Right
      checkRightThenNext(event);
      break;
  }
}

/** Checks which direction we are scrolling
 * @param {object} event - The event passed from the event listener */
function checkScroll(event) {
  if (lastScrollPosition > window.pageYOffset) {
    // We don't do anything for scroll up, but leaving this here
  } else {
    checkScrollBottom();
  }
  lastScrollPosition = window.pageYOffset;

  const TOCElement = document.getElementById('TOC');
  if (TOCElement && TOCElement.style.display != 'none') {
    const postHeaders =
      document.getElementById('full_post').querySelectorAll('h1, h2, h3');
    if (postHeaders[1].getBoundingClientRect().y > 1) {
      TOCElement.querySelectorAll('div')[1].style.border = '2px solid black';
      TOCElement.querySelectorAll('div')[2].style.border = 'none';
    } else {
      for (let headNumber = 2; headNumber < postHeaders.length; headNumber++) {
        if (postHeaders[headNumber].getBoundingClientRect().y > 1) {
          TOCElement.querySelectorAll('div')[headNumber].style.border =
            '2px solid black';
          TOCElement.querySelectorAll('div')[headNumber-1].style.border =
            'none';
          TOCElement.querySelectorAll('div')[headNumber+1].style.border =
            'none';
          break;
        }
      }
    }
  }
}

/** Checks if we are at the bottom of the page, then loads more content
 * @return {bool} - If this function returns, it is an error */
function checkScrollBottom() {
  if (notNavigable()) {
    return false;
  } else if ((window.innerHeight + window.pageYOffset) >=
    document.body.scrollHeight-10) {
    displayTenMore();
  }

  /** Displays ten more posts from postsStartPosition */
  function displayTenMore() {
    if (!firstPageDisplayed) {
      firstPageDisplayed = parseInt(((postsStartPosition+10)/10), 10);
    }
    postsStartPosition = postsStartPosition+10;
    showPosts(10);
  }
}

/** Shows more posts and updates page number display
 * @param {number} howMany - How many more posts to display */
function showPosts(howMany) {
  postPositionReal();

  const posts=document.getElementsByClassName('single_post_container');
  const postsEnd = postsStartPosition+howMany;
  for (let i = postsStartPosition; i < postsEnd; i++) {
    posts[i].style.display = 'block';
    posts[i].style.order = 0;
  }

  showNav();

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
      if (firstPageDisplayed) {
        document.getElementById('page_number').innerHTML =
          'Displaying Pages '+firstPageDisplayed+' to '
          +currentPostPage+' of '+postPagesTotal;
      } else {
        document.getElementById('page_number').innerHTML =
          'Displaying Page '+currentPostPage+' of '+postPagesTotal;
      }
    }
  }
}

/** Checks if we are in a state where navigation should occur
 * @return {bool} - Returns true when we should not try to navigate */
function notNavigable() {
  if (document.activeElement.id == 'search' ||
    document.getElementById('all_posts_container').style.display == 'none' ||
    document.getElementById('search').value ||
    document.getElementById('tags').style.display == 'flex' ||
    document.getElementById('page_number').style.display == 'none') {
    return true;
  } else {
    return false;
  }
}

/** Hides all the navigation, since it is out of context */
function hideNav() {
  if (document.activeElement.id != 'search') {
    document.getElementById('search').style.display = 'none';
  }
  document.getElementById('next_page').style.display = 'none';
  document.getElementById('previous_page').style.display = 'none';
  document.getElementById('page_number').style.display = 'none';
  document.getElementById('tags_nav').style.display = 'none';
  document.getElementById('categories_nav').style.display = 'none';
}

/** Shows all the navigation elements */
function showNav() {
  if (noOpenContent()) {
    document.getElementById('search').style.display = 'block';
    document.getElementById('page_number').style.display = 'initial';
    document.getElementById('tags_nav').style.display = 'initial';
    document.getElementById('categories_nav').style.display = 'initial';
    checkPosition();
  }

  /** We only want the previous/next buttons if they do something */
  function checkPosition() {
    const maxPosts =
      document.getElementsByClassName('single_post_container').length;
    if (maxPosts > (postsStartPosition+10)) {
      document.getElementById('next_page').style.display = 'initial';
    } else {
      document.getElementById('next_page').style.display = 'none';
    }

    if (postsStartPosition > 0) {
      document.getElementById('previous_page').style.display = 'initial';
    } else {
      document.getElementById('previous_page').style.display = 'none';
    }
  }
}

/** Returns true if we have a content tab open
 * @return {bool} - Returns true when there is no content blocking */
function noOpenContent() {
  if (document.getElementById('close_full_post').style.display == 'none' &&
    document.getElementById('close_tags').style.display == 'none' &&
    document.getElementById('clear_search_results').style.display == 'none') {
    return true;
  } else {
    return false;
  }
}
