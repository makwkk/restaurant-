/* ============================================================
   MAISON LUMIÈRE — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     A. FADE-UP ON SCROLL  (IntersectionObserver)
  ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything immediately
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----------------------------------------------------------
     B. MOBILE NAV — hamburger toggle
  ---------------------------------------------------------- */
  var nav         = document.getElementById('site-nav');
  var hamburger   = document.getElementById('nav-hamburger');
  var navLinks    = document.getElementById('nav-links');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     C. TESTIMONIAL CAROUSEL
  ---------------------------------------------------------- */
  var track     = document.getElementById('carousel-track');
  var dotsWrap  = document.getElementById('carousel-dots');
  var prevBtn   = document.getElementById('carousel-prev');
  var nextBtn   = document.getElementById('carousel-next');

  if (track && dotsWrap) {
    var total   = track.children.length;   // 3
    var current = 0;
    var autoTimer;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      dotsWrap.querySelectorAll('.dot').forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function startAuto() {
      autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); goTo(current + 1); startAuto(); });

    dotsWrap.querySelectorAll('.dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopAuto();
        goTo(parseInt(dot.dataset.index, 10));
        startAuto();
      });
    });

    // Pause on hover
    var carouselWrap = document.querySelector('.carousel-wrap');
    if (carouselWrap) {
      carouselWrap.addEventListener('mouseenter', stopAuto);
      carouselWrap.addEventListener('mouseleave', startAuto);
    }

    // Touch / swipe support
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        stopAuto();
        goTo(delta < 0 ? current + 1 : current - 1);
        startAuto();
      }
    }, { passive: true });

    startAuto();
  }

  /* ----------------------------------------------------------
     D. RESERVATION FORM — validation & submission
  ---------------------------------------------------------- */
  var form        = document.getElementById('reservation-form');
  var successBox  = document.getElementById('form-success');

  // Set date minimum to today
  var dateInput = document.getElementById('f-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  if (form && successBox) {

    function setError(inputId, errId, message) {
      var input = document.getElementById(inputId);
      var err   = document.getElementById(errId);
      if (input)  input.classList.add('invalid');
      if (err)    err.textContent = message;
      return false;
    }

    function clearError(inputId, errId) {
      var input = document.getElementById(inputId);
      var err   = document.getElementById(errId);
      if (input) input.classList.remove('invalid');
      if (err)   err.textContent = '';
    }

    function clearAllErrors() {
      [
        ['f-name',   'err-name'],
        ['f-email',  'err-email'],
        ['f-phone',  'err-phone'],
        ['f-date',   'err-date'],
        ['f-time',   'err-time'],
        ['f-guests', 'err-guests'],
      ].forEach(function (pair) { clearError(pair[0], pair[1]); });
    }

    // Clear error on input so user gets instant feedback
    ['f-name','f-email','f-phone','f-date','f-time','f-guests'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () { el.classList.remove('invalid'); });
        el.addEventListener('change', function () { el.classList.remove('invalid'); });
      }
    });

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function formatDate(dateStr) {
      if (!dateStr) return '';
      var parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      var months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
      return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();
      successBox.classList.remove('visible');

      var valid = true;

      var name   = document.getElementById('f-name').value.trim();
      var email  = document.getElementById('f-email').value.trim();
      var phone  = document.getElementById('f-phone').value.trim();
      var date   = document.getElementById('f-date').value;
      var time   = document.getElementById('f-time').value;
      var guests = document.getElementById('f-guests').value;

      if (!name) {
        valid = setError('f-name', 'err-name', 'Please enter your full name.');
      }
      if (!email) {
        valid = setError('f-email', 'err-email', 'Please enter your email address.');
      } else if (!EMAIL_RE.test(email)) {
        valid = setError('f-email', 'err-email', 'Please enter a valid email address.');
      }
      if (!phone) {
        valid = setError('f-phone', 'err-phone', 'Please enter your phone number.');
      }
      if (!date) {
        valid = setError('f-date', 'err-date', 'Please select a date.');
      } else {
        var today = new Date().toISOString().split('T')[0];
        if (date < today) {
          valid = setError('f-date', 'err-date', 'Please select a future date.');
        }
      }
      if (!time) {
        valid = setError('f-time', 'err-time', 'Please select a time.');
      }
      var guestsNum = parseInt(guests, 10);
      if (!guests || isNaN(guestsNum) || guestsNum < 1 || guestsNum > 20) {
        valid = setError('f-guests', 'err-guests', 'Please enter between 1 and 20 guests.');
      }

      if (!valid) {
        // Scroll to first error
        var firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Show success message
      var firstName = name.split(' ')[0];
      successBox.innerHTML =
        '<strong>Thank you, ' + escHtml(firstName) + '!</strong> ' +
        'Your reservation request for <strong>' + escHtml(guests) + ' guest' + (guestsNum > 1 ? 's' : '') + '</strong> ' +
        'on <strong>' + escHtml(formatDate(date)) + '</strong> at <strong>' + escHtml(time) + '</strong> ' +
        'has been received. We will confirm within 24 hours.';

      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      form.reset();
      // Restore date minimum after reset
      if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

      // Auto-hide after 10s
      setTimeout(function () { successBox.classList.remove('visible'); }, 10000);
    });
  }

  /* ----------------------------------------------------------
     E. FOOTER — current year
  ---------------------------------------------------------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     UTILITY
  ---------------------------------------------------------- */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
