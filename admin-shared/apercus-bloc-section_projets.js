/*
 * Aperçu du bloc « section_projets » (Section de projets). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/section_projets.njk
 * Définition : admin/config/blocs/section_projets.yml ; morceaux communs : apercus-prestations.js
 */
import { enregistrerBloc, outils } from './apercus.js';
import { section, grille, enLigne, mdSection } from './apercus-prestations.js';

const { el, cle, tableau, texte, chargeur, premiereEntree, propsLien } = outils;

// Carte d'un projet : visuel, logo et secteur lus dans la fiche référence reliée.
function carteProjet(pr, chemin, ctx) {
  const rendu = (d) => {
    d = d || {};
    const nom = d.client || texte(pr.titre).split(/[,:–-]/)[0].trim();
    const lien = pr.lien || (pr.reference ? '/references/' + pr.reference + '/' : '');
    return el('div', { className: 'sect-ref-carte' },
      el('div', Object.assign({ className: 'sect-ref-visuel' + (d.image ? '' : ' ref-visuel--vide') }, cle(chemin + '.reference')),
        d.image ? el('img', { src: d.image, alt: d.titre || '', loading: 'lazy' }) : el('span', { className: 'ref-vide-nom' }, nom),
        d.logo ? el('div', { className: 'ref-cartouche' }, el('img', { src: d.logo, alt: d.client || '' }))
          : d.client && el('div', { className: 'ref-cartouche' }, el('span', { className: 'ref-cartouche-txt' }, d.client))),
      el('div', { className: 'sect-ref-corps' },
        el('span', { className: 'sect-ref-label' }, (d.secteurs && d.secteurs[0]) || 'Projet'),
        el('h3', cle(chemin + '.titre'), enLigne(texte(pr.titre))),
        el('div', Object.assign({ className: 'sect-ref-texte' }, cle(chemin + '.texte')), mdSection(pr.texte)),
        lien && el('a', Object.assign({ className: 'socle-lien' }, propsLien(lien), cle(chemin + '.lien_texte')), (pr.lien_texte || 'Voir la référence') + ' →')));
  };
  if (!pr.reference) return rendu(null);
  return chargeur({
    cleCache: 'reference:' + pr.reference,
    charger: () => premiereEntree(ctx.getCollection, [['references', pr.reference]]),
    rendu,
  });
}

function SectionProjets({ b, i, ctx }) {
  const projets = tableau(b.projets);
  return section({ b, i, ctx }, projets.length > 0 &&
    grille(projets.map((pr, k) => carteProjet(pr || {}, 'blocs.' + i + '.projets.' + k, ctx)), 'refs'));
}

enregistrerBloc('section_projets', SectionProjets, { libelle: 'Section de projets' });
