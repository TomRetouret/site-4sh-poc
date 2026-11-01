/*
 * Aperçus Sveltia : Secteurs, Clients & Solutions, Technologies, Catégories de formation.
 * Chargé par admin/index.html après apercus.js, dont il reprend les outils exposés
 * (window.APERCUS_4SH.outils : el, cle, accent, texteRiche, adresseImage, propsLien).
 * Enregistre ses gabarits avec CMS.registerPreviewTemplate.
 *
 * Balisage de référence : src/_includes/secteur.njk, secteur-libre.njk,
 * technologie.njk et categorie.njk, reproduit classe par classe. Les feuilles propres
 * à ces pages (secteurs.css, logiciel-metier.css, learning.css, catalogue.css) sont
 * chargées DANS l'aperçu concerné (balise link), pour ne pas toucher aux autres aperçus.
 *
 * Sections (Clients & Solutions, Technologies) : la mise en page reprend les règles
 * principales du filtre « blocs » d'eleventy.config.js (fonds alternés, étapes,
 * atouts, cartes selon le titre et la longueur), de façon approchée : le site fait foi.
 * Spécification : docs/back-office/schema-collections.md
 */

/* ------------------------------------------------------------------------- */
/* Réglages                                                                  */
/* ------------------------------------------------------------------------- */

// Libellés de src/_data/libelles.json (secteur.*), recopiés pour l'aperçu.
const LIB = {
  defis_eyebrow: 'Votre contexte',
  defis_titre: 'Les défis de votre métier',
  opportunites_eyebrow: 'Les leviers',
  opportunites_titre: 'Les opportunités apportées par les outils métier',
  pourquoi_eyebrow: 'Notre valeur',
  pourquoi_titre: 'Pourquoi 4SH ?',
  comment_eyebrow: 'Notre approche',
  comment_titre: 'Comment ?',
  refs_eyebrow: 'Ils nous font confiance',
  refs_titre: 'Références clients',
  faq_titre: 'Questions fréquentes',
  cta_bouton: 'Contactez-nous',
};

const STYLES = `
.apercu-info,.apercu-alerte,.apercu-seo{font:600 13px/1.4 Asap,system-ui,sans-serif;box-sizing:border-box}
.apercu-info{margin:8px 0;padding:8px 12px;background:#eef3ff;color:#23324d;border-left:3px solid #4a6fd1}
.apercu-alerte{position:relative;z-index:5;margin:6px 0;padding:6px 10px;background:#fff4d6;color:#5c3d00;border-left:3px solid #e0a100}
.apercu-seo{padding:10px 16px;background:#14171C;color:#d8dbe0}
.apercu-seo b{color:#fff}
.apercu-seo p{margin:2px 0}
[data-key-path]{cursor:pointer}
[data-key-path]:focus-visible{outline:2px dashed #ED203D;outline-offset:3px}
`;

/* ------------------------------------------------------------------------- */
/* Outils                                                                    */
/* ------------------------------------------------------------------------- */

const O = () => (window.APERCUS_4SH && window.APERCUS_4SH.outils) || null;
const el = (...a) => O().el(...a);
const cle = (c) => O().cle(c);
const accent = (s) => O().accent(s);
const texteRiche = (s) => O().texteRiche(s);
const propsLien = (d, def) => O().propsLien(d, def);
const tableau = (v) => (Array.isArray(v) ? v : []);
const texte = (v) => (v === null || v === undefined ? '' : String(v));
const plein = (v) => texte(v).trim() !== '';
const avec = (props, chemin) => Object.assign({}, props || {}, chemin ? cle(chemin) : {});

function versJS(v) { return v && typeof v.toJS === 'function' ? v.toJS() : v; }
function lireDonnees(entry) {
  if (!entry) return {};
  if (typeof entry.getIn === 'function') return versJS(entry.getIn(['data'])) || {};
  return versJS(entry.data) || {};
}
function adresseImage(getAsset, fichier) {
  const o = O();
  return o && o.adresseImage ? o.adresseImage(getAsset, fichier) : texte(fichier);
}

// **gras** (filtre « gras ») puis *mot* en rouge (filtre « accent »), en ligne.
function grasAccent(s) {
  return texte(s).split(/\*\*([^*\n]+?)\*\*/g).map((m, i) => (i % 2 ? el('strong', null, m) : accent(m)));
}
// Anciennes balises <strong> encore saisies : affichées en gras.
const sansBalises = (s) => texte(s).replace(/<strong>([^<]*)<\/strong>/g, '**$1**');

// Markdown des textes longs : titres 2 et 3 en plus de texteRiche (paragraphes,
// listes, gras, liens).
function markdown(source) {
  const sortie = [];
  texte(source).replace(/\r/g, '').split(/\n\s*\n/).forEach((bloc) => {
    const reste = [];
    bloc.split('\n').forEach((l) => {
      const m = l.match(/^(#{2,3})\s+(.+)$/);
      if (m) {
        if (reste.length) { sortie.push(texteRiche(sansBalises(reste.join('\n')))); reste.length = 0; }
        sortie.push(el(m[1].length === 2 ? 'h2' : 'h3', null, m[2]));
      } else reste.push(l);
    });
    if (reste.join('').trim()) sortie.push(texteRiche(sansBalises(reste.join('\n'))));
  });
  return sortie;
}

const feuille = (href) => el('link', { rel: 'stylesheet', href });
const alerte = (chemin, message) => el('p', avec({ className: 'apercu-alerte', role: 'note' }, chemin), message);
const info = (chemin, ...contenu) => el('p', avec({ className: 'apercu-info' }, chemin), ...contenu);

function filAriane(courant, parents) {
  return el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" },
    el('a', propsLien('/'), 'Accueil'), ' › ',
    tableau(parents).map((p) => [el('a', propsLien(p.url), p.label), ' › ']), courant);
}

// Hero des pages éditoriales (macro hero de composants/page.njk).
function heroSect(d, o) {
  return el('section', { className: 'sect-hero' },
    el('div', { className: 'container' },
      filAriane(texte(o.titre), [{ label: 'Secteurs', url: '/' }]),
      el('span', avec({ className: 'eyebrow' }, o.cleEyebrow), o.eyebrow),
      o.logo ? el('div', avec({ className: 'sect-logo' }, 'logo'), el('img', { src: o.logo, alt: texte(o.titre) })) : null,
      el('h1', cle('h1'), accent(plein(d.h1) ? d.h1 : o.titre)),
      plein(o.chapo) ? el('p', avec({ className: 'accroche' }, o.cleChapo), grasAccent(sansBalises(o.chapo))) : null,
      el('div', { className: 'hero-cta' }, el('a', avec(Object.assign({ className: 'btn btn-primary' }, propsLien(o.ctaUrl)), o.cleCta), o.ctaLabel))));
}

// Référencement : ce que Google affichera.
function blocSeo(d, titreDefaut, descDefaut) {
  const r = d.referencement || {};
  return el('div', avec({ className: 'apercu-seo' }, 'referencement.meta_title'),
    el('p', null, el('b', null, 'Google : '), texte(r.meta_title) || titreDefaut),
    el('p', null, texte(r.meta_description) || texte(descDefaut)),
    r.indexation === false ? el('p', null, el('b', null, 'Page masquée des moteurs de recherche.')) : null);
}

function faqAccordeon(faq, p, style) {
  return el('div', { className: 'faq', style: style || { marginTop: '20px' } },
    tableau(faq).map((q, i) => el('details', avec(i === 0 ? { open: true } : {}, p + '.' + i + '.question'),
      el('summary', null, texte(q && q.question)), el('p', null, texte(q && q.reponse)))));
}

function listeReferences(slugs, chemin) {
  const s = tableau(slugs);
  if (!s.length) return null;
  return el('section', { className: 'sect-refs' }, el('div', { className: 'container' },
    el('p', { className: 'eyebrow' }, LIB.refs_eyebrow), el('h2', null, LIB.refs_titre),
    info(chemin, 'Cartes des fiches références : ', s.join(', '), '. Visuel, logo et résumé viennent de chaque fiche.')));
}

/* ------------------------------------------------------------------------- */
/* Sections (filtre « blocs », règles principales)                           */
/* ------------------------------------------------------------------------- */

const RE_ETAPES = /approche|m[ée]thode|m[ée]thodologie|d[ée]marche|fa[çc]on de|en pratique|^comment|cycle|process|quatre temps|notre veille/i;
const RE_ATOUTS = /pourquoi|atout|choisir|confiance|nous choisissent|diff[ée]renc|engagement/i;

function sections(liste, prefixe) {
  let rang = 0, sombre = false, precedent = null, numero = 0;
  const items = tableau(liste);
  const sorties = [];
  items.forEach((s, i) => {
    s = s || {};
    const p = prefixe + '.' + i;
    const sp = tableau(s.sous_parties);
    if (plein(s.titre)) numero += 1;
    if (i > 0 && !plein(s.titre)) sorties.push(alerte(p + '.titre', 'Section ' + (i + 1) + ' sans titre : sur le site, elle se fond dans la précédente.'));
    let type = 'prose';
    const puces = texte(s.texte).split('\n').filter((l) => /^\s*[-*+]\s+/.test(l));
    if (!sp.length && puces.length >= 3) type = 'cartes';
    if (sp.length) {
      const moyenne = sp.reduce((n, x) => n + texte(x && x.texte).length, 0) / sp.length;
      if (RE_ETAPES.test(texte(s.titre)) && sp.length >= 3) type = 'etapes';
      else if (RE_ATOUTS.test(texte(s.titre)) && sp.length >= 2) type = 'atouts';
      else if (sp.length >= 3 && moyenne < 420) type = 'cartes';
      else type = 'atouts';
    }
    if (type === precedent && (type === 'cartes' || type === 'atouts')) type = type === 'cartes' ? 'atouts' : 'cartes';
    precedent = type;
    let fond = '';
    if (type === 'etapes' && !sombre && rang > 0) { fond = ' sect-bloc--sombre'; sombre = true; }
    else if (rang % 2 === 1) fond = ' sect-bloc--creme';
    rang += 1;
    const classe = type === 'etapes' ? 'sect-etape' : type === 'atouts' ? 'sect-atout' : 'sect-defi';
    const carte = (x, k) => {
      const corps = [el('h3', null, texte(x && x.titre)), texteRiche(sansBalises(x && x.texte))];
      return el('div', avec({ className: classe }, p + '.sous_parties.' + k + '.titre'), type === 'etapes' ? el('div', null, corps) : corps);
    };
    const grille = sp.length
      ? el('div', { className: type === 'etapes' ? 'sect-etapes' : type === 'atouts' ? 'sect-atouts' : 'sect-defis' }, sp.map(carte))
      : null;
    sorties.push(el('section', { className: 'sect-bloc' + fond }, el('div', { className: 'container' },
      plein(s.titre) ? el('p', { className: 'eyebrow eyebrow--rang' }, String(numero).padStart(2, '0')) : null,
      plein(s.titre) ? el('h2', cle(p + '.titre'), texte(s.titre)) : null,
      plein(s.texte) ? el('div', avec({ className: 'sect-prose' }, p + '.texte'), texteRiche(sansBalises(s.texte))) : null,
      grille)));
  });
  if (items.length) sorties.unshift(el('p', { className: 'apercu-info' }, 'Mise en page des sections approchée : le site fait foi (carrousel au-delà de 3 cartes, aperçus des fiches références, boutons).'));
  return sorties;
}

/* ------------------------------------------------------------------------- */
/* Gabarits                                                                  */
/* ------------------------------------------------------------------------- */

function sectionSecteur(classe, eyebrow, titre, intro, cleIntro, contenu) {
  return el('section', { className: 'sect-bloc' + classe }, el('div', { className: 'container' },
    el('p', { className: 'eyebrow' }, eyebrow), el('h2', null, titre),
    plein(intro) ? el('p', avec({ className: 'intro' }, cleIntro), intro) : null, contenu));
}

function ApercuSecteur({ entry }) {
  const d = lireDonnees(entry);
  const defis = tableau(d.defis), opps = tableau(d.opportunites), pq = tableau(d.pourquoi), etapes = tableau(d.etapes);
  return el('div', null, feuille('/assets/secteurs.css'),
    heroSect(d, { titre: d.titre, eyebrow: 'Secteur · ' + texte(d.titre), cleEyebrow: 'titre', chapo: d.accroche, cleChapo: 'accroche', ctaLabel: LIB.cta_bouton, ctaUrl: '/#contact' }),
    defis.length ? sectionSecteur('', LIB.defis_eyebrow, LIB.defis_titre, d.defis_intro, 'defis_intro',
      el('div', { className: 'sect-defis' }, defis.map((x, i) => el('div', avec({ className: 'sect-defi' }, 'defis.' + i), el('p', null, grasAccent(sansBalises(x))))))) : null,
    opps.length ? sectionSecteur(' sect-bloc--creme', LIB.opportunites_eyebrow, LIB.opportunites_titre, d.opportunites_intro, 'opportunites_intro',
      el('ul', { className: 'sect-liste' }, opps.map((x, i) => el('li', cle('opportunites.' + i), grasAccent(sansBalises(x)))))) : null,
    pq.length ? sectionSecteur('', LIB.pourquoi_eyebrow, LIB.pourquoi_titre, '', null,
      el('div', { className: 'sect-atouts' }, pq.map((a, i) => el('div', avec({ className: 'sect-atout' }, 'pourquoi.' + i + '.titre'),
        el('h3', null, texte(a && a.titre)), tableau(a && a.paras).map((x) => el('p', null, grasAccent(sansBalises(x)))))))) : null,
    etapes.length ? sectionSecteur(' sect-bloc--sombre', LIB.comment_eyebrow, LIB.comment_titre, d.comment_intro, 'comment_intro',
      el('div', { className: 'sect-etapes' }, etapes.map((e, i) => el('div', avec({ className: 'sect-etape' }, 'etapes.' + i + '.titre'),
        el('div', null, el('h3', null, texte(e && e.titre)), el('p', null, texte(e && e.texte))))))) : null,
    listeReferences(d.references, 'references'),
    info(null, 'Formulaire de contact (automatique, commun à tout le site).'),
    blocSeo(d, texte(d.titre) + ' - Logiciel métier sur mesure | 4SH', d.accroche));
}

function ApercuClientsSolutions({ entry, getAsset }) {
  const d = lireDonnees(entry);
  const chiffres = tableau(d.chiffres);
  return el('div', null, feuille('/assets/secteurs.css'),
    heroSect(d, { titre: d.titre, eyebrow: texte(d.categorie) || 'Secteur', cleEyebrow: 'categorie', chapo: d.chapo, cleChapo: 'chapo',
      logo: d.logo ? adresseImage(getAsset, d.logo) : '', ctaLabel: texte(d.cta_label) || LIB.cta_bouton, ctaUrl: texte(d.cta_url) || '/#contact', cleCta: 'cta_label' }),
    sections(d.sections, 'sections'),
    chiffres.length ? el('div', { className: 'ref-resultats' }, el('div', { className: 'container' },
      el('div', { className: 'grille' }, chiffres.map((c, i) => el('div', avec({ className: 'stat' }, 'chiffres.' + i + '.chiffre'),
        el('b', null, accent(c && c.chiffre)), el('span', null, texte(c && c.label))))))) : null,
    listeReferences(d.references, 'references'),
    tableau(d.faq).length ? el('section', { className: 'sect-bloc sect-bloc--creme' }, el('div', { className: 'container' },
      el('div', { className: 'sect-faq' }, el('h2', null, LIB.faq_titre), faqAccordeon(d.faq, 'faq')))) : null,
    info(null, 'Formulaire de contact (automatique, commun à tout le site).'),
    blocSeo(d, texte(d.titre) + ' - 4SH', d.chapo));
}

function corpsTechnologie(d) {
  const liste = tableau(d.sections);
  if (!liste.length) return null;
  const eyebrow = el('p', avec({ className: 'eyebrow' }, 'corps_eyebrow'), texte(d.corps_eyebrow) || 'Communauté et écosystème');
  const titre = plein(d.corps_titre) ? el('h2', avec({ className: 'sec-titre' }, 'corps_titre'), accent(d.corps_titre)) : null;
  if (d.corps_sombre) {
    return el('section', { className: 'section-sombre sur-sombre' }, el('div', { className: 'container' }, eyebrow, titre,
      el('div', avec({ className: 'prose prose--sombre' }, 'sections'), liste.map((s) => [
        plein(s && s.titre) ? el('h2', null, s.titre) : null, texteRiche(sansBalises(s && s.texte)),
        tableau(s && s.sous_parties).map((x) => [el('h3', null, texte(x && x.titre)), texteRiche(sansBalises(x && x.texte))])]))));
  }
  return [el('section', { style: { paddingBottom: 0 } }, el('div', { className: 'container' }, eyebrow, titre)), sections(liste, 'sections')];
}

function ApercuTechnologie({ entry, getAsset }) {
  const d = lireDonnees(entry);
  const nom = texte(d.nom);
  const formations = tableau(d.formations);
  const refs = tableau(d.references);
  return el('div', { className: d.famille ? 'famille-' + d.famille : '' }, feuille('/assets/logiciel-metier.css'),
    el('div', { className: 'hero-interne' }, el('div', { className: 'container' },
      el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" }, el('a', propsLien('/'), 'Accueil'), ' › ', el('a', propsLien('/expertises-techniques/'), 'Expertises techniques'), ' › ', el('span', cle('nom'), nom)),
      el('div', { className: 'hero-grille' },
        el('div', null,
          el('p', { className: 'eyebrow' }, 'Expertise technique'),
          el('h1', cle('h1'), accent(d.h1)),
          el('p', avec({ className: 'chapo', style: { fontSize: '18px', color: 'var(--texte-2)', marginBottom: '26px' } }, 'intro'), texte(d.intro)),
          el('div', { className: 'hero-cta' }, el('a', Object.assign({ className: 'btn btn-primary' }, propsLien('/contact/')), 'Contactez-nous'),
            formations.length ? el('a', Object.assign({ className: 'btn btn-ghost' }, propsLien('#formations')), 'Nos formations') : null)),
        d.logo ? el('div', avec({ className: 'techno-blason', 'aria-hidden': 'true' }, 'logo'), el('img', { src: adresseImage(getAsset, d.logo), alt: nom })) : null))),
    el('section', null, el('div', { className: 'container' },
      el('p', avec({ className: 'eyebrow' }, 'pourquoi_eyebrow'), texte(d.pourquoi_eyebrow) || 'Pourquoi ' + nom + ' ?'),
      plein(d.pourquoi_titre) ? el('h2', avec({ className: 'sec-titre' }, 'pourquoi_titre'), accent(d.pourquoi_titre)) : null,
      plein(d.pourquoi_intro) ? el('p', avec({ className: 'sec-sous' }, 'pourquoi_intro'), d.pourquoi_intro) : null,
      el('div', { className: 'atouts', style: { gridTemplateColumns: 'repeat(4,1fr)' } }, tableau(d.atouts).map((a, i) => el('div', avec({ className: 'atout' }, 'atouts.' + i + '.titre'),
        el('span', { className: 'n' }, String(i + 1)), el('h3', null, texte(a && a.titre)), el('p', null, texte(a && a.texte))))))),
    refs.length ? el('section', { style: { paddingTop: 0 } }, el('div', { className: 'container' },
      el('p', { className: 'eyebrow' }, 'Références clients'),
      el('div', { className: 'sect-refs-inline' }, refs.map((r, i) => el('div', avec({ className: 'sect-ref-carte' }, 'references.' + i + '.titre'),
        el('div', { className: 'sect-ref-visuel ref-visuel--vide' }, el('span', { className: 'ref-vide-nom' }, plein(r && r.fiche) ? 'Visuel de la fiche « ' + r.fiche + ' »' : texte(r && r.titre).split(' - ')[0])),
        el('div', { className: 'sect-ref-corps' }, el('span', { className: 'sect-ref-label' }, 'Projet'), el('h3', null, texte(r && r.titre)),
          el('div', { className: 'sect-ref-texte' }, el('p', null, texte(r && r.texte))),
          plein(r && r.fiche) ? el('a', Object.assign({ className: 'socle-lien' }, propsLien('/references/' + r.fiche + '/')), 'Voir la référence →') : null)))))) : null,
    corpsTechnologie(d),
    formations.length ? el('section', { id: 'formations' }, el('div', { className: 'container' },
      el('p', { className: 'eyebrow' }, 'Nos formations'),
      el('div', { className: 'socle', style: { gridTemplateColumns: 'repeat(3,1fr)' } }, formations.map((f, i) => el('a', avec(Object.assign({ className: 'socle-carte' }, propsLien(f && f.formation ? '/formations/' + f.formation + '/' : '')), 'formations.' + i + '.titre'),
        el('h3', null, texte(f && f.titre)), el('span', { className: 'socle-lien' }, 'Découvrir →'),
        !plein(f && f.formation) ? alerte('formations.' + i + '.formation', 'Fiche formation à choisir : la carte ne mène nulle part.') : null))))) : null,
    tableau(d.faq).length ? el('section', { style: { background: 'var(--creme)' } }, el('div', { className: 'container' },
      el('div', { className: 'sect-faq', style: { maxWidth: '820px', margin: '0 auto' } },
        el('h2', avec({ className: 'sec-titre' }, 'faq_titre'), accent(texte(d.faq_titre) || 'Questions fréquentes sur ' + nom)), faqAccordeon(d.faq, 'faq')))) : null,
    info('accroche_courte', el('b', null, 'Carte de la page Expertises techniques : '), nom, ', ', texte(d.accroche_courte) || '(accroche courte vide)', d.ordre ? ' (position ' + d.ordre + ')' : ''),
    blocSeo(d, nom + ' - Expertise technique 4SH', d.intro));
}

function ApercuCategorie({ entry }) {
  const d = lireDonnees(entry);
  const nom = texte(d.nom);
  return el('div', { className: 'learning' }, feuille('/assets/learning.css'), feuille('/assets/catalogue.css'),
    el('div', { className: 'hero-form' }, el('div', { className: 'container' },
      el('nav', { className: 'fil-ariane', 'aria-label': "Fil d'Ariane" }, el('a', propsLien('/'), 'Accueil'), ' › ', el('a', propsLien('/formations/'), 'Formations'), ' › ', el('span', cle('nom'), nom)),
      el('div', { className: 'hero-grille' }, el('div', null,
        el('span', { className: 'eyebrow eyebrow-offre' }, el('span', { className: 'barre', 'aria-hidden': 'true' }), '4SH Learning'),
        el('h1', cle('h1'), accent(plein(d.h1) ? d.h1 : 'Formations ' + nom)),
        plein(d.intro) ? el('p', avec({ className: 'chapo' }, 'intro'), d.intro) : null)))),
    el('section', { id: 'catalogue', style: { paddingTop: '60px' } }, el('div', { className: 'container' },
      el('h2', { className: 'sec-titre' }, 'Formations ', el('em', { className: 'accent' }, nom)),
      info('nom', 'Catalogue automatique : les fiches formation de la catégorie « ' + nom + ' ».'))),
    el('section', { style: { paddingTop: 0 } }, el('div', { className: 'container' },
      el('div', avec({ className: 'prose', style: { maxWidth: '820px', fontSize: '16.5px' } }, 'body'), markdown(d.body)),
      tableau(d.faq).length ? faqAccordeon(d.faq, 'faq', { marginTop: '36px' }) : null)),
    info(null, 'Formulaire de demande de devis (automatique, commun aux pages formation).'),
    blocSeo(d, 'Formations ' + nom + ' - 4SH', d.intro));
}

/* ------------------------------------------------------------------------- */
/* Enregistrement auprès du CMS                                              */
/* ------------------------------------------------------------------------- */

// Collections dossier : enregistrées sous le nom de la collection.
const GABARITS = {
  secteurs: ApercuSecteur,
  pages_secteurs: ApercuClientsSolutions,
  technologies: ApercuTechnologie,
  categories: ApercuCategorie,
};

function enregistrer(CMS) {
  CMS.registerPreviewStyle(STYLES, { raw: true });
  Object.keys(GABARITS).forEach((nom) => CMS.registerPreviewTemplate(nom, GABARITS[nom]));
}

// Attend le CMS et les outils de apercus.js (jusqu'à 10 secondes).
(function attendre(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function' && w.APERCUS_4SH && w.APERCUS_4SH.outils) return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus-collections.js : CMS ou apercus.js introuvable, aperçus non enregistrés.');
  setTimeout(() => attendre(essai + 1), 100);
})(0);
