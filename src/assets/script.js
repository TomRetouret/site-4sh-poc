/* 4SH refonte v2 : micro-interactions (apparition au scroll + marquee) */
(function () {
  // 1. Marquee logos : duplique la liste pour une boucle continue
  document.querySelectorAll('.marquee ul').forEach(function (ul) {
    ul.innerHTML += ul.innerHTML;
  });

  // 2. Apparition au scroll
  var cibles = document.querySelectorAll(
    '.hero .surtitre, .hero-accroche, .hero .chapo, .hero-cta, .hero-note, .hero-visuel,' +
    '.eyebrow, .sec-titre, .sec-sous, .porte, .etape, .secteur-carte, .cas, .bandeau-cta,' +
    '.faq details, .formulaire, .contact-grille > div, .chiffres .container > div,' +
    '.regle, .panneau, .col-carte, .prose p, .offres-liees > *, .mobile-demo, .chips,' +
    '.photo-figure, .schema-craft, .atout, .socle-carte, .real-carte, .blog-carte,' +
    '.hero-interne h1, .hero-interne .chapo, .hero-interne .hero-cta'
  );
  var parNiveau = {};
  cibles.forEach(function (el) {
    el.classList.add('reveal');
    var top = Math.round(el.getBoundingClientRect().top / 60);
    parNiveau[top] = (parNiveau[top] || 0);
    el.style.transitionDelay = Math.min(parNiveau[top] * 90, 450) + 'ms';
    parNiveau[top]++;
  });
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cibles.forEach(function (el) { obs.observe(el); });
  } else {
    cibles.forEach(function (el) { el.classList.add('vu'); });
  }
})();

/* Curseur personnalisé : point rouge 4SH + anneau en retard doux.
   Actif uniquement à la souris (pointer:fine), respecte prefers-reduced-motion. */
(function () {
  if (!matchMedia('(pointer:fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('curseur-perso');
  var point = document.createElement('div'); point.className = 'curseur-point';
  var anneau = document.createElement('div'); anneau.className = 'curseur-anneau';
  point.setAttribute('aria-hidden', 'true'); anneau.setAttribute('aria-hidden', 'true');
  document.body.appendChild(anneau); document.body.appendChild(point);
  var mx = innerWidth / 2, my = innerHeight / 2, ax = mx, ay = my;
  addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    point.style.left = mx + 'px'; point.style.top = my + 'px';
  }, { passive: true });
  (function suit() {
    ax += (mx - ax) * 0.16; ay += (my - ay) * 0.16;
    anneau.style.left = ax + 'px'; anneau.style.top = ay + 'px';
    requestAnimationFrame(suit);
  })();
  addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, summary, .btn')) anneau.classList.add('grossi');
    else anneau.classList.remove('grossi');
  });
  addEventListener('mousedown', function () { point.classList.add('clic'); });
  addEventListener('mouseup', function () { point.classList.remove('clic'); });
  document.documentElement.addEventListener('mouseleave', function () { point.style.opacity = anneau.style.opacity = '0'; });
  document.documentElement.addEventListener('mouseenter', function () { point.style.opacity = anneau.style.opacity = '1'; });
})();

/* Menu mobile : burger + méga-menus en accordéon (bascule à 1024px) */
(function () {
  var nav = document.querySelector('header .nav');
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  if (!nav || !burger || !menu) return;
  var actions = nav.querySelector('.nav-actions');

  menu.id = menu.id || 'menu-principal';
  burger.setAttribute('aria-controls', menu.id);
  burger.setAttribute('aria-expanded', 'false');

  var MQ = matchMedia('(max-width:1024px)');

  // En mobile, on rapatrie les boutons d'action (Contact...) DANS le panneau ;
  // en desktop, on les remet à leur place initiale (avant le burger).
  function placerActions() {
    if (!actions) return;
    if (MQ.matches) { if (actions.parentNode !== menu) menu.appendChild(actions); }
    else if (actions.parentNode !== nav) nav.insertBefore(actions, burger);
  }

  function ouvrir() {
    document.body.classList.add('menu-ouvert');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
  }
  function fermer() {
    document.body.classList.remove('menu-ouvert');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    menu.querySelectorAll('li.ouvert').forEach(function (li) { li.classList.remove('ouvert'); });
  }

  burger.addEventListener('click', function () {
    document.body.classList.contains('menu-ouvert') ? fermer() : ouvrir();
  });

  // Accordéon : en mobile, un clic sur un item porteur de sous-menu déplie au lieu de naviguer
  menu.addEventListener('click', function (e) {
    if (!MQ.matches) return;
    var lien = e.target.closest('.menu > li > a');
    if (!lien) return;
    var li = lien.parentElement;
    if (!li.querySelector('.deroulant')) return; // lien simple : navigation normale
    e.preventDefault();
    li.classList.toggle('ouvert');
  });

  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('menu-ouvert')) return;
    if (e.target.closest('.menu') || e.target.closest('.burger')) return;
    fermer();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-ouvert')) { fermer(); burger.focus(); }
  });

  placerActions();
  MQ.addEventListener('change', function () { fermer(); placerActions(); });
})();

/* Compteurs animés (bandeau chiffres), déclenchés au scroll, respecte reduced-motion */
(function () {
  var nums = document.querySelectorAll('[data-compte]');
  if (!nums.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function anime(el) {
    var fin = +el.dataset.compte, suf = el.dataset.suffixe || '';
    if (isNaN(fin)) return;
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = fin + suf; return; }
    var t0 = null, dur = 1400;
    (function pas(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(fin * p) + suf;
      if (p < 1) requestAnimationFrame(pas);
    })(performance.now());
  }
  if (!('IntersectionObserver' in window)) { nums.forEach(anime); return; }
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { anime(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(function (el) { obs.observe(el); });
})();
