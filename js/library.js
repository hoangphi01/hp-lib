/* HP Library — Landing page interactions */

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

  /* ---- Materials type filter ---- */
  var filterButtons = document.querySelectorAll('.lib-materials__filter');
  var spines = document.querySelectorAll('.lib-spine');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var type = btn.getAttribute('data-type');

      filterButtons.forEach(function (b) {
        b.classList.remove('lib-materials__filter--active');
      });
      btn.classList.add('lib-materials__filter--active');

      spines.forEach(function (spine) {
        if (type === 'all' || spine.getAttribute('data-type') === type) {
          spine.style.display = '';
        } else {
          spine.style.display = 'none';
        }
      });
    });
  });
})();
