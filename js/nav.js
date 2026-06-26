// TOC active state tracking and smooth scroll
(function() {
  'use strict';

  // Highlight current section in TOC based on scroll position
  var sectionLinks = document.querySelectorAll('.toc .section-list a');
  var sections = [];

  sectionLinks.forEach(function(link) {
    var id = link.getAttribute('href');
    if (id && id.startsWith('#')) {
      var el = document.getElementById(id.substring(1));
      if (el) sections.push({ link: link, el: el });
    }
  });

  function updateActive() {
    var scrollY = window.scrollY + 100;
    var current = null;

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= scrollY) {
        current = sections[i];
      }
    }

    sectionLinks.forEach(function(link) {
      link.classList.remove('active');
    });

    if (current) {
      current.link.classList.add('active');
    }
  }

  if (sections.length > 0) {
    window.addEventListener('scroll', updateActive);
    updateActive();
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.getElementById(this.getAttribute('href').substring(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
