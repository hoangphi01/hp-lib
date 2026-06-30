// Settings panel: theme switching, font size, localStorage persistence
(function() {
  'use strict';

  var FONT_SIZES = [15, 17, 18, 20, 22];
  var DEFAULT_THEME = 'original';
  var DEFAULT_FONT_LEVEL = 3; // 18px

  // --- State ---
  var currentTheme = localStorage.getItem('theme') || DEFAULT_THEME;
  var currentFontLevel = parseInt(localStorage.getItem('fontSize'), 10) || DEFAULT_FONT_LEVEL;

  // --- Apply ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    updateThemeCards();
  }

  function applyFontSize(level) {
    level = Math.max(1, Math.min(5, level));
    document.documentElement.setAttribute('data-fontsize', level);
    localStorage.setItem('fontSize', level);
    currentFontLevel = level;
    updateFontUI();
  }

  // --- Panel ---
  var panel = document.getElementById('settings-panel');
  var overlay = document.getElementById('settings-overlay');

  function closePanel() {
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // Close on outside click (but not if clicking floating nav)
  var floatingNav = document.getElementById('floating-nav');
  document.addEventListener('click', function(e) {
    if (panel && panel.classList.contains('open') && !panel.contains(e.target)) {
      if (floatingNav && floatingNav.contains(e.target)) return;
      closePanel();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
      closePanel();
    }
  });

  // Close on overlay click (mobile)
  if (overlay) {
    overlay.addEventListener('click', closePanel);
  }

  // --- Theme cards ---
  var themeCards = document.querySelectorAll('.theme-card');

  themeCards.forEach(function(card) {
    card.addEventListener('click', function() {
      applyTheme(this.getAttribute('data-theme'));
    });
  });

  function updateThemeCards() {
    themeCards.forEach(function(card) {
      card.classList.toggle('active', card.getAttribute('data-theme') === currentTheme);
    });
  }

  // --- Font size buttons ---
  var btnMinus = document.getElementById('font-decrease');
  var btnPlus = document.getElementById('font-increase');
  var barFill = document.getElementById('font-bar-fill');
  var fontLabel = document.getElementById('font-size-label');

  if (btnMinus) {
    btnMinus.addEventListener('click', function() {
      applyFontSize(currentFontLevel - 1);
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', function() {
      applyFontSize(currentFontLevel + 1);
    });
  }

  function updateFontUI() {
    if (!barFill || !fontLabel) return;
    var pct = ((currentFontLevel - 1) / 4) * 100;
    barFill.style.width = pct + '%';
    fontLabel.textContent = FONT_SIZES[currentFontLevel - 1] + 'px';
    if (btnMinus) btnMinus.disabled = currentFontLevel <= 1;
    if (btnPlus) btnPlus.disabled = currentFontLevel >= 5;
  }

  // --- Init ---
  updateThemeCards();
  updateFontUI();
})();
