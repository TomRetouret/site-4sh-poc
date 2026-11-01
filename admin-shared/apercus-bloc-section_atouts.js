/*
 * Aperçu du bloc « section_atouts » (Section d'atouts). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/section_atouts.njk
 * Définition : admin/config/blocs/section_atouts.yml ; morceaux communs : apercus-prestations.js
 */
import { enregistrerBloc, outils } from './apercus.js';
import { section, carte } from './apercus-prestations.js';

function SectionAtouts({ b, i, ctx }) {
  const atouts = outils.tableau(b.atouts);
  return section({ b, i, ctx }, atouts.length > 0 && outils.el('div', { className: 'sect-atouts' },
    atouts.map((e, k) => carte(e || {}, 'sect-atout', 'blocs.' + i + '.atouts.' + k))));
}

enregistrerBloc('section_atouts', SectionAtouts, { libelle: "Section d'atouts (deux colonnes)" });
