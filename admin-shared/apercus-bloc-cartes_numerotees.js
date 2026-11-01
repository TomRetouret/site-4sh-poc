/*
 * Aperçu du bloc « cartes_numerotees » (Cartes numérotées). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/cartes_numerotees.njk (carte_atout de cartes.njk)
 * Définition : admin/config/blocs/cartes_numerotees.yml. Le carrousel est montré sans son défilement.
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, entete, tableau, texte } = outils;

function CartesNumerotees({ b, i }) {
  const p = 'blocs.' + i;
  const cartes = tableau(b.cartes).map((c, j) =>
    el('div', Object.assign({ className: 'atout' }, cle(p + '.cartes.' + j + '.titre')),
      el('span', { className: 'n' }, String(j + 1)), el('h3', null, c.titre), el('p', null, c.texte)));
  const libelle = b.surtitre || texte(b.titre).replace(/\*/g, '');
  const colonnes = ['2', '3', '4'].includes(b.colonnes) ? { gridTemplateColumns: 'repeat(' + b.colonnes + ',1fr)' } : null;
  return el('section', b.sans_marge_haute ? { style: { paddingTop: 0 } } : null,
    el('div', { className: 'container' },
      entete(b, p),
      b.affichage === 'carrousel'
        ? el('div', { className: 'carrousel car--blocs', 'aria-label': libelle },
            el('div', { className: 'car-piste', tabIndex: 0, role: 'group', 'aria-label': libelle + ', faites défiler' }, cartes),
            el('div', { className: 'car-dots' }))
        : el('div', Object.assign({ className: 'atouts' }, colonnes ? { style: colonnes } : {}), cartes)));
}

enregistrerBloc('cartes_numerotees', CartesNumerotees, { libelle: 'Cartes numérotées', feuille: '/assets/logiciel-metier.css' });
