/*
 * Aperçus Sveltia : pages de prestation (collection dossier « pages_prestations »).
 * Chargé par admin/index.html après apercus.js. Enregistre son gabarit avec CMS.registerPreviewTemplate.
 *
 * Spécification : docs/back-office/schema-prestations.md
 * Balisage de référence : src/_includes/prestation.njk et les blocs section_* de
 * src/_includes/composants/blocs/ (morceaux communs : _section.njk).
 * Ce fichier exporte aussi les morceaux communs des aperçus de sections
 * (apercus-bloc-section_*.js), chargés à la demande par apercus.js.
 *
 * Calculés comme sur le site (filtre misePageSections) : fond alterné, temps fort sombre
 * (première section en étapes qui n'ouvre pas la page) et numéro des sections titrées.
 */
import { rendreBlocs, el, cle, propsLien, lireDonnees, outils } from './apercus.js';

const { accent, tableau, texte } = outils;
const FEUILLE = '/assets/secteurs.css';
const FAMILLES = { build: 'Concevoir & développer', run: 'Faire vivre & auditer' };
const NOMS = ['pages_prestations'];

// Fond et numéro de chaque bloc visible (null pour un bloc masqué).
export function misePage(blocs) {
  let rang = 0, sombre = false, n = 0;
  return tableau(blocs).map((b) => {
    if (!b || b.masquer || !/^[a-z][a-z0-9_]*$/.test(String(b.type))) return null;
    let fond = '';
    if (b.type === 'section_etapes' && !sombre && rang > 0) { fond = ' sect-bloc--sombre'; sombre = true; }
    else if (rang % 2 === 1) fond = ' sect-bloc--creme';
    rang += 1;
    const titre = texte(b.titre).trim() !== '';
    if (titre) n += 1;
    return { fond, numero: titre ? String(n).padStart(2, '0') : '' };
  });
}

// Markdown des sections : paragraphes, listes (classe sect-liste), gras, italique, liens.
function enLigne(s) {
  const morceaux = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_|\[([^\]]+)\]\(([^)\s]*)\)/g;
  let dernier = 0, m;
  while ((m = re.exec(s))) {
    morceaux.push(s.slice(dernier, m.index));
    if (m[1] !== undefined) morceaux.push(el('strong', null, m[1]));
    else if (m[2] !== undefined || m[3] !== undefined) morceaux.push(el('em', null, m[2] || m[3]));
    else morceaux.push(el('a', propsLien(m[5]), m[4]));
    dernier = re.lastIndex;
  }
  morceaux.push(s.slice(dernier));
  return morceaux;
}
export { enLigne };
export function mdSection(source) {
  const blocs = texte(source).replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocs.map((b) => {
    const lignes = b.split('\n');
    if (lignes.every((l) => /^\s*[-*+]\s+/.test(l))) return el('ul', { className: 'sect-liste' }, lignes.map((l) => el('li', null, enLigne(l.replace(/^\s*[-*+]\s+/, '')))));
    if (lignes.every((l) => /^\s*\d+[.)]\s+/.test(l))) return el('ol', { className: 'sect-liste' }, lignes.map((l) => el('li', null, enLigne(l.replace(/^\s*\d+[.)]\s+/, '')))));
    return el('p', null, enLigne(lignes.join(' ')));
  });
}

// Petit numéro, titre, introduction et boutons communs aux sections.
const mise = (ctx, i) => (ctx && ctx.misePrestation && ctx.misePrestation[i]) || { fond: '', numero: '' };
export function numero(ctx, i) {
  const m = mise(ctx, i);
  return m.numero && el('p', { className: 'eyebrow eyebrow--rang' }, m.numero);
}
export function titre(b, p) {
  return b.titre && el('h2', cle(p + '.titre'), enLigne(texte(b.titre)));
}
export function chapeau(b, p) {
  return texte(b.texte).trim() && el('div', Object.assign({ className: 'sect-prose' }, cle(p + '.texte')), mdSection(b.texte));
}
export function boutons(b, p) {
  const bs = tableau(b.boutons).map((x, k) => [x, k]).filter(([x]) => x && x.texte && x.lien);
  return bs.length > 0 && el('div', { className: 'hero-cta', style: { marginTop: '30px' } },
    bs.map(([x, k], j) => el('a', Object.assign({ className: 'btn ' + (j === 0 ? 'btn-primary' : 'btn-ghost') }, propsLien(x.lien), cle(p + '.boutons.' + k + '.texte')), x.texte)));
}
export function classeSection(ctx, i, extra) {
  return 'sect-bloc' + mise(ctx, i).fond + (extra || '');
}
// Section ordinaire : numéro, titre, introduction, contenu, boutons.
export function section({ b, i, ctx }, contenu) {
  const p = 'blocs.' + i;
  return el('section', { className: classeSection(ctx, i) },
    el('div', { className: 'container' }, numero(ctx, i), titre(b, p), chapeau(b, p), contenu, boutons(b, p)));
}
// Grille de cartes (carrousel à partir de 4 cartes, montré à plat dans l'aperçu).
export function grille(cartes, variante) {
  if (cartes.length >= 4) {
    return el('div', { className: 'carrousel car--blocs' + (variante === 'refs' ? ' car--refs' : ''), 'data-carrousel': '', 'data-carrousel-auto': 'off' },
      el('div', { className: 'car-piste', tabIndex: 0, role: 'group' }, cartes), el('div', { className: 'car-dots' }));
  }
  return el('div', { className: variante === 'refs' ? 'sect-refs-inline' : 'sect-defis' }, cartes);
}
// Carte ou atout : cliquable si une destination est remplie.
export function carte(e, classe, chemin) {
  if (e.lien) {
    return el('a', Object.assign({ className: classe + ' sect-defi--lien' }, propsLien(e.lien), cle(chemin + '.titre')),
      el('h3', null, enLigne(texte(e.titre))), el('span', { className: 'socle-lien' }, 'Découvrir →'));
  }
  return el('div', { className: classe },
    e.titre && el('h3', cle(chemin + '.titre'), enLigne(texte(e.titre))),
    el('div', Object.assign({ style: { display: 'contents' } }, cle(chemin + '.texte')), mdSection(e.texte)));
}

// Gabarit de la page : en-tête, chiffres, sections, références, questions fréquentes.
export function ApercuPrestation(props) {
  const d = lireDonnees(props.entry);
  const e = d.entete || {};
  const parent = e.parent || {};
  const bouton = e.bouton || {};
  const ref = d.referencement || {};
  const famille = FAMILLES[e.offre];
  const ctx = {
    getAsset: props.getAsset,
    getCollection: props.getCollection,
    fieldsMetaData: props.fieldsMetaData,
    langue: 'fr',
    misePrestation: misePage(d.blocs),
  };
  const faq = tableau(d.faq);
  return el('div', { className: 'apercu-prestation' + (famille ? ' famille-' + e.offre : '') },
    el('link', { rel: 'stylesheet', href: FEUILLE }),
    el('div', { className: 'apercu-seo' },
      el('p', cle('referencement.meta_title'), el('b', null, 'Titre SEO : '), ref.meta_title || (texte(d.titre) + ' - 4SH')),
      el('p', cle('referencement.meta_description'), el('b', null, 'Description SEO : '), ref.meta_description || e.chapo || '(vide)'),
      ref.indexation === false && el('p', cle('referencement.indexation'), el('b', null, 'Page masquée dans les moteurs de recherche.'))),
    el('section', { className: 'sect-hero' },
      el('div', { className: 'container' },
        el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" },
          el('a', propsLien('/'), 'Accueil'), ' › ',
          parent.texte && [el('a', Object.assign(propsLien(parent.lien), cle('entete.parent.texte')), parent.texte), ' › '],
          el('span', cle('titre'), texte(d.titre))),
        el('span', Object.assign({ className: 'eyebrow' + (famille ? ' eyebrow-offre' : '') }, cle('entete.offre')),
          famille && el('span', { className: 'barre', 'aria-hidden': 'true' }),
          famille ? '4SH ' + e.offre.charAt(0).toUpperCase() + e.offre.slice(1) + ' · ' + famille : 'Prestation'),
        el('h1', cle('entete.titre_h1'), accent(e.titre_h1 || d.titre)),
        e.chapo && el('p', Object.assign({ className: 'accroche' }, cle('entete.chapo')), e.chapo),
        el('div', { className: 'hero-cta' },
          el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(bouton.lien, '/contact/'), cle('entete.bouton.texte')), bouton.texte || 'Parlons de votre projet')))),
    tableau(d.chiffres).length > 0 && el('div', { className: 'ref-resultats' },
      el('div', { className: 'container' },
        el('div', { className: 'grille' }, tableau(d.chiffres).map((c, k) =>
          el('div', Object.assign({ className: 'stat' }, cle('chiffres.' + k + '.chiffre')), el('b', null, accent(c.chiffre)), el('span', null, c.label)))))),
    el('main', null, rendreBlocs(d.blocs, ctx)),
    tableau(d.references).length > 0 && el('p', Object.assign({ className: 'apercu-info', style: { margin: '24px 16px' } }, cle('references')),
      'Références en bas de page (sauf celles déjà reliées dans une section Projets) : ' + tableau(d.references).join(', ')),
    faq.length > 0 && el('section', { className: 'sect-bloc' },
      el('div', { className: 'container' },
        el('div', { className: 'sect-faq' },
          el('h2', null, 'Questions fréquentes'),
          el('div', { className: 'faq', style: { marginTop: '20px' } }, faq.map((q, k) =>
            el('details', { open: k === 0 },
              el('summary', cle('faq.' + k + '.question'), q.question),
              el('p', cle('faq.' + k + '.reponse'), q.reponse))))))),
    el('p', { className: 'apercu-info', style: { margin: '24px 16px' } },
      'Le formulaire de contact est ajouté automatiquement en fin de page.'));
}

function enregistrer(CMS) {
  NOMS.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuPrestation));
}

(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus-prestations.js : CMS introuvable, aperçus non enregistrés.');
  setTimeout(() => attendreCMS(essai + 1), 100);
})(0);
