/*
 * Aperçu du bloc « texte_image » (Texte et image). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/texte_image.njk
 * Définition : admin/config/blocs/texte_image.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, entete, texteRiche, propsSection, propsLien, imageSite, alerteAlt } = outils;

function BlocTexteImage({ b, i, ctx, serre }) {
  const p = 'blocs.' + i;
  const image = b.image || {};
  const bouton = b.bouton || {};
  return el('section', propsSection(serre, { className: 'bloc-ti' + (b.position_image === 'droite' ? ' bloc-ti--droite' : '') }),
    el('div', { className: 'container bloc-ti-grille' },
      image.fichier
        ? el('figure', { className: 'bloc-ti-image' },
          imageSite(image, p + '.image', ctx.getAsset),
          image.credit && el('figcaption', Object.assign({ className: 'bloc-credit' }, cle(p + '.image.credit')), image.credit))
        : el('p', Object.assign({ className: 'apercu-alerte' }, cle(p + '.image.fichier')), 'Image à choisir.'),
      el('div', { className: 'bloc-ti-texte' },
        alerteAlt(image, p + '.image'),
        entete({ surtitre: b.surtitre, titre: b.titre }, p),
        el('div', Object.assign({ className: 'prose' }, cle(p + '.texte')), texteRiche(b.texte)),
        bouton.texte && el('p', { className: 'bloc-ti-action' },
          el('a', Object.assign({ className: 'btn btn-ghost' }, propsLien(bouton.lien, '#contact'), cle(p + '.bouton.texte')), bouton.texte)))));
}

enregistrerBloc('texte_image', BlocTexteImage, { libelle: 'Texte et image', feuille: '/assets/blocs.css' });
