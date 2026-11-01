/* 4SH refonte v2 : micro-interactions (apparition au scroll + marquee) */
(function () {
  return; // Charte v1.1 : ni marquee ni apparition au défilement
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
  return; // Charte v1.1 : pas de curseur personnalisé
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
  // Libellés du bouton : celui d'ouverture est écrit dans la page (base.njk), celui de fermeture
  // dans data-libelle-fermer quand il diffère du français (libellés commun.menu_ouvrir et commun.menu_fermer).
  var libelleOuvrir = burger.getAttribute('aria-label') || 'Ouvrir le menu';
  var libelleFermer = burger.getAttribute('data-libelle-fermer') || 'Fermer le menu';
  burger.setAttribute('aria-controls', menu.id);
  burger.setAttribute('aria-expanded', 'false');

  var MQ = matchMedia('(max-width:1024px)');

  // En mobile, on rapatrie les boutons d'action (Contact...) DANS le panneau ;
  // en desktop, on les remet à leur place initiale (avant le burger).
  // en mobile, les actions vont dans la liste du menu : on les enveloppe dans un <li> (liste valide)
  var liActions = document.createElement('li');
  liActions.className = 'menu-actions';
  function placerActions() {
    if (!actions) return;
    if (MQ.matches) { if (actions.parentNode !== liActions) { liActions.appendChild(actions); menu.appendChild(liActions); } }
    else if (actions.parentNode !== nav) { nav.insertBefore(actions, burger); if (liActions.parentNode) liActions.parentNode.removeChild(liActions); }
  }

  function ouvrir() {
    document.body.classList.add('menu-ouvert');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', libelleFermer);
  }
  function fermer() {
    document.body.classList.remove('menu-ouvert');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', libelleOuvrir);
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
  return; // Charte v1.1 : rien ne s'anime au défilement
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

/* Carrousels : défilement auto discret, bullets d'état cliquables,
   pause au survol/focus, pas de bouton pause, respect de prefers-reduced-motion. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-carrousel]').forEach(function (car) {
    var piste = car.querySelector('.car-piste');
    var dotsWrap = car.querySelector('.car-dots');
    if (!piste || !dotsWrap) return;
    var slides = Array.prototype.slice.call(piste.children);
    if (slides.length < 2) return;
    var i = 0, timer = null;

    slides.forEach(function (s, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Aller à l\'élément ' + (k + 1));
      b.addEventListener('click', function () { i = k; aller(); relance(); });
      dotsWrap.appendChild(b);
    });

    // Barre de contrôle discrète : flèche précédent + bullets + flèche suivant
    function fleche(dir, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-nav car-nav--' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false"><path d="' + (dir === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6') + '"/></svg>';
      return b;
    }
    var avPrev = fleche('prev', 'Éléments précédents');
    var avNext = fleche('next', 'Éléments suivants');
    var ctrl = document.createElement('div');
    ctrl.className = 'car-ctrl';
    dotsWrap.parentNode.insertBefore(ctrl, dotsWrap);
    ctrl.appendChild(avPrev); ctrl.appendChild(dotsWrap); ctrl.appendChild(avNext);
    avPrev.addEventListener('click', function () { precedent(); relance(); });
    avNext.addEventListener('click', function () { suivant(); relance(); });

    var verrou = false;
    function pas() {
      var gap = parseFloat(getComputedStyle(piste).gap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }
    function maxScroll() { return piste.scrollWidth - piste.clientWidth - 2; }
    function majDots() {
      Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
    }
    function aller() {
      verrou = true;
      piste.scrollTo({ left: Math.min(i * pas(), maxScroll() + 2), behavior: reduce ? 'auto' : 'smooth' });
      majDots();
      setTimeout(function () { verrou = false; }, 700);
    }
    function suivant() { i = (i * pas() >= maxScroll()) ? 0 : i + 1; aller(); }
    function precedent() { i = (i <= 0) ? slides.length - 1 : i - 1; aller(); }
    // défilement automatique : actif sur l'accueil, coupé dans le corps des
    // pages (data-carrousel-auto="off") pour ne pas bouger sous les yeux du lecteur
    var auto = false; // Charte v1.1 : pas de défilement automatique
    function jouer() { if (auto && !reduce && !timer) timer = setInterval(suivant, 4800); }
    function stop() { clearInterval(timer); timer = null; }
    function relance() { stop(); jouer(); }

    var st;
    piste.addEventListener('scroll', function () {
      if (verrou) return;
      clearTimeout(st);
      st = setTimeout(function () {
        i = Math.min(slides.length - 1, Math.round(piste.scrollLeft / pas()));
        majDots();
      }, 120);
    }, { passive: true });

    majDots(); jouer();
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', jouer);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', jouer);
    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(aller, 150); });
  });
})();

/* (1) Doodles qui se dessinent : on arme chaque tracé (dasharray = longueur) puis on
   le déroule quand le doodle entre dans l'écran. Respecte prefers-reduced-motion. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doodles = document.querySelectorAll('.doodle');
  if (!doodles.length || reduce) return;
  function armer(svg) {
    var paths = svg.querySelectorAll('path');
    paths.forEach(function (p) {
      var len;
      try { len = p.getTotalLength(); } catch (e) { return; }
      if (!len) return;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    svg.classList.add('doodle-anim');
  }
  function tracer(svg) {
    svg.classList.add('vu');
    svg.querySelectorAll('path').forEach(function (p) { p.style.strokeDashoffset = '0'; });
  }
  doodles.forEach(armer);
  if (!('IntersectionObserver' in window)) { doodles.forEach(tracer); return; }
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { tracer(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -30px 0px' });
  doodles.forEach(function (d) { obs.observe(d); });
})();

/* (7) Header qui se condense légèrement au scroll (ombre + hauteur réduite) */
(function () {
  var header = document.querySelector('header');
  if (!header) return;
  var racine = document.documentElement;
  function hauteur() { racine.style.setProperty('--en-tete-actuel', Math.round(header.getBoundingClientRect().height) + 'px'); }
  function maj() { header.classList.toggle('scrolled', window.scrollY > 8); hauteur(); }
  if ('ResizeObserver' in window) new ResizeObserver(hauteur).observe(header);
  addEventListener('resize', hauteur);
  addEventListener('scroll', maj, { passive: true });
  maj();
})();

/* CTA flottant : apparaît après le hero, masqué près du bloc contact */
(function () {
  var cta = document.getElementById('sticky-cta');
  if (!cta) return;
  var contact = document.getElementById('contact');
  function maj() {
    var passeHero = window.scrollY > 640;
    var contactVisible = false;
    if (contact) { var r = contact.getBoundingClientRect(); contactVisible = r.top < innerHeight && r.bottom > 0; }
    cta.classList.toggle('visible', passeHero && !contactVisible);
  }
  addEventListener('scroll', maj, { passive: true });
  addEventListener('resize', maj);
  maj();
})();
