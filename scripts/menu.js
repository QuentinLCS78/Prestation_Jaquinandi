/* Menu principal : ouverture/fermeture, section active, accessibilité clavier */
(function(){
  var d=document, root=d.documentElement;
  var btn=d.getElementById('menuBtn'), nav=d.getElementById('mnav');
  if(!btn || !nav) return;
  var lab=btn.querySelector('.lab');
  var links=Array.prototype.slice.call(nav.querySelectorAll('.mnav-links a'));

  /* Rend le menu inaccessible au clavier tant qu'il est fermé */
  function setInert(on){ if('inert' in nav) nav.inert=on; nav.setAttribute('aria-hidden',on?'true':'false'); }
  setInert(true);

  function open(){
    root.classList.add('menu-open');
    btn.setAttribute('aria-expanded','true');
    btn.setAttribute('aria-label','Fermer le menu');
    if(lab) lab.textContent='Fermer';
    setInert(false);
    markCurrent();
  }
  function close(focusBtn){
    root.classList.remove('menu-open');
    btn.setAttribute('aria-expanded','false');
    btn.removeAttribute('aria-label');
    if(lab) lab.textContent='Menu';
    setInert(true);
    if(focusBtn) btn.focus({preventScroll:true});
  }
  btn.addEventListener('click',function(){ root.classList.contains('menu-open') ? close(true) : open(); });

  /* Fermer : clic sur un lien, touche Échap, clic dans le vide du panneau */
  nav.addEventListener('click',function(e){
    if(e.target.closest('a') || e.target===nav || e.target.classList.contains('mnav-in')) close(false);
  });
  d.addEventListener('keydown',function(e){
    if(e.key==='Escape' && root.classList.contains('menu-open')) close(true);
    /* Garder le focus dans le menu (bouton + liens) */
    if(e.key==='Tab' && root.classList.contains('menu-open')){
      var f=[btn].concat(Array.prototype.slice.call(nav.querySelectorAll('a')));
      var i=f.indexOf(d.activeElement);
      if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
    }
  });

  /* Section active : met en avant dans le menu la section visible à l'écran */
  var targets=links.map(function(a){
    var h=a.getAttribute('href'), id=h.split('#')[1];
    return (h.charAt(0)==='#' && id) ? d.getElementById(id) : null;
  });
  function markCurrent(){
    var mid=window.innerHeight*0.4, best=-1;
    targets.forEach(function(el,k){
      if(!el) return;
      var r=el.getBoundingClientRect();
      if(r.top<=mid && r.bottom>mid) best=k;
    });
    links.forEach(function(a,k){ if(k===best) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
  }
})();
