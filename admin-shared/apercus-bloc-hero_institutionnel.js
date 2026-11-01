/*
 * Aperçu du bloc « hero_institutionnel » (Haut de page institutionnelle). Chargé à la demande par apercus.js.
 * Balisage de référence : src/_includes/composants/blocs/hero_institutionnel.njk
 * Définition : admin/config/blocs/hero_institutionnel.yml ; pages : docs/back-office/schema-pages.md
 * L'illustration (schéma SVG du site) est remplacée ici par une étiquette : elle est dessinée dans le gabarit.
 */
import { enregistrerBloc, outils } from './apercus.js';

const { el, cle, accent, propsLien, tableau, texte } = outils;
const ILLUSTRATIONS = {
  demarche: 'Schéma « De votre idée à la mise en production »',
  entreprise: 'Schéma « Nos agences autour de 4SH »',
};

function HeroInstitutionnel({ b, i }) {
  const p = 'blocs.' + i;
  const fil = tableau(b.fil_ariane);
  const b1 = b.bouton_principal || {};
  const b2 = b.bouton_secondaire || {};
  return el('div', { className: 'hero-interne' },
    el('div', { className: 'container' },
      fil.length > 0 && el('nav', Object.assign({ className: 'fil-ariane', 'aria-label': "Fil d'Ariane" }, cle(p + '.fil_ariane')),
        fil.map((e, j) => (j === 0 ? el('a', propsLien('/'), e) : [' › ', e]))),
      el('div', { className: 'hero-grille' },
        el('div', null,
          b.surtitre && el('p', Object.assign({ className: 'eyebrow' }, cle(p + '.surtitre')), b.surtitre),
          el('h1', cle(p + '.titre_page'), accent(b.titre_page)),
          b.chapo && el('p', Object.assign({ className: 'chapo', style: { fontSize: '18px', color: 'var(--texte-2)', marginBottom: '26px' } }, cle(p + '.chapo')), b.chapo),
          el('div', { className: 'hero-cta' },
            el('a', Object.assign({ className: 'btn btn-primary' }, propsLien(b1.lien, '#contact'), cle(p + '.bouton_principal')), b1.texte || '(texte du bouton)'),
            texte(b2.texte) && el('a', Object.assign({ className: 'btn btn-ghost' }, propsLien(b2.lien, '#contact'), cle(p + '.bouton_secondaire')), b2.texte)),
          tableau(b.etiquettes).length > 0 && el('div', Object.assign({ className: 'chips' }, cle(p + '.etiquettes')),
            tableau(b.etiquettes).map((c) => el('span', null, c)))),
        ILLUSTRATIONS[b.illustration] && el('p', Object.assign({ className: 'apercu-info' }, cle(p + '.illustration')),
          ILLUSTRATIONS[b.illustration] + ' (dessiné par le site, masqué sur téléphone).'))));
}

enregistrerBloc('hero_institutionnel', HeroInstitutionnel, { libelle: 'Haut de page institutionnelle' });
