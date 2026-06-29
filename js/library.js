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

  /* ---- Search filter ---- */
  var searchInput = document.querySelector('.lib-search__input');
  var tagButtons = document.querySelectorAll('.lib-search__tag');
  var bookCards = document.querySelectorAll('.lib-book-card');
  var emptyState = document.querySelector('.lib-empty');
  var activeTag = 'all';

  function filterCards() {
    var query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    var visibleCount = 0;

    bookCards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var tags = (card.getAttribute('data-tags') || '').toLowerCase();
      var matchesSearch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
      var matchesTag = activeTag === 'all' || tags.indexOf(activeTag) !== -1;
      var visible = matchesSearch && matchesTag;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  tagButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tagButtons.forEach(function (b) { b.classList.remove('lib-search__tag--active'); });
      btn.classList.add('lib-search__tag--active');
      activeTag = btn.getAttribute('data-tag') || 'all';
      filterCards();
    });
  });
})();
