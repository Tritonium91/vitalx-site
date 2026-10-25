/*
  vx.js — VitalX, site vitrine v4. Aucune dépendance, aucune requête extérieure.
  Le contenu reste complet sans JavaScript ; ce script ajoute : menu mobile, en-tête qui se teinte, apparitions au défilement,
  bandeau défilant à l'arrêt hors de l'écran, compteurs, galeries à boutons, sous-navigation.
  Fluidité (25/10) : plus de vidéo ni de parallaxe ; pendant le défilement, seul l'en-tête change de teinte (l'échelle des tablettes est en CSS).
  Sous « réduire les animations » : aucune animation (contenu affiché tel quel).
*/
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // « still » : réduire les animations OU navigateur piloté (captures, robots : vx-boot.js pose rv-fallback) → rien ne bouge, tout est affiché
  var still = reduce || /\brv-fallback\b/.test(root.className);
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  w.__vx = true;                                   // le filet de sécurité du <head> voit que le script tourne

  /* 1. Menu mobile */
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    w.addEventListener('resize', function () { if (w.innerWidth >= 1180) setMenu(false); });
  }

  /* 2. En-tête teinté après le haut de page */
  var hd = $('.hd');
  var onScrollHd = function () { if (hd) hd.classList.toggle('sc', (w.pageYOffset || root.scrollTop) > 24); };
  onScrollHd();
  w.addEventListener('scroll', onScrollHd, { passive: true });

  /* 3. Apparitions au défilement */
  var rv = $$('.rv');
  if (still || !('IntersectionObserver' in w)) {
    rv.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });   // départ juste avant l'entrée à l'écran
    rv.forEach(function (e) { io.observe(e); });
  }

  /* 4. Bandeau défilant : à l'arrêt quand il est hors de l'écran (le navigateur n'a plus rien à recalculer) */
  var mq = $$('.mq');
  if (mq.length && !still && 'IntersectionObserver' in w) {
    var io4 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle('off', !en.isIntersecting); });
    });
    mq.forEach(function (e) { io4.observe(e); });
  }

  /* 5. Compteurs */
  var cnt = $$('[data-count]');
  if (cnt.length && !still && 'IntersectionObserver' in w) {
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1500;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.firstChild.nodeValue = String(Math.round(to * e));
        if (k < 1) w.requestAnimationFrame(step);
      };
      el.firstChild.nodeValue = '0';
      w.requestAnimationFrame(step);
    };
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io2.unobserve(en.target); } });
    }, { threshold: 0.6 });
    cnt.forEach(function (el) { io2.observe(el); });
  }

  /* 6. Galeries à boutons précédent / suivant */
  $$('[data-rail]').forEach(function (box) {
    var list = $('.rail-in', box), prev = $('[data-prev]', box), next = $('[data-next]', box);
    if (!list) return;
    var upd = function () {
      if (prev) prev.disabled = list.scrollLeft < 8;
      if (next) next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 8;
    };
    var by = function (dir) { list.scrollBy({ left: dir * Math.max(240, list.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' }); };
    if (prev) prev.addEventListener('click', function () { by(-1); });
    if (next) next.addEventListener('click', function () { by(1); });
    list.addEventListener('scroll', function () { w.requestAnimationFrame(upd); }, { passive: true });
    list.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { by(1); e.preventDefault(); } if (e.key === 'ArrowLeft') { by(-1); e.preventDefault(); } });
    w.addEventListener('resize', upd);
    upd();
  });

  /* 7. Sous-navigation : l'ancre de la section visible s'allume */
  var sub = $('.subnav');
  if (sub && 'IntersectionObserver' in w) {
    var links = $$('a[href^="#"]', sub), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('on'); });
        var a = map[en.target.id];
        if (a) { a.classList.add('on'); if (a.scrollIntoView && sub.scrollWidth > sub.clientWidth) { var sc = $('.subnav-in', sub); sc.scrollTo({ left: a.offsetLeft - 20, behavior: 'auto' }); } }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var t = d.getElementById(id); if (t) io3.observe(t); });
  }

  /* 8. Formulaire : langue de la page + effacement du pot de miel */
  var f = $('form[name="contact"]');
  if (f) {
    var lg = f.querySelector('input[name="langue"]');
    if (lg) lg.value = root.getAttribute('lang') || 'fr';
    var q = new URLSearchParams(w.location.search).get('sujet');
    if (q) { var r = f.querySelector('input[name="demande"][value="' + q.replace(/[^a-z]/g, '') + '"]'); if (r) r.checked = true; }
  }
})();
