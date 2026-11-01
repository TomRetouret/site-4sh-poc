/*
 * Aperçu du bloc « cartes_texte » (Cartes de texte). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/cartes_texte.njk
 * Définition : admin/config/blocs/cartes_texte.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, accent, entete, propsLien, tableau, texte } = outils;

// Retour à la ligne saisi = nouvelle ligne (adresses), mot entre astérisques en rouge.
const lignes = (s) => texte(s).split('\n').map((l, k) => (k ? [el('br'), accent(l)] : accent(l)));

function CartesTexte({ b, i }) {
  const p = 'blocs.' + i;
  const sombre = b.fond === 'sombre';
  const colonnes = b.presentation === 'colonnes';
  const style = colonnes ? { fontSize: '15px', color: 'var(--texte-2)' } : { fontSize: '14.5px', color: sombre ? 'var(--sur-nuit)' : 'var(--texte-2)' };
  const cartes = tableau(b.cartes).map((c, j) => {
    const pc = p + '.cartes.' + j;
    const l = c.lien || {};
    return el('div', { className: colonnes ? 'col-carte' : 'socle-carte' },
      el('h3', cle(pc + '.titre'), c.titre),
      texte(c.texte) && el('p', Object.assign({ style }, cle(pc + '.texte')), lignes(c.texte)),
      texte(l.texte) && texte(l.lien) && el('a', Object.assign({ className: 'socle-lien' }, propsLien(l.lien), cle(pc + '.lien')), l.texte + ' →'));
  });
  const grille = !colonnes && ['2', '3', '4'].includes(b.colonnes) ? { style: { gridTemplateColumns: 'repeat(' + b.colonnes + ',1fr)' } } : {};
  return el('section', Object.assign(sombre ? { className: 'section-sombre sur-sombre' } : {}, b.sans_marge_haute ? { style: { paddingTop: 0 } } : {}),
    el('div', { className: 'container' },
      entete(b, p),
      el('div', Object.assign({ className: colonnes ? 'offres-liees' : 'socle' }, grille), cartes)));
}

enregistrerBloc('cartes_texte', CartesTexte, { libelle: 'Cartes de texte', feuille: '/assets/logiciel-metier.css' });
