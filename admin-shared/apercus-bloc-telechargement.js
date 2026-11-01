/*
 * Aperçu du bloc « telechargement » (Téléchargement d'un document). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/telechargement.njk
 * Définition : admin/config/blocs/telechargement.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, accent, propsLien, texte } = outils;

// Même liste que le filtre formatFichier (eleventy/blocs.js).
const FORMATS = ['pdf', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'zip', 'txt'];
function formatFichier(adresse) {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(texte(adresse));
  return m && FORMATS.includes(m[1].toLowerCase()) ? m[1].toUpperCase() : '';
}

function BlocTelechargement({ b, i, serre }) {
  const p = 'blocs.' + i;
  if (!b.document) {
    return el('p', Object.assign({ className: 'apercu-alerte' }, cle(p + '.document')), 'Téléchargement : document à choisir (rien ne s’affiche sur le site sans document).');
  }
  const meta = [formatFichier(b.document), b.poids].filter((x) => texte(x).trim()).join(' · ');
  return el('section', Object.assign({ className: 'bloc-telechargement' }, serre ? { style: { paddingTop: 0 } } : {}),
    el('div', { className: 'container' },
      el('div', { className: 'bloc-tel-carte' },
        el('div', { className: 'bloc-tel-texte' },
          b.surtitre && el('p', Object.assign({ className: 'eyebrow' }, cle(p + '.surtitre')), b.surtitre),
          el('h2', Object.assign({ className: 'bloc-tel-titre' }, cle(p + '.titre')), accent(b.titre)),
          b.texte && el('p', cle(p + '.texte'), b.texte)),
        el('div', { className: 'bloc-tel-action' },
          el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(b.document), cle(p + '.bouton_texte')), b.bouton_texte || 'Télécharger le document'),
          meta && el('span', Object.assign({ className: 'bloc-tel-meta' }, cle(p + '.poids')), meta)))));
}

enregistrerBloc('telechargement', BlocTelechargement, { libelle: "Téléchargement d'un document", feuille: '/assets/blocs.css' });
