/*
  vx-map.js — VitalX — carte du monde des revendeurs (accueil, section #revendeurs)
  🆕 v1.0 — 25/10/2026
  • Fond de carte : le tracé en points de /vx-worldmap-data.js (VXWorld.path, projection Equal Earth) dessiné dans le <svg class="vxmap-svg">.
  • Repères : un point rouge discret et pulsant par revendeur, placé avec VXWorld.project(lat, lon) ; clic, Entrée ou Espace = carte d'information
    (nom, ville, pays, site, e-mail, téléphone, langues). Échap ou clic ailleurs = fermeture. Liste lisible au clavier sous la carte.
  • Repère fixe « Conçu & assemblé en France » au centre de la France (46,6 ; 2,4) — aucun lieu précis n'est inventé.
  • Données : /revendeurs.json (liste « revendeurs » ; schéma dans le fichier). Liste vide = message d'attente + bouton « Devenir revendeur ».
    Variante sans fichier : définir window.VX_DEALERS = [ … ] avant ce script.
  • Textes dynamiques (Site web, E-mail, Téléphone, Langues, Fermer) : dictionnaire FR / EN / DE / ES ci-dessous, mis à jour quand l'attribut lang de <html> change.
  • Sécurité : tout le texte est inséré avec textContent ; seuls les liens http(s) sont acceptés pour le site.
  • Aucune requête extérieure : seul /revendeurs.json (même origine) est lu.
*/
(function () {
  'use strict';
  var doc = document, W = window.VXWorld, NS = 'http://www.w3.org/2000/svg';
  var stage = doc.querySelector('[data-vxmap]');
  if (!stage || !W) return;
  var sec = stage.closest('.vxmap') || doc;
  var svg = stage.querySelector('.vxmap-svg'), pinsBox = stage.querySelector('.vxmap-pins'), card = stage.querySelector('.vxmap-card');
  var fr = stage.querySelector('.vxmap-fr'), emptyBox = sec.querySelector('.vxmap-empty'), listBox = sec.querySelector('.vxmap-list');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var VX = 148, VW = 841;                  // cadrage serré sur les terres : x de 148 à 989 sur les 1000 unités du tracé (viewBox « 148 0 841 437.4 »)
  function pct(p) { return { x: ((p.x - VX) / VW * 100).toFixed(3) + '%', y: (p.y / W.height * 100).toFixed(3) + '%' }; }

  /* 1. Fond de carte (un seul tracé : « M x y h0 » répété, trait rond = un point) et repère de la France */
  svg.setAttribute('viewBox', VX + ' 0 ' + VW + ' ' + W.height);
  var path = doc.createElementNS(NS, 'path');
  path.setAttribute('d', W.path);
  path.setAttribute('stroke-width', (0.62 * W.step).toFixed(2));
  svg.appendChild(path);
  if (fr) {
    var pf = W.project(46.6, 2.4);
    fr.style.left = pct(pf).x; fr.style.top = pct(pf).y;
  }

  /* 2. Textes de la carte (dynamiques) */
  var L = {
    fr: { site: 'Site web', email: 'E-mail', tel: 'Téléphone', langs: 'Langues', close: 'Fermer', dealer: 'Revendeur', show: 'Voir sur la carte' },
    en: { site: 'Website', email: 'Email', tel: 'Phone', langs: 'Languages', close: 'Close', dealer: 'Reseller', show: 'Show on the map' },
    de: { site: 'Website', email: 'E-Mail', tel: 'Telefon', langs: 'Sprachen', close: 'Schließen', dealer: 'Händler', show: 'Auf der Karte zeigen' },
    es: { site: 'Sitio web', email: 'Correo electrónico', tel: 'Teléfono', langs: 'Idiomas', close: 'Cerrar', dealer: 'Distribuidor', show: 'Ver en el mapa' }
  };
  function lang() { var l = (doc.documentElement.getAttribute('lang') || 'fr').slice(0, 2).toLowerCase(); return L[l] ? l : 'fr'; }
  function t(k) { return L[lang()][k]; }
  function display(type, code) {
    try { if (window.Intl && Intl.DisplayNames) return new Intl.DisplayNames([lang()], { type: type }).of(code) || code; } catch (e) {}
    return code;
  }
  function country(d) { return /^[A-Za-z]{2}$/.test(d.pays || '') ? display('region', d.pays.toUpperCase()) : (d.pays || ''); }
  function where(d) { return [d.ville, country(d)].filter(Boolean).join(', '); }
  function langNames(d) {
    var a = Array.isArray(d.langues) ? d.langues : (d.langues ? String(d.langues).split(/[,;]\s*/) : []);
    return a.filter(Boolean).map(function (c) { return /^[A-Za-z]{2,3}(-[A-Za-z]{2,4})?$/.test(c) ? display('language', c) : c; }).join(', ');
  }
  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function safeUrl(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u || '') ? u : null; }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }
  function safeMail(m) { return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(m || '') ? m : null; }
  function safeTel(p) { return /^[+0-9 ().\-\/]{5,24}$/.test(p || '') ? p : null; }

  /* Lignes de détail (site, e-mail, téléphone) en liens */
  function detailRows(d, mode) {
    var rows = [], u = safeUrl(d.site), m = safeMail(d.email), p = safeTel(d.telephone), lg = langNames(d);
    function link(href, text, ext) { var a = el('a', null, text); a.href = href; if (ext) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } return a; }
    if (u) rows.push([t('site'), link(u, host(u), true)]);
    if (m) rows.push([t('email'), link('mailto:' + m, m)]);
    if (p) rows.push([t('tel'), link('tel:' + p.replace(/[^+0-9]/g, ''), p)]);
    if (lg) rows.push([t('langs'), doc.createTextNode(lg)]);
    return rows;
  }

  /* 3. Données */
  var dealers = [], pins = [], open = -1, lastFocus = null;
  function clean(a) {
    return (Array.isArray(a) ? a : []).filter(function (d) { return d && typeof d.nom === 'string' && d.nom.trim(); }).map(function (d) {
      var lat = parseFloat(d.lat), lon = parseFloat(d.lon);
      d.hasPos = isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
      d.lat = lat; d.lon = lon;
      return d;
    });
  }
  function load(cb) {
    if (Array.isArray(window.VX_DEALERS)) return cb(window.VX_DEALERS);
    if (!window.fetch) return cb([]);
    fetch(stage.getAttribute('data-src') || '/revendeurs.json', { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { cb(Array.isArray(j) ? j : (j && j.revendeurs) || []); })
      .catch(function () { cb([]); });
  }

  /* 4. Rendu */
  function pinLabel(d) { return t('dealer') + ' : ' + d.nom + (where(d) ? ', ' + where(d) : ''); }
  function renderPins() {
    pinsBox.textContent = ''; pins = [];
    dealers.forEach(function (d, i) {
      if (!d.hasPos) return;
      var p = W.project(d.lat, d.lon), b = el('button', 'pin');
      b.type = 'button';
      b.style.left = pct(p).x; b.style.top = pct(p).y;
      b.setAttribute('data-name', d.nom);
      b.setAttribute('aria-label', pinLabel(d));
      b.setAttribute('aria-haspopup', 'dialog');
      b.setAttribute('aria-expanded', 'false');
      b.appendChild(el('span', 'pin-ring')); b.appendChild(el('span', 'pin-dot'));
      b.addEventListener('click', function (e) { e.stopPropagation(); toggle(i); });
      pinsBox.appendChild(b); pins[i] = b;
    });
  }
  function renderList() {
    listBox.textContent = '';
    var order = dealers.map(function (d, i) { return i; }).sort(function (a, b) {
      return (country(dealers[a]).localeCompare(country(dealers[b])) || dealers[a].nom.localeCompare(dealers[b].nom));
    });
    order.forEach(function (i) {
      var d = dealers[i], li = el('li');
      if (d.hasPos) {
        var b = el('button', 'vxmap-name', d.nom); b.type = 'button';
        b.title = t('show');
        b.addEventListener('click', function () { show(i, true); });
        li.appendChild(b);
      } else li.appendChild(el('strong', 'vxmap-name', d.nom));
      if (where(d)) li.appendChild(el('p', 'vxmap-where', where(d)));
      var rows = detailRows(d), box = el('div', 'vxmap-det');
      rows.forEach(function (r) { var row = el('div'); row.appendChild(el('span', null, r[0] + ' : ')); row.appendChild(r[1]); box.appendChild(row); });
      if (rows.length) li.appendChild(box);
      listBox.appendChild(li);
    });
  }
  function buildCard(d) {
    card.textContent = '';
    var x = el('button', 'vxmap-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', t('close'));
    x.addEventListener('click', function () { close(true); });
    card.appendChild(x);
    var h = el('h3', null, d.nom); card.appendChild(h);
    if (where(d)) card.appendChild(el('p', null, where(d)));
    var rows = detailRows(d);
    if (rows.length) {
      var dl = el('dl');
      rows.forEach(function (r) { var dd = el('dd'); dd.appendChild(r[1]); dl.appendChild(el('dt', null, r[0])); dl.appendChild(dd); });
      card.appendChild(dl);
    }
    card.setAttribute('aria-label', d.nom);
  }
  function place(i) {
    var pin = pins[i];
    if (!pin) return;
    if (window.matchMedia && window.matchMedia('(max-width:600px)').matches) { card.style.left = card.style.top = ''; return; }
    var sw = stage.clientWidth, px = pin.offsetLeft + 14, py = pin.offsetTop + 14;
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var cx = Math.min(Math.max(px, cw / 2 + 8), sw - cw / 2 - 8);
    card.style.left = Math.round(cx - cw / 2) + 'px';
    card.style.top = Math.round(py - ch - 18 < 6 ? py + 20 : py - ch - 18) + 'px';
  }
  function toggle(i) { if (open === i) close(true); else show(i, false); }
  function show(i, fromList) {
    var d = dealers[i];
    if (!d || !d.hasPos) return;
    if (fromList) {
      var r = stage.getBoundingClientRect();
      if (r.top < 60 || r.bottom > window.innerHeight) stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
    close(false);
    lastFocus = fromList ? doc.activeElement : pins[i];
    open = i; buildCard(d);
    card.hidden = false; card.setAttribute('tabindex', '-1');
    pins[i].setAttribute('aria-expanded', 'true');
    place(i);
    card.focus({ preventScroll: true });
  }
  function close(refocus) {
    if (open < 0) return;
    if (pins[open]) pins[open].setAttribute('aria-expanded', 'false');
    open = -1; card.hidden = true;
    if (refocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function render() {
    renderPins(); renderList();
    var n = dealers.length;
    if (emptyBox) emptyBox.hidden = n > 0;
    if (listBox) listBox.hidden = n === 0;
  }

  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open >= 0) close(true); });
  doc.addEventListener('click', function (e) { if (open >= 0 && !card.contains(e.target)) close(false); });
  window.addEventListener('resize', function () { if (open >= 0) place(open); });
  if (window.MutationObserver) {      // la langue du site change : on reconstruit les textes dynamiques
    var cur = doc.documentElement.getAttribute('lang');
    new MutationObserver(function () {
      var l = doc.documentElement.getAttribute('lang');
      if (l === cur) return;
      cur = l; var o = open; close(false); render(); if (o >= 0) show(o, false);
    }).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  load(function (a) { dealers = clean(a); render(); });
})();
