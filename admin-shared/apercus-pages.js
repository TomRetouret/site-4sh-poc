/*
 * Aperçus Sveltia des pages uniques : pages institutionnelles (Notre démarche, Notre entreprise / Company,
 * Intelligence artificielle, Podcasts, Contact), pages mères (Formations, Références, Expertises
 * techniques, Glossaire, et leurs versions anglaises) et pages légales.
 * Chargé par admin/index.html après les autres scripts d'aperçu. Spécification : docs/back-office/schema-pages.md
 *
 * Les pages en blocs sont dessinées par rendreBlocs() de apercus.js (même bibliothèque que l'accueil,
 * avec le balisage des pages intérieures). Les autres pages montrent leur haut de page tel qu'affiché,
 * puis un résumé des sections : listes, cartes et formulaires viennent des collections ou des réglages.
 *
 * Noms d'enregistrement = noms des fichiers dans admin/config/collections/120-pages.yml et 160-pages_en.yml.
 * Outils : window.APERCUS_4SH.outils (el, cle, accent, propsLien, tableau, texte) et rendreBlocs.
 */
import { rendreBlocs, lireDonnees, FEUILLE_OFFRE } from './apercus.js';

const A = (typeof window !== 'undefined' && window.APERCUS_4SH) || {};
const { el, cle, accent, propsLien, tableau, texte } = A.outils || {};

// Langue de l'entrée, d'après le chemin (…/en/…). Avec le multilingue intégré, Sveltia peut donner le
// chemin de la langue par défaut : l'aperçu de Company peut alors afficher les données liées en français.
function langue(entry) {
  const chemin = String((entry && typeof entry.get === 'function' ? entry.get('path') : entry && entry.path) || '');
  return /(^|\/)en(\/|_)/.test(chemin) ? 'en' : 'fr';
}

function rappelSeo(seo, prefixe) {
  const s = seo || {};
  return el('div', { className: 'apercu-seo' },
    el('p', cle(prefixe + '.meta_title'), el('b', null, 'Titre SEO : '), s.meta_title || '(vide : titre par défaut des Réglages SEO)'),
    el('p', cle(prefixe + '.meta_description'), el('b', null, 'Description SEO : '), s.meta_description || '(vide)'));
}
const info = (texteInfo, chemin) => el('p', Object.assign({ className: 'apercu-info', style: { margin: '16px' } }, chemin ? cle(chemin) : {}), texteInfo);
const bouton = (b, chemin, classe, defaut) => b && texte(b.texte) &&
  el('a', Object.assign({ className: 'btn ' + (classe || 'btn-primary') }, propsLien(b.lien, defaut), cle(chemin)), b.texte);

/* ---- Pages en blocs : Notre démarche, Notre entreprise / Company ---- */
function ApercuPageBlocs(props) {
  const data = lireDonnees(props.entry);
  const ctx = {
    getAsset: props.getAsset,
    getCollection: props.getCollection,
    fieldsMetaData: props.fieldsMetaData,
    langue: langue(props.entry),
    gabarit: 'offre',
  };
  return el('div', { className: 'apercu-page-institutionnelle' },
    el('link', { rel: 'stylesheet', href: FEUILLE_OFFRE }),
    rappelSeo(data.seo, 'seo'),
    el('main', null, rendreBlocs(data.blocs, ctx)),
    info('Le formulaire de contact est ajouté automatiquement en fin de page.'));
}

/* ---- Haut de page des pages intérieures (hero-interne, ref-hero, glo-hero, sect-hero) ---- */
function haut(h, chemin, options) {
  const o = options || {};
  const v = h || {};
  return el('div', { className: o.classe || 'hero-interne' },
    el('div', { className: 'container' },
      el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" }, el('a', propsLien('/'), 'Accueil'), ' › ', o.fil || ''),
      v.surtitre && el('p', Object.assign({ className: 'eyebrow' }, cle(chemin + '.surtitre')), v.surtitre),
      el('h1', cle(chemin + '.titre'), accent(v.titre)),
      (v.chapo || v.intro) && el('p', Object.assign({ className: o.classeChapo || 'chapo' }, cle(chemin + (v.intro !== undefined ? '.intro' : '.chapo'))), v.chapo || v.intro),
      o.boutons && el('div', { className: 'hero-cta' }, o.boutons)));
}
function section(titre, chemin, enfants) {
  return el('section', { style: { paddingTop: '40px', paddingBottom: '40px' } },
    el('div', { className: 'container' },
      titre !== undefined && el('h2', Object.assign({ className: 'sec-titre' }, cle(chemin)), accent(titre)),
      enfants));
}

function ApercuFormations(props) {
  const d = lireDonnees(props.entry);
  const h = d.hero || {};
  return el('div', null,
    rappelSeo(d.seo, 'seo'),
    haut(h, 'hero', {
      classe: 'hero-form', fil: 'Formations en informatique',
      boutons: [bouton(h.bouton_principal, 'hero.bouton_principal', 'btn-primary', '#catalogue'), bouton(h.bouton_secondaire, 'hero.bouton_secondaire', 'btn-ghost', '#contact')],
    }),
    (h.note || h.note_detail) && info('Note : ' + texte(h.note) + ' · ' + texte(h.note_detail), 'hero.note'),
    info('Animation : ' + tableau(h.etapes).join(', '), 'hero.etapes'),
    section((d.pourquoi || {}).titre, 'pourquoi.titre',
      el('div', { className: 'portes' }, tableau((d.pourquoi || {}).cartes).map((c, j) =>
        el('div', Object.assign({ className: 'porte' }, cle('pourquoi.cartes.' + j + '.titre')), el('h3', null, c.titre), el('p', null, c.texte))))),
    section((d.catalogue || {}).titre, 'catalogue.titre', [
      el('p', Object.assign({ className: 'sec-sous' }, cle('catalogue.sous_titre')), (d.catalogue || {}).sous_titre),
      info('Le catalogue se remplit avec les fiches Formations.')]),
    section((d.agenda || {}).titre, 'agenda.titre', [
      el('p', Object.assign({ className: 'sec-sous' }, cle('agenda.sous_titre')), (d.agenda || {}).sous_titre),
      el('ul', null, tableau((d.agenda || {}).mois).map((m, j) => el('li', cle('agenda.mois.' + j + '.mois'),
        el('b', null, m.mois), ' : ', tableau(m.sessions).map((s) => texte(s.jour) + ' ' + texte(s.mois_court) + ' ' + texte(s.titre)).join(' ; ')))),
      bouton((d.agenda || {}).bouton, 'agenda.bouton', 'btn-ghost', '#contact')]),
    section((d.qualiopi || {}).titre, 'qualiopi.titre', el('p', cle('qualiopi.texte'), (d.qualiopi || {}).texte)),
    section((d.temoignages || {}).titre, 'temoignages.titre',
      el('div', { className: 'temoins' }, tableau((d.temoignages || {}).liste).map((t, j) =>
        el('div', Object.assign({ className: 'temoin' }, cle('temoignages.liste.' + j + '.citation')),
          el('blockquote', null, t.citation), el('p', null, el('b', null, t.nom), ' ', t.detail))))),
    info('Le formulaire de devis est ajouté en fin de page (Textes récurrents, Bloc devis).'));
}

function ApercuTechnologies(props) {
  const d = lireDonnees(props.entry);
  const h = d.hero || {};
  return el('div', null,
    el('link', { rel: 'stylesheet', href: FEUILLE_OFFRE }),
    rappelSeo(d.seo, 'seo'),
    haut(h, 'hero', { fil: 'Expertises techniques', classeChapo: 'chapo', boutons: [bouton(h.bouton, 'hero.bouton', 'btn-primary', '/contact/')] }),
    section((d.phares || {}).titre, 'phares.titre', info('Les cartes reprennent les fiches Technologies.')),
    section(undefined, 'autres', [
      el('p', Object.assign({ className: 'sec-sous', style: { maxWidth: 'none' } }, cle('autres.intro')), (d.autres || {}).intro),
      el('div', { className: 'autres-technos' }, tableau((d.autres || {}).technos).map((t, j) =>
        el('div', Object.assign({ className: 'techno-tuile' }, cle('autres.technos.' + j + '.nom')), el('span', null, t.nom))))]));
}

const ApercuHautSeul = (fil, classe, note) => (props) => {
  const d = lireDonnees(props.entry);
  return el('div', null, rappelSeo(d.seo, 'seo'), haut(d.hero, 'hero', { fil, classe }), note && info(note));
};

function ApercuPodcasts(props) {
  const d = lireDonnees(props.entry);
  const h = d.hero || {};
  return el('div', null,
    rappelSeo(d.seo, 'seo'),
    haut(h, 'hero', {
      classe: 'sect-hero', classeChapo: 'accroche', fil: 'Podcasts',
      boutons: tableau(h.plateformes).map((p, j) => el('a', Object.assign({ className: 'btn ' + (j ? 'btn-ghost' : 'btn-primary') }, propsLien(p.url), cle('hero.plateformes.' + j + '.label')), 'Écouter sur ' + texte(p.label))),
    }),
    section(undefined, 'episodes', tableau(d.episodes).map((e, j) =>
      el('article', Object.assign({ className: 'sect-defi' }, cle('episodes.' + j + '.titre')),
        el('p', { className: 'eyebrow' }, texte(e.date) + ' · ' + texte(e.duree)),
        el('h2', null, e.titre), el('p', null, e.resume),
        el('p', null, ['Spotify', e.deezer && 'Deezer', e.apple && 'Apple Podcasts'].filter(Boolean).join(' · '))))));
}

function ApercuContact(props) {
  const d = lireDonnees(props.entry);
  const h = d.hero || {};
  return el('div', null,
    rappelSeo(d.seo, 'seo'),
    el('section', { className: 'contact-final sur-sombre', style: { marginTop: 0 } },
      el('div', { className: 'container' },
        el('h1', Object.assign({ className: 'sec-titre' }, cle('hero.titre')), accent(h.titre)),
        el('p', Object.assign({ className: 'sec-sous' }, cle('hero.chapo')), h.chapo))),
    info('Arguments, téléphone, villes et formulaire : Réglages, Réglages du site (communs à tout le site).'));
}

/* ---- Pages Markdown : Intelligence artificielle, pages légales ---- */
function corps(props) {
  if (typeof props.widgetFor === 'function') {
    try { return props.widgetFor('body'); } catch (e) { /* aperçu texte ci-dessous */ }
  }
  return el('pre', { style: { whiteSpace: 'pre-wrap' } }, texte(lireDonnees(props.entry).body));
}
function ApercuPageLibre(props) {
  const d = lireDonnees(props.entry);
  const h = d.hero || {};
  return el('div', null,
    el('link', { rel: 'stylesheet', href: '/assets/secteurs.css' }),
    rappelSeo(d.referencement, 'referencement'),
    haut(h, 'hero', { classe: 'sect-hero', classeChapo: 'accroche', fil: d.titre, boutons: [bouton(h.bouton, 'hero.bouton', 'btn-primary', '/contact/')] }),
    el('section', { className: 'sect-bloc' }, el('div', Object.assign({ className: 'container sect-libre' }, cle('body')), corps(props))),
    tableau(d.faq).length > 0 && section('Questions fréquentes', 'faq', el('ul', null, tableau(d.faq).map((q, j) => el('li', cle('faq.' + j + '.question'), q.question)))),
    info(d.contact_final === false ? 'Pas de formulaire de contact en bas de page.' : 'Le formulaire de contact est ajouté en fin de page.', 'contact_final'));
}
function ApercuPageLegale(props) {
  const d = lireDonnees(props.entry);
  return el('div', null,
    el('link', { rel: 'stylesheet', href: '/assets/secteurs.css' }),
    rappelSeo(d.referencement, 'referencement'),
    el('section', { className: 'sect-hero' },
      el('div', { className: 'container' },
        el('nav', Object.assign({ className: 'fil-ariane' }, cle('titre')), el('a', propsLien('/'), 'Accueil'), ' › ', d.titre),
        el('h1', cle('h1'), d.h1 || d.titre),
        d.maj && el('p', Object.assign({ className: 'accroche' }, cle('maj')), 'Dernière mise à jour : ' + texte(d.maj)))),
    el('section', { className: 'sect-bloc' },
      el('div', { className: 'container' }, el('div', Object.assign({ className: 'sect-libre', style: { maxWidth: '820px' } }, cle('body')), corps(props)))));
}

const GABARITS = {
  notre_demarche: ApercuPageBlocs,
  notre_entreprise: ApercuPageBlocs,
  notre_equipe: ApercuPageBlocs,
  nos_agences: ApercuPageBlocs,
  conception_ux: ApercuPageBlocs,
  engagements: ApercuPageBlocs,
  page_ia: ApercuPageLibre,
  page_podcasts: ApercuPodcasts,
  contact: ApercuContact,
  page_formations: ApercuFormations,
  en_page_formations: ApercuFormations,
  page_technologies: ApercuTechnologies,
  en_page_technologies: ApercuTechnologies,
  page_references: ApercuHautSeul('Références', 'ref-hero', 'Chiffres, filtres et cartes : fiches Références et Textes récurrents.'),
  page_glossaire: ApercuHautSeul('Glossaire', 'glo-hero', 'Index et définitions : collection Glossaire.'),
  page_mentions_legales: ApercuPageLegale,
  page_rgpd: ApercuPageLegale,
};

function enregistrer(CMS) {
  if (!el) { console.warn('apercus-pages.js : window.APERCUS_4SH absent, aperçus des pages non enregistrés.'); return; }
  Object.keys(GABARITS).forEach((nom) => CMS.registerPreviewTemplate(nom, GABARITS[nom]));
}

(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai < 100) setTimeout(() => attendreCMS(essai + 1), 100);
})(0);
