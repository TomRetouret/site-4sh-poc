/*
 * APERÇUS PERSONNALISÉS DU BACK-OFFICE (preuve de concept)
 * ---------------------------------------------------------------------------
 * Un seul fichier, chargé par les deux interfaces :
 *   - Sveltia CMS 0.256.1 (admin/index.html)
 *   - Decap CMS 3.17.3   (admin-decap/index.html)
 * Les deux exposent la même API : CMS.registerPreviewTemplate(nom, composant)
 * et CMS.registerPreviewStyle(feuille[, { raw: true }]).
 *
 * Chargement : module ES, sans étape de build, à placer APRÈS le script du CMS :
 *   <script type="module" src="/admin-shared/apercus.js"></script>
 * Attention : le dossier admin-shared doit être copié tel quel par Eleventy
 * (addPassthroughCopy({ "admin-shared": "admin-shared" })), sinon le fichier
 * n'est pas servi en production.
 *
 * Spécification qui fait foi : docs/back-office/schema-blocs.md
 * Balisage de référence : src/_includes/composants/blocs/*.njk (rendu Eleventy),
 * reproduit ici classe par classe pour que les feuilles du site s'appliquent.
 *
 * NOMS D'ENREGISTREMENT
 * Pour une collection fichier, les deux CMS attendent le NOM DU FICHIER (et non
 * celui de la collection). Pour une collection dossier, le nom de la collection.
 * Constaté le 1er novembre 2026 dans admin/config.yml (Sveltia) : collection
 * « accueil », fichier « accueil » (src/_data/blocs/{{locale}}/accueil.json,
 * i18n multiple_folders) ; collection dossier « temoignages » ; réglages du
 * site dans la collection « pages », fichiers « site » et « en_site ».
 * Collection dossier « demo » (Pages de démonstration, src/demo/*.md) : même
 * gabarit que l'accueil, enregistré sous le nom de la collection.
 * admin-decap/config.yml n'existait pas encore : on enregistre donc aussi les
 * noms probables d'une configuration Decap sans i18n (voir NOMS_ACCUEIL et
 * NOMS_TEMOIGNAGES plus bas). Enregistrer un nom absent de la configuration est
 * sans effet. Si Decap retient un autre nom, il suffit de l'ajouter à la liste.
 *
 * CHOIX TECHNIQUES
 * - On écrit avec h() (alias de React.createElement) exposé globalement par
 *   les deux CMS (window.h). Pas de HTM : aucune dépendance réseau, rien à lier,
 *   et Sveltia comme Decap fournissent h() pour la compatibilité.
 * - Les données arrivent en Immutable.js dans les deux CMS (entry.getIn) ;
 *   on convertit en objet simple avec toJS(), et on accepte aussi un objet
 *   simple (repli défensif).
 * - Aucun script du site (ni WebGL du hero, ni carrousel, ni mouvement.js) :
 *   l'aperçu montre l'état statique. Sans la classe .mv posée par mouvement.js,
 *   mouvement.css n'applique aucune animation : tout est visible.
 * - Les liens de l'aperçu n'ont pas d'attribut href (la vraie destination est
 *   dans l'infobulle) : un clic ne doit pas faire quitter l'aperçu à l'iframe.
 * - Chaque élément éditable porte data-key-path (chemin du champ, ex.
 *   blocs.2.cartes.1.texte) et tabindex="0" : dans Sveltia, un clic ou
 *   Entrée amène au champ ; dans Decap, ces attributs sont simplement ignorés.
 */

/* ------------------------------------------------------------------------- */
/* Réglages                                                                  */
/* ------------------------------------------------------------------------- */

// Noms de fichier sous lesquels le gabarit de l'accueil est enregistré.
// « accueil » : nom retenu côté Sveltia (collection accueil, fichier accueil).
// Les autres couvrent les variantes probables (Decap, version anglaise séparée).
const NOMS_ACCUEIL = ['accueil', 'accueil_fr', 'accueil_en', 'en_accueil', 'home'];

// Collections dossier dont les entrées ont un champ « blocs » (mêmes 11 types) :
// rendues par le même gabarit que l'accueil. « demo » : Pages de démonstration
// (src/demo/*.md, données en front matter : titre, seo, blocs).
const NOMS_PAGES_BLOCS = ['demo'];

// Noms possibles de la collection des témoignages (contenu partagé).
const NOMS_TEMOIGNAGES = ['temoignages', 'temoignages_fr', 'temoignages_en'];

// Feuilles du site, dans l'ordre de src/_includes/base.njk pour l'accueil
// (learning.css, catalogue.css et extraCss ne sont pas chargées sur l'accueil).
const FEUILLES_SITE = [
  'https://fonts.googleapis.com/css2?family=Asap:wght@400;600&family=Manrope:wght@700;800&display=swap',
  '/assets/styles.css',
  '/assets/charte.css',
  '/assets/mouvement.css',
];

// Libellés des types de blocs (repris de la spécification).
const LIBELLES = {
  hero: 'Hero (haut de page)',
  logos_clients: 'Logos clients (Ils nous confient leur métier)',
  cartes_offres: "Cartes d'offres (Build, Run, Learning)",
  chiffres_cles: 'Chiffres clés',
  cartes_secteurs: 'Cartes secteurs (carrousel)',
  methode_4d: 'Méthode 4D',
  projets: 'Projets (carrousel de réalisations)',
  technologies: 'Technologies (mur)',
  faq: 'Questions fréquentes',
  derniers_articles: 'Derniers articles du blog',
  equipe: 'Équipe (photo et texte)',
};

// Styles propres à l'aperçu (mentions, avertissements, repère de focus).
// Préfixe « apercu- » pour ne jamais entrer en conflit avec la charte.
const STYLES_APERCU = `
.apercu-masque,.apercu-info,.apercu-alerte,.apercu-seo{font:600 13px/1.4 Asap,system-ui,sans-serif;box-sizing:border-box}
.apercu-masque{margin:0;padding:6px 16px;background:repeating-linear-gradient(135deg,#f3f3f3 0 8px,#e9e9e9 8px 16px);color:#555;border-top:1px dashed #bbb;border-bottom:1px dashed #bbb;cursor:pointer}
.apercu-info{margin:8px 0;padding:8px 12px;background:#eef3ff;color:#23324d;border-left:3px solid #4a6fd1}
.apercu-alerte{position:relative;z-index:5;margin:6px 0;padding:6px 10px;background:#fff4d6;color:#5c3d00;border-left:3px solid #e0a100}
.apercu-seo{padding:10px 16px;background:#14171C;color:#d8dbe0}
.apercu-seo b{color:#fff}
.apercu-seo p{margin:2px 0}
[data-key-path]{cursor:pointer}
[data-key-path]:focus-visible{outline:2px dashed #ED203D;outline-offset:3px}
`;

/* ------------------------------------------------------------------------- */
/* Outils                                                                    */
/* ------------------------------------------------------------------------- */

// h() du CMS, lu au moment du rendu (le CMS peut finir de s'initialiser après
// le chargement de ce module).
function obtenirH() {
  const w = typeof window !== 'undefined' ? window : globalThis;
  const h = w.h || w.createElement || (w.CMS && w.CMS.React && w.CMS.React.createElement) || (w.React && w.React.createElement);
  if (typeof h !== 'function') throw new Error('apercus.js : h() introuvable (window.h)');
  return h;
}

// Crée un élément en aplatissant les enfants : pas de tableaux transmis à
// React, donc pas d'avertissement sur les clés, et les valeurs vides
// (null, undefined, false, '') sont retirées.
function el(type, props, ...enfants) {
  const plats = [];
  (function aplatir(liste) {
    for (const e of liste) {
      if (Array.isArray(e)) aplatir(e);
      else if (e !== null && e !== undefined && e !== false && e !== '') plats.push(e);
    }
  })(enfants);
  return obtenirH()(type, props || null, ...plats);
}

// Convertit une valeur Immutable.js en objet simple ; laisse le reste intact.
function versJS(v) {
  return v && typeof v.toJS === 'function' ? v.toJS() : v;
}

// Lit les données de l'entrée, que le CMS fournisse une Map Immutable
// (Decap, Sveltia) ou un objet simple.
function lireDonnees(entry) {
  if (!entry) return {};
  if (typeof entry.getIn === 'function') return versJS(entry.getIn(['data'])) || {};
  return versJS(entry.data) || {};
}

function lireChamp(entry, cle) {
  if (!entry) return undefined;
  if (typeof entry.get === 'function') return versJS(entry.get(cle));
  return entry[cle];
}

// Langue de l'entrée, déduite du chemin du fichier (…/en/…). Limite connue :
// avec l'i18n de Sveltia, le chemin est celui de la langue par défaut, et
// getCollection rend toujours la langue par défaut ; les données liées
// (témoignage, noms des clients) s'affichent donc en français dans l'aperçu.
function langueDe(entry) {
  const chemin = String(lireChamp(entry, 'path') || '');
  return /(^|\/)en(\/|_)/.test(chemin) ? 'en' : 'fr';
}

// Attributs du lien aperçu vers champ.
function cle(chemin) {
  return { 'data-key-path': chemin, tabIndex: 0 };
}

const tableau = (v) => (Array.isArray(v) ? v : []);
const texte = (v) => (v === null || v === undefined ? '' : String(v));

// Convention *mot* : rendue en <em class="accent">mot</em> (même expression
// que le filtre accent d'eleventy.config.js). Les <br> saisis sont conservés.
function accent(s) {
  const morceaux = [];
  texte(s).split(/<br\s*\/?>/i).forEach((ligne, i) => {
    if (i > 0) morceaux.push(el('br'));
    const re = /\*([^*\n]+)\*/g;
    let dernier = 0;
    let m;
    while ((m = re.exec(ligne))) {
      morceaux.push(ligne.slice(dernier, m.index));
      morceaux.push(el('em', { className: 'accent' }, m[1]));
      dernier = re.lastIndex;
    }
    morceaux.push(ligne.slice(dernier));
  });
  return morceaux;
}

// Lien inerte dans l'aperçu : pas d'attribut href (un clic ne fait donc pas
// naviguer l'iframe, et on n'appelle pas preventDefault, qui désactiverait le
// lien vers le champ dans Sveltia) ; la destination est montrée en infobulle.
// Les feuilles du site ne ciblent ni a[href] ni :link : le rendu est le même.
function propsLien(destination, defaut) {
  const cible = texte(destination) || defaut || '';
  return { title: cible ? 'Destination : ' + cible : 'Destination non renseignée' };
}

// Cadrage d'image : même correspondance que le filtre cadrageStyle du site.
const CADRAGES = { haut: 'center top', bas: 'center bottom', gauche: 'left center', droite: 'right center' };

// Résout l'adresse d'une image (fichier tout juste téléversé ou déjà publié).
function adresseImage(getAsset, fichier) {
  if (!fichier) return '';
  try {
    const a = typeof getAsset === 'function' ? getAsset(fichier) : null;
    const s = a ? String(a.url || a.toString()) : '';
    return s && s !== '[object Object]' ? s : fichier;
  } catch (err) {
    return fichier;
  }
}

// Avertissement visible si une image non décorative n'a pas de texte alternatif.
function alerteAlt(image, chemin) {
  if (!image || !image.fichier || image.decorative || texte(image.alt).trim()) return null;
  return el('p', Object.assign({ className: 'apercu-alerte', role: 'note' }, cle(chemin + '.alt')),
    'Texte alternatif manquant : décrivez l’image ou cochez « Image décorative ».');
}

// Balise <img> du site (alt vide si décorative, object-position si cadrage).
function imageSite(image, chemin, getAsset, extra) {
  const props = Object.assign({
    src: adresseImage(getAsset, image.fichier),
    alt: image.decorative ? '' : texte(image.alt),
    loading: 'lazy',
    decoding: 'async',
  }, extra || {}, cle(chemin + '.fichier'));
  if (CADRAGES[image.cadrage]) props.style = { objectPosition: CADRAGES[image.cadrage] };
  return el('img', props);
}

// Petit dessin SVG à partir d'une liste [balise, attributs].
function svg(props, formes) {
  return el('svg', props, formes.map(([type, attrs]) => el(type, attrs)));
}

// Chargement asynchrone (témoignages, réglages du site) : petit composant de
// classe écrit avec createClass, fourni globalement par les deux CMS. Le
// résultat est gardé en cache pour ne pas relancer la requête à chaque frappe.
const cacheChargements = new Map();
let ComposantChargeur = null;

function chargeur(props) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (!ComposantChargeur && typeof w.createClass === 'function') {
    ComposantChargeur = w.createClass({
      getInitialState: function () {
        return { valeur: cacheChargements.get(this.props.cleCache) };
      },
      componentDidMount: function () { this.vivant = true; this.charger(); },
      componentWillUnmount: function () { this.vivant = false; },
      componentDidUpdate: function (avant) { if (avant.cleCache !== this.props.cleCache) this.charger(); },
      charger: function () {
        const cleCache = this.props.cleCache;
        if (cacheChargements.has(cleCache)) {
          if (this.state.valeur !== cacheChargements.get(cleCache)) this.setState({ valeur: cacheChargements.get(cleCache) });
          return;
        }
        const soi = this;
        Promise.resolve()
          .then(() => soi.props.charger())
          .catch(() => null)
          .then((valeur) => {
            cacheChargements.set(cleCache, valeur || null);
            if (soi.vivant && soi.props.cleCache === cleCache) soi.setState({ valeur: valeur || null });
          });
      },
      render: function () { return groupe(this.props.rendu(this.state.valeur)); },
    });
  }
  if (!ComposantChargeur) return props.rendu(cacheChargements.get(props.cleCache));
  return el(ComposantChargeur, props);
}

// Regroupe plusieurs éléments sans ajouter de balise (Fragment de React si le
// CMS l'expose, sinon une div neutre en display: contents).
function groupe(enfants) {
  if (!Array.isArray(enfants)) return enfants === undefined ? null : enfants;
  const w = typeof window !== 'undefined' ? window : globalThis;
  const F = (w.CMS && w.CMS.React && w.CMS.React.Fragment) || (w.React && w.React.Fragment);
  return F ? el(F, null, enfants) : el('div', { style: { display: 'contents' } }, enfants);
}

// Demande une entrée à getCollection en essayant plusieurs couples
// (collection, fichier ou slug) ; rend le premier « data » non vide.
async function premiereEntree(getCollection, essais) {
  if (typeof getCollection !== 'function') return null;
  for (const [collection, slug] of essais) {
    try {
      let r = await getCollection(collection, slug);
      r = versJS(r);
      if (Array.isArray(r)) r = r.find((e) => e && e.slug === slug) || null;
      const data = r && (r.data || null);
      if (data && Object.keys(data).length) return data;
    } catch (err) { /* collection absente : on essaie la suivante */ }
  }
  return null;
}

/* ------------------------------------------------------------------------- */
/* Composants de blocs : un par type                                         */
/* Chaque composant reçoit { b, i, ctx } : b = le bloc, i = son rang,        */
/* ctx = { getAsset, getCollection, fieldsMetaData, langue, etapes4d }.      */
/* ------------------------------------------------------------------------- */

// Surtitre, titre (accent) et sous-titre communs à beaucoup de blocs.
function entete(b, p) {
  return [
    b.surtitre && el('p', Object.assign({ className: 'eyebrow' }, cle(p + '.surtitre')), b.surtitre),
    el('h2', Object.assign({ className: 'sec-titre' }, cle(p + '.titre')), accent(b.titre)),
    b.sous_titre && el('p', Object.assign({ className: 'sec-sous' }, cle(p + '.sous_titre')), b.sous_titre),
  ];
}

// Enveloppe de carrousel (macro carrousel de sections.njk), sans son script.
function carrousel(libelle, variante, enfants) {
  return el('div', { className: 'carrousel ' + variante, 'data-carrousel': '', 'data-carrousel-auto': 'off', 'aria-label': libelle },
    el('div', { className: 'car-piste', tabIndex: 0, role: 'group', 'aria-label': libelle + ', faites défiler' }, enfants),
    el('div', { className: 'car-dots' }));
}

function BlocHero({ b, i, ctx }) {
  const p = 'blocs.' + i;
  const bp = b.bouton_principal || {};
  const bs = b.bouton_secondaire || {};
  const encart = b.encart || {};
  return el('div', { className: 'hero sur-sombre' },
    el('div', { className: 'container' },
      el('div', { className: 'hero-grille' },
        el('div', null,
          el('h1', Object.assign({ className: 'surtitre' }, cle(p + '.titre_page')), b.titre_page),
          el('p', Object.assign({ className: 'hero-accroche' }, cle(p + '.accroche')), accent(b.accroche)),
          b.chapo && el('p', Object.assign({ className: 'chapo' }, cle(p + '.chapo')), b.chapo),
          el('div', { className: 'hero-cta' },
            el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(bp.lien, '#contact'), cle(p + '.bouton_principal.texte')), bp.texte),
            bs.texte && el('a', Object.assign({ className: 'btn btn-ghost' }, propsLien(bs.lien, '/references/'), cle(p + '.bouton_secondaire.texte')), bs.texte)),
          b.note && el('p', Object.assign({ className: 'hero-note' }, cle(p + '.note')), b.note)),
        encart.afficher && el('div', { className: 'hero-visuel', 'aria-hidden': 'true' },
          el('div', { className: 'fenetre' },
            el('span', cle(p + '.encart.titre'), encart.titre), el('br'),
            tableau(encart.lignes).map((l, j) => [
              el('i', cle(p + '.encart.lignes.' + j + '.cle'), l.cle), ' : ',
              el('span', cle(p + '.encart.lignes.' + j + '.valeur'), l.valeur), el('br'),
            ])),
          el('div', { className: 'badge-projet' },
            el('span', cle(p + '.encart.badge'), encart.badge),
            el('b', cle(p + '.encart.badge_note'), encart.badge_note))))),
    // État statique : le plan rouge et la frise 4D, sans le WebGL de hero-signal.js.
    el('div', { className: 'hero-plan-zone' },
      svg({ className: 'hero-plan', viewBox: '0 0 1440 280', preserveAspectRatio: 'xMaxYMax meet', 'aria-hidden': 'true', focusable: 'false' }, [
        ['rect', { x: '-6000', y: '200', width: '6001', height: '80', fill: '#ED203D' }],
        ['path', { d: 'M0 280V200H520L560 160H800L840 120H1080L1120 80H1440V280Z', fill: '#ED203D' }],
        ['path', { d: 'M1320 65L1335 80L1320 95L1305 80Z', fill: '#FFFFFF' }],
      ]),
      svg({ className: 'hero-plan--m', viewBox: '0 0 390 170', preserveAspectRatio: 'xMaxYMax meet', 'aria-hidden': 'true', focusable: 'false' }, [
        ['rect', { x: '-3000', y: '110', width: '3001', height: '60', fill: '#ED203D' }],
        ['path', { d: 'M0 170V110H180L220 70H390V170Z', fill: '#ED203D' }],
        ['path', { d: 'M320 55L335 70L320 85L305 70Z', fill: '#FFFFFF' }],
      ]),
      // Étapes reprises du premier bloc methode_4d de la page (même masqué).
      el('ol', { className: 'hero-4d', 'aria-hidden': 'true' },
        ctx.etapes4d.etapes.map((e, j) => el('li', cle('blocs.' + ctx.etapes4d.rang + '.etapes.' + j + '.phase'),
          el('span', null, e.numero), e.phase)))));
}

function BlocLogosClients({ b, i, ctx }) {
  const p = 'blocs.' + i;
  // Les noms viennent des réglages du site (contenu partagé, hors de cette page).
  const essais = ctx.langue === 'en'
    ? [['pages', 'en_site'], ['reglages', 'site_en'], ['reglages_en', 'site']]
    : [['pages', 'site'], ['reglages', 'site'], ['reglages_fr', 'site']];
  return chargeur({
    cleCache: 'site:' + ctx.langue,
    charger: () => premiereEntree(ctx.getCollection, essais),
    rendu: (site) => {
      const intro = texte(site && site.clients_intro).replace(' :', '').replace(':', '');
      const clients = tableau(site && site.clients);
      return el('section', { className: 'confiance', 'aria-labelledby': 'confiance-titre' },
        el('div', { className: 'container confiance-grille' },
          el('h2', Object.assign({ className: 'confiance-titre', id: 'confiance-titre' }, cle(p + '.titre')),
            b.titre || intro || 'Ils nous confient leur métier'),
          clients.length
            ? el('ul', { className: 'confiance-noms' }, clients.map((c) => el('li', null,
                c.url ? el('a', propsLien(c.url), c.nom) : el('span', null, c.nom))))
            : el('p', { className: 'apercu-info' }, 'Les noms des clients viennent des réglages du site (contenu partagé) : ils s’afficheront ici sur le site publié.')));
    },
  });
}

// Pictos, étiquettes et familles d'offre (cartes_offres.njk).
const OFFRES = {
  build: { picto: [['path', { d: 'M8 6L3 12L8 18M16 6L21 12L16 18' }], ['path', { d: 'M13.5 4L10.5 20' }]], etiquette: '4SH Build', famille: 'famille-build' },
  run: { picto: [['path', { d: 'M4 4H18L20 6V10H4Z' }], ['path', { d: 'M4 14H18L20 16V20H4Z' }], ['path', { d: 'M7 7H10M7 17H10' }]], etiquette: '4SH Run', famille: 'famille-run' },
  learning: { picto: [['path', { d: 'M3 5H10L12 7L14 5H21V19H14L12 21L10 19H3Z' }], ['path', { d: 'M12 7V21' }]], etiquette: '4SH Learning', famille: 'famille-formation' },
  institutionnel: { picto: [['path', { d: 'M8 6L3 12L8 18M16 6L21 12L16 18' }], ['path', { d: 'M13.5 4L10.5 20' }]], etiquette: '4SH', famille: '' },
};

function BlocCartesOffres({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', { className: 'fond-doux' },
    el('div', { className: 'container' },
      entete(b, p),
      el('div', { className: 'portes' },
        tableau(b.cartes).map((c, j) => {
          const pc = p + '.cartes.' + j;
          const o = OFFRES[c.offre] || OFFRES.institutionnel;
          const bas = c.lien_bas || {};
          return el('article', { className: 'porte' + (o.famille ? ' ' + o.famille : '') },
            el('div', Object.assign({ className: 'pictos' }, cle(pc + '.offre')),
              svg({ viewBox: '0 0 24 24', fill: 'none', stroke: '#14171C', strokeWidth: '1.5', strokeLinejoin: 'miter', 'aria-hidden': 'true', focusable: 'false' }, o.picto),
              el('span', { className: 'offre' }, o.etiquette)),
            el('h3', cle(pc + '.titre'), c.titre),
            el('p', cle(pc + '.texte'), c.texte),
            el('ul', null, tableau(c.liens).map((l, k) => el('li', null,
              el('a', Object.assign(propsLien(l.lien), cle(pc + '.liens.' + k + '.texte')), l.texte)))),
            bas.texte && el('a', Object.assign({ className: 'suite' }, propsLien(bas.lien), cle(pc + '.lien_bas.texte')), bas.texte));
        }))));
}

function BlocChiffresCles({ b, i }) {
  const p = 'blocs.' + i;
  return el('div', { className: 'chiffres' },
    el('div', { className: 'container' },
      tableau(b.chiffres).map((c, j) => {
        const pc = p + '.chiffres.' + j;
        return el('div', null,
          el('b', cle(pc + '.valeur'), el('i', null, c.valeur)),
          el('span', cle(pc + '.texte'), c.texte),
          c.note && el('small', cle(pc + '.note'), c.note));
      })));
}

function BlocCartesSecteurs({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', null,
    el('div', { className: 'container' },
      entete(b, p),
      carrousel('Secteurs', 'car--secteurs', tableau(b.cartes).map((s, j) => {
        const ps = p + '.cartes.' + j;
        const l = s.lien || {};
        return el('div', { className: 'secteur-carte' },
          el('h3', cle(ps + '.titre'), s.titre),
          s.texte && el('p', cle(ps + '.texte'), s.texte),
          l.texte && el('a', Object.assign(propsLien(l.lien), cle(ps + '.lien.texte')), l.texte));
      }))));
}

function BlocMethode4d({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', { className: 'section-sombre' },
    el('div', { className: 'container' },
      entete(b, p),
      svg({ className: 'trace-4d', viewBox: '0 0 1280 120', 'aria-hidden': 'true', focusable: 'false' }, [
        ['path', { d: 'M0 110H280L310 80H600L630 50H920L950 20H1240', fill: 'none', stroke: '#14171C', strokeWidth: '2' }],
        ['path', { d: 'M1240 9L1251 20L1240 31L1229 20Z', fill: '#ED203D' }],
      ]),
      // frise_etapes de sections.njk (numero vers .num, phase vers .num-label).
      el('div', { className: 'etapes' },
        tableau(b.etapes).map((e, j) => {
          const pe = p + '.etapes.' + j;
          return el('div', { className: 'etape' },
            el('span', Object.assign({ className: 'num' }, cle(pe + '.numero')), e.numero),
            el('span', Object.assign({ className: 'num-label' }, cle(pe + '.phase')), e.phase),
            el('h3', cle(pe + '.titre'), e.titre),
            el('p', cle(pe + '.texte'), e.texte));
        }))));
}

// Citation et auteur d'un témoignage relié (valeur du champ = slug).
function citationTemoignage(slug, chemin, ctx) {
  if (!slug) return null;
  const rendu = (t) => {
    if (!t || !t.citation) {
      return el('p', Object.assign({ className: 'apercu-info' }, cle(chemin)),
        'Témoignage relié : « ' + slug + ' » (citation affichée sur le site publié).');
    }
    return [
      el('blockquote', cle(chemin), t.citation),
      t.auteur && el('p', Object.assign({ className: 'auteur' }, cle(chemin)),
        [t.auteur, t.fonction, t.entreprise].filter((x) => texte(x).trim()).join(', ')),
    ];
  };
  // 1. Données déjà fournies par le widget relation (fieldsMetaData).
  const fm = ctx.fieldsMetaData;
  if (fm && typeof fm.getIn === 'function') {
    for (const coll of NOMS_TEMOIGNAGES) {
      for (const base of [['temoignage'], ['projets', 'temoignage'], ['blocs', 'projets', 'temoignage']]) {
        const t = versJS(fm.getIn(base.concat([coll, slug])));
        if (t && t.citation) return rendu(t);
      }
    }
  }
  // 2. Sinon, lecture de la collection témoignages de la même langue.
  const essais = [['temoignages', slug], ['temoignages_' + ctx.langue, slug]];
  return chargeur({
    cleCache: 'temoignage:' + ctx.langue + ':' + slug,
    charger: () => premiereEntree(ctx.getCollection, essais),
    rendu,
  });
}

function BlocProjets({ b, i, ctx }) {
  const p = 'blocs.' + i;
  const bas = b.bouton_bas || {};
  return el('section', { className: 'fond-doux' },
    el('div', { className: 'container' },
      entete(b, p),
      carrousel('Réalisations', 'car--real', tableau(b.projets).map((r, j) => {
        const pr = p + '.projets.' + j;
        const img = r.image || {};
        const bouton = r.bouton || {};
        return el('div', { className: 'cas' + (img.fichier ? ' cas--image' : '') },
          el('figure', { className: 'cas-visuel' },
            img.fichier && imageSite(img, pr + '.image', ctx.getAsset),
            el('figcaption', null,
              el('span', Object.assign({ className: 'secteur' }, cle(pr + '.secteur')), r.secteur),
              el('span', Object.assign({ className: 'logo-client' }, cle(pr + '.client')), r.client))),
          el('div', { className: 'cas-corps' },
            alerteAlt(img, pr + '.image'),
            citationTemoignage(r.temoignage, pr + '.temoignage', ctx),
            r.description && el('p', Object.assign({ className: 'cas-desc' }, cle(pr + '.description')), r.description),
            el('div', { className: 'cas-chiffre' },
              tableau(r.chiffres).map((ch, k) => el('div', null,
                el('b', cle(pr + '.chiffres.' + k + '.valeur'), accent(ch.valeur)),
                el('span', cle(pr + '.chiffres.' + k + '.libelle'), ch.libelle)))),
            bouton.texte && el('a', Object.assign({ className: 'btn btn-ghost btn-sm' }, propsLien(bouton.lien), cle(pr + '.bouton.texte')), bouton.texte)));
      })),
      bas.texte && el('div', { className: 'centre', style: { marginTop: '28px' } },
        el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(bas.lien, '/references/'), cle(p + '.bouton_bas.texte')), bas.texte))));
}

function BlocTechnologies({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', null,
    el('div', { className: 'container' },
      entete(b, p),
      el('div', { className: 'techno-nuage' },
        tableau(b.technos).map((t, j) => el('a', Object.assign({ className: 'techno-tag' }, propsLien(t.lien), cle(p + '.technos.' + j + '.nom')), t.nom)))));
}

function BlocFaq({ b, i }) {
  const p = 'blocs.' + i;
  // Le JSON-LD FAQPage du site n'a pas d'intérêt dans l'aperçu : omis.
  return el('section', { style: { paddingTop: 0 } },
    el('div', { className: 'container' },
      el('h2', Object.assign({ className: 'sec-titre centre', style: { textAlign: 'center' } }, cle(p + '.titre')), b.titre),
      b.sous_titre && el('p', Object.assign({ className: 'sec-sous', style: { margin: '0 auto 38px', textAlign: 'center' } }, cle(p + '.sous_titre')), b.sous_titre),
      el('div', { className: 'faq' },
        tableau(b.questions).map((q, j) => el('details', j === 0 ? { open: true } : null,
          el('summary', cle(p + '.questions.' + j + '.question'), q.question),
          el('p', cle(p + '.questions.' + j + '.reponse'), q.reponse))))));
}

function BlocDerniersArticles({ b, i }) {
  const p = 'blocs.' + i;
  const tout = b.lien_tout || {};
  // Les articles sont récupérés au build : l'aperçu montre des cartes témoins.
  const temoin = (n) => el('article', { className: 'blog-carte' },
    el('span', { className: 'blog-carte-lien' },
      el('span', { className: 'blog-corps' },
        el('span', { className: 'blog-cat' }, 'Blog'),
        el('span', { className: 'blog-titre' }, 'Article ' + n + ' du blog'),
        el('span', { className: 'blog-meta' }, 'Récupéré automatiquement à la publication'))));
  return el('section', { className: 'blog-accueil' },
    el('div', { className: 'container' },
      el('div', { className: 'blog-tete' },
        el('h2', Object.assign({ className: 'sec-titre' }, cle(p + '.titre')), accent(b.titre || 'Nos derniers *articles*')),
        el('a', Object.assign({ className: 'blog-tout' }, propsLien(tout.lien, 'https://blog.4sh.fr/'), cle(p + '.lien_tout.texte')), tout.texte || 'Tout le blog')),
      el('p', { className: 'apercu-info' }, 'Les articles affichés sont les derniers du blog, récupérés au moment de la publication. Sans article, le bloc n’apparaît pas.'),
      el('div', { className: 'blog-grille' }, [1, 2, 3].map(temoin))));
}

function BlocEquipe({ b, i, ctx }) {
  const p = 'blocs.' + i;
  const photo = b.photo || {};
  const bouton = b.bouton || {};
  return el('section', { className: 'equipe' },
    el('div', { className: 'container equipe-grille' },
      photo.fichier && el('figure', { className: 'equipe-photo' },
        imageSite(photo, p + '.photo', ctx.getAsset, { width: '1360', height: '583' })),
      el('div', { className: 'equipe-texte' },
        alerteAlt(photo, p + '.photo'),
        b.surtitre && el('p', Object.assign({ className: 'eyebrow' }, cle(p + '.surtitre')), b.surtitre),
        el('h2', Object.assign({ className: 'sec-titre' }, cle(p + '.titre')), accent(b.titre)),
        b.texte && el('p', Object.assign({ className: 'sec-sous' }, cle(p + '.texte')), b.texte),
        el('a', Object.assign({ className: 'btn btn-ghost' }, propsLien(bouton.lien, '/notre-entreprise/'), cle(p + '.bouton.texte')), bouton.texte || 'Notre entreprise'))));
}

const COMPOSANTS = {
  hero: BlocHero,
  logos_clients: BlocLogosClients,
  cartes_offres: BlocCartesOffres,
  chiffres_cles: BlocChiffresCles,
  cartes_secteurs: BlocCartesSecteurs,
  methode_4d: BlocMethode4d,
  projets: BlocProjets,
  technologies: BlocTechnologies,
  faq: BlocFaq,
  derniers_articles: BlocDerniersArticles,
  equipe: BlocEquipe,
};

/* ------------------------------------------------------------------------- */
/* Rendu de la liste des blocs et gabarits                                   */
/* ------------------------------------------------------------------------- */

// Rend la liste « blocs » dans l'ordre. Un bloc masqué est remplacé par une
// fine mention cliquable pour que le contributeur le retrouve.
export function rendreBlocs(blocs, ctxBase) {
  const liste = tableau(blocs);
  const rang4d = liste.findIndex((b) => b && b.type === 'methode_4d');
  const ctx = Object.assign({}, ctxBase, {
    etapes4d: { rang: rang4d, etapes: rang4d >= 0 ? tableau(liste[rang4d].etapes) : [] },
  });
  return liste.map((b, i) => {
    if (!b) return null;
    const libelle = LIBELLES[b.type] || b.type || 'type inconnu';
    if (b.masquer) {
      return el('p', Object.assign({ className: 'apercu-masque' }, cle('blocs.' + i + '.masquer')), 'Bloc masqué : ' + libelle);
    }
    const Composant = COMPOSANTS[b.type];
    if (!Composant) return el('p', { className: 'apercu-alerte' }, 'Bloc inconnu : ' + libelle);
    try {
      return Composant({ b, i, ctx });
    } catch (err) {
      // Un bloc en cours de saisie ne doit jamais casser tout l'aperçu.
      return el('p', { className: 'apercu-alerte' }, 'Aperçu indisponible pour le bloc « ' + libelle + ' » : ' + err.message);
    }
  });
}

// Gabarit de la page d'accueil : { seo, blocs }.
export function ApercuAccueil(props) {
  const data = lireDonnees(props.entry);
  const seo = data.seo || {};
  const ctx = {
    getAsset: props.getAsset,
    getCollection: props.getCollection,
    fieldsMetaData: props.fieldsMetaData,
    langue: langueDe(props.entry),
  };
  return el('div', { className: 'apercu-accueil' },
    // Rappel SEO (absent de la page, mais utile au contributeur).
    el('div', { className: 'apercu-seo' },
      // Titre de la page (pages de démonstration ; absent de l'accueil).
      data.titre !== undefined && el('p', cle('titre'), el('b', null, 'Titre de la page : '), data.titre || '(vide)'),
      el('p', cle('seo.meta_title'), el('b', null, 'Titre SEO : '), seo.meta_title || '(vide)'),
      el('p', cle('seo.meta_description'), el('b', null, 'Description SEO : '), seo.meta_description || '(vide)')),
    el('main', null, rendreBlocs(data.blocs, ctx)),
    el('p', { className: 'apercu-info', style: { margin: '24px 16px' } },
      'Le formulaire de contact est ajouté automatiquement en fin de page.'));
}

// Gabarit d'un témoignage : rendu dans une carte de réalisation, comme sur le site.
export function ApercuTemoignage(props) {
  const t = lireDonnees(props.entry);
  const auteur = [t.auteur, t.fonction, t.entreprise].filter((x) => texte(x).trim()).join(', ');
  return el('section', { className: 'fond-doux' },
    el('div', { className: 'container' },
      el('div', { className: 'cas', style: { maxWidth: '560px' } },
        el('div', { className: 'cas-corps' },
          el('blockquote', cle('citation'), t.citation || '(citation vide)'),
          el('p', { className: 'auteur' },
            el('span', cle('auteur'), auteur || '(nom vide)'))))));
}

/* ------------------------------------------------------------------------- */
/* Enregistrement auprès du CMS                                              */
/* ------------------------------------------------------------------------- */

function enregistrer(CMS) {
  FEUILLES_SITE.forEach((f) => CMS.registerPreviewStyle(f));
  CMS.registerPreviewStyle(STYLES_APERCU, { raw: true });
  NOMS_ACCUEIL.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuAccueil));
  NOMS_PAGES_BLOCS.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuAccueil));
  NOMS_TEMOIGNAGES.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuTemoignage));
}

// Le CMS peut ne pas être encore défini à l'exécution du module (script
// chargé en parallèle) : on attend jusqu'à 10 secondes.
(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus.js : CMS introuvable, aperçus non enregistrés.');
  setTimeout(() => attendreCMS(essai + 1), 100);
})(0);
