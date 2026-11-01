/*
 * Aperçu du bloc « image_pleine » (Image pleine largeur). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/image_pleine.njk
 * Définition : admin/config/blocs/image_pleine.yml
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, imageSite, alerteAlt } = outils;

function BlocImagePleine({ b, i, ctx }) {
  const p = 'blocs.' + i;
  const image = b.image || {};
  if (!image.fichier) {
    return el('p', Object.assign({ className: 'apercu-alerte' }, cle(p + '.image.fichier')), 'Image pleine largeur : image à choisir (rien ne s’affiche sur le site sans image).');
  }
  return el('section', { className: 'bloc-image-pleine' + (b.format === 'entiere' ? ' bloc-image-pleine--entiere' : '') },
    alerteAlt(image, p + '.image'),
    el('figure', null,
      imageSite(image, p + '.image', ctx.getAsset),
      (b.legende || image.credit) && el('figcaption', { className: 'container' },
        b.legende && el('span', Object.assign({ className: 'bloc-legende' }, cle(p + '.legende')), b.legende),
        image.credit && el('span', Object.assign({ className: 'bloc-credit' }, cle(p + '.image.credit')), image.credit))));
}

enregistrerBloc('image_pleine', BlocImagePleine, { libelle: 'Image pleine largeur', feuille: '/assets/blocs.css' });
