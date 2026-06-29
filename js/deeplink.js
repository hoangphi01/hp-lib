// Deep-linking: auto-update URL hash on scroll + share button
// Like YouTube's ?t=62 — but for document sections
(function() {
  'use strict';

  // --- 1. Collect all section anchors ---
  var anchors = [];
  document.querySelectorAll('h2[id], h3[id]').forEach(function(el) {
    anchors.push({ id: el.id, el: el });
  });

  if (anchors.length === 0) return;

  // --- 2. Update URL hash as user scrolls (debounced) ---
  var scrollTimer = null;
  var userClicked = false; // avoid fighting with click-scroll

  function updateHash() {
    if (userClicked) return;
    var scrollY = window.scrollY + 120;
    var current = null;

    for (var i = 0; i < anchors.length; i++) {
      if (anchors[i].el.offsetTop <= scrollY) {
        current = anchors[i];
      }
    }

    // At very top of page, clear hash
    if (window.scrollY < 50) {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return;
    }

    if (current && '#' + current.id !== window.location.hash) {
      history.replaceState(null, '', '#' + current.id);
    }
  }

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateHash, 150);
  });

  // --- 3. Scroll to hash on page load ---
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.substring(1));
    if (target) {
      // Small delay to let MathJax render and layout settle
      setTimeout(function() {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  // --- 4. Track click-scrolls to avoid hash fighting ---
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function() {
      userClicked = true;
      setTimeout(function() { userClicked = false; }, 1000);
    });
  });

  // --- 5. Share button ---
  var shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', function() {
    var url = window.location.href;
    // Use clipboard API, fallback to textarea trick
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(showToast, fallbackCopy);
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    var ta = document.createElement('textarea');
    ta.value = window.location.href;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  }

  function showToast() {
    var toast = document.getElementById('share-toast');
    if (!toast) return;
    toast.textContent = 'Đã sao chép link!';
    toast.classList.add('visible');
    setTimeout(function() {
      toast.classList.remove('visible');
    }, 2000);
  }
})();
