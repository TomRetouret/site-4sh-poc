/*
 * Aperçu du bloc « section_cartes » (Section en cartes). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/section_cartes.njk
 * Définition : admin/config/blocs/section_cartes.yml ; morceaux communs : apercus-prestations.js
 */
import { enregistrerBloc, outils } from './apercus.js';
import { section, grille, carte } from './apercus-prestations.js';

function SectionCartes({ b, i, ctx }) {
  const cartes = outils.tableau(b.cartes);
  return section({ b, i, ctx }, cartes.length > 0 && grille(cartes.map((e, k) => carte(e || {}, 'sect-defi', 'blocs.' + i + '.cartes.' + k)), ''));
}

enregistrerBloc('section_cartes', SectionCartes, { libelle: 'Section en cartes' });
