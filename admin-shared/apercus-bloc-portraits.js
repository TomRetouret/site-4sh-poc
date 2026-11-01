/*
 * Aperçu du bloc « portraits » (Équipe ou portraits). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/portraits.njk
 * Définition : admin/config/blocs/portraits.yml
 * Les fiches viennent de la collection « equipe » (src/_data/equipe/<slug>.json), lues avec getCollection.
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, entete, chargeur, premiereEntree, adresseImage, tableau, texte } = outils;

// Une fiche Équipe chargée puis rendue par rendu(fiche) ; fiche nulle tant qu'elle n'est pas lue.
function avecFiche(slug, ctx, rendu) {
  return chargeur({
    cleCache: 'equipe:' + slug,
    charger: () => premiereEntree(ctx.getCollection, [['equipe', slug]]),
    rendu: (f) => rendu(f || { nom: slug }),
  });
}

function photo(f, ctx) {
  return f.photo && el('img', { className: 'bloc-portrait-photo', src: adresseImage(ctx.getAsset, f.photo), alt: texte(f.photo_alt), loading: 'lazy', decoding: 'async' });
}

function BlocPortraits({ b, i, ctx, serre }) {
  const p = 'blocs.' + i;
  const slugs = tableau(b.membres).length ? tableau(b.membres) : (b.membres ? [b.membres] : []);
  const corps = !slugs.length
    ? el('p', Object.assign({ className: 'apercu-alerte' }, cle(p + '.membres')), 'Choisissez au moins une personne (rien ne s’affiche sur le site sans personne).')
    : b.affichage === 'unique'
      ? avecFiche(slugs[0], ctx, (f) => el('div', Object.assign({ className: 'bloc-portrait-unique' }, cle(p + '.membres')),
        photo(f, ctx),
        el('div', null,
          el('h3', { className: 'bloc-portrait-nom' }, f.nom),
          f.fonction && el('p', { className: 'bloc-portrait-fonction' }, f.fonction),
          texte(f.presentation).replace(/\r/g, '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
            .map((x) => el('p', { className: 'bloc-portrait-texte' }, x)))))
      : el('ul', Object.assign({ className: 'bloc-portraits-grille' }, cle(p + '.membres')),
        slugs.map((slug) => avecFiche(slug, ctx, (f) => el('li', null,
          photo(f, ctx),
          el('h3', { className: 'bloc-portrait-nom' }, f.nom),
          f.fonction && el('p', { className: 'bloc-portrait-fonction' }, f.fonction)))));
  return el('section', Object.assign({ className: 'bloc-portraits' }, serre ? { style: { paddingTop: 0 } } : {}),
    el('div', { className: 'container' }, entete(b, p), corps));
}

enregistrerBloc('portraits', BlocPortraits, { libelle: 'Équipe ou portraits (fiches Équipe)', feuille: '/assets/blocs.css' });
