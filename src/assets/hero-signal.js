/* ============================================================
   4SH · Hero de l'accueil, « Le signal prend forme » (directions A + B)
   Chargé dans accueil.njk, juste après le hero et AVANT mouvement.js.

   - Ordinateur (>= 1024 px) avec WebGL 2 : 3 000 à 4 000 micro-losanges
     convergent vers le tracé en 2,4 s (un seul appel de dessin instancié,
     trajectoires calculées dans le vertex shader), puis disparaissent :
     aucune particule ne reste. Une épure (repères, aplombs, cotes) se
     trace sous le plan et reste à 18 %. Le texte du hero est une zone
     protégée : aucune particule n'y naît ni ne la traverse.
   - Sinon (tablette, mobile, WebGL absent ou perdu) : direction C,
     c'est-à-dire l'entrée du plan déjà gérée par mouvement.js.
   - prefers-reduced-motion : état final direct (épure et paliers nommés).
   - Commun : au premier défilement, les 4 paliers se nomment, puis le
     losange descend vers la section suivante. Une seule fois, jamais lié
     à la position de défilement.
   Pour tout couper : retirer la balise <script> de accueil.njk.
   ============================================================ */
(function () {
  'use strict';

  var racine = document.documentElement;
  var hero = document.querySelector('.hero');
  var svg = hero && hero.querySelector('svg.hero-plan');
  if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return;

  var NS = 'http://www.w3.org/2000/svg';
  var COURBE = 'cubic-bezier(0.2, 0, 0, 1)';
  var reduit = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var bureau = !!(window.matchMedia && matchMedia('(min-width: 1024px)').matches);
  var etiquettes = hero.querySelector('.hero-4d');
  var vb = svg.viewBox.baseVal;
  var chemins = svg.querySelectorAll('path');
  var plan = chemins[0], losange = chemins[chemins.length - 1];
  var socle = svg.querySelector('rect');
  var ease = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return 1 - Math.pow(1 - t, 3); };

  /* ---------- Géométrie : crête du plan, lue dans le chemin SVG ---------- */
  var crete = (function () {
    var pts = [], x = 0, y = 0, toks = plan.getAttribute('d').match(/[MVHLZ]|-?\d+(\.\d+)?/g), i = 0;
    while (i < toks.length) {
      var c = toks[i++];
      if (c === 'M') { x = +toks[i++]; y = +toks[i++]; }
      else if (c === 'V') { y = +toks[i++]; if (y < vb.height) pts.push([x, y]); }
      else if (c === 'H') { x = +toks[i++]; if (y < vb.height) pts.push([x, y]); }
      else if (c === 'L') { x = +toks[i++]; y = +toks[i++]; pts.push([x, y]); }
    }
    return pts;
  })();
  // paliers = segments horizontaux de la crête
  var paliers = [];
  for (var p = 0; p < crete.length - 1; p++) if (crete[p][1] === crete[p + 1][1]) paliers.push([crete[p][0], crete[p + 1][0], crete[p][1]]);

  /* ---------- Épure (langage B) : sous le plan, dans le SVG du hero ---------- */
  var epure = null, niveaux = null, cotes = [];
  function ligne(x1, y1, x2, y2, parent, tirets) {
    var e = document.createElementNS(NS, 'line');
    e.setAttribute('x1', x1); e.setAttribute('y1', y1); e.setAttribute('x2', x2); e.setAttribute('y2', y2);
    if (tirets) e.setAttribute('stroke-dasharray', tirets);
    parent.appendChild(e);
    return e;
  }
  function construireEpure() {
    epure = document.createElementNS(NS, 'g');
    epure.setAttribute('class', 'hs-epure');
    epure.setAttribute('fill', 'none');
    epure.setAttribute('stroke', '#5E656E');
    epure.setAttribute('stroke-width', '1');
    niveaux = document.createElementNS(NS, 'g'); niveaux.setAttribute('class', 'hs-niveaux'); epure.appendChild(niveaux);
    paliers.forEach(function (pl) { ligne(-6000, pl[2], vb.width, pl[2], niveaux); });
    crete.forEach(function (pt, i) { if (i > 0 && i < crete.length - 1) ligne(pt[0], 0, pt[0], vb.height, niveaux); });
    paliers.forEach(function (pl) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'hs-cote');
      var a = Math.max(pl[0], 0) + 12, b = pl[1] - 12, yy = pl[2] - 40;
      ligne(a, yy, b, yy, g); ligne(a, yy - 6, a, yy + 6, g); ligne(b, yy - 6, b, yy + 6, g);
      ligne(a, yy + 6, a, pl[2] - 4, g, '2 3'); ligne(b, yy + 6, b, pl[2] - 4, g, '2 3');
      epure.appendChild(g);
      cotes.push({ g: g, a: pl[0], b: pl[1] });
    });
    svg.insertBefore(epure, svg.firstChild);
  }

  /* ---------- Paliers nommés et sortie (commun à toutes les directions) ---------- */
  function placerEtiquettes() {
    if (!etiquettes) return;
    var m = svg.getScreenCTM(), z = etiquettes.parentElement.getBoundingClientRect();
    if (!m || !z.width) return;
    Array.prototype.forEach.call(etiquettes.children, function (li, i) {
      var pl = paliers[i]; if (!pl) { li.style.display = 'none'; return; }
      var gauche = Math.max(pl[0], (z.left - m.e) / m.a);
      li.style.left = (m.a * (gauche + pl[1]) / 2 + m.e - z.left) + 'px';
      li.style.top = (m.d * pl[2] + m.f - z.top) + 'px';
    });
  }
  var nomme = false, sorti = false, finIntro = 0, minuteur = 0;
  function nommer() {
    if (nomme || !etiquettes) return; nomme = true;
    placerEtiquettes();
    Array.prototype.forEach.call(etiquettes.children, function (li, i) {
      setTimeout(function () { li.classList.add('hs-on'); }, i * 120);
    });
  }
  function sortir() {
    if (sorti) return; sorti = true;
    var attente = Math.max(0, finIntro - performance.now());
    setTimeout(function () {
      nommer();
      // plan visible : ordinateur et tablette (hero-plan) ou mobile (hero-plan--m)
      var visible = [svg, hero.querySelector('svg.hero-plan--m')].filter(function (s) { return s && s.getClientRects().length; })[0];
      if (reduit || !visible || !visible.viewBox || !visible.viewBox.baseVal) return;
      var ps = visible.querySelectorAll('path'), los = ps[ps.length - 1];
      if (!los || !los.animate) return;
      var b = los.getBBox(), descente = visible.viewBox.baseVal.height - (b.y + b.height / 2);
      los.style.transformBox = 'fill-box'; los.style.transformOrigin = 'center';
      setTimeout(function () {
        los.animate([
          { transform: 'translate(0,0)', opacity: 1 },
          { transform: 'translate(0,0)', opacity: 1, offset: 0.15 },
          { transform: 'translate(0,' + descente + 'px)', opacity: 0 }
        ], { duration: 1050, easing: COURBE, fill: 'forwards' });
      }, 4 * 120 + 300);
    }, attente);
  }
  function suivreDefilement() {
    var seuil = function () { return hero.offsetHeight * 0.08; };
    var surDefilement = function () {
      if (window.scrollY > seuil()) { window.removeEventListener('scroll', surDefilement); clearTimeout(minuteur); sortir(); }
    };
    window.addEventListener('scroll', surDefilement, { passive: true });
    // sans défilement, la méthode reste lisible : les paliers se nomment après 4 s
    minuteur = setTimeout(nommer, Math.max(0, finIntro - performance.now()) + 4000);
  }
  var tempo;
  window.addEventListener('resize', function () { clearTimeout(tempo); tempo = setTimeout(placerEtiquettes, 120); });

  /* ---------- Survol : les cotes du palier visé se renforcent ---------- */
  function survol() {
    if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    hero.addEventListener('pointermove', function (e) {
      if (!racine.classList.contains('hs-fini')) return;
      var m = svg.getScreenCTM(); if (!m) return;
      var x = (e.clientX - m.e) / m.a, y = (e.clientY - m.f) / m.d;
      cotes.forEach(function (c) {
        c.g.classList.toggle('hs-vise', x >= c.a && x <= c.b && y > -160 && y < vb.height);
      });
    });
    hero.addEventListener('pointerleave', function () { cotes.forEach(function (c) { c.g.classList.remove('hs-vise'); }); });
  }

  /* ---------- Directions C (repli) et mouvement réduit ---------- */
  if (reduit || !bureau) {
    if (bureau) { construireEpure(); racine.classList.add('hs-fini'); survol(); }
    if (reduit) { racine.classList.add('hs-reduit'); }
    finIntro = performance.now() + (reduit ? 0 : 1200);
    if (reduit) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { nomme = false; nommer(); }); else nommer(); }
    else suivreDefilement();
    return;
  }

  /* ---------- Direction A + B : WebGL 2 ---------- */
  var cv = document.createElement('canvas'), gl = null;
  try { gl = cv.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' }); } catch (e) { gl = null; }
  if (!gl) { finIntro = performance.now() + 1200; suivreDefilement(); return; } // mouvement.js joue la direction C

  // à partir d'ici, mouvement.js n'arme plus le plan du hero
  racine.classList.add('hs-gl');
  cv.className = 'hs-canvas';
  cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  construireEpure();

  var VS = '#version 300 es\n' +
    'in vec2 aCoin; in vec2 aDepart; in vec2 aControle; in vec2 aCible; in vec3 aDivers;\n' +
    'uniform vec2 uTaille; uniform float uT; uniform float uDuree; uniform float uFondu;\n' +
    'out vec2 vPx; out float vA; out vec3 vCouleur;\n' +
    'void main(){\n' +
    '  float k = clamp((uT - aDivers.x) / uDuree, 0.0, 1.0);\n' +
    '  float e = 1.0 - pow(1.0 - k, 3.0);\n' +
    '  vec2 p = mix(mix(aDepart, aControle, e), mix(aControle, aCible, e), e);\n' +
    '  vec2 d = 2.0 * (1.0 - e) * (aControle - aDepart) + 2.0 * e * (aCible - aControle);\n' +
    '  float bouge = step(aDivers.x, uT) * (1.0 - step(1.0, k));\n' +
    '  vec2 v = d * 3.0 * pow(1.0 - k, 2.0) / uDuree * bouge;\n' +
    '  float vit = length(v);\n' +
    '  vec2 dir = vit > 0.0005 ? v / vit : vec2(0.0, 1.0);\n' +
    '  vec2 nrm = vec2(-dir.y, dir.x);\n' +
    '  float s = aDivers.y * (1.0 - 0.35 * e);\n' +
    '  float etire = 1.0 + min(vit * 1.6, 3.5);\n' +
    '  vec2 pos = p + dir * aCoin.y * s * etire + nrm * aCoin.x * s;\n' +
    '  vPx = pos;\n' +
    '  vA = (0.22 + 0.78 * smoothstep(0.0, 0.25, k)) * (1.0 - uFondu);\n' +
    '  vCouleur = mix(vec3(0.42, 0.45, 0.50), vec3(1.0), e);\n' +
    '  vec2 c = pos / uTaille * 2.0 - 1.0;\n' +
    '  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);\n' +
    '}';
  var FS = '#version 300 es\nprecision mediump float;\n' +
    'in vec2 vPx; in float vA; in vec3 vCouleur; uniform vec4 uTexte; out vec4 o;\n' +
    'void main(){\n' +
    '  if (vPx.x > uTexte.x && vPx.x < uTexte.z && vPx.y > uTexte.y && vPx.y < uTexte.w) discard;\n' +
    '  o = vec4(vCouleur * vA, vA);\n' +
    '}';

  var prog, vao, tampon, U = {}, N = 0, W = 0, H = 0, texte = [0, 0, 0, 0], t0 = 0, raf = 0, fini = false;
  var traceSvg = null;

  function abandon() {
    // tout échec : état final immédiat, rien ne reste masqué
    cancelAnimationFrame(raf);
    racine.classList.remove('hs-gl', 'hs-joue');
    racine.classList.add('hs-fini');
    [plan, socle, losange].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.transform = ''; } });
    if (traceSvg) traceSvg.style.opacity = 0;
    if (niveaux) niveaux.style.opacity = '';
    if (niveaux) Array.prototype.forEach.call(niveaux.querySelectorAll('line'), function (l) { l.style.strokeDashoffset = ''; l.style.strokeDasharray = ''; });
    cotes.forEach(function (c) { c.g.style.opacity = ''; });
    if (cv.parentNode) cv.parentNode.removeChild(cv);
    if (!finIntro) { finIntro = performance.now(); suivreDefilement(); }
  }
  function terminer() {
    fini = true;
    cancelAnimationFrame(raf);
    racine.classList.remove('hs-joue');
    racine.classList.add('hs-fini');
    [plan, socle, losange].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.transform = ''; } });
    if (traceSvg) traceSvg.style.opacity = 0;
    niveaux.style.opacity = '';
    cotes.forEach(function (c) { c.g.style.opacity = ''; });
    Array.prototype.forEach.call(niveaux.querySelectorAll('line'), function (l) { l.style.strokeDashoffset = ''; l.style.strokeDasharray = ''; });
    // libère le GPU : aucune particule ne reste
    var perte = gl && gl.getExtension('WEBGL_lose_context');
    if (cv.parentNode) cv.parentNode.removeChild(cv);
    if (perte) perte.loseContext();
    gl = null;
  }

  function compiler() {
    var sh = function (type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('lien');
    gl.useProgram(prog);
    ['uTaille', 'uT', 'uDuree', 'uFondu', 'uTexte'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var coins = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, coins);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 1, 0, 0, 1, -1, 0]), gl.STATIC_DRAW);
    var lc = gl.getAttribLocation(prog, 'aCoin'); gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 0, 0);
    tampon = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
    [['aDepart', 2, 0], ['aControle', 2, 8], ['aCible', 2, 16], ['aDivers', 3, 24]].forEach(function (a) {
      var l = gl.getAttribLocation(prog, a[0]); gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, 36, a[2]); gl.vertexAttribDivisor(l, 1);
    });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  // zone protégée : l'union des blocs de texte du hero, plus 32 px de marge
  function zoneTexte(rh) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    var blocs = hero.querySelectorAll('.container h1, .container p, .hero-cta');
    Array.prototype.forEach.call(blocs, function (el) {
      var b = el.getBoundingClientRect(); if (!b.width) return;
      var droite = b.left;
      if (el.classList.contains('hero-cta')) {
        Array.prototype.forEach.call(el.children, function (c) { droite = Math.max(droite, c.getBoundingClientRect().right); });
      } else {
        var r = document.createRange(); r.selectNodeContents(el);
        Array.prototype.forEach.call(r.getClientRects(), function (c) { droite = Math.max(droite, c.right); });
      }
      x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, droite); y1 = Math.max(y1, b.bottom);
    });
    var m = 32;
    return [x0 - rh.left - m, y0 - rh.top - m, x1 - rh.left + m, y1 - rh.top + m];
  }

  function preparer() {
    var rh = hero.getBoundingClientRect(), dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = rh.width; H = rh.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    texte = zoneTexte(rh);
    var m = svg.getScreenCTM(); if (!m) throw new Error('ctm');
    // crête en pixels du hero, prolongée jusqu'au bord gauche de l'écran
    var gaucheVb = Math.min(0, (rh.left - m.e) / m.a);
    var pts = crete.map(function (q) { return [m.a * q[0] + m.e - rh.left, m.d * q[1] + m.f - rh.top]; });
    pts.unshift([m.a * gaucheVb + m.e - rh.left, pts[0][1]]);
    var segs = [], L = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push({ a: pts[i], b: pts[i + 1], l: l, s: L }); L += l;
    }
    var surCrete = function (u) {
      var d = u * L;
      for (var j = 0; j < segs.length; j++) {
        var g = segs[j];
        if (d <= g.s + g.l || j === segs.length - 1) { var k = g.l ? (d - g.s) / g.l : 0; return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k]; }
      }
    };
    var yCrete = function (x) {
      for (var j = 0; j < segs.length; j++) { var g = segs[j]; if (x >= g.a[0] && x <= g.b[0]) return g.a[1] + (g.b[1] - g.a[1]) * ((x - g.a[0]) / ((g.b[0] - g.a[0]) || 1)); }
      return pts[pts.length - 1][1];
    };
    // tracé blanc (relais entre particules et plan), en coordonnées du viewBox
    traceSvg = document.createElementNS(NS, 'path');
    traceSvg.setAttribute('class', 'hs-trace');
    traceSvg.setAttribute('d', 'M' + gaucheVb + ' ' + crete[0][1] + crete.map(function (q) { return 'L' + q[0] + ' ' + q[1]; }).join(''));
    traceSvg.setAttribute('fill', 'none'); traceSvg.setAttribute('stroke', '#FFFFFF'); traceSvg.setAttribute('stroke-width', '2');
    traceSvg.style.opacity = 0;
    svg.insertBefore(traceSvg, losange);

    // densité validée : 3 000 à 4 000 selon la largeur
    N = Math.round(3000 + 1000 * Math.max(0, Math.min(1, (W - 1024) / 896)));
    var graine = 7, alea = function () { return (graine = (graine * 16807) % 2147483647) / 2147483647; };
    var data = new Float32Array(N * 9);
    for (var n = 0; n < N; n++) {
      var u = Math.max(0, Math.min(1, n / (N - 1) + (alea() - 0.5) * 0.004));
      var cible = surCrete(u), Tx = cible[0], Ty = cible[1] + (alea() - 0.5) * 1.6;
      var Sx, Sy, essai = 0;
      do { Sx = W * Math.pow(alea(), 0.55); Sy = H * alea(); essai++; }
      while (essai < 40 && ((Sx > texte[0] && Sx < texte[2] && Sy > texte[1] && Sy < texte[3]) || Sy > yCrete(Sx) - 6));
      var mx = (Sx + Tx) / 2, my = (Sy + Ty) / 2, dx = Tx - Sx, dy = Ty - Sy, dist = Math.hypot(dx, dy) || 1;
      var courbe = 0.28 * Math.sin(Sx * 0.004 + Sy * 0.007) * dist;
      data.set([Sx, Sy, mx - dy / dist * courbe, my + dx / dist * courbe, Tx, Ty, 300 + u * 900 + alea() * 260, 1.4 + alea() * 1.5, alea()], n * 9);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, tampon); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // arrivée des particules au début de chaque palier : allume sa cote
    cotes.forEach(function (c) {
      var x = m.a * Math.max(c.a, gaucheVb) + m.e - rh.left, d = 0;
      for (var j = 0; j < segs.length; j++) { var g = segs[j]; if (x >= g.a[0] && x <= g.b[0] && g.a[1] === g.b[1]) { d = g.s + (x - g.a[0]); break; } if (x > g.b[0]) d = g.s + g.l; }
      c.arrivee = 1200 + (d / L) * 900;
    });
    Array.prototype.forEach.call(niveaux.querySelectorAll('line'), function (l) {
      if (l.getAttribute('y1') === l.getAttribute('y2')) l.setAttribute('x1', gaucheVb); // part du bord gauche visible
      var lg = Math.hypot(+l.getAttribute('x2') - +l.getAttribute('x1'), +l.getAttribute('y2') - +l.getAttribute('y1'));
      l.style.strokeDasharray = lg; l._lg = lg;
    });
  }

  function image(now) {
    var t = now - t0;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (t < 2500) {
      gl.useProgram(prog); gl.bindVertexArray(vao);
      gl.uniform2f(U.uTaille, W, H); gl.uniform1f(U.uT, t); gl.uniform1f(U.uDuree, 900);
      gl.uniform1f(U.uFondu, ease((t - 2050) / 350)); gl.uniform4f(U.uTexte, texte[0], texte[1], texte[2], texte[3]);
      gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, N);
    }
    // épure : se trace en 600 ms, puis s'efface à 18 %
    var kc = ease(t / 600);
    Array.prototype.forEach.call(niveaux.querySelectorAll('line'), function (l) { l.style.strokeDashoffset = l._lg * (1 - kc); });
    niveaux.style.opacity = 0.9 - 0.72 * ease((t - 2100) / 400);
    cotes.forEach(function (c) { var k = ease((t - c.arrivee) / 250); c.g.style.opacity = (0.75 - 0.45 * ease((t - 2200) / 300)) * k; });
    // relais : trait blanc, puis plan, puis losange
    traceSvg.style.opacity = ease((t - 1850) / 250) * (1 - ease((t - 2250) / 300));
    var kp = ease((t - 2050) / 350);
    plan.style.opacity = kp; if (socle) socle.style.opacity = kp;
    var kl = ease((t - 2250) / 250);
    losange.style.opacity = kl; losange.style.transform = 'scale(' + (0.4 + 0.6 * kl) + ')';
    if (t < 2650) raf = requestAnimationFrame(image); else terminer();
  }

  function demarrer() {
    try {
      var rh = hero.getBoundingClientRect();
      // rechargé plus bas dans la page, ou hero masqué : état final direct
      if (rh.bottom < 0 || !svg.getClientRects().length) { abandon(); return; }
      compiler(); preparer();
      racine.classList.add('hs-joue');
      finIntro = performance.now() + 2650;
      t0 = performance.now();
      raf = requestAnimationFrame(image);
      suivreDefilement();
      survol();
    } catch (e) { abandon(); }
  }

  // masque le plan avant le premier rendu (le texte, lui, est déjà là)
  plan.style.opacity = 0; if (socle) socle.style.opacity = 0; losange.style.opacity = 0;
  losange.style.transformBox = 'fill-box'; losange.style.transformOrigin = 'center';
  niveaux.style.opacity = 0; cotes.forEach(function (c) { c.g.style.opacity = 0; });
  cv.addEventListener('webglcontextlost', function (e) { if (!fini) { e.preventDefault(); abandon(); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden && !fini && t0) terminer(); });
  // changement de largeur pendant la séquence (rotation, fenêtre) : état final direct ;
  // un changement de hauteur seul (barre d'adresse mobile, capture) est ignoré
  var largeur0 = window.innerWidth;
  window.addEventListener('resize', function () { if (!fini && t0 && Math.abs(window.innerWidth - largeur0) > 2) terminer(); });

  // après le premier rendu, polices chargées (attente plafonnée à 600 ms)
  var lance = false;
  function lancer() { if (lance) return; lance = true; requestAnimationFrame(function () { requestAnimationFrame(demarrer); }); }
  var pret = function () {
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(lancer); setTimeout(lancer, 600); }
    else lancer();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pret); else pret();
})();
