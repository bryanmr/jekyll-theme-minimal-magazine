function next_page() {
  // Requires display_ten from navbar.js
  if (document.activeElement.id == 'search' || document.getElementById('all_posts_container').style.display == 'none' || document.getElementById('search').value ) {
    return false;
  }
  posts_start_position = posts_start_position+10;
  post_position_real();
  display_ten();
}
function previous_page() {
  // Requires display_ten from navbar.js
  if (document.activeElement.id == 'search' || document.getElementById('all_posts_container').style.display == 'none' || document.getElementById('search').value ) {
    return false;
  }
  posts_start_position = posts_start_position-10;
  post_position_real();
  display_ten();
}
function check_wheel(event) {
  wheel_direction = event.deltaY < 0 ? 'up' : 'down';
  if (wheel_direction == 'up' && window.pageYOffset == 0) {
    previous_page();
  } else if (wheel_direction == 'down' && (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    next_page();
  }
}
function check_bottom_then_next(event) {
  if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    if (next_page()) {
      event.preventDefault(); // Don't move page, if we reach here
    }
  }
}
function check_top_then_previous(event) {
  if (window.pageYOffset == 0) {
    if (previous_page()) {
      event.preventDefault(); // Don't move page, if we reach here
    }
  }
}
function check_left_then_previous(event) {
  if (window.pageXOffset == 0) {
    if (previous_page()) {
      event.preventDefault(); // Don't move page, if we reach here
    }
  }
}
function check_right_then_next(event) {
  if ((window.innerWidth + window.pageXOffset) >= document.body.offsetWidth) {
    if (next_page()) {
      event.preventDefault(); // Don't move page, if we reach here
    }
  }
}
function check_key(event) {
  event = event || window.event;
  switch (event.which || event.keyCode) {
    case 34: // Page Down
    case 40: // Down
      check_bottom_then_next(event);
      break;
    case 33: // Page Up
    case 38: // Up
      check_top_then_previous(event);
      break;
    case 37: // Left
      check_left_then_previous(event);
      break;
    case 39: // Right
      check_right_then_next(event);
      break;
  }
}
document.addEventListener('wheel', check_wheel, true);
document.onkeydown = check_key;
