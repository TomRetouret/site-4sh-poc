/*
 * Aperçus Sveltia : formations.
 * Chargé par admin/index.html après apercus.js. Enregistre ses gabarits avec CMS.registerPreviewTemplate.
 *
 * - « formations » : fiche formation, balisage repris de src/_includes/formation.njk (classes du
 *   site, feuille learning.css ajoutée dans l'aperçu). Mise en forme identique au site
 *   (eleventy/formations.js) : prix « 1500 € HT », durée « 3 jours (21h00) », note « 4,7 / 5 »,
 *   sessions « Du JJ/MM/AAAA au JJ/MM/AAAA ». Les sessions déjà commencées restent visibles
 *   dans l'aperçu, barrées, avec la mention qu'elles sont masquées sur le site.
 * - « equipe » : fiche Équipe, rendue comme le bloc Formateur d'une fiche.
 *
 * Conventions reprises de apercus.js (petits utilitaires recopiés) : h() global du CMS,
 * entry.getIn(['data']), data-key-path sur chaque élément éditable, accent *mot*, getAsset.
 * Libellés : copie de src/_data/libelles.json (formation) au 1er novembre 2026.
 */

const L = {
  eyebrow: 'Formations · ', prix_titre: 'Prix de la formation', par_participant: 'par participant',
  promo: "Pour toute demande intra-entreprise, jusqu'à <b>-50 %</b> sur une formation.",
  sessions_titre: 'Prochaine(s) session(s)', cta_inscription: 'Démarrer mon inscription', cta_devis: 'Devis sur mesure',
  note_lieu: 'Disponible en présentiel (Bordeaux, Paris, Toulouse, Lyon, Marseille, Lille) ou à distance.',
  personnes: 'personnes', avis: 'avis', depuis: 'Depuis', theorie: 'Théorie', pratique: 'Pratique',
  description_titre: 'Description de la formation', pour_qui_titre: 'Pour qui ?', prerequis_titre: 'Prérequis',
  objectifs_titre: 'Objectifs *pédagogiques*', programme_titre: 'Programme de la formation',
  formateur_titre: 'Votre *formateur*', faq_titre: 'Vos questions sur la formation',
  documents_titre: 'Documents', programme_pdf_label: 'Programme de la formation',
};

const STYLES = `
.apercu-session-passee{opacity:.55;text-decoration:line-through}
.apercu-f-info{font:600 12.5px/1.4 Asap,system-ui,sans-serif;margin:6px 0;padding:6px 10px;background:#eef3ff;color:#23324d;border-left:3px solid #4a6fd1}
.apercu-f-alerte{font:600 12.5px/1.4 Asap,system-ui,sans-serif;margin:6px 0;padding:6px 10px;background:#fff4d6;color:#5c3d00;border-left:3px solid #e0a100}
.apercu-f-seo{font:600 13px/1.4 Asap,system-ui,sans-serif;padding:10px 16px;background:#14171C;color:#d8dbe0}
.apercu-f-seo b{color:#fff}.apercu-f-seo p{margin:2px 0}
`;

/* ---- utilitaires (recopiés de apercus.js) ---- */
function obtenirH() {
  const w = typeof window !== 'undefined' ? window : globalThis;
  const h = w.h || w.createElement || (w.CMS && w.CMS.React && w.CMS.React.createElement) || (w.React && w.React.createElement);
  if (typeof h !== 'function') throw new Error('apercus-formations.js : h() introuvable (window.h)');
  return h;
}
function el(type, props, ...enfants) {
  const plats = [];
  (function aplatir(liste) {
    for (const e of liste) {
      if (Array.isArray(e)) aplatir(e);
      else if (e !== null && e !== undefined && e !== false && e !== '') plats.push(e);
    }
  })(enfants);
  return obtenirH()(type, props || null, ...plats);
}
const versJS = (v) => (v && typeof v.toJS === 'function' ? v.toJS() : v);
function lireDonnees(entry) {
  if (!entry) return {};
  if (typeof entry.getIn === 'function') return versJS(entry.getIn(['data'])) || {};
  return versJS(entry.data) || {};
}
const cle = (chemin) => ({ 'data-key-path': chemin, tabIndex: 0 });
const tableau = (v) => (Array.isArray(v) ? v : []);
const texte = (v) => (v === null || v === undefined ? '' : String(v));
const vide = (v) => texte(v).trim() === '';
function accent(s) {
  const morceaux = [];
  const re = /\*([^*\n]+)\*/g;
  const t = texte(s);
  let dernier = 0;
  let m;
  while ((m = re.exec(t))) {
    morceaux.push(t.slice(dernier, m.index));
    morceaux.push(el('em', { className: 'accent' }, m[1]));
    dernier = re.lastIndex;
  }
  morceaux.push(t.slice(dernier));
  return morceaux;
}
function adresseImage(getAsset, fichier) {
  if (!fichier) return '';
  try {
    const a = typeof getAsset === 'function' ? getAsset(fichier) : null;
    const s = a ? String(a.url || a.toString()) : '';
    return s && s !== '[object Object]' ? s : fichier;
  } catch (err) {
    return fichier;
  }
}
function groupe(enfants) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  const F = (w.CMS && w.CMS.React && w.CMS.React.Fragment) || (w.React && w.React.Fragment);
  return F ? el(F, null, enfants) : el('div', { style: { display: 'contents' } }, enfants);
}

/* ---- mise en forme (mêmes règles que eleventy/formations.js) ---- */
const nombre = (v) => {
  if (vide(v)) return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
};
const decimalFr = (n) => String(n).replace('.', ',');
const dateIso = (v) => {
  if (vide(v)) return '';
  if (v instanceof Date) return isNaN(v) ? '' : v.toISOString().slice(0, 10);
  const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};
const dateFr = (iso) => iso.split('-').reverse().join('/');
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function prixAffiche(i) {
  const n = nombre(i.prix);
  return n === null ? '' : `${i.prix_a_partir ? 'À partir de ' : ''}${decimalFr(n)} € HT`;
}
const joursTexte = (j) => (j === 0.5 ? '1/2 journée' : `${decimalFr(j)} ${j <= 1 ? 'jour' : 'jours'}`);
function heuresTexte(h) {
  let e = Math.floor(h);
  let m = Math.round((h - e) * 60);
  if (m === 60) { e += 1; m = 0; }
  return `${e}h${String(m).padStart(2, '0')}`;
}
// Durée : [partie en gras, suite]
function duree(c) {
  if (!vide(c.duree_texte)) {
    const t = texte(c.duree_texte).trim();
    const m = t.match(/^(.*?)(\s*\(.*\))$/);
    return m ? [m[1], m[2]] : [t, ''];
  }
  const j = nombre(c.duree_jours);
  const h = nombre(c.duree_heures);
  if (j === null && h === null) return null;
  if (j === null) return [heuresTexte(h), ''];
  return [joursTexte(j), h === null ? '' : ` (${heuresTexte(h)})`];
}
function participants(c) {
  const a = nombre(c.participants_min);
  const b = nombre(c.participants_max);
  if (a !== null && b !== null) return a === b ? `${b}` : `${a} à ${b}`;
  return b !== null ? `${b}` : a !== null ? `${a}` : '';
}
function session(s) {
  const d = dateIso(s && s.debut);
  const f = dateIso(s && s.fin);
  if (!d) return { libelle: '(date de début manquante)', passee: false };
  return { libelle: !f || f === d ? `Le ${dateFr(d)}` : `Du ${dateFr(d)} au ${dateFr(f)}`, passee: d < aujourdhui() };
}
const paragraphes = (t) => texte(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/* ---- chargement de la fiche Équipe reliée (getCollection, résultat en cache) ---- */
const cache = new Map();
let Chargeur = null;
function avecEquipe(getCollection, slug, rendu) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (!slug) return rendu(null);
  if (!Chargeur && typeof w.createClass === 'function') {
    Chargeur = w.createClass({
      getInitialState: function () { return { v: cache.get(this.props.slug) }; },
      componentDidMount: function () { this.vivant = true; this.charger(); },
      componentWillUnmount: function () { this.vivant = false; },
      componentDidUpdate: function (avant) { if (avant.slug !== this.props.slug) this.charger(); },
      charger: function () {
        const slug = this.props.slug;
        if (cache.has(slug)) { if (this.state.v !== cache.get(slug)) this.setState({ v: cache.get(slug) }); return; }
        const soi = this;
        Promise.resolve()
          .then(() => (typeof soi.props.getCollection === 'function' ? soi.props.getCollection('equipe', slug) : null))
          .then((r) => {
            r = versJS(r);
            if (Array.isArray(r)) r = r.find((e) => e && e.slug === slug) || null;
            return (r && r.data) || null;
          })
          .catch(() => null)
          .then((v) => { cache.set(slug, v); if (soi.vivant && soi.props.slug === slug) soi.setState({ v }); });
      },
      render: function () { return groupe([this.props.rendu(this.state.v)]); },
    });
  }
  if (!Chargeur) return rendu(cache.get(slug) || null);
  return el(Chargeur, { slug, getCollection, rendu });
}

/* ---- gabarit d'une fiche formation ---- */
function blocFormateur(props, f, titre) {
  return avecEquipe(props.getCollection, texte(f.personne), (fiche) => {
    if (vide(f.personne)) return null;
    if (!fiche) return el('p', Object.assign({ className: 'apercu-f-info' }, cle('formateur.personne')), `Formateur : fiche Équipe « ${f.personne} » en cours de chargement ou introuvable.`);
    const role = vide(f.fonction) ? fiche.fonction : f.fonction;
    const bio = paragraphes(vide(f.presentation) ? fiche.presentation : f.presentation);
    return el('section', { id: 'formateur', style: { padding: '48px 0 0' } },
      el('div', { className: 'bloc-detail', style: { maxWidth: 'none' } },
        el('h2', { style: { maxWidth: '820px' } }, accent(L.formateur_titre)),
        el('div', { className: 'formateur' },
          el('div', Object.assign({ className: 'portrait' }, cle('formateur.personne')),
            fiche.photo && el('img', { src: adresseImage(props.getAsset, fiche.photo), alt: `${texte(fiche.nom)}, formateur ${titre} chez 4SH` }),
            el('b', null, texte(fiche.nom)),
            el('span', cle('formateur.fonction'), texte(role))),
          el('div', cle('formateur.presentation'),
            bio.map((para, k) => el('p', k === bio.length - 1 ? { style: { marginBottom: 0 } } : null, accent(para)))))));
  });
}

const manque = (chemin, libelle) => el('p', Object.assign({ className: 'apercu-f-alerte' }, cle(chemin)), `${libelle} : obligatoire pour publier (Qualiopi).`);

function carteInscription(props, i) {
  const sessions = tableau(i.sessions);
  return el('aside', { className: 'detail-aside' },
    el('div', { className: 'aside-colle' },
      el('div', { className: 'carte-inscription' },
        el('div', { className: 'prix-bloc' },
          el('div', { className: 'sessions', style: { marginBottom: '6px' } }, L.prix_titre),
          el('div', Object.assign({ className: 'montant' }, cle('inscription.prix')), prixAffiche(i) || '(prix vide)'),
          el('div', { className: 'par' }, L.par_participant),
          el('div', { className: 'promo', dangerouslySetInnerHTML: { __html: L.promo } })),
        sessions.length > 0 && [
          el('div', { className: 'sessions' }, L.sessions_titre),
          sessions.map((s, k) => {
            const v = session(s);
            return el('div', Object.assign({ className: 'session' + (v.passee ? ' apercu-session-passee' : ''), title: v.passee ? 'Session commencée : masquée sur le site' : '' }, cle(`inscription.sessions.${k}.debut`)), v.libelle);
          }),
          sessions.some((s) => session(s).passee) && el('p', { className: 'apercu-f-info' }, 'Les sessions barrées sont déjà commencées : elles sont masquées sur le site.')],
        el('a', { className: 'btn btn-learning' }, L.cta_inscription),
        el('a', { className: 'btn btn-ghost', style: { width: '100%', justifyContent: 'center', borderColor: 'var(--violet)', color: 'var(--violet)' } }, L.cta_devis),
        el('p', { className: 'note-lieu' }, L.note_lieu)),
      el('div', { className: 'carte-inscription', style: { marginTop: '16px' } },
        el('div', { className: 'sessions' }, L.documents_titre),
        vide(i.programme_pdf)
          ? manque('inscription.programme_pdf', 'Programme détaillé (PDF)')
          : el('ul', { style: { listStyle: 'none', padding: 0, margin: '8px 0 0', fontSize: '14.5px', lineHeight: 1.9 } },
            el('li', cle('inscription.programme_pdf'), el('a', { title: 'Destination : ' + i.programme_pdf }, L.programme_pdf_label + (vide(i.programme_pdf_poids) ? '' : ` (PDF, ${i.programme_pdf_poids})`)))))));
}

function chiffresCles(c) {
  const dur = duree(c);
  const note = nombre(c.note);
  const theorie = nombre(c.theorie);
  return [
    el('div', { className: 'meta-grille' },
      dur && el('div', Object.assign({ className: 'meta-item' }, cle(vide(c.duree_texte) ? 'chiffres.duree_jours' : 'chiffres.duree_texte')), el('span', null, el('b', null, dur[0]), dur[1])),
      participants(c) && el('div', Object.assign({ className: 'meta-item' }, cle('chiffres.participants_max')), el('span', null, el('b', null, participants(c)), ' ' + L.personnes)),
      note !== null && el('div', Object.assign({ className: 'meta-item' }, cle('chiffres.note')), el('span', null, el('b', null, `${decimalFr(note)} / 5`), vide(c.avis) ? '' : ` · ${c.avis} ${L.avis}`)),
      !vide(c.depuis) && el('div', Object.assign({ className: 'meta-item' }, cle('chiffres.depuis')), el('span', null, L.depuis + ' ', el('b', null, texte(c.depuis))))),
    theorie !== null && theorie > 0 && theorie < 100 && el('div', Object.assign({ className: 'repartition' }, cle('chiffres.theorie')),
      el('div', { className: 'barre' }, el('i', { className: 'theorie', style: { width: theorie + '%' } }), el('i', { className: 'pratique', style: { width: (100 - theorie) + '%' } })),
      el('div', { className: 'legende' }, el('span', { className: 't' }, `${L.theorie} ${theorie} %`), el('span', { className: 'p' }, `${L.pratique} ${100 - theorie} % (calculée)`))),
  ];
}

function ApercuFormation(props) {
  const d = lireDonnees(props.entry);
  const e = d.entete || {};
  const i = d.inscription || {};
  const c = d.chiffres || {};
  const p = d.public || {};
  const r = d.referencement || {};
  const titre = texte(e.titre);
  const corps = typeof props.widgetFor === 'function' ? props.widgetFor('body') : null;
  const prerequis = tableau(p.prerequis);

  return el('div', { className: 'learning apercu-formation' },
    el('link', { rel: 'stylesheet', href: '/assets/learning.css' }),
    el('div', { className: 'apercu-f-seo' },
      el('p', cle('referencement.meta_title'), el('b', null, 'Titre SEO : '), texte(r.meta_title) || `(vide : « Formation ${titre} - 4SH »)`),
      el('p', cle('referencement.meta_description'), el('b', null, 'Description SEO : '), texte(r.meta_description) || "(vide : l'accroche est reprise)"),
      r.indexation === false && el('p', cle('referencement.indexation'), el('b', null, 'Page masquée des moteurs de recherche')),
      !vide(e.groupe) && el('p', cle('entete.groupe'), el('b', null, 'Famille : '), texte(e.groupe))),
    el('div', { className: 'hero-detail' },
      el('div', { className: 'container' },
        el('nav', { className: 'fil-ariane' }, 'Accueil › Formations › ', el('span', cle('entete.categorie'), texte(e.categorie)), ` › Formation ${titre}${vide(e.sous_titre) ? '' : ' ' + e.sous_titre}`),
        el('div', { className: 'detail-tete' },
          el('span', Object.assign({ className: 'eyebrow' }, cle('entete.categorie')), L.eyebrow + texte(e.categorie)),
          el('h1', null, el('span', cle('entete.titre'), `Formation ${titre}`),
            !vide(e.sous_titre) && [' ', el('em', Object.assign({ className: 'accent' }, cle('entete.sous_titre')), texte(e.sous_titre))]),
          el('p', Object.assign({ className: 'chapo' }, cle('entete.chapo')), texte(e.chapo))),
        el('div', { className: 'detail-grille' },
          carteInscription(props, i),
          el('div', { className: 'detail-main' },
            !vide(e.niveau) && el('nav', { className: 'toggle-niveau' }, el('a', Object.assign({ className: 'actif' }, cle('entete.niveau')), texte(e.niveau))),
            chiffresCles(c),
            !vide(e.image) && el('div', Object.assign({ className: 'visuel-detail' }, cle('entete.image')), el('img', { src: adresseImage(props.getAsset, e.image), alt: `Formation ${titre}, 4SH` })),
            el('section', { id: 'description', style: { padding: '44px 0 0' } },
              el('div', { className: 'bloc-detail' },
                el('h2', null, L.description_titre + ' ', el('em', { className: 'accent' }, titre)),
                el('div', cle('body'), corps),
                vide(p.pour_qui) ? manque('public.pour_qui', 'Public visé') : [el('h3', null, L.pour_qui_titre), el('p', cle('public.pour_qui'), accent(p.pour_qui))],
                prerequis.length
                  ? [el('h3', null, L.prerequis_titre), el('ul', { className: 'liste-prereq' }, prerequis.map((x, k) => el('li', cle(`public.prerequis.${k}`), texte(x))))]
                  : manque('public.prerequis', 'Prérequis'))),
            tableau(d.objectifs).length
              ? el('section', { id: 'objectifs', style: { padding: '48px 0 0' } },
                el('div', { className: 'bloc-detail' },
                  el('h2', null, accent(L.objectifs_titre)),
                  el('ul', { className: 'liste-check' }, tableau(d.objectifs).map((x, k) => el('li', cle(`objectifs.${k}`), texte(x))))))
              : manque('objectifs', 'Objectifs pédagogiques'),
            tableau(d.programme).length
              ? el('section', { id: 'programme', style: { padding: '48px 0 0' } },
                el('div', { className: 'bloc-detail' },
                  el('h2', null, L.programme_titre + ' ', el('em', { className: 'accent' }, titre)),
                  el('div', { className: 'programme' }, tableau(d.programme).map((ch, k) =>
                    el('details', { open: true },
                      el('summary', cle(`programme.${k}.titre`), texte(ch && ch.titre)),
                      el('ul', { className: 'contenu' }, tableau(ch && ch.points).map((x, n) => el('li', cle(`programme.${k}.points.${n}`), texte(x)))))))))
              : manque('programme', 'Programme'),
            blocFormateur(props, d.formateur || {}, titre),
            tableau(d.faq).length > 0 && el('section', { style: { padding: '48px 0 0' } },
              el('div', { className: 'bloc-detail' },
                el('h2', null, L.faq_titre + ' ', el('em', { className: 'accent' }, titre)),
                el('div', { className: 'faq', style: { marginTop: '8px' } }, tableau(d.faq).map((q, k) =>
                  el('details', { open: true },
                    el('summary', cle(`faq.${k}.question`), texte(q && q.question)),
                    el('p', cle(`faq.${k}.reponse`), texte(q && q.reponse))))))),
            el('p', { className: 'apercu-f-info', style: { marginTop: '32px' } }, 'Modalités d’accueil, autres formations de la catégorie, devis et fenêtre de pré-inscription sont ajoutés automatiquement.'))))));
}

/* ---- gabarit d'une fiche Équipe ---- */
function ApercuEquipe(props) {
  const d = lireDonnees(props.entry);
  const bio = paragraphes(d.presentation);
  return el('div', { className: 'learning' },
    el('link', { rel: 'stylesheet', href: '/assets/learning.css' }),
    el('div', { className: 'container', style: { padding: '40px 16px' } },
      el('div', { className: 'bloc-detail', style: { maxWidth: 'none' } },
        el('div', { className: 'formateur' },
          el('div', { className: 'portrait' },
            d.photo && el('img', Object.assign({ src: adresseImage(props.getAsset, d.photo), alt: texte(d.photo_alt) }, cle('photo'))),
            el('b', cle('nom'), texte(d.nom) || '(nom vide)'),
            el('span', cle('fonction'), texte(d.fonction))),
          el('div', cle('presentation'), bio.map((para, k) => el('p', k === bio.length - 1 ? { style: { marginBottom: 0 } } : null, accent(para)))))),
      d.photo && vide(d.photo_alt) && el('p', Object.assign({ className: 'apercu-f-alerte' }, cle('photo_alt')), 'Texte alternatif de la photo manquant.'),
      el('p', { className: 'apercu-f-info' }, 'Rendu dans la section Formateur des fiches formation qui relient cette personne. Une formation peut remplacer la fonction et la présentation.')));
}

function enregistrer(CMS) {
  CMS.registerPreviewStyle(STYLES, { raw: true });
  CMS.registerPreviewTemplate('formations', ApercuFormation);
  CMS.registerPreviewTemplate('equipe', ApercuEquipe);
}
(function attendreCMS(essai) {
  const w = typeof window !== 'undefined' ? window : globalThis;
  if (w.CMS && typeof w.CMS.registerPreviewTemplate === 'function') return enregistrer(w.CMS);
  if (essai > 100) return console.warn('apercus-formations.js : CMS introuvable, aperçus non enregistrés.');
  setTimeout(() => attendreCMS(essai + 1), 100);
})(0);

export { ApercuFormation, ApercuEquipe };
