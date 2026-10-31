/* ============================================================
   4SH · Mouvement (phase 2)
   Chargé APRÈS script.js. Pour tout couper : retirer la ligne de
   ce script et celle de mouvement.css dans base.njk.
   Voir l'en-tête de mouvement.css pour la grammaire de mouvement.

   1. Entrées au défilement (une seule fois par élément)
   2. Losange du menu qui glisse vers l'entrée survolée
   3. FAQ : la réponse se pose à l'ouverture
   4. Flèches « → » des liens : isolées pour pouvoir avancer au survol
   ============================================================ */
(function () {
  'use strict';

  var racine = document.documentElement;
  var reduit = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- 1. Entrées au défilement ---------- */
  (function entrees() {
    if (reduit || !('IntersectionObserver' in window)) return; // tout reste visible

    var SELECTEURS = {
      glisse: [
        '.hero .surtitre', '.hero-accroche', '.hero p.chapo', '.hero-cta', '.hero-note',
        '.sect-hero .container > *',
        '.hero-interne .eyebrow', '.hero-interne h1', '.hero-interne .chapo',
        '.eyebrow', '.sec-titre', '.sec-sous',
        '.sect-bloc .container > h2', '.sect-duo h2', '.sect-faq > h2'
      ],
      monte: [
        '.porte', '.secteur-carte', '.cas', '.blog-carte', '.etape', '.sect-etape',
        '.sect-defi', '.sect-atout', '.sect-ref-carte', '.atout', '.socle-carte',
        '.real-carte', '.ref-carte', '.col-carte', '.faq > details',
        '.contact-final .formulaire'
      ],
      bloc: ['.chiffres .container > div', '.ref-resultats .stat'],
      plan: ['svg.hero-plan', 'svg.hero-plan--m', 'svg.contact-plan'],
      trace: ['svg.trace-4d']
    };
    // pas = décalage de la cascade entre voisins ; max = rang plafonné ; duree = fin de l'effet
    var REGLAGES = {
      glisse: { pas: 60, max: 4, duree: 600 + 200 },  // + 200 : barre d'offre
      monte:  { pas: 80, max: 4, duree: 600 },
      bloc:   { pas: 120, max: 3, duree: 800 },
      plan:   { pas: 0, max: 0, duree: 1050 },       // tracé 300 -> 900, losange 1 050
      trace:  { pas: 0, max: 0, duree: 1050 }
    };
    var EXCLUS = 'header, footer, .deroulant, .modale, dialog, template, [hidden], .menu';
    var CLASSES = ['mv-e', 'mv-glisse', 'mv-monte', 'mv-bloc', 'mv-plan', 'mv-trace', 'mv-vu'];

    var genres = Object.keys(SELECTEURS);
    var tous = genres.map(function (g) { return SELECTEURS[g].join(','); }).join(',');
    var armes = [];
    var parDeclencheur = new Map();
    var rangs = new Map();

    function genreDe(el) {
      for (var i = 0; i < genres.length; i++) {
        if (el.matches(SELECTEURS[genres[i]].join(','))) return genres[i];
      }
      return null;
    }

    function nettoyer(el) {
      CLASSES.forEach(function (c) { el.classList.remove(c); });
      el.style.removeProperty('--mv-delai');
      el.style.removeProperty('--mv-long');
      if (el._mvTrace) { el._mvTrace.style.strokeDasharray = ''; }
      el._mvArme = false;
    }

    function reveler(el) {
      if (!el._mvArme || el.classList.contains('mv-vu')) return;
      el.classList.add('mv-vu');
      var r = REGLAGES[el._mvGenre];
      setTimeout(function () { nettoyer(el); }, (el._mvDelai || 0) + r.duree + 150);
    }

    function armer(el, genre) {
      var r = REGLAGES[genre];
      // rang parmi les voisins de même genre : cascade courte
      var parent = el.parentElement;
      var cle = rangs.get(parent) || {};
      var rang = cle[genre] || 0;
      cle[genre] = rang + 1;
      rangs.set(parent, cle);
      var delai = Math.min(rang, r.max) * r.pas;

      if (genre === 'trace') {
        var p = el.querySelector('path');
        var long = 0;
        try { long = p ? p.getTotalLength() : 0; } catch (e) { long = 0; }
        if (!long) return false; // non mesurable (masqué) : on laisse visible
        p.style.strokeDasharray = long;
        el.style.setProperty('--mv-long', long);
        el._mvTrace = p;
      }

      el._mvArme = true;
      el._mvGenre = genre;
      el._mvDelai = delai;
      if (delai) el.style.setProperty('--mv-delai', delai + 'ms');
      if (genre === 'glisse' || genre === 'monte') el.classList.add('mv-e');
      el.classList.add('mv-' + genre);
      return true;
    }

    try {
      var hautVue = window.innerHeight || racine.clientHeight;
      var candidats = document.querySelectorAll(tous);
      Array.prototype.forEach.call(candidats, function (el) {
        if (el.closest(EXCLUS)) return;
        if (el.parentElement && el.parentElement.closest('.mv-e, .mv-bloc')) return; // pas d'effet imbriqué
        var genre = genreDe(el);
        if (!genre) return;
        // déjà dépassé (rechargement en milieu de page) : laissé tel quel
        var rect = el.getBoundingClientRect();
        if (el.getClientRects().length && rect.bottom < 0) return;
        if (!armer(el, genre)) return;
        armes.push(el);
        // dans un carrousel, c'est le carrousel entier qui déclenche
        var declencheur = el.closest('[data-carrousel]') || el;
        var liste = parDeclencheur.get(declencheur);
        if (!liste) { liste = []; parDeclencheur.set(declencheur, liste); }
        liste.push(el);
      });

      function rappel(entrees, obs) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          (parDeclencheur.get(e.target) || []).forEach(reveler);
        });
      }
      var obsContenu = new IntersectionObserver(rappel, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
      var obsTrace = new IntersectionObserver(rappel, { rootMargin: '0px 0px -8% 0px', threshold: 0.5 });
      parDeclencheur.forEach(function (liste, declencheur) {
        var g = liste[0]._mvGenre;
        (g === 'plan' || g === 'trace' ? obsTrace : obsContenu).observe(declencheur);
      });

      racine.classList.add('mv'); // à partir d'ici seulement, les éléments armés sont masqués
    } catch (err) {
      racine.classList.remove('mv');
      armes.forEach(nettoyer);
      return;
    }

    // Filet de sécurité : rien ne doit rester invisible dans l'écran
    function verifier() {
      var h = window.innerHeight || racine.clientHeight;
      armes.forEach(function (el) {
        if (!el._mvArme || el.classList.contains('mv-vu')) return;
        if (!el.getClientRects().length) return;
        var r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) reveler(el);
      });
    }
    window.addEventListener('load', function () { setTimeout(verifier, 2500); });
    window.addEventListener('beforeprint', function () { armes.forEach(nettoyer); });
  })();

  /* ---------- 2. Losange du menu ---------- */
  (function losangeMenu() {
    var nav = document.querySelector('header .nav');
    var menu = nav && nav.querySelector('.menu');
    if (!nav || !menu || !window.matchMedia) return;
    var MQ = matchMedia('(min-width:1025px)');
    var actif = nav.querySelector('.menu > li > a.actif, .nav-actions > .lien-formations.actif');
    var losange = document.createElement('span');
    losange.className = 'mv-losange';
    losange.setAttribute('aria-hidden', 'true');
    nav.appendChild(losange);

    var courant = null, attente = null;

    // position du losange sous le lien : même place que le losange fixe de la charte
    // (8 px, centré, 2 px au-dessus du bas du lien), repérée par rapport au milieu
    // vertical de la barre pour suivre la barre quand elle se condense au défilement
    // mode : 'glisse' (200 ms vers la cible), 'apparait' (s'allume sur place),
    // 'immediat' (chargement, redimensionnement : aucune transition)
    function placer(a, mode) {
      var rn = nav.getBoundingClientRect();
      var ra = a.getBoundingClientRect();
      if (!ra.width) return false;
      var x = ra.left + ra.width / 2 - rn.left - 4;
      var y = ra.bottom - 10 - (rn.top + rn.height / 2);
      if (mode === 'glisse' && !losange.classList.contains('mv-allume')) mode = 'apparait';
      var position = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(45deg)';
      if (mode === 'glisse') {
        losange.style.transform = position;
      } else {
        losange.classList.add(mode === 'immediat' ? 'mv-immediat' : 'mv-sur-place');
        losange.style.transform = position;
        if (mode === 'immediat') losange.classList.add('mv-allume');
        void losange.offsetWidth;
        losange.classList.remove('mv-immediat', 'mv-sur-place');
      }
      losange.classList.add('mv-allume');
      courant = a;
      return true;
    }
    function eteindre() { losange.classList.remove('mv-allume'); courant = null; }
    function viser(a) {
      clearTimeout(attente);
      if (!MQ.matches || a === courant) return;
      placer(a, 'glisse');
    }
    function revenir() {
      clearTimeout(attente);
      attente = setTimeout(function () {
        if (!MQ.matches) return;
        if (actif) { if (courant !== actif) placer(actif, 'glisse'); } else eteindre();
      }, 80);
    }
    function initialiser() {
      clearTimeout(attente);
      if (!MQ.matches) { racine.classList.remove('mv-menu'); eteindre(); return; }
      if (actif) {
        if (placer(actif, 'immediat')) racine.classList.add('mv-menu');
      } else {
        eteindre();
        racine.classList.add('mv-menu');
      }
    }

    Array.prototype.forEach.call(menu.children, function (li) {
      var a = li.querySelector(':scope > a');
      if (!a) return;
      li.addEventListener('mouseenter', function () { viser(a); });
    });
    var formations = nav.querySelector('.nav-actions > .lien-formations');
    if (formations) formations.addEventListener('mouseenter', function () { viser(formations); });
    menu.addEventListener('mouseleave', revenir);
    if (formations) formations.addEventListener('mouseleave', revenir);

    nav.addEventListener('focusin', function (e) {
      var li = e.target.closest('.menu > li');
      var a = li ? li.querySelector(':scope > a') : (e.target.closest('.nav-actions > .lien-formations'));
      if (a) viser(a); else revenir();
    });
    nav.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || !nav.contains(e.relatedTarget)) revenir();
    });

    var tempo;
    window.addEventListener('resize', function () { clearTimeout(tempo); tempo = setTimeout(initialiser, 120); });
    if (MQ.addEventListener) MQ.addEventListener('change', initialiser);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(initialiser);
    window.addEventListener('load', initialiser);
    initialiser();
  })();

  /* ---------- 3. FAQ ---------- */
  (function faq() {
    if (reduit) return;
    document.addEventListener('click', function (e) {
      var s = e.target.closest && e.target.closest('.faq summary');
      if (!s) return;
      var d = s.parentElement;
      if (!d || d.open) return; // fermeture : immédiate
      d.classList.remove('mv-deplie');
      void d.offsetWidth;
      d.classList.add('mv-deplie');
      setTimeout(function () { d.classList.remove('mv-deplie'); }, 450);
    });
  })();

  /* ---------- 4. Flèches « → » ---------- */
  (function fleches() {
    var liens = document.querySelectorAll('a, .socle-lien, .promo-lien');
    Array.prototype.forEach.call(liens, function (el) {
      var t = el.lastChild;
      if (!t || t.nodeType !== 3) return;
      var m = /^([\s\S]*?)(\s*)→(\s*)$/.exec(t.nodeValue);
      if (!m) return;
      t.nodeValue = m[1] + m[2];
      var f = document.createElement('span');
      f.className = 'mv-fleche';
      f.setAttribute('aria-hidden', 'true');
      f.textContent = '→';
      el.appendChild(f);
      if (m[3]) el.appendChild(document.createTextNode(m[3]));
    });
  })();
})();
