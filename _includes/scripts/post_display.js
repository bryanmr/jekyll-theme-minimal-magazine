/* exported scrollTOC */
/* exported closeFullPost */
'use strict';

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('scroll', checkScrollTOC, {passive: true});
  displayTOC();
  const baseURL = document.querySelector('meta[itemprop="baseurl"]')
      .getAttribute('content').split('/')[2];
  findComments(baseURL, window.location.pathname);
});

/** Checks which direction we are scrolling and updates the TOC
 * @param {object} event - The event passed from the event listener */
function checkScrollTOC(event) {
  const TOCElement = document.getElementById('TOC');
  if (TOCElement && window.getComputedStyle(TOCElement).display != 'none') {
    const postHeaders =
      document.getElementById('whole_post').querySelectorAll('h1, h2, h3');
    const TOCDivs = TOCElement.querySelectorAll('div');
    if (typeof postHeaders !== 'undefined' && postHeaders.length > 1) {
      if (postHeaders[1].getBoundingClientRect().y > 1) {
        TOCElement.querySelectorAll('div')[1].style.border = '5px solid black';
        removeBorders(TOCDivs, 1);
      } else {
        for (let headNum = 2; headNum < TOCDivs.length; headNum++) {
          // TOCDivs should be postHeaders+1
          if (headNum == postHeaders.length) {
            TOCDivs[headNum].style.border = '5px solid black';
            removeBorders(TOCDivs, headNum);
          } else if (postHeaders[headNum].getBoundingClientRect().y > 1) {
            TOCDivs[headNum].style.border = '5px solid black';
            removeBorders(TOCDivs, headNum);
            break;
          }
        }
      }
    }
  }

  /** Function to remove borders from a NodeList of elements
   * @param {NodeList} element - The element to iterate over
   * @param {number} skipSubElementNum - Skipping this element */
  function removeBorders(element, skipSubElementNum) {
    for (let elemNum = 0; elemNum < element.length; elemNum++) {
      if (elemNum == skipSubElementNum) {
        continue;
      }
      element[elemNum].style.border = 'none';
    }
  }
}

/** Replace the TOC div with the contents we expect */
function displayTOC() {
  const postHeaders =
    document.getElementById('whole_post').querySelectorAll('h1, h2, h3');

  let TOCContents = '<div id="toc_label">Table of Contents</div>';
  TOCContents += `<div id="toc_head"><a href="#"
  onclick="scrollTOC('post_title');return false">Top of Page</a></div>`;

  for (let headNumber = 1; headNumber < postHeaders.length; headNumber++) {
    TOCContents +=
      `<div class="toc_${postHeaders[headNumber].nodeName}">
      <a href="#${postHeaders[headNumber].id}"
      onclick="scrollTOC('${postHeaders[headNumber].id}');return false">
      ${postHeaders[headNumber].innerHTML}</a></div>`;
  }
  document.getElementById('TOC').innerHTML = TOCContents;
}

/** Scrolls based on TOC links
 * @param {string} Id - The ID we are scrolling to */
function scrollTOC(Id) {
  const elem = document.getElementById(Id);
  elem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  if (Id != 'post_title') {
    history.replaceState({}, '', '#'+Id);
  } else {
    history.replaceState({}, '', window.location.pathname);
  }
}

/** Finds the Reddit threads for a blog post
 * @param {string} site - The site we are searching for, should be ours
 * @param {string} url - URL for the blog post we are searching for */
function findComments(site, url) {
  // URL for testing if the code works
  // site = 'i.imgur.com';
  // url = '4V6UFix.gifv';
  const fetchString = 'https://www.reddit.com/search.json?q=site%3A"'+site+'" url%3A"'+url+'"';
  fetch(fetchString).then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to download with unknown cause');
    }
  }).then(function(redditPosts) {
    if (redditPosts.data.children[0]) {
      document.getElementById('comments').innerHTML = '';
      redditPosts.data.children.forEach(function(thread) {
        writeComments('https://www.reddit.com'+
          thread.data.permalink.slice(0, -1)+'.json');
      });
    } else {
      console.log('No comment threads found on Reddit');
    }
  }).catch(function(error) {
    console.log('Checking our own thread downloads.'+
      'Error not fatal, yet. Reported as: '+error);
    localComments(url);
  });
}

/** Attempts to write from JSON stored at local URL
 * @param {string} url - The URL we are checking for comment threads for */
function localComments(url) {
  let foundComments = false;
  const baseURL = document.getElementById('home_menu').children[0].pathname;
  fetch(baseURL+'reddit_comment_threads.json').then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to download with unknown cause');
    }
  }).then(function(possiblePosts) {
    if (possiblePosts.data.children[0]) {
      possiblePosts.data.children.forEach(function(thread) {
        if (thread.data.url.includes(url)) {
          if (!foundComments) {
            document.getElementById('comments').innerHTML = '';
            foundComments = true;
          }
          writeThreads(thread.data);
        }
        if (!foundComments) {
          console.log('No comment theads found on Reddit.');
        }
      });
    }
  }).catch(function(error) {
    console.error('Giving up on posts. Error: '+error);
  });
}

/** Makes links to the threads where we are finding comments
 * @param {object} redditThread - The thread we are working on */
function writeThreads(redditThread) {
  const thread = document.createElement('a');
  document.getElementById('comments').appendChild(thread);
  thread.classList.add('thread_link');
  thread.innerText = 'Comments from '+redditThread.subreddit_name_prefixed+
    ' posted at '+redditThread.title;
  thread.setAttribute('href', 'https://www.reddit.com'+redditThread.permalink);
  thread.setAttribute('target', '_blank');
  thread.setAttribute('rel', 'noreferrer noopener');
}

/** Displays the comments for a post
 * @param {string} url - URL for the comments to be displayed */
async function writeComments(url) {
  const fetchCommentsResponse = await fetch(url);
  const commentsContent = await fetchCommentsResponse.json();
  writeThreads(commentsContent[0].data.children[0].data);
  recurseComments(commentsContent[1].data);
}

/** Function that can recurse, showing all replies in a comment thread
 * @param {string} replies - The array to parse for comments */
function recurseComments(replies) {
  replies.children.forEach(function(post) {
    if (post.data.body && post.data.score > 0) {
      const commentAuthor = document.createElement('h3');
      document.getElementById('comments').appendChild(commentAuthor);
      commentAuthor.classList.add('comment_author');
      commentAuthor.innerText = post.data.author;
      commentAuthor.style.paddingLeft = post.data.depth*20+'px';

      const commentText = document.createElement('p');
      document.getElementById('comments').appendChild(commentText);
      commentText.innerText = post.data.body;
      commentText.style.paddingLeft = post.data.depth*20+'px';

      if (post.data.replies.data) {
        recurseComments(post.data.replies.data);
      }
    }
  });
}

/** Function to close our post page and return to where we came from */
function closeFullPost() {
  if (!document.referrer || window.location == document.referrer) {
    window.location =
      document.getElementById('home_menu').children[0].pathname;
  } else if (window.location.hostname != document.referrer) {
    window.location = document.referrer;
  } else {
    window.location = document.referrer;
  }
}
