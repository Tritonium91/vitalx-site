/*
  brands.js — VitalX — section « Interfaces constructeurs » (#interfaces)
  Bandeau des marques (onglets) → appareils de la marque (tuiles) → écrans de l'appareil (fiche).
  Vanilla, sans dépendance. Aucun texte n'est modifié ici (i18n.js indexe les nœuds de texte au chargement).

  • Souris : le survol d'un logo ouvre la marque (légère temporisation anti-balayage). Le clic ou l'appui
    (tablette, mobile) fait la même chose ; clavier : flèches / Début / Fin sur les logos.
  • Une marque reste toujours ouverte (SCHILLER par défaut). Cliquer un appareil affiche sa fiche dans la même zone.
  • Retour : bouton « Tous les appareils », touche Échap (la visionneuse d'images garde la priorité), ou clic sur la marque.
  • Ancres : #schiller / #weinmann ouvrent la marque ; #sch-… / #wei-… ouvrent directement la fiche de l'appareil.
*/
(function () {
  'use strict';
  var root = document.querySelector('[data-ifc]');
  if (!root) return;

  function $(s, c) { return (c || root).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }

  var band = $('.ifc-band');
  var tabs = $$('.ifc-tab');
  var lightbox = document.getElementById('lightbox');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = {};                                   // marque → éléments et état de sa fiche
  tabs.forEach(function (t) {
    var k = t.getAttribute('data-brand');
    var el = document.getElementById(t.getAttribute('aria-controls'));
    P[k] = { tab: t, el: el, lx: $('.ifc-lx', el), vx: $('.ifc-vx', el), devs: $$('.dv', el),
             chips: $$('.ifc-chip', el), chipBox: $('.ifc-chips', el), cur: null };
  });
  var open = tabs[0].getAttribute('data-brand'); // marque ouverte

  /* Liste des appareils (id = null) ou fiche d'un appareil */
  function setView(p, id) {
    p.cur = id;
    p.el.setAttribute('data-view', id ? 'dev' : 'list');
    p.lx.classList.toggle('is-on', !id);
    p.vx.classList.toggle('is-on', !!id);
    if (!id) return;                            // fermeture : la fiche reste en place pendant l'animation
    p.devs.forEach(function (d) {
      var on = d.id === id;
      d.hidden = !on;
      d.classList.remove('is-cur');
      if (on) { void d.offsetWidth; d.classList.add('is-cur'); }
    });
    p.chips.forEach(function (c) {
      var on = c.getAttribute('data-dev') === id;
      if (on) { c.setAttribute('aria-current', 'true'); } else { c.removeAttribute('aria-current'); }
      if (on && p.chipBox) {
        p.chipBox.scrollTo({ left: c.offsetLeft - (p.chipBox.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }

  /* Ouvre une marque (une seule à la fois). keep = conserver l'état de sa fiche */
  function choose(k, o) {
    o = o || {};
    var p = P[k];
    if (!p) return;
    if (k === open) {
      if (o.reset && p.cur) back(k, o);
      return;
    }
    var prev = P[open];
    prev.el.classList.remove('is-on');
    prev.tab.setAttribute('aria-selected', 'false');
    prev.tab.tabIndex = -1;
    if (!o.keep) setView(p, null);
    p.el.classList.add('is-on');
    p.tab.setAttribute('aria-selected', 'true');
    p.tab.tabIndex = 0;
    open = k;
  }

  function navH() { return (document.querySelector('.gnav') || { offsetHeight: 48 }).offsetHeight + 12; }

  /* Garde le bandeau visible quand on ouvre une fiche (surtout sur mobile) */
  function keepInView(force) {
    var top = band.getBoundingClientRect().top;
    if (force || top < navH() - 4 || top > window.innerHeight * 0.45) {
      window.scrollTo({ top: window.pageYOffset + top - navH() - 8, behavior: reduce || force === 'now' ? 'auto' : 'smooth' });
    }
  }

  function show(k, id, o) {
    o = o || {};
    var p = P[k];
    if (!p || !p.devs.some(function (d) { return d.id === id; })) return;
    choose(k, { keep: true });
    setView(p, id);
    var h = $('#' + id + ' h3', p.el);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    keepInView(o.first ? 'now' : false);
  }

  function back(k, o) {
    var p = P[k], id = p.cur;
    setView(p, null);
    if (o && o.focus && id) {
      var tile = $('.ifc-tile[data-dev="' + id + '"]', p.el);
      if (tile) tile.focus({ preventScroll: true });
    }
  }

  /* Marques : survol (souris), clic / appui, clavier */
  tabs.forEach(function (t, i) {
    var k = t.getAttribute('data-brand'), timer = 0;
    t.addEventListener('click', function () { choose(k, { reset: true, focus: false }); });
    t.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || k === open) return;
      clearTimeout(timer);
      timer = setTimeout(function () { choose(k); }, 120);
    });
    t.addEventListener('pointerleave', function () { clearTimeout(timer); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      tabs[n].focus();
      choose(tabs[n].getAttribute('data-brand'), { reset: true });
    });
  });

  /* Tuiles, pastilles et bouton retour (délégation) */
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.ifc-tile, .ifc-chip, .ifc-back');
    if (!b || !root.contains(b)) return;
    var k = b.closest('.ifc-brand').getAttribute('data-brand');
    if (b.classList.contains('ifc-back')) back(k, { focus: true });
    else show(k, b.getAttribute('data-dev'));
  });

  /* Échap : retour à la liste (sauf si la visionneuse d'images est ouverte : elle se ferme seule) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (lightbox && lightbox.style.display === 'flex') return;
    var p = P[open];
    if (!p || !p.cur) return;
    var a = document.activeElement;
    if (a && a !== document.body && !root.contains(a)) return;
    back(open, { focus: true });
  }, true);

  /* Après le chargement : charge les miniatures de l'autre marque (légères), pour un survol sans attente */
  window.addEventListener('load', function () {
    setTimeout(function () { $$('.ifc-tile img').forEach(function (i) { i.loading = 'eager'; }); }, 800);
  });

  /* Ancres */
  function route(first) {
    var id = '';
    try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (x) { return; }
    if (!id || id === 'interfaces') return;
    if (P[id]) { choose(id, { reset: true }); return; }
    var d = document.getElementById(id);
    if (d && d.classList.contains('dv') && root.contains(d)) {
      show(d.closest('.ifc-brand').getAttribute('data-brand'), id, { first: first });
    }
  }
  window.addEventListener('hashchange', function () { route(false); });
  route(true);
})();
