/**
 * Constructora Ara-Chile — Fase 2
 * Vanilla JS: nav, modal mandantes, contadores, lightbox
 */
(function () {
  'use strict';

  var DURATION = 2000;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Año footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Nav móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-principal');

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('nav-open', !open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* ---------- Modal Mandantes ---------- */
  var modal = document.getElementById('modal-mandantes');
  var openTriggers = document.querySelectorAll('[data-open-modal="modal-mandantes"]');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    closeNav();
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    document.body.classList.add('modal-open');
    var firstInput = modal.querySelector('input, button');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openTriggers.forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  if (modal) {
    modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', function (e) {
      var rect = modal.getBoundingClientRect();
      var inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inDialog) closeModal();
    });

    modal.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeModal();
    });

    var form = modal.querySelector('.mandantes-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Hook listo para backend / autenticación real
        var id = form.querySelector('#proyecto-id');
        if (id && !id.value.trim()) {
          id.focus();
          return;
        }
        alert('Portal en preparación. Solicite credenciales a gerencia@constructora-ara.com');
      });
    }
  }

  /* ---------- Contadores animados ---------- */
  function formatNumber(value, decimals) {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function animateCounter(el) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var divisor = parseFloat(el.getAttribute('data-divisor')) || 1;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var displayTarget = target / divisor;

    if (reduceMotion) {
      el.textContent = formatNumber(displayTarget, decimals) + suffix;
      return;
    }

    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / DURATION, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = displayTarget * eased;
      el.textContent = formatNumber(current, decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatNumber(displayTarget, decimals) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll('.counter');
  var statsSection = document.getElementById('experiencia');

  if (counters.length && 'IntersectionObserver' in window && statsSection) {
    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counters.forEach(animateCounter);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    counterObserver.observe(statsSection);
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxTriggers = document.querySelectorAll('.img-lightbox');

  function openLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    if (lightboxCaption) {
      var fig = img.closest('figure');
      var cap = fig ? fig.querySelector('figcaption') : null;
      lightboxCaption.textContent = cap ? cap.textContent : img.alt || '';
    }
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    // Force reflow for fade-in
    void lightbox.offsetWidth;
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    var closeBtn = lightbox.querySelector('[data-lightbox-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    window.setTimeout(function () {
      if (lightbox.classList.contains('is-open')) return;
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImg) {
        lightboxImg.removeAttribute('src');
        lightboxImg.alt = '';
      }
    }, 280);
  }

  lightboxTriggers.forEach(function (img) {
    var trigger = img.closest('.gallery-trigger') || img;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(img);
    });
  });

  if (lightbox) {
    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (btn) {
      btn.addEventListener('click', closeLightbox);
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox && lightbox.classList.contains('is-open')) {
      closeLightbox();
      return;
    }
    if (modal && modal.open) closeModal();
  });
})();
