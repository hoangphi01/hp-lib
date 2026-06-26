// Settings panel: theme switching, font size, localStorage persistence
(function() {
  'use strict';

  var THEMES = ['original', 'quiet', 'paper', 'bold', 'calm', 'focus', 'dark'];
  var FONT_SIZES = [15, 17, 18, 20, 22];
  var DEFAULT_THEME = 'original';
  var DEFAULT_FONT_LEVEL = 3; // 18px

  // --- State ---
  var currentTheme = localStorage.getItem('theme') || DEFAULT_THEME;
  var currentFontLevel = parseInt(localStorage.getItem('fontSize'), 10) || DEFAULT_FONT_LEVEL;

  // --- Apply (already done by inline script, but re-apply for safety) ---
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

  // --- Panel toggle ---
  var panel = document.getElementById('settings-panel');
  var overlay = document.getElementById('settings-overlay');
  var btn = document.getElementById('settings-btn');

  var backToTop = document.getElementById('back-to-top');

  function openPanel() {
    panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    backToTop.classList.remove('visible');
  }

  function closePanel() {
    panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    updateBackToTop();
  }

  function togglePanel() {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    togglePanel();
  });

  // Close on outside click (ignore clicks inside floating-buttons container)
  var floatingBtns = document.querySelector('.floating-buttons');
  document.addEventListener('click', function(e) {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !floatingBtns.contains(e.target)) {
      closePanel();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
      btn.focus();
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

  btnMinus.addEventListener('click', function() {
    applyFontSize(currentFontLevel - 1);
  });

  btnPlus.addEventListener('click', function() {
    applyFontSize(currentFontLevel + 1);
  });

  function updateFontUI() {
    var pct = ((currentFontLevel - 1) / 4) * 100;
    barFill.style.width = pct + '%';
    fontLabel.textContent = FONT_SIZES[currentFontLevel - 1] + 'px';
    btnMinus.disabled = currentFontLevel <= 1;
    btnPlus.disabled = currentFontLevel >= 5;
  }

  // --- Back to top button ---
  function updateBackToTop() {
    if (panel.classList.contains('open')) return;
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateBackToTop);

  // --- Init ---
  updateThemeCards();
  updateFontUI();
  updateBackToTop();
})();
