// Floating Nav (Assistive Touch): draggable, expandable, context-aware navigation
(function() {
  'use strict';

  var nav = document.getElementById('floating-nav');
  var toggle = document.getElementById('floating-nav-toggle');
  var menu = document.getElementById('floating-nav-menu');
  if (!nav || !toggle) return;

  // --- Context detection from body data attributes ---
  var body = document.body;
  var level = body.dataset.pageLevel || 'library';
  var bookUrl = body.dataset.bookUrl;

  // --- Configure button visibility based on context ---
  var btnHome = document.getElementById('fn-home');
  var btnBook = document.getElementById('fn-book');
  var btnShare = document.getElementById('fn-share');
  var btnSettings = document.getElementById('fn-settings');
  var btnBackTop = document.getElementById('fn-back-top');

  // Home: hide on library (already there)
  if (btnHome) {
    if (level === 'library') {
      btnHome.hidden = true;
    }
  }

  // Back to Book: only visible on chapter pages
  if (btnBook) {
    if (level === 'chapter' && bookUrl) {
      btnBook.href = bookUrl;
    } else {
      btnBook.hidden = true;
    }
  }

  // Share: already conditionally included via Liquid, but hide on library
  if (btnShare && level === 'library') {
    btnShare.hidden = true;
  }

  // Settings: hide on library (no theme system there)
  if (btnSettings && level === 'library') {
    btnSettings.hidden = true;
  }

  // --- Expand / Collapse ---
  var isOpen = false;
  var isDragging = false;
  var wasDragged = false;

  function openMenu() {
    isOpen = true;
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    isOpen = false;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    // Also close settings panel if open
    var panel = document.getElementById('settings-panel');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      var overlay = document.getElementById('settings-overlay');
      if (overlay) overlay.classList.remove('open');
    }
  }

  function toggleMenu() {
    if (isOpen) closeMenu(); else openMenu();
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (wasDragged) { wasDragged = false; return; }
    toggleMenu();
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (isOpen && !nav.contains(e.target)) {
      var panel = document.getElementById('settings-panel');
      if (panel && panel.contains(e.target)) return;
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      toggle.focus();
    }
  });

  // --- Back to top ---
  if (btnBackTop) {
    btnBackTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMenu();
    });
  }

  // --- Settings button ---
  if (btnSettings) {
    btnSettings.addEventListener('click', function(e) {
      e.stopPropagation();
      var panel = document.getElementById('settings-panel');
      var overlay = document.getElementById('settings-overlay');
      if (panel) {
        var wasOpen = panel.classList.contains('open');
        if (wasOpen) {
          panel.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
        } else {
          panel.classList.add('open');
          if (overlay) overlay.classList.add('open');
        }
      }
    });
  }

  // --- Share button (deep-link) ---
  if (btnShare) {
    btnShare.addEventListener('click', function() {
      // Reuse existing share/deeplink logic if available
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          showToast('Link copied!');
        });
      } else {
        // Fallback
        var input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Link copied!');
      }
      closeMenu();
    });
  }

  function showToast(msg) {
    var toast = document.getElementById('share-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 2000);
  }

  // --- Drag (Assistive Touch) ---
  var startX, startY, startLeft, startBottom, startRight, startTop;
  var dragThreshold = 8;
  var dragStartTime;

  function getNavRect() {
    return nav.getBoundingClientRect();
  }

  function onPointerDown(e) {
    if (e.target.closest('.floating-nav__menu') || e.target.closest('.floating-nav__item')) return;
    isDragging = true;
    wasDragged = false;
    dragStartTime = Date.now();
    nav.classList.add('dragging');

    var rect = getNavRect();
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    startY = e.clientY || (e.touches && e.touches[0].clientY);
    startRight = window.innerWidth - rect.right;
    startBottom = window.innerHeight - rect.bottom;

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    var clientX = e.clientX || (e.touches && e.touches[0].clientX);
    var clientY = e.clientY || (e.touches && e.touches[0].clientY);
    var dx = clientX - startX;
    var dy = clientY - startY;

    if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
      wasDragged = true;
    }

    var newRight = startRight - dx;
    var newBottom = startBottom - dy;

    // Clamp within viewport
    var toggleSize = 48;
    var maxRight = window.innerWidth - toggleSize;
    var maxBottom = window.innerHeight - toggleSize;
    newRight = Math.max(8, Math.min(maxRight, newRight));
    newBottom = Math.max(8, Math.min(maxBottom, newBottom));

    nav.style.right = newRight + 'px';
    nav.style.bottom = newBottom + 'px';
    nav.style.left = 'auto';
    nav.style.top = 'auto';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    nav.classList.remove('dragging');

    if (wasDragged) {
      snapToEdge();
      savePosition();
    }
  }

  function snapToEdge() {
    var rect = getNavRect();
    var centerX = rect.left + rect.width / 2;
    var viewW = window.innerWidth;

    // Snap to nearest horizontal edge
    if (centerX < viewW / 2) {
      nav.style.right = 'auto';
      nav.style.left = '16px';
    } else {
      nav.style.left = 'auto';
      nav.style.right = '16px';
    }
    updateTooltipSide();
  }

  function savePosition() {
    var pos = {
      right: nav.style.right,
      bottom: nav.style.bottom,
      left: nav.style.left
    };
    try { localStorage.setItem('floatingNavPos', JSON.stringify(pos)); } catch(e) {}
  }

  function restorePosition() {
    try {
      var saved = localStorage.getItem('floatingNavPos');
      if (saved) {
        var pos = JSON.parse(saved);
        if (pos.left && pos.left !== 'auto') {
          nav.style.left = pos.left;
          nav.style.right = 'auto';
        } else if (pos.right && pos.right !== 'auto') {
          nav.style.right = pos.right;
          nav.style.left = 'auto';
        }
        if (pos.bottom) nav.style.bottom = pos.bottom;
      }
    } catch(e) {}
  }

  // Pointer events
  toggle.addEventListener('mousedown', onPointerDown);
  toggle.addEventListener('touchstart', onPointerDown, { passive: false });
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('touchend', onPointerUp);

  // --- Tooltip positioning when snapped left ---
  // When nav is on the left side, tooltips should appear on the right
  function updateTooltipSide() {
    var rect = getNavRect();
    var onLeft = rect.left < window.innerWidth / 2;
    nav.classList.toggle('snapped-left', onLeft);
  }

  // --- Init ---
  restorePosition();
  // Delay tooltip side check so layout is settled
  requestAnimationFrame(updateTooltipSide);

  // If on library page, don't show nav at all (no useful buttons)
  if (level === 'library') {
    var visibleItems = menu.querySelectorAll('.floating-nav__item:not([hidden])');
    if (visibleItems.length === 0) {
      nav.style.display = 'none';
    }
  }
})();
