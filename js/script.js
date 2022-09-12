'use strict';


//----------------------------------------------------------------------
// on load
//----------------------------------------------------------------------
window.addEventListener('load', event => {
  // nav stuff
  creteDropdownNav(document.getElementById('general-nav'), document.getElementById('general-dropdown'));
  creteDropdownNav(document.getElementById('fractals-nav'), document.getElementById('fractals-dropdown'));
  creteDropdownNav(document.getElementById('games-nav'), document.getElementById('games-dropdown'));
  creteDropdownNav(document.getElementById('markets-nav'), document.getElementById('markets-dropdown'));
  
  // footer stuff
  const a = [ 'gmail.com', 'mailto:', '@', 'albertlobo1981' ];
  document.getElementById('email-link').href = a[1] + a[3] + a[2] + a[0];
});


// add hover listeners
function creteDropdownNav(navElement, dropdownElement) {
  navElement.addEventListener('mouseenter', event => { dropdownElement.style.display = 'block'; });
  navElement.addEventListener('mouseleave', event => { dropdownElement.style.display = 'none'; });
}















