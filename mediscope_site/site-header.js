/*
  site-header.js — VitalX
  Description : script UNIQUE commun à toutes les pages (refonte « vitrine façon Apple », 25/10/2026).
  🆕 v1.0 — 08/10/2026 : menu mobile, année du pied de page, lien actif de l'en-tête sur l'accueil
  🆕 v1.1 — 13/10/2026 : charge l'assistant VitalX (bulle de tchat, /vx-chat.js) une fois la page affichée
  🆕 v2.0 — 25/10/2026 : refonte
     • Menu mobile (#menuBtn, #mobileMenu) : ouverture / fermeture, Échap, fermeture en passant en grand écran (≥ 1041 px)
     • Apparition au défilement (.rv → .in) via IntersectionObserver ; sans effet si « réduire les animations »
     • Galeries horizontales : boutons précédent / suivant (.snap-ctl) pour chaque .snap et chaque .ifc-list
     • Lien actif de la barre de navigation (sections [data-spy] de l'accueil ; aria-current="page" posé dans le HTML ailleurs)
     • Sous-navigation locale (.subnav) : variante sombre / claire selon la section qui passe derrière
     • Visionneuse d'images (#lightbox) : toute image de <main> sans data-no-lightbox, hors liens et boutons
     • Année du pied de page (#year) · chargement différé de l'assistant
  À charger avec « defer ». Aucune requête extérieure, aucun cookie, aucune mesure d'audience.
*/
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || doc).querySelectorAll(s)); }

  // Année du pied de page
  var y = doc.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menu mobile
  (function () {
    var b = doc.getElementById('menuBtn'), m = doc.getElementById('mobileMenu');
    if (!b || !m) return;
    function set(open) {
      m.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
      doc.body.style.overflow = open ? 'hidden' : '';
    }
    b.addEventListener('click', function () { set(!m.classList.contains('open')); });
    $$('a', m).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('open')) { set(false); b.focus(); } });
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width:1041px)');
      var f = function (e) { if (e.matches) set(false); };
      if (mq.addEventListener) mq.addEventListener('change', f); else if (mq.addListener) mq.addListener(f);
    }
  })();

  // Apparition au défilement
  (function () {
    var els = $$('.rv');
    root.classList.add('rv-js');                         // annule le filet de sécurité CSS (voir vx-home.css / vx.css)
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
    // Bas de page atteint : tout ce qui reste est affiché (un bloc collé au bas du document ne franchirait jamais la marge de 6 %)
    var done = false;
    function bottom() {
      if (done || window.innerHeight + window.pageYOffset < doc.documentElement.scrollHeight - 2) return;
      done = true;
      els.forEach(function (el) { el.classList.add('in'); });
    }
    window.addEventListener('scroll', bottom, { passive: true });
  })();

  // Galeries horizontales : boutons précédent / suivant
  (function () {
    $$('.snap-ctl').forEach(function (ctl) {
      var id = ctl.getAttribute('data-snap-for'), t = id ? doc.getElementById(id) : null;
      if (!t) { var p = ctl.previousElementSibling; while (p && !p.matches('.snap,.ifc-list')) p = p.previousElementSibling; t = p; }
      if (!t) return;
      var prev = $('[data-dir="-1"]', ctl), next = $('[data-dir="1"]', ctl);
      function upd() {
        var max = t.scrollWidth - t.clientWidth;
        ctl.hidden = max < 8;
        if (prev) prev.disabled = t.scrollLeft < 4;
        if (next) next.disabled = t.scrollLeft > max - 4;
      }
      function go(d) {
        var item = t.children[0], w = item ? item.getBoundingClientRect().width + 20 : t.clientWidth * 0.8;
        var n = Math.max(1, Math.floor(t.clientWidth / w));
        t.scrollBy({ left: d * w * n, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      t.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(upd).observe(t); else window.addEventListener('resize', upd);
      window.addEventListener('load', upd);
      upd();
    });
  })();

  // Lien actif de la barre de navigation (accueil) : la section [data-spy] qui croise le milieu de l'écran
  (function () {
    var links = $$('.vx-links a[href^="#"], .vx-menu a.big[href^="#"]');
    var secs = $$('[data-spy]');
    if (!links.length || !secs.length || !('IntersectionObserver' in window)) return;
    function mark(id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) mark(e.target.getAttribute('data-spy')); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io.observe(s); });
    var hero = doc.getElementById('v2');
    if (hero) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) mark(''); }); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  })();

  // Sous-navigation locale (.subnav, boutique et fiches) : elle prend le ton de la section qui passe derrière elle
  // (sombre sur une section .t-dark / .t-dark2, claire sinon). Le HTML pose déjà .subnav--dark si la page commence par un héros sombre.
  (function () {
    var bar = $('.subnav'), secs = $$('main > section');
    if (!bar || !secs.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = bar.getBoundingClientRect().bottom + 1, dark = false;
      for (var i = 0; i < secs.length; i++) {
        var r = secs[i].getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { dark = /(^|\s)t-dark2?(\s|$)/.test(secs[i].className); break; }
      }
      bar.classList.toggle('subnav--dark', dark);
    }
    function schedule() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  })();

  // Visionneuse d'images (#lightbox) : même contrat que brands.js (style.display = 'flex' quand elle est ouverte)
  (function () {
    var ov = doc.getElementById('lightbox'), im = doc.getElementById('lightboxImg'),
        cp = doc.getElementById('lightboxCaption'), cb = doc.getElementById('lightboxClose');
    if (!ov || !im) return;
    var from = null;
    function op(img) {
      from = img;
      im.src = img.getAttribute('data-full') || img.src;
      im.alt = img.alt || '';
      if (cp) cp.textContent = img.alt || '';
      ov.style.display = 'flex';
      ov.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      if (cb) cb.focus({ preventScroll: true });
    }
    function cl() {
      ov.style.display = 'none';
      ov.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
      im.removeAttribute('src');
      if (cp) cp.textContent = '';
      if (from) { try { from.focus({ preventScroll: true }); } catch (e) {} from = null; }
    }
    $$('main img').forEach(function (i) {
      if (i.hasAttribute('data-no-lightbox') || i.closest('a,button,.ifc-tile,[data-no-lightbox]')) return;
      i.style.cursor = 'zoom-in';
      i.setAttribute('tabindex', '0');
      i.addEventListener('click', function () { op(i); });
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); op(i); } });
    });
    ov.addEventListener('click', function (e) { if (e.target === ov) cl(); });
    if (cb) cb.addEventListener('click', cl);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.style.display === 'flex') cl(); });
  })();

  // Assistant VitalX (vx-chat.js) : chargé après l'affichage de la page, pour ne pas la ralentir
  (function () {
    function load() {
      if (doc.getElementById('vxchat-js')) return;
      var s = doc.createElement('script');
      s.id = 'vxchat-js'; s.src = '/vx-chat.js'; s.async = true;
      doc.body.appendChild(s);
    }
    if (doc.readyState === 'complete') setTimeout(load, 400);
    else window.addEventListener('load', function () { setTimeout(load, 400); });
  })();
})();
