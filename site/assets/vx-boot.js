/* vx-boot.js — marque la page « JavaScript actif » (les apparitions au défilement ne se cachent qu'à ce moment-là)
   et pose un filet de sécurité : si le script principal ne démarre pas, tout le contenu est affiché au bout de 3,5 s. */
(function () {
  var r = document.documentElement;
  r.className += ' js';
  // navigateur piloté (captures, robots) : pas d'apparitions différées, tout est visible tout de suite
  if (/HeadlessChrome/.test(navigator.userAgent) || navigator.webdriver) r.className += ' rv-fallback';
  setTimeout(function () { if (!window.__vx) r.className += ' rv-fallback'; }, 3500);
})();
