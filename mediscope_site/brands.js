/*
  brands.js — VitalX — composant « bandeau → tuiles → fiche » (vanilla, sans dépendance)
  Sert trois sections de l'accueil, sans scroller : #interfaces (marques → appareils → écrans),
  #mediacenter (catégories → écrans du panneau) et #formateur (catégories → fonctions du poste formateur).
  Aucun texte n'est créé ici (i18n.js indexe les nœuds de texte au chargement) : tout est dans le HTML.

  Balisage (attributs data-…) :
    <section data-ifc [data-ifc-hover="120"]>        racine du composant (plusieurs par page) ; délai de survol en ms, 0 = pas de survol
      .ifc-band[role=tablist]  > .ifc-tab[data-brand=CLÉ][aria-controls=ID_PANNEAU]   groupes : marques ou catégories
      .ifc-brand#ID_PANNEAU[data-brand=CLÉ]  > .ifc-bar (.ifc-hint, .ifc-nav > .ifc-back + .ifc-chip[data-dev=ID_FICHE])
                                             > .ifc-lx > ul.ifc-list > li > .ifc-tile[data-dev=ID_FICHE]   tuiles
                                             > .ifc-vx > article.dv#ID_FICHE[hidden]                       fiches
  Comportement :
    • Souris : le survol d'un groupe l'ouvre (légère temporisation anti-balayage). Clic ou appui (tablette, mobile) : idem.
    • Un groupe reste toujours ouvert (le premier par défaut). Un clic sur une tuile affiche sa fiche dans la même zone.
    • Clavier : ← → Début Fin sur les groupes, ↓ entre dans les tuiles ; flèches, Début, Fin parmi les tuiles et les pastilles.
    • Retour : bouton « Tous… », touche Échap (la visionneuse d'images garde la priorité) ou clic sur le groupe ouvert.
    • Ancres : l'identifiant d'une fiche (#sch-hd7, #fo-rcp, #mc-gds…) ou d'un groupe (#schiller…) l'ouvre directement.
*/
(function () {
  'use strict';
  var roots = [].slice.call(document.querySelectorAll('[data-ifc]'));
  if (!roots.length) return;
  var lightbox = document.getElementById('lightbox');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var inst = roots.map(init).filter(Boolean);

  function navH() { return (document.querySelector('.gnav') || { offsetHeight: 48 }).offsetHeight + 12; }

  function init(root) {
    function $(s, c) { return (c || root).querySelector(s); }
    function $$(s, c) { return [].slice.call((c || root).querySelectorAll(s)); }
    var band = $('.ifc-band'), tabs = $$('.ifc-tab'), P = Object.create(null);
    if (!band || !tabs.length) return null;
    var hoverMs = root.hasAttribute('data-ifc-hover') ? +root.getAttribute('data-ifc-hover') : 120;

    tabs.forEach(function (t) {                  // groupe → éléments et état de son panneau
      var k = t.getAttribute('data-brand'), el = document.getElementById(t.getAttribute('aria-controls'));
      if (el) P[k] = { tab: t, el: el, lx: $('.ifc-lx', el), vx: $('.ifc-vx', el), devs: $$('.dv', el),
                       chips: $$('.ifc-chip', el), chipBox: $('.ifc-chips', el), cur: null };
    });
    var sel = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    var open = sel.getAttribute('data-brand');   // groupe ouvert

    /* Liste des tuiles (id = null) ou fiche d'un élément */
    function setView(p, id) {
      p.cur = id;
      p.el.setAttribute('data-view', id ? 'dev' : 'list');
      if (p.lx) p.lx.classList.toggle('is-on', !id);
      if (p.vx) p.vx.classList.toggle('is-on', !!id);
      if (!id) return;                           // fermeture : la fiche reste en place pendant l'animation
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

    /* Ouvre un groupe (un seul à la fois). keep = conserver l'état de sa fiche, reset = revenir à la liste */
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

    /* Garde le bandeau visible quand on ouvre une fiche (surtout sur mobile) */
    function keepInView(mode) {                  // 'now' : toujours, sans animation · 'soft' : si besoin, sans animation · sinon si besoin, animé
      var y = 0, e = band;
      while (e) { y += e.offsetTop; e = e.offsetParent; }   // position réelle du bandeau (sans le décalage d'apparition .sr)
      var top = y - window.pageYOffset;
      if (mode === 'now' || top < navH() - 4 || top > window.innerHeight * 0.45) {
        var smooth = !(reduce || mode === 'now' || mode === 'soft');
        try { window.scrollTo({ top: y - navH() - 8, behavior: smooth ? 'smooth' : 'instant' }); }
        catch (x) { window.scrollTo(0, y - navH() - 8); }
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
      if (!o.first) keepInView(false);           // au chargement, c'est le défilement natif vers l'ancre qui positionne la page (cf. route)
    }

    function back(k, o) {
      var p = P[k], id = p.cur;
      setView(p, null);
      if (o && o.focus && id) {
        var tile = $('.ifc-tile[data-dev="' + id + '"]', p.el);
        if (tile) tile.focus({ preventScroll: true });
      }
    }

    /* Charge d'avance les images d'une fiche (survol, focus, appui) pour qu'elle s'ouvre sans attente */
    function warm(id) {
      var d = id && document.getElementById(id);
      if (d && root.contains(d)) $$('img', d).forEach(function (i) { i.loading = 'eager'; });
    }

    /* Groupes : survol (souris), clic / appui, clavier */
    tabs.forEach(function (t, i) {
      var k = t.getAttribute('data-brand'), timer = 0;
      t.addEventListener('click', function () { choose(k, { reset: true, focus: false }); });
      t.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || k === open || !hoverMs) return;
        clearTimeout(timer);
        timer = setTimeout(function () { choose(k); }, hoverMs);
      });
      t.addEventListener('pointerleave', function () { clearTimeout(timer); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        else if (e.key === 'ArrowDown') {        // entre dans la liste des tuiles du groupe ouvert
          var f = !P[open].cur && $('.ifc-tile', P[open].el);
          if (f) { e.preventDefault(); f.focus(); }
          return;
        }
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
    root.addEventListener('mouseover', function (e) {
      var b = e.target.closest && e.target.closest('.ifc-tile, .ifc-chip');
      if (b) warm(b.getAttribute('data-dev'));
    });
    root.addEventListener('touchstart', function (e) {
      var b = e.target.closest && e.target.closest('.ifc-tile, .ifc-chip');
      if (b) warm(b.getAttribute('data-dev'));
    }, { passive: true });
    root.addEventListener('focusin', function (e) {
      var b = e.target.closest && e.target.closest('.ifc-tile, .ifc-chip');
      if (b) warm(b.getAttribute('data-dev'));
    });

    /* Flèches parmi les tuiles et les pastilles ; ↑ depuis la première tuile : retour au groupe */
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || !e.target.closest) return;
      var s = e.target.closest('.ifc-tile') ? '.ifc-tile' : e.target.closest('.ifc-chip') ? '.ifc-chip' : null;
      if (!s) return;
      var cur = e.target.closest(s), items = $$(s, cur.closest('.ifc-lx, .ifc-nav')), i = items.indexOf(cur), n = -1, k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = i + 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = i - 1;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = items.length - 1;
      else return;
      if (n < 0 && k === 'ArrowUp' && s === '.ifc-tile') { e.preventDefault(); P[open].tab.focus(); return; }
      if (n < 0 || n >= items.length || n === i) return;
      e.preventDefault();
      items[n].focus();
    });

    /* Charge les miniatures (légères) quand la section approche de l'écran : survol sans attente */
    function preload() { $$('.ifc-tile img').forEach(function (i) { i.loading = 'eager'; }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (en) { return en.isIntersecting; })) { io.disconnect(); preload(); }
      }, { rootMargin: '1400px 0px' });
      io.observe(root);
    } else {
      window.addEventListener('load', function () { setTimeout(preload, 800); });
    }

    return {
      root: root,
      opened: function () { return !!P[open].cur; },
      escape: function () { if (P[open].cur) back(open, { focus: true }); },
      ensure: function () { var r = band.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight || r.top < navH() - 8) keepInView('now'); },
      go: function (id, first) {                 // ancre : groupe ou fiche
        if (P[id]) { choose(id, { reset: true }); keepInView(first ? 'soft' : false); return true; }
        var d = document.getElementById(id);
        if (d && d.classList.contains('dv') && root.contains(d)) {
          show(d.closest('.ifc-brand').getAttribute('data-brand'), id, { first: first });
          return true;
        }
        return false;
      }
    };
  }

  /* Échap : retour à la liste (sauf si la visionneuse d'images est ouverte : elle se ferme seule) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (lightbox && lightbox.style.display === 'flex') return;
    var a = document.activeElement, t = null;
    inst.forEach(function (I) { if (I.root.contains(a)) t = I; });
    if (!t && (!a || a === document.body)) {     // aucun focus : la première section visible dont une fiche est ouverte
      inst.some(function (I) {
        var r = I.root.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight && I.opened()) { t = I; return true; }
        return false;
      });
    }
    if (t) t.escape();
  }, true);

  /* Ancres */
  function route(first) {
    var id = '';
    try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (x) { return; }
    if (!id) return;
    var de = document.documentElement, hit = null;
    if (first) de.classList.add('ifc-noanim');   // mise en page finale tout de suite : le défilement natif vers l'ancre vise juste
    inst.some(function (I) { if (I.go(id, first)) { hit = I; return true; } return false; });
    if (first) {
      setTimeout(function () { de.classList.remove('ifc-noanim'); }, 600);
      if (hit) window.addEventListener('load', function () { setTimeout(hit.ensure, 800); setTimeout(hit.ensure, 2200); });   // la page peut encore bouger (images)
    }
  }
  window.addEventListener('hashchange', function () { route(false); });
  route(true);
})();
