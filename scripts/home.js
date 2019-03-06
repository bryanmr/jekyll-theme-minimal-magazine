function next_page() {
  //Requires display_ten from navbar.js
  posts_start_position = posts_start_position+10;
  post_position_real();
  display_ten();
}
function previous_page() {
  //Requires display_ten from navbar.js
  posts_start_position = posts_start_position-10;
  post_position_real();
  display_ten();
}
function top_of_page_action (event) {
  switch (event.which || event.keyCode) {
    case 33: // Page Up
    case 37: // Left
    case 38: // Up
      previous_page();
      break;

    default:
      return; // Return, don't hit preventDefault()
  }
  event.preventDefault(); // Don't move page, if we reach here
}
function bottom_of_page_action(event) {
  switch (event.which || event.keyCode) {
    case 34: // Page Down
    case 39: // Right
    case 40: // Down
      next_page();
      break;

    default:
      return; // Return, don't hit preventDefault()
  }
  event.preventDefault(); // Don't move page, if we reach here
}
function check_wheel(event) {
  wheel_direction = event.deltaY < 0 ? 'up' : 'down';
  if(wheel_direction == "up" && window.pageYOffset == 0) {
    previous_page();
  } else if(wheel_direction == "down" && (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    next_page();
  }
}
function check_key(event) {
  event = event || window.event;
  if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    bottom_of_page_action(event);
  }
  if (window.pageYOffset == 0) {
    top_of_page_action(event);
  }
}
document.addEventListener("wheel", check_wheel, true);
document.onkeydown = check_key;
