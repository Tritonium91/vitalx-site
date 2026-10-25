/* i18n-v3-merci.js — GÉNÉRÉ par build/build.py (tables build/tr/*.py) : traductions EN / DE / ES des textes nouveaux ou modifiés de la page merci.html (refonte du 25/10/2026). Ne pas modifier à la main.
   Même principe que i18n-site.js, i18n-fiches.js, i18n-legal.js : clé = texte français affiché ; fusionne dans window.VitalXI18nExtra ; à charger APRÈS le
   dictionnaire de la page et AVANT i18n.js. Une clé absente = texte laissé en français. Lignes : [français, anglais, allemand, espagnol]. */
(function () {
  var R = [["Revendeurs","Resellers","Händler","Distribuidores"],["Non","No","Nein","No"]];
  var TT = [];
  var X = window.VitalXI18nExtra = window.VitalXI18nExtra || {};
  X.en = X.en || {}; X.de = X.de || {}; X.es = X.es || {}; X.titles = X.titles || {};
  R.forEach(function (r) { X.en[r[0]] = r[1]; X.de[r[0]] = r[2]; X.es[r[0]] = r[3]; });
  TT.forEach(function (r) { X.titles[r[0]] = Object.assign({}, X.titles[r[0]] || {}, { en: r[1], de: r[2], es: r[3] }); });
})();
