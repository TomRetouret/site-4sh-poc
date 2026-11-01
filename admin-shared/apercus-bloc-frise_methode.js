/*
 * Aperçu du bloc « frise_methode » (Frise de méthode). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/frise_methode.njk (macro frise_etapes de sections.njk)
 * Définition : admin/config/blocs/frise_methode.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, entete, tableau } = outils;

function FriseMethode({ b, i }) {
  const p = 'blocs.' + i;
  return el('section', { className: 'section-sombre' },
    el('div', { className: 'container' },
      entete(b, p),
      el('div', { className: 'etapes' },
        tableau(b.etapes).map((e, j) => {
          const pe = p + '.etapes.' + j;
          return el('div', Object.assign({ className: 'etape' }, cle(pe + '.titre')),
            el('span', { className: 'num' }, e.numero),
            el('span', { className: 'num-label' }, e.phase),
            el('h3', null, e.titre),
            el('p', null, e.texte));
        }))));
}

enregistrerBloc('frise_methode', FriseMethode, { libelle: 'Frise de méthode' });
