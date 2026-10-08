/*
  site-header.js — VitalX
  Description : script UNIQUE de l'en-tête et du pied de page, commun à toutes les pages du site.
  🆕 v1.0 — 08/10/2026 — Yann USSEGLIO
     • Menu mobile (bouton #menuBtn, panneau #mobileMenu) : ouverture/fermeture, clic sur un lien, touche Échap,
       fermeture automatique en passant en grand écran (≥ 901 px)
     • Année du pied de page (#year)
     • Lien actif de l'en-tête sur l'accueil : la section [data-spy] qui croise le milieu de l'écran
       (sur les autres pages, le lien de la page en cours est marqué dans le HTML avec aria-current="page")
  À charger avec « defer » ; aucun autre script de menu n'est nécessaire sur les pages.
*/
(function(){
  // Année du pied de page
  var y=document.getElementById('year');
  if(y) y.textContent=new Date().getFullYear();

  // Menu mobile
  (function(){
    var b=document.getElementById('menuBtn'),m=document.getElementById('mobileMenu');
    if(!b||!m) return;
    function set(open){m.classList.toggle('open',open);b.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''}
    b.addEventListener('click',function(){set(!m.classList.contains('open'))});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open')){set(false);b.focus()}});
    if(window.matchMedia){var mq=window.matchMedia('(min-width:901px)');var f=function(e){if(e.matches)set(false)};if(mq.addEventListener)mq.addEventListener('change',f)}
  })();

  // Lien actif de l'en-tête (accueil) : la section qui croise le milieu de l'écran
  (function(){
    var links=[].slice.call(document.querySelectorAll('.hx-links a[href^="#"], .hx-menu a.big[href^="#"]'));
    var secs=[].slice.call(document.querySelectorAll('[data-spy]'));
    if(!links.length||!secs.length||!('IntersectionObserver' in window)) return;
    function mark(id){links.forEach(function(a){if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})}
    var opt={rootMargin:'-40% 0px -55% 0px'};
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)mark(e.target.getAttribute('data-spy'))})},opt);
    secs.forEach(function(s){io.observe(s)});
    var hero=document.getElementById('v2');
    if(hero)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)mark('')})},opt).observe(hero);
  })();
})();
