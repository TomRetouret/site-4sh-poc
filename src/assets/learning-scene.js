/* ============================================================
   4SH Learning · hero de /formations/, « Le savoir se structure »

   Un seul modèle sert deux fois :
   - au build (Eleventy, shortcode learningScene) : il écrit dans la page
     l'état final, en SVG statique. C'est aussi le repli : sans script, en
     mouvement réduit ou en cas d'erreur, on voit cette image ;
   - dans le navigateur (chargé en defer) : il rejoue la chronologie de
     1,8 s, une seule fois, puis s'arrête. Aucun mouvement ensuite.

   Fond clair, violet Learning pour le seul tracé et le seul losange,
   fragments en encre et filets, horizontales et diagonales à 45°.
   Pour tout couper : retirer la balise <script> de formations.njk.
   ============================================================ */
(function (racine, fabrique) {
  if (typeof module === 'object' && module.exports) module.exports = fabrique();
  else racine.LearningScene = fabrique();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var V = '#7C4DDB', ENCRE = '#14171C', GRIS = '#9AA0A8', FILET = '#E3E5E8', DOUX = '#F4F5F7';
  var ease = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return 1 - Math.pow(1 - t, 3); };
  var lerp = function (a, b, k) { return a + (b - a) * k; };
  var hex = function (s) { return [1, 3, 5].map(function (i) { return parseInt(s.slice(i, i + 2), 16); }); };
  var mixC = function (a, b, k) {
    var A = hex(a), B = hex(b);
    return '#' + A.map(function (x, i) { var v = Math.round(lerp(x, B[i], k)).toString(16); return v.length < 2 ? '0' + v : v; }).join('');
  };
  var r1 = function (n) { return Math.round(n * 10) / 10; };

  /* ---------- Ordinateur : viewBox 620 x 460 ---------- */
  var TRACE = [[0, 400], [170, 400], [230, 340], [390, 340], [450, 280], [620, 280]];
  var PALIERS = [{ a: 0, b: 170, y: 400 }, { a: 230, b: 390, y: 340 }, { a: 450, b: 620, y: 280 }];
  var segs = [], LT = 0;
  for (var i = 0; i < TRACE.length - 1; i++) {
    var l = Math.hypot(TRACE[i + 1][0] - TRACE[i][0], TRACE[i + 1][1] - TRACE[i][1]);
    segs.push({ x1: TRACE[i][0], y1: TRACE[i][1], x2: TRACE[i + 1][0], y2: TRACE[i + 1][1], l: l, s: LT }); LT += l;
  }
  function surTrace(u) {
    var d = Math.min(1, Math.max(0, u)) * LT;
    for (var j = 0; j < segs.length; j++) { var g = segs[j]; if (d <= g.s + g.l) { var k = (d - g.s) / g.l; return [lerp(g.x1, g.x2, k), lerp(g.y1, g.y2, k)]; } }
    return TRACE[TRACE.length - 1];
  }
  function uDeX(x) {
    for (var j = 0; j < segs.length; j++) { var g = segs[j]; if (x <= g.x2) return (g.s + (x - g.x1) * (g.l / (g.x2 - g.x1))) / LT; }
    return 1;
  }

  // Chronologie (ms) : fragments 0-300, tracé 200-900, losange 850-1700, fin 1800
  var T = { tA: 200, tB: 900, lA: 850, lB: 1700, fin: 1800 };
  function arriveeTrace(p) { return T.tA + uDeX(PALIERS[p].a + 20) * (T.tB - T.tA); }
  function passage(p) { return T.lA + (p + 1) * (T.lB - T.lA) / 3; }
  var ARRETS = [uDeX(85), uDeX(310), uDeX(590)];
  function losangeU(t) {
    if (t < T.lA) return null;
    var k = (t - T.lA) / (T.lB - T.lA);
    if (k >= 1) return ARRETS[2];
    var e = Math.min(2.999, k * 3), n = Math.floor(e), f = ease(e - n);
    return lerp(n === 0 ? uDeX(10) : ARRETS[n - 1], ARRETS[n], f);
  }

  // Fragments (coordonnées finales) ; d = décalage à l'état épars, multiples de 8
  var FRAG = [
    // Comprendre : une notion
    { p: 0, t: 'l', x: 16, y: 262, w: 112, d: [-24, -72] }, { p: 0, t: 'l', x: 16, y: 280, w: 88, d: [40, -40] },
    { p: 0, t: 'l', x: 16, y: 298, w: 124, d: [-8, -112] }, { p: 0, t: 'l', x: 16, y: 316, w: 64, d: [56, -16] },
    { p: 0, t: 'd', x: 16, y: 352, w: 24, d: [72, -88] },
    // Pratiquer : un exercice, une ligne à compléter
    { p: 1, t: 'r', x: 240, y: 168, w: 148, h: 128, d: [-48, -64] }, { p: 1, t: 'l', x: 240, y: 188, w: 148, d: [24, -96] },
    { p: 1, t: 'l', x: 256, y: 208, w: 56, d: [-64, -24] }, { p: 1, t: 'l', x: 268, y: 224, w: 84, d: [32, -56] },
    { p: 1, t: 'l', x: 280, y: 240, w: 52, d: [-40, -104], ex: true }, { p: 1, t: 'l', x: 268, y: 256, w: 72, d: [64, -8] },
    { p: 1, t: 'l', x: 256, y: 272, w: 40, d: [8, -128] },
    // Maîtriser : une réalisation
    { p: 2, t: 'r', x: 460, y: 64, w: 150, h: 176, d: [-32, -24] }, { p: 2, t: 'b', x: 460, y: 64, w: 150, h: 22, d: [24, -48] },
    { p: 2, t: 'b', x: 460, y: 86, w: 36, h: 154, d: [-56, 8] }, { p: 2, t: 'r', x: 506, y: 98, w: 44, h: 40, d: [40, -80], c: true },
    { p: 2, t: 'r', x: 558, y: 98, w: 44, h: 40, d: [-16, -112], c: true }, { p: 2, t: 'r', x: 506, y: 146, w: 96, h: 40, d: [48, -32], c: true },
    { p: 2, t: 'l', x: 506, y: 204, w: 96, d: [-40, -136] }, { p: 2, t: 'l', x: 506, y: 220, w: 64, d: [16, -152] }
  ];

  function fragment(f, t) {
    var range = ease((t - arriveeTrace(f.p)) / 300), fini = ease((t - passage(f.p)) / 220);
    var op = r1((0.45 + 0.55 * range) * ease(t / 300) * 100) / 100;
    var col = mixC(GRIS, ENCRE, fini);
    var x = r1(f.x + f.d[0] * (1 - range)), y = r1(Math.max(8, f.y + f.d[1] * (1 - range)));
    var o = op < 1 ? ' opacity="' + op + '"' : '';
    if (f.t === 'l' && f.ex) {
      return fini > 0.5
        ? '<line x1="' + x + '" y1="' + y + '" x2="' + r1(x + f.w) + '" y2="' + y + '" stroke="' + V + '" stroke-width="3"' + o + '/>'
        : '<line x1="' + x + '" y1="' + y + '" x2="' + r1(x + f.w) + '" y2="' + y + '" stroke="' + col + '" stroke-width="2" stroke-dasharray="4 4"' + o + '/>';
    }
    if (f.t === 'l') return '<line x1="' + x + '" y1="' + y + '" x2="' + r1(x + f.w) + '" y2="' + y + '" stroke="' + col + '" stroke-width="2"' + o + '/>';
    if (f.t === 'd') return '<path d="M' + x + ' ' + y + 'l' + f.w + ' ' + (-f.w) + 'h' + (f.w * 2) + '" fill="none" stroke="' + col + '" stroke-width="2" opacity="' + r1(op * (0.4 + 0.6 * fini) * 100) / 100 + '"/>';
    if (f.t === 'r') return '<rect x="' + x + '" y="' + y + '" width="' + f.w + '" height="' + f.h + '" fill="' + (f.c ? mixC('#FFFFFF', DOUX, fini) : 'none') + '" stroke="' + col + '" stroke-width="1.5"' + o + '/>';
    return '<rect x="' + x + '" y="' + y + '" width="' + f.w + '" height="' + f.h + '" fill="' + mixC('#FFFFFF', FILET, range) + '" stroke="' + col + '" stroke-width="1.5"' + o + '/>';
  }

  function losange(x, y, r, a) {
    return '<path class="ls-losange" d="M' + r1(x) + ' ' + r1(y - r) + 'L' + r1(x + r) + ' ' + r1(y) + 'L' + r1(x) + ' ' + r1(y + r) + 'L' + r1(x - r) + ' ' + r1(y) + 'Z" fill="' + V + '"' + (a < 1 ? ' opacity="' + r1(a * 100) / 100 + '"' : '') + '/>';
  }

  // Scène ordinateur à l'instant t (ms) ; t >= 1800 : état final
  function rendre(t) {
    var s = '';
    [0, 1, 2].forEach(function (p) {
      s += '<g data-p="' + p + '">';
      FRAG.forEach(function (f) { if (f.p === p) s += fragment(f, t); });
      s += '</g>';
    });
    var k = ease((t - T.tA) / (T.tB - T.tA)), d = k * LT, pts = [TRACE[0]];
    for (var j = 0; j < segs.length; j++) {
      var g = segs[j];
      if (d >= g.s + g.l) pts.push([g.x2, g.y2]);
      else { var f = (d - g.s) / g.l; if (f > 0) pts.push([r1(lerp(g.x1, g.x2, f)), r1(lerp(g.y1, g.y2, f))]); break; }
    }
    if (k > 0) s += '<path class="ls-trace" d="M' + pts.map(function (q) { return q.join(' '); }).join('L') + '" fill="none" stroke="' + V + '" stroke-width="3"/>';
    var u = losangeU(t);
    if (u !== null) { var q = surTrace(u); s += losange(q[0], q[1], 11, ease((t - T.lA) / 120)); }
    return s;
  }

  /* ---------- Mobile : viewBox 358 x 150, 1,2 s ---------- */
  var TM = [[0, 120], [100, 120], [130, 90], [230, 90], [260, 60], [358, 60]];
  var LM = [], LTM = 0;
  for (var m = 0; m < TM.length - 1; m++) { var lm = Math.hypot(TM[m + 1][0] - TM[m][0], TM[m + 1][1] - TM[m][1]); LM.push(lm); LTM += lm; }
  function surTM(u) {
    var d = Math.min(1, Math.max(0, u)) * LTM, acc = 0;
    for (var j = 0; j < LM.length; j++) { if (d <= acc + LM[j]) { var f = (d - acc) / LM[j]; return [lerp(TM[j][0], TM[j + 1][0], f), lerp(TM[j][1], TM[j + 1][1], f)]; } acc += LM[j]; }
    return TM[TM.length - 1];
  }
  var TMOB = { fin: 1200, passages: [700, 950, 1200] };
  function rendreMobile(t) {
    var k = ease((t - 100) / 600), d = k * LTM, pts = [TM[0]], acc = 0;
    for (var j = 0; j < LM.length; j++) {
      if (d >= acc + LM[j]) pts.push(TM[j + 1]);
      else { var f = (d - acc) / LM[j]; if (f > 0) pts.push([r1(lerp(TM[j][0], TM[j + 1][0], f)), r1(lerp(TM[j][1], TM[j + 1][1], f))]); break; }
      acc += LM[j];
    }
    var o = ease((t - 300) / 300), oa = o < 1 ? ' opacity="' + r1(o * 100) / 100 + '"' : '';
    var s = '<g data-p="0"><line x1="0" y1="96" x2="56" y2="96" stroke="' + ENCRE + '" stroke-width="2"' + oa + '/></g>';
    s += '<g data-p="1"><rect x="138" y="44" width="72" height="34" fill="none" stroke="' + ENCRE + '" stroke-width="1.5"' + oa + '/><line x1="146" y1="62" x2="186" y2="62" stroke="' + V + '" stroke-width="2"' + oa + '/></g>';
    s += '<g data-p="2"><rect x="268" y="4" width="80" height="44" fill="' + DOUX + '" stroke="' + ENCRE + '" stroke-width="1.5"' + oa + '/><rect x="268" y="4" width="80" height="10" fill="' + FILET + '" stroke="' + ENCRE + '" stroke-width="1.5"' + oa + '/></g>';
    if (k > 0) s += '<path class="ls-trace" d="M' + pts.map(function (q) { return q.join(' '); }).join('L') + '" fill="none" stroke="' + V + '" stroke-width="3"/>';
    if (t >= 650) {
      var kl = ease((t - 650) / 550), q = kl < 1 ? surTM(kl * 0.93) : [330, 60];
      s += losange(q[0], q[1], 9, 1);
    }
    return s;
  }

  // Positions des noms de paliers (HTML), en % de la scène
  var NOMS = {
    bureau: [[0, 400], [242, 340], [462, 280]].map(function (q) { return { left: r1(q[0] / 620 * 100), top: r1((q[1] + 14) / 460 * 100) }; }),
    mobile: [[0, 120], [138, 90], [268, 60]].map(function (q) { return { left: r1(q[0] / 358 * 100), top: r1((q[1] + 10) / 150 * 100) }; })
  };

  /* ---------- Build : balisage complet de la scène, état final ---------- */
  function balisage(noms) {
    noms = noms && noms.length === 3 ? noms : ['Comprendre', 'Pratiquer', 'Maîtriser'];
    var liste = function (pos, cls) {
      return '<ol class="ls-noms ' + cls + '">' + noms.map(function (n, i) {
        return '<li class="ls-vu ls-fait" style="left:' + pos[i].left + '%;top:' + pos[i].top + '%">' + n + '</li>';
      }).join('') + '</ol>';
    };
    return '<div class="learning-scene" data-learning-scene>' +
      '<div class="ls-bureau"><svg viewBox="0 0 620 460" aria-hidden="true" focusable="false">' + rendre(T.fin) + '</svg>' + liste(NOMS.bureau, '') + '</div>' +
      '<div class="ls-mobile"><svg viewBox="0 0 358 150" aria-hidden="true" focusable="false">' + rendreMobile(TMOB.fin) + '</svg>' + liste(NOMS.mobile, '') + '</div>' +
      '</div>';
  }

  /* ---------- Navigateur : lecture unique ---------- */
  function jouer() {
    var bloc = document.querySelector('[data-learning-scene]');
    var racineDoc = document.documentElement;
    var liberer = function () { racineDoc.classList.remove('ls-attente'); };
    if (!bloc) { liberer(); return; }
    var reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var zones = [['.ls-bureau', rendre, T.fin, [0, 1, 2].map(arriveeTrace), [0, 1, 2].map(passage)],
                 ['.ls-mobile', rendreMobile, TMOB.fin, [200, 400, 600], TMOB.passages]];
    var zone = null;
    zones.forEach(function (z) { var el = bloc.querySelector(z[0]); if (el && el.getClientRects().length && !zone) zone = { el: el, rendre: z[1], fin: z[2], vus: z[3], faits: z[4] }; });
    var r = bloc.getBoundingClientRect();
    // mouvement réduit, scène hors écran (arrivée sur une ancre) ou masquée : état final tel quel
    if (reduit || !zone || r.bottom < 0 || r.top > (window.innerHeight || 0)) { liberer(); survol(bloc); return; }
    var svg = zone.el.querySelector('svg'), noms = zone.el.querySelectorAll('.ls-noms li');
    var t0 = 0, raf = 0;
    function image(now) {
      var t = Math.min(now - t0, zone.fin);
      svg.innerHTML = zone.rendre(t);
      Array.prototype.forEach.call(noms, function (li, i) {
        li.classList.toggle('ls-vu', t >= zone.vus[i]);
        li.classList.toggle('ls-fait', t >= zone.faits[i] - 80);
      });
      if (t < zone.fin) raf = requestAnimationFrame(image);
      else survol(bloc);
    }
    try {
      svg.innerHTML = zone.rendre(0);
      Array.prototype.forEach.call(noms, function (li) { li.classList.remove('ls-vu', 'ls-fait'); });
      liberer();
      requestAnimationFrame(function (now) { t0 = now; raf = requestAnimationFrame(image); });
      // onglet masqué ou largeur modifiée en cours de route : état final direct
      var fin = function () { cancelAnimationFrame(raf); svg.innerHTML = zone.rendre(zone.fin); Array.prototype.forEach.call(noms, function (li) { li.classList.add('ls-vu', 'ls-fait'); }); survol(bloc); };
      document.addEventListener('visibilitychange', function () { if (document.hidden) fin(); }, { once: true });
      var l0 = window.innerWidth;
      window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - l0) > 2) fin(); });
    } catch (e) {
      cancelAnimationFrame(raf); svg.innerHTML = zone.rendre(zone.fin); liberer();
    }
  }

  // Survol (souris, après l'animation) : le palier visé met son objet en avant
  var survolPose = false;
  function survol(bloc) {
    if (survolPose || !window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var zone = bloc.querySelector('.ls-bureau'); if (!zone) return;
    survolPose = true;
    var svg = zone.querySelector('svg');
    zone.addEventListener('pointermove', function (e) {
      var b = svg.getBoundingClientRect(); if (!b.width) return;
      var x = (e.clientX - b.left) / b.width * 620;
      zone.setAttribute('data-vise', x < 200 ? '0' : x < 420 ? '1' : '2');
    });
    zone.addEventListener('pointerleave', function () { zone.removeAttribute('data-vise'); });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jouer); else jouer();
  }

  return { rendre: rendre, rendreMobile: rendreMobile, balisage: balisage, T: T };
});
