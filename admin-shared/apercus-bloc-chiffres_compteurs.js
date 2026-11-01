/*
 * Aperçu du bloc « chiffres_compteurs » (Chiffres animés). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/chiffres_compteurs.njk
 * Définition : admin/config/blocs/chiffres_compteurs.yml. L'animation du compteur n'est pas jouée ici.
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, tableau } = outils;

function ChiffresCompteurs({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', { style: { padding: 0 } },
    el('div', { className: 'chiffres' },
      el('div', { className: 'container' },
        tableau(b.chiffres).map((c, j) => {
          const pc = p + '.chiffres.' + j;
          return el('div', null,
            el('b', cle(pc + '.valeur'), c.valeur),
            el('span', cle(pc + '.texte'), c.texte),
            c.note && el('small', cle(pc + '.note'), c.note));
        }))));
}

enregistrerBloc('chiffres_compteurs', ChiffresCompteurs, { libelle: 'Chiffres animés' });
