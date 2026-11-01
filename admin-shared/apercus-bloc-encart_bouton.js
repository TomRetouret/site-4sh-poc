/*
 * Aperçu du bloc « encart_bouton » (Encart avec bouton). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/encart_bouton.njk
 * Définition : admin/config/blocs/encart_bouton.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, accent, propsLien, texte } = outils;

function EncartBouton({ b, i }) {
  const p = 'blocs.' + i;
  const bt = b.bouton || {};
  const libre = b.presentation === 'libre';
  const bouton = texte(bt.texte) && el('a', Object.assign({ className: 'btn ' + (libre ? 'btn-ghost' : 'btn-primary') }, propsLien(bt.lien, '#contact'), cle(p + '.bouton')), bt.texte);
  return el('section', b.sans_marge_haute ? { style: { paddingTop: 0 } } : null,
    el('div', { className: 'container' },
      libre
        ? el('div', { className: 'sect-libre', style: { maxWidth: '820px' } },
            el('h2', Object.assign({ className: 'sec-titre' }, cle(p + '.titre')), accent(b.titre)),
            b.texte && el('p', Object.assign({ className: 'sec-sous' }, cle(p + '.texte')), b.texte),
            bouton && el('p', null, bouton))
        : el('div', { className: 'col-carte', style: { textAlign: 'center', padding: '48px 30px', background: 'var(--creme)' } },
            el('h2', Object.assign({ className: 'sec-titre', style: { marginBottom: '10px' } }, cle(p + '.titre')), accent(b.titre)),
            b.texte && el('p', Object.assign({ className: 'sec-sous', style: { margin: '0 auto 24px' } }, cle(p + '.texte')), b.texte),
            bouton)));
}

enregistrerBloc('encart_bouton', EncartBouton, { libelle: 'Encart avec bouton' });
