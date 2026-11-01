/*
 * Aperçus Sveltia : pages d'offre (Logiciel métier) et appels à l'action partagés.
 * Chargé par admin/index.html après apercus.js. Enregistre ses gabarits avec CMS.registerPreviewTemplate.
 *
 * Spécification : docs/back-office/schema-logiciel-metier.md
 * Balisage de référence : src/logiciel-metier.njk et les blocs de src/_includes/composants/blocs/
 * rendus avec le gabarit « offre ». Les blocs eux-mêmes sont dessinés par rendreBlocs() de apercus.js
 * (bibliothèque partagée) ; ce fichier n'ajoute que l'enveloppe de la page.
 *
 * Noms d'enregistrement : collection fichier « pages_offre », donc nom du FICHIER (« logiciel_metier ») ;
 * collection dossier « appels_action », donc nom de la collection.
 */
import { rendreBlocs, el, cle, propsLien, lireDonnees, chargeur, premiereEntree, FEUILLE_OFFRE } from './apercus.js';

// Fichiers de la collection « Pages d'offre » (à compléter quand une page d'offre est ajoutée).
const NOMS_PAGES_OFFRE = ['logiciel_metier'];
const NOMS_APPELS = ['appels_action'];

// Bouton flottant : appel à l'action partagé relié (texte et destination lus dans la collection).
function boutonFlottant(slug, ctx) {
  if (!slug) {
    return el('p', Object.assign({ className: 'apercu-info', style: { margin: '24px 16px' } }, cle('bouton_flottant')),
      'Pas de bouton flottant sur cette page.');
  }
  return chargeur({
    cleCache: 'appel:' + slug,
    charger: () => premiereEntree(ctx.getCollection, [['appels_action', slug]]),
    rendu: (a) => el('p', Object.assign({ className: 'apercu-info', style: { margin: '24px 16px' } }, cle('bouton_flottant')),
      'Bouton flottant (visible en bas d’écran sur mobile) : ',
      // Affiché ici dans le flux : la classe sticky-cta le fixerait hors de l'aperçu.
      el('a', Object.assign({ className: 'btn btn-primary btn-sm' }, propsLien(a && a.lien, '#contact')),
        (a && a.texte) || 'appel à l’action « ' + slug + ' »')),
  });
}

// Gabarit d'une page d'offre : { nom, bouton_flottant, seo, blocs }.
export function ApercuPageOffre(props) {
  const data = lireDonnees(props.entry);
  const seo = data.seo || {};
  const ctx = {
    getAsset: props.getAsset,
    getCollection: props.getCollection,
    fieldsMetaData: props.fieldsMetaData,
    langue: 'fr',
    gabarit: 'offre',
    filAriane: data.nom,
    cleFilAriane: 'nom',
  };
  return el('div', { className: 'apercu-page-offre' },
    // Feuille propre aux pages d'offre (extraCss de src/logiciel-metier.njk), limitée à cet aperçu.
    el('link', { rel: 'stylesheet', href: FEUILLE_OFFRE }),
    el('div', { className: 'apercu-seo' },
      el('p', cle('seo.meta_title'), el('b', null, 'Titre SEO : '), seo.meta_title || '(vide)'),
      el('p', cle('seo.meta_description'), el('b', null, 'Méta-description : '), seo.meta_description || '(vide)')),
    el('main', null, rendreBlocs(data.blocs, ctx)),
    el('p', { className: 'apercu-info', style: { margin: '24px 16px' } },
      'Le formulaire de contact est ajouté automatiquement en fin de page.'),
    boutonFlottant(data.bouton_flottant, ctx));
}

// Gabarit d'un appel à l'action : le bouton tel qu'il apparaît, et sa destination.
export function ApercuAppelAction(props) {
  const a = lireDonnees(props.entry);
  return el('section', null,
    el('div', { className: 'container', style: { textAlign: 'center' } },
      el('p', Object.assign({ className: 'apercu-info' }, cle('intitule')),
        'Intitulé interne (non affiché sur le site) : ' + (a.intitule || '(vide)')),
      el('div', { className: 'hero-cta', style: { justifyContent: 'center' } },
        el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(a.lien, '#contact'), cle('texte')), a.texte || '(texte vide)')),
      el('p', Object.assign({ className: 'apercu-info' }, cle('lien')), 'Destination : ' + (a.lien || '#contact'))));
}

function enregistrer(CMS) {
  NOMS_PAGES_OFFRE.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuPageOffre));
  NOMS_APPELS.forEach((nom) => CMS.registerPreviewTemplate(nom, ApercuAppelAction));
}

(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus-logiciel-metier.js : CMS introuvable, aperçus non enregistrés.');
  setTimeout(() => attendreCMS(essai + 1), 100);
})(0);
