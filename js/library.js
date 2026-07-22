/* HP Library -- Landing page interactions */

(function () {
  'use strict';

  /* ---- Navbar scroll shadow ---- */
  var navbar = document.querySelector('.lib-navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('lib-navbar--scrolled', window.scrollY > 10);
    });
  }

  /* ---- Mobile hamburger menu ---- */
  var hamburger = document.querySelector('.lib-navbar__hamburger');
  var navLinks = document.querySelector('.lib-navbar__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('lib-navbar__links--open');
      hamburger.textContent = isOpen ? 'close' : 'menu';
    });
  }
})();
