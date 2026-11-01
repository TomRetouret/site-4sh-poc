/*
 * Aperçus Sveltia : références (fiches études de cas, collection « references »).
 * Chargé par admin/index.html après apercus.js. Enregistre ses gabarits avec CMS.registerPreviewTemplate.
 *
 * Balisage de référence : src/_includes/reference.njk (rendu Eleventy), reproduit
 * classe par classe pour que les feuilles du site (styles.css, references.css)
 * s'appliquent. Spécification : docs/back-office/schema-references.md
 *
 * Conventions reprises de apercus.js (petits utilitaires recopiés ici pour que ce
 * fichier reste autonome) : h() global, données lues par entry.getIn(['data']),
 * data-key-path sur chaque élément éditable (un clic amène au champ dans Sveltia),
 * accent *mot*, getAsset pour les images, liens sans href.
 *
 * L'étude de cas est recomposée comme dans eleventy/references.js (filtre
 * etudeDeCas) : mêmes intertitres fixes, rubriques vides non affichées. Le Markdown
 * est rendu par un petit convertisseur local (paragraphes, listes, titres 2 et 3,
 * gras, italique, liens) : suffisant pour un aperçu, le site fait foi.
 */

/* ------------------------------------------------------------------------- */
/* Réglages                                                                  */
/* ------------------------------------------------------------------------- */

const NOMS_REFERENCES = ['references'];

const FEUILLES_REF = ['/assets/references.css'];

// Libellés de src/_data/libelles.json (reference.*), recopiés pour l'aperçu.
const LIB = {
  eyebrow: 'Réalisation',
  fil_parent: 'Nos réussites',
  telecharger: 'Télécharger la fiche',
  maj: 'Dernière mise à jour :',
  client: 'Client',
  secteur: 'Secteur',
  expertises: 'Nos expertises',
  technologies: 'Technologies',
  galerie: 'Galerie',
};

// Mêmes intertitres que eleventy/references.js.
const INTERTITRES = {
  entreprise: 'Entreprise et activité',
  missions: 'Nos missions',
  enjeux_objectifs: 'Enjeux & Objectifs',
  enjeux: 'Les enjeux',
  objectifs: 'Les objectifs',
  points_cles_defaut: "Les points clés de l'application",
  points_cles_projet: 'Les points clés du projet',
};

const STYLES_REF = `
.apercu-alerte,.apercu-info,.apercu-seo{font:600 13px/1.4 Asap,system-ui,sans-serif;box-sizing:border-box}
.apercu-info{margin:8px 0;padding:8px 12px;background:#eef3ff;color:#23324d;border-left:3px solid #4a6fd1}
.apercu-alerte{position:relative;z-index:5;margin:6px 0;padding:6px 10px;background:#fff4d6;color:#5c3d00;border-left:3px solid #e0a100}
.apercu-seo{padding:10px 16px;background:#14171C;color:#d8dbe0}
.apercu-seo b{color:#fff}
.apercu-seo p{margin:2px 0}
[data-key-path]{cursor:pointer}
[data-key-path]:focus-visible{outline:2px dashed #ED203D;outline-offset:3px}
`;

/* ------------------------------------------------------------------------- */
/* Outils (recopiés de apercus.js)                                           */
/* ------------------------------------------------------------------------- */

function obtenirH() {
  const w = typeof window !== 'undefined' ? window : globalThis;
  const h = w.h || w.createElement || (w.CMS && w.CMS.React && w.CMS.React.createElement) || (w.React && w.React.createElement);
  if (typeof h !== 'function') throw new Error('apercus-references.js : h() introuvable (window.h)');
  return h;
}

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

function versJS(v) {
  return v && typeof v.toJS === 'function' ? v.toJS() : v;
}

function lireDonnees(entry) {
  if (!entry) return {};
  if (typeof entry.getIn === 'function') return versJS(entry.getIn(['data'])) || {};
  return versJS(entry.data) || {};
}

function cle(chemin) {
  return { 'data-key-path': chemin, tabIndex: 0 };
}

const tableau = (v) => (Array.isArray(v) ? v : []);
const texte = (v) => (v === null || v === undefined ? '' : String(v));
const plein = (v) => texte(v).trim() !== '';

function accent(s) {
  const morceaux = [];
  const re = /\*([^*\n]+)\*/g;
  const ligne = texte(s);
  let dernier = 0;
  let m;
  while ((m = re.exec(ligne))) {
    morceaux.push(ligne.slice(dernier, m.index));
    morceaux.push(el('em', { className: 'accent' }, m[1]));
    dernier = re.lastIndex;
  }
  morceaux.push(ligne.slice(dernier));
  return morceaux;
}

function propsLien(destination) {
  const cible = texte(destination);
  return { title: cible ? 'Destination : ' + cible : 'Destination non renseignée' };
}

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

function alerte(chemin, message) {
  return el('p', Object.assign({ className: 'apercu-alerte', role: 'note' }, chemin ? cle(chemin) : {}), message);
}

// Date de mise à jour : AAAA-MM-JJ (ou objet Date) vers JJ/MM/AAAA, comme le filtre dateMaj.
function dateMaj(v) {
  if (v instanceof Date && !isNaN(v)) {
    const p = (n) => String(n).padStart(2, '0');
    return `${p(v.getUTCDate())}/${p(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`;
  }
  const m = texte(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : texte(v);
}

/* ------------------------------------------------------------------------- */
/* Petit rendu Markdown (aperçu seulement)                                   */
/* ------------------------------------------------------------------------- */

function enLigne(s) {
  const sortie = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_|\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g;
  let dernier = 0;
  let m;
  while ((m = re.exec(s))) {
    sortie.push(s.slice(dernier, m.index));
    if (m[1]) sortie.push(el('strong', null, m[1]));
    else if (m[2] || m[3]) sortie.push(el('em', null, m[2] || m[3]));
    else sortie.push(el('a', propsLien(m[5]), m[4]));
    dernier = re.lastIndex;
  }
  sortie.push(s.slice(dernier));
  return sortie;
}

function markdown(src) {
  const blocs = [];
  let para = [];
  let liste = null;
  const finirPara = () => { if (para.length) blocs.push(el('p', null, enLigne(para.join(' ')))); para = []; };
  const finirListe = () => { if (liste) blocs.push(el(liste.type, null, liste.items.map((t) => el('li', null, enLigne(t))))); liste = null; };
  texte(src).replace(/\r\n/g, '\n').split('\n').forEach((l) => {
    let m;
    if (!l.trim()) { finirPara(); finirListe(); return; }
    if ((m = l.match(/^(#{2,4})\s+(.*)$/))) { finirPara(); finirListe(); blocs.push(el('h' + m[1].length, null, enLigne(m[2]))); return; }
    if ((m = l.match(/^\s*[-*+]\s+(.*)$/)) || (m = l.match(/^\s*\d+[.)]\s+(.*)$/))) {
      finirPara();
      const type = /^\s*\d/.test(l) ? 'ol' : 'ul';
      if (!liste || liste.type !== type) { finirListe(); liste = { type, items: [] }; }
      liste.items.push(m[1]);
      return;
    }
    if (liste && /^\s{2,}\S/.test(l)) { liste.items[liste.items.length - 1] += ' ' + l.trim(); return; }
    finirListe();
    para.push(l.trim());
  });
  finirPara();
  finirListe();
  return blocs;
}

/* ------------------------------------------------------------------------- */
/* Étude de cas                                                              */
/* ------------------------------------------------------------------------- */

function etudeDeCas(e) {
  const eo = e.enjeux_objectifs || {};
  const pc = e.points_cles || {};
  const sortie = [];
  const rubrique = (chemin, titre, corps) => el('div', cle(chemin), el('h2', null, titre), markdown(corps));
  if (plein(e.entreprise)) sortie.push(rubrique('etude.entreprise', INTERTITRES.entreprise, e.entreprise));
  if (plein(e.missions)) sortie.push(rubrique('etude.missions', INTERTITRES.missions, e.missions));
  if (plein(eo.intro) || plein(eo.enjeux) || plein(eo.objectifs)) {
    sortie.push(el('div', cle('etude.enjeux_objectifs'),
      el('h2', null, INTERTITRES.enjeux_objectifs),
      plein(eo.intro) ? el('div', cle('etude.enjeux_objectifs.intro'), markdown(eo.intro)) : null,
      plein(eo.enjeux) ? el('div', cle('etude.enjeux_objectifs.enjeux'), el('h3', null, INTERTITRES.enjeux), markdown(eo.enjeux)) : null,
      plein(eo.objectifs) ? el('div', cle('etude.enjeux_objectifs.objectifs'), el('h3', null, INTERTITRES.objectifs), markdown(eo.objectifs)) : null));
  }
  if (plein(pc.texte)) sortie.push(rubrique('etude.points_cles.texte', pc.intertitre || INTERTITRES.points_cles_defaut, pc.texte));
  if (plein(pc.projet)) sortie.push(rubrique('etude.points_cles.projet', INTERTITRES.points_cles_projet, pc.projet));
  if (plein(e.complements)) sortie.push(el('div', cle('etude.complements'), markdown(e.complements)));
  return sortie;
}

// Rubriques vides : signalées (elles ne s'affichent pas sur le site).
function alertesEtude(e) {
  const eo = e.enjeux_objectifs || {};
  const pc = e.points_cles || {};
  const vides = [];
  if (!plein(e.entreprise)) vides.push(['etude.entreprise', 'Entreprise et activité']);
  if (!plein(e.missions)) vides.push(['etude.missions', 'Nos missions']);
  if (!plein(eo.enjeux) && !plein(eo.objectifs)) vides.push(['etude.enjeux_objectifs.enjeux', 'Enjeux et objectifs']);
  if (!plein(pc.texte)) vides.push(['etude.points_cles.texte', 'Points clés']);
  if (!vides.length) return null;
  return alerte(vides[0][0], 'Rubrique vide, non affichée sur le site : ' + vides.map((v) => v[1]).join(', ') + '.');
}

/* ------------------------------------------------------------------------- */
/* Gabarit de la fiche                                                       */
/* ------------------------------------------------------------------------- */

function ApercuReference(props) {
  const d = lireDonnees(props.entry);
  const getAsset = props.getAsset;
  const secteurs = tableau(d.secteurs);
  const technologies = tableau(d.technologies);
  const expertises = tableau(d.expertises);
  const stats = tableau(d.stats);
  const galerie = tableau(d.galerie);
  const etude = d.etude || {};
  const seo = d.referencement || {};
  const majTexte = d.maj ? dateMaj(d.maj) : texte(d.maj_repli);
  const chapo = plein(d.sous_titre) ? d.sous_titre : d.resume;
  const altVisuel = d.image_decorative ? '' : texte(d.image_alt);

  const boutonPdf = (classe, style) => el('a', Object.assign({ className: 'btn ' + classe + ' btn-sm', style }, propsLien(d.fiche_pdf), cle('fiche_pdf')), LIB.telecharger);

  return el('div', null,
    el('div', { className: 'apercu-seo' },
      el('p', cle('referencement.meta_title'), el('b', null, 'Titre Google : '), texte(seo.meta_title) || `${texte(d.titre)} - Référence 4SH`),
      el('p', cle('referencement.meta_description'), el('b', null, 'Description Google : '), texte(seo.meta_description) || texte(d.sous_titre) || texte(d.resume)),
      seo.indexation === false ? el('p', cle('referencement.indexation'), el('b', null, 'Masquée des moteurs de recherche')) : null),

    el('section', { className: 'ref-detail' },
      el('div', { className: 'container' },
        el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" }, el('a', propsLien('/'), 'Accueil'), ' › ', el('a', propsLien('/references/'), LIB.fil_parent), ' › ', el('span', cle('titre'), texte(d.titre) || '(nom du projet)')),
        el('div', { className: 'ref-hero-detail' },
          el('div', null,
            el('span', Object.assign({ className: 'eyebrow' }, cle('secteurs')), LIB.eyebrow, secteurs.length ? ' · ' + secteurs[0] : ''),
            d.logo ? el('div', Object.assign({ className: 'ref-logo-detail' }, cle('logo')), el('img', { src: adresseImage(getAsset, d.logo), alt: texte(d.client), decoding: 'async' })) : alerte('logo', 'Logo du client manquant.'),
            el('h1', cle('h1'), accent(plein(d.h1) ? d.h1 : d.titre)),
            plein(chapo) ? el('p', Object.assign({ className: 'chapo' }, cle(plein(d.sous_titre) ? 'sous_titre' : 'resume')), chapo) : null,
            stats.length ? el('div', Object.assign({ className: 'ref-preuve' }, cle('stats')), stats.map((s, i) => el('div', Object.assign({ className: 'stat' }, cle('stats.' + i + '.chiffre')), el('b', null, texte(s.chiffre)), el('span', null, texte(s.label))))) : null,
            el('div', { className: 'ref-hero-actions' },
              d.fiche_pdf ? boutonPdf('btn-ghost') : null,
              majTexte ? el('span', Object.assign({ className: 'ref-maj' }, cle('maj')), LIB.maj, ' ', majTexte) : null),
            plein(d.maj_repli) ? alerte('maj_repli', 'Ancienne date à reprendre : « ' + texte(d.maj_repli) + ' ». Choisissez-la dans le sélecteur puis videz le champ de repli.') : null),
          el('div', Object.assign({ className: 'ref-hero-visuel' }, cle('image')),
            d.image
              ? el('img', { src: adresseImage(getAsset, d.image), alt: altVisuel, decoding: 'async' })
              : el('div', { className: 'ref-visuel ref-visuel--vide', style: { aspectRatio: '4/3', borderRadius: 'var(--radius)' } }, el('span', { className: 'ref-vide-nom' }, texte(d.client))),
            d.image && !d.image_decorative && !plein(d.image_alt) ? alerte('image_alt', 'Texte alternatif manquant : décrivez l’image ou cochez « Visuel principal décoratif ».') : null)))),

    el('section', { style: { paddingTop: 0 } },
      el('div', { className: 'container' },
        el('div', { className: 'ref-fiche-grille' },
          el('div', { className: 'ref-corps' }, alertesEtude(etude), etudeDeCas(etude)),
          el('aside', { className: 'ref-identite' },
            plein(d.client) ? el('div', Object.assign({ className: 'bloc' }, cle('client')), el('b', null, LIB.client), el('span', null, d.client)) : null,
            secteurs.length ? el('div', Object.assign({ className: 'bloc' }, cle('secteurs')), el('b', null, LIB.secteur), el('div', { className: 'pills' }, secteurs.map((s) => el('span', null, s)))) : null,
            expertises.length ? el('div', Object.assign({ className: 'bloc' }, cle('expertises')), el('b', null, LIB.expertises), el('div', { className: 'pills' }, expertises.map((s) => el('span', null, s)))) : null,
            technologies.length ? el('div', Object.assign({ className: 'bloc' }, cle('technologies')), el('b', null, LIB.technologies), el('div', { className: 'pills' }, technologies.map((s) => el('span', null, s)))) : null,
            d.fiche_pdf ? el('div', { className: 'bloc' }, boutonPdf('btn-primary', { width: '100%', justifyContent: 'center' })) : null)),

        galerie.length ? el('div', { className: 'ref-galerie', id: 'galerie' },
          el('h2', null, LIB.galerie),
          el('div', { className: 'grille' }, galerie.map((g, i) => el('figure', cle('galerie.' + i + '.image'),
            el('img', { src: adresseImage(getAsset, g && g.image), alt: g && g.decorative ? '' : texte(g && g.alt), loading: 'lazy', decoding: 'async' }),
            g && g.image && !g.decorative && !plein(g.alt) ? alerte('galerie.' + i + '.alt', 'Texte alternatif manquant pour l’image ' + (i + 1) + '.') : null)))) : null,

        el('p', Object.assign({ className: 'apercu-info' }, cle('resume')), el('b', null, 'Carte de la page Nos réussites : '), texte(d.resume) || '(résumé vide)', d.ordre ? ' (position ' + d.ordre + ')' : ''))));
}

/* ------------------------------------------------------------------------- */
/* Enregistrement auprès du CMS                                              */
/* ------------------------------------------------------------------------- */

function enregistrer(CMS) {
  FEUILLES_REF.forEach((f) => CMS.registerPreviewStyle(f));
  CMS.registerPreviewStyle(STYLES_REF, { raw: true });
  NOMS_REFERENCES.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuReference));
}

(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus-references.js : CMS introuvable, aperçus non enregistrés.');
  setTimeout(() => attendreCMS(essai + 1), 100);
})(0);
