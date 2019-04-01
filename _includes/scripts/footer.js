'use strict';
document.addEventListener('DOMContentLoaded', function() {
  const elementHeight =
    window.getComputedStyle(document.getElementById('footer')).height;
  document.getElementById('footer_spacer').style.height = elementHeight;
});
