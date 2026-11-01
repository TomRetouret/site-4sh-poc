/*
 * Aperçu du bloc « section_texte » (Section de texte). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/section_texte.njk
 * Définition : admin/config/blocs/section_texte.yml ; morceaux communs : apercus-prestations.js
 */
import { enregistrerBloc, outils } from './apercus.js';
import { numero, titre, chapeau, boutons, classeSection, section } from './apercus-prestations.js';

function SectionTexte({ b, i, ctx }) {
  const p = 'blocs.' + i;
  if (b.disposition === 'colonnes') {
    return outils.el('section', { className: classeSection(ctx, i) },
      outils.el('div', { className: 'container' },
        outils.el('div', { className: 'sect-duo' },
          outils.el('div', null, numero(ctx, i), titre(b, p)),
          outils.el('div', null, chapeau(b, p), boutons(b, p)))));
  }
  if (b.disposition === 'bandeau') {
    return outils.el('section', { className: classeSection(ctx, i, ' sect-bloc--cta') },
      outils.el('div', { className: 'container' }, titre(b, p), chapeau(b, p), boutons(b, p)));
  }
  return section({ b, i, ctx }, null);
}

enregistrerBloc('section_texte', SectionTexte, { libelle: 'Section de texte' });
