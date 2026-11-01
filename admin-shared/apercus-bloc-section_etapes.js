/*
 * Aperçu du bloc « section_etapes » (Section en étapes). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/section_etapes.njk
 * Définition : admin/config/blocs/section_etapes.yml ; morceaux communs : apercus-prestations.js
 */
import { enregistrerBloc, outils } from './apercus.js';
import { section, enTitre, mdSection } from './apercus-prestations.js';

const { el, cle, tableau, texte } = outils;

function SectionEtapes({ b, i, ctx }) {
  const etapes = tableau(b.etapes);
  return section({ b, i, ctx }, etapes.length > 0 && el('div', { className: 'sect-etapes' },
    etapes.map((e, k) => {
      const c = 'blocs.' + i + '.etapes.' + k;
      return el('div', { className: 'sect-etape' },
        el('div', null,
          el('h3', cle(c + '.titre'), enTitre(texte((e || {}).titre))),
          el('div', Object.assign({ style: { display: 'contents' } }, cle(c + '.texte')), mdSection((e || {}).texte))));
    })));
}

enregistrerBloc('section_etapes', SectionEtapes, { libelle: 'Section en étapes' });
