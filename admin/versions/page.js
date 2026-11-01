// Page « Versions publiées » : interface (navigateur).
// js-yaml auto-hébergé (copie exacte de dist/js-yaml.mjs du paquet npm js-yaml@4.3.2, licence MIT
// dans vendor/js-yaml-LICENSE.txt) : plus de script tiers sur une page qui manipule le jeton GitHub.
// Empreinte SHA-256 du fichier : zqJ2x+FfQJoa2+XRd6ungkOYpHT3z3Ar1Xlix9VwY28= (voir docs/securite.md).
import * as jsyaml from './vendor/js-yaml-4.3.2.js';
import {
  LIBELLES_STATUT,
  analyserContenu,
  comparerChamps,
  dateFr,
  diffLignes,
  lireConfig,
  regrouperHistorique,
  titreFiche,
  trouverContenu,
} from './logique.js';
import { ErreurGitHub, creerClient } from './github.js';

const CLE_SESSION_SVELTIA = 'sveltia-cms.user'; // clé où Sveltia CMS garde la session (localStorage)
const CLE_SESSION_PAGE = 'versions-4sh.session'; // session propre à cette page (sessionStorage), si connexion ici

const $ = (sel) => document.querySelector(sel);
const etat = { config: null, client: null, compte: null, collection: null, contenu: null, versions: [], suite: null, actuel: null, choisie: null, situation: null };

/* ---------- Utilitaires d'affichage ---------- */

function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) if (e != null) n.append(e instanceof Node ? e : document.createTextNode(String(e)));
  return n;
}

function annoncer(message, type = 'info') {
  const zone = $('#message');
  zone.className = `message message-${type}`;
  zone.textContent = message;
  zone.hidden = !message;
}

function texteErreur(e) {
  if (e instanceof ErreurGitHub) return e.message;
  console.error(e);
  return `Une erreur inattendue s’est produite : ${e?.message ?? e}. Rechargez la page et réessayez ; si cela persiste, prévenez l’équipe technique.`;
}

async function enAttente(bouton, action) {
  const libelle = bouton?.textContent;
  if (bouton) {
    bouton.disabled = true;
    bouton.setAttribute('aria-busy', 'true');
  }
  document.body.classList.add('occupe');
  try {
    return await action();
  } finally {
    document.body.classList.remove('occupe');
    if (bouton) {
      bouton.disabled = false;
      bouton.removeAttribute('aria-busy');
      bouton.textContent = libelle;
    }
  }
}

function afficherValeur(v) {
  if (v === undefined) return el('em', { class: 'vide', text: '(absent)' });
  if (v === null || v === '') return el('em', { class: 'vide', text: '(vide)' });
  if (Array.isArray(v)) return el('em', { class: 'vide', text: '(liste vide)' });
  if (typeof v === 'object') return el('em', { class: 'vide', text: '(groupe vide)' });
  if (typeof v === 'boolean') return document.createTextNode(v ? 'Oui' : 'Non');
  return el('span', { class: 'valeur', text: String(v) });
}

function blocDiff(avant, apres) {
  const lignes = diffLignes(avant, apres);
  if (!lignes) return el('p', { text: 'Texte trop long pour une comparaison ligne à ligne.' });
  return el(
    'div',
    { class: 'diff', role: 'group', 'aria-label': 'Comparaison ligne à ligne' },
    lignes.map((l) =>
      el(
        'div',
        { class: `ligne ligne-${l.type}` },
        el('span', { class: 'sr-only', text: l.type === 'ajout' ? 'Ajouté : ' : l.type === 'retrait' ? 'Retiré : ' : '' }),
        el('span', { class: 'signe', 'aria-hidden': 'true', text: l.type === 'ajout' ? '+' : l.type === 'retrait' ? '−' : ' ' }),
        l.texte || ' ',
      ),
    ),
  );
}

/* ---------- Session GitHub ---------- */

function lireSession() {
  try {
    const page = JSON.parse(sessionStorage.getItem(CLE_SESSION_PAGE) ?? 'null');
    if (page?.token) return { jeton: page.token, source: 'page' };
  } catch { /* stockage indisponible */ }
  try {
    const u = JSON.parse(localStorage.getItem(CLE_SESSION_SVELTIA) ?? 'null');
    if (u && u.backendName === 'github' && typeof u.token === 'string' && u.token) return { jeton: u.token, source: 'sveltia' };
  } catch { /* stockage indisponible */ }
  return null;
}

/** Connexion par le même Worker OAuth que Sveltia (fenêtre surgissante, protocole Decap/Sveltia). */
function seConnecter() {
  const { authRacine, authChemin, authScope } = etat.config;
  const url = `${authRacine}/${authChemin}?${new URLSearchParams({ provider: 'github', site_id: location.hostname, scope: authScope })}`;
  const origine = new URL(url).origin;
  const largeur = 600;
  const hauteur = 800;
  const fenetre = window.open(url, 'auth', `width=${largeur},height=${hauteur},top=${screen.availHeight / 2 - hauteur / 2},left=${screen.availWidth / 2 - largeur / 2}`);
  if (!fenetre) return Promise.reject(new ErreurGitHub('La fenêtre de connexion a été bloquée par le navigateur. Autorisez les fenêtres surgissantes pour ce site, puis réessayez.'));
  return new Promise((resoudre, rejeter) => {
    const surveillance = setInterval(() => {
      if (fenetre.closed) {
        nettoyer();
        rejeter(new ErreurGitHub('Connexion annulée.'));
      }
    }, 1000);
    function nettoyer() {
      clearInterval(surveillance);
      window.removeEventListener('message', ecouter);
    }
    function ecouter({ origin, data, source }) {
      if (source !== fenetre || origin !== origine || typeof data !== 'string') return;
      if (data === 'authorizing:github') {
        fenetre.postMessage(data, origin);
        return;
      }
      const m = /^authorization:github:(success|error):(.+)$/s.exec(data);
      if (!m) return;
      nettoyer();
      fenetre.close();
      let res = {};
      try { res = JSON.parse(m[2]); } catch { /* ignoré */ }
      if (m[1] === 'success' && res.token) resoudre(res.token);
      else rejeter(new ErreurGitHub(`La connexion à GitHub a échoué${res.error ? ` : ${res.error}` : ''}.`));
    }
    window.addEventListener('message', ecouter);
  });
}

async function ouvrirSession(jeton, source) {
  const { owner, repo, branche, prefixeEtiquette } = etat.config;
  const client = creerClient({ jeton, owner, repo, branche, prefixeEtiquette });
  const compte = await client.verifierAcces();
  etat.client = client;
  etat.compte = compte;
  $('#session').replaceChildren(
    el('span', {}, 'Connecté à GitHub : ', el('strong', { text: compte.nom }), source === 'sveltia' ? ' (session du back-office)' : ''),
  );
  if (!compte.peutEcrire) {
    annoncer('Votre compte peut consulter l’historique mais n’a pas le droit d’écrire sur le dépôt : la restauration sera refusée. Demandez l’accès à l’administrateur du dépôt.', 'avertissement');
  }
  $('#etape-contenu').hidden = false;
}

function afficherConnexion(message) {
  const bouton = el('button', { type: 'button', class: 'bouton bouton-principal', text: 'Se connecter avec GitHub' });
  bouton.addEventListener('click', () =>
    enAttente(bouton, async () => {
      try {
        const jeton = await seConnecter();
        try { sessionStorage.setItem(CLE_SESSION_PAGE, JSON.stringify({ token: jeton })); } catch { /* ignoré */ }
        annoncer('');
        await ouvrirSession(jeton, 'page');
        await lienDirect();
      } catch (e) {
        annoncer(texteErreur(e), 'erreur');
      }
    }),
  );
  $('#session').replaceChildren(
    el('p', { text: message ?? 'Vous n’êtes pas connecté. Ouvrez d’abord le back-office et connectez-vous, puis revenez sur cette page, ou connectez-vous ici.' }),
    bouton,
  );
}

/* ---------- Étape 1 : choisir un contenu ---------- */

function remplirCollections() {
  const liste = $('#collection');
  liste.replaceChildren(el('option', { value: '', text: 'Choisir un type de contenu…' }));
  for (const c of etat.config.collections) liste.append(el('option', { value: c.nom, text: c.libelle }));
}

async function choisirCollection(nom) {
  const liste = $('#contenu');
  liste.replaceChildren(el('option', { value: '', text: 'Chargement…' }));
  liste.disabled = true;
  masquerApres('contenu');
  const collection = etat.config.collections.find((c) => c.nom === nom);
  etat.collection = collection ?? null;
  if (!collection) {
    liste.replaceChildren(el('option', { value: '', text: 'Choisir d’abord un type de contenu' }));
    return;
  }
  let options = [];
  if (collection.type === 'fichiers') {
    options = collection.fichiers.map((f) => ({ valeur: f.chemin, libelle: f.libelle }));
  } else {
    const fichiers = await etat.client.listerDossier(collection.dossierLangue);
    options = fichiers
      .filter((f) => f.name.endsWith(`.${collection.extension}`))
      .map((f) => {
        const slug = f.name.slice(0, -(collection.extension.length + 1));
        let donnees = null;
        try { donnees = analyserContenu(f.object?.text, collection.format, jsyaml); } catch { /* fichier illisible : on garde le nom */ }
        return { valeur: f.path, libelle: titreFiche(collection, donnees, slug) };
      })
      .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'));
  }
  liste.replaceChildren(
    el('option', { value: '', text: options.length ? `Choisir parmi ${options.length} contenu(s)…` : 'Aucun contenu publié' }),
    ...options.map((o) => el('option', { value: o.valeur, text: o.libelle })),
  );
  liste.disabled = !options.length;
}

function masquerApres(etape) {
  const ordre = ['contenu', 'versions', 'comparaison'];
  for (const e of ordre.slice(ordre.indexOf(etape))) {
    if (e !== 'contenu') $(`#etape-${e}`).hidden = true;
  }
  $('#resultat').hidden = true;
}

/* ---------- Étape 2 : versions ---------- */

async function chargerContenu(chemin, libelle) {
  masquerApres('versions');
  const trouve = trouverContenu(etat.config, chemin);
  if (!trouve) throw new ErreurGitHub('Ce fichier ne correspond à aucun contenu du back-office.');
  const { collection, slug, fichier } = trouve;
  etat.contenu = {
    chemin,
    slug,
    collection: collection.nom,
    libelle: libelle ?? fichier?.libelle ?? slug,
    format: fichier?.format ?? collection.format,
    champs: fichier?.champs ?? collection.champs,
  };
  const actuel = await etat.client.lireFichierActuel(chemin);
  etat.actuel = actuel ? { ...actuel, donnees: analyserSur(actuel.texte) } : null;
  if (actuel && !libelle && collection.type === 'dossier') etat.contenu.libelle = titreFiche(collection, etat.actuel.donnees, slug);
  const { versions, suite } = await etat.client.historique(chemin);
  etat.versions = versions;
  etat.suite = suite;
  afficherVersions();
}

function analyserSur(texte) {
  try {
    return analyserContenu(texte, etat.contenu.format, jsyaml);
  } catch {
    return null;
  }
}

function afficherVersions() {
  const section = $('#etape-versions');
  $('#titre-versions').textContent = `Versions publiées de « ${etat.contenu.libelle} »`;
  const corps = $('#versions tbody');
  corps.replaceChildren();
  if (!etat.versions.length) {
    corps.append(el('tr', {}, el('td', { colspan: '5', text: 'Aucune version publiée trouvée pour ce contenu.' })));
  }
  for (const v of etat.versions) {
    const enLigne = !!etat.actuel && v.blob === etat.actuel.blob;
    let action;
    if (enLigne) action = el('span', { class: 'pastille', text: 'Version en ligne' });
    else if (v.supprime) action = el('span', { class: 'discret', text: 'Contenu supprimé à cette date' });
    else {
      action = el('button', { type: 'button', class: 'bouton', text: 'Comparer', 'aria-label': `Comparer la version du ${dateFr(v.date)} avec la version en ligne` });
      action.addEventListener('click', () => enAttente(action, () => comparer(v).catch((e) => annoncer(texteErreur(e), 'erreur'))));
    }
    corps.append(
      el(
        'tr',
        { class: enLigne ? 'en-ligne' : null },
        el('td', {}, el('time', { datetime: v.date, text: dateFr(v.date) })),
        el('td', { text: v.modifiePar }),
        el('td', { text: v.publiePar ?? '' }),
        el('td', {}, v.message, v.pr ? el('span', { class: 'discret' }, ' (', el('a', { href: v.pr.url, target: '_blank', rel: 'noopener', text: `demande n° ${v.pr.numero}` }), ')') : null),
        el('td', {}, action),
      ),
    );
  }
  $('#plus-versions').hidden = !etat.suite;
  section.hidden = false;
  $('#titre-versions').focus();
}

async function chargerPlus(bouton) {
  await enAttente(bouton, async () => {
    const { noeuds, suite } = await etat.client.historique(etat.contenu.chemin, { apres: etat.suite });
    // Une publication à cheval sur deux pages ne doit pas apparaître deux fois.
    const dejaVues = new Set(etat.versions.map((v) => v.pr?.numero).filter(Boolean));
    const nouvelles = regrouperHistorique(noeuds, etat.config.branche).filter((v) => !v.pr || !dejaVues.has(v.pr.numero));
    etat.versions = [...etat.versions, ...nouvelles];
    etat.suite = suite;
    afficherVersions();
  });
}

/* ---------- Étape 3 : comparaison ---------- */

async function comparer(version) {
  masquerApres('comparaison');
  const texte = await etat.client.lireBlob(version.blob);
  const donnees = analyserSur(texte);
  etat.choisie = { ...version, texte, donnees };
  const section = $('#etape-comparaison');
  $('#titre-comparaison').textContent = `Version du ${dateFr(version.date)} comparée à la version en ligne`;
  const zone = $('#differences');
  zone.replaceChildren();

  if (!etat.actuel) {
    zone.append(el('p', { text: 'Ce contenu n’existe plus en ligne : la restauration le recréera tel qu’il était à cette date.' }));
  } else if (donnees && etat.actuel.donnees) {
    const diffs = comparerChamps(etat.actuel.donnees, donnees, etat.contenu.champs);
    zone.append(
      el('p', { class: 'resume' }, diffs.length ? `${diffs.length} champ(s) changeront si vous restaurez cette version :` : 'Aucune différence de contenu (seule la mise en forme du fichier diffère).'),
    );
    const liste = el('ul', { class: 'liste-differences' });
    for (const d of diffs) {
      const longs = [d.enLigne, d.restauree].some((v) => typeof v === 'string' && (v.length > 160 || v.includes('\n')));
      const nature = { modifie: 'modifié', ajoute: 'sera ajouté', retire: 'sera retiré' }[d.nature];
      liste.append(
        el(
          'li',
          { class: `difference difference-${d.nature}` },
          el('h4', {}, d.libelle, el('span', { class: 'discret', text: ` (${nature})` })),
          longs
            ? blocDiff(typeof d.enLigne === 'string' ? d.enLigne : '', typeof d.restauree === 'string' ? d.restauree : '')
            : el(
                'dl',
                { class: 'avant-apres' },
                el('div', {}, el('dt', { text: 'En ligne aujourd’hui' }), el('dd', {}, afficherValeur(d.enLigne))),
                el('div', {}, el('dt', { text: 'Après restauration' }), el('dd', {}, afficherValeur(d.restauree))),
              ),
        ),
      );
    }
    zone.append(liste);
  } else {
    zone.append(el('p', { text: 'Le contenu n’a pas pu être lu champ par champ ; voici la comparaison du fichier.' }));
  }
  const details = el('details', { class: 'detail-technique' }, el('summary', { text: 'Voir le fichier complet, ligne à ligne' }));
  details.append(el('p', { class: 'discret', text: 'Lignes marquées « − » : retirées par la restauration. Lignes « + » : remises par la restauration.' }), blocDiff(etat.actuel?.texte ?? '', texte));
  zone.append(details);

  section.hidden = false;
  $('#titre-comparaison').focus();
}

/* ---------- Restauration ---------- */

async function preparerRestauration(bouton) {
  await enAttente(bouton, async () => {
    const { chemin, collection, slug, libelle } = etat.contenu;
    const s = await etat.client.situation({ chemin, collection, slug });
    etat.situation = s;
    const dialogue = $('#confirmation');
    $('#confirmation-texte').textContent = `Un brouillon de « ${libelle} » va être créé avec le contenu de la version du ${dateFr(etat.choisie.date)}. Rien ne change sur le site tant que ce brouillon n’a pas été relu puis publié dans le back-office.`;
    const avertissement = $('#confirmation-avertissement');
    const case_ = $('#confirmation-remplacer');
    case_.checked = false;
    const valider = $('#confirmation-valider');
    if (s.etat === 'bloque') {
      annoncer(s.raison, 'erreur');
      return;
    }
    if (s.etat === 'brouillon') {
      const statut = LIBELLES_STATUT[s.statut] ?? 'Brouillon';
      $('#avertissement-texte').textContent = `Ce contenu a déjà une modification non publiée (statut « ${statut} », ouverte par ${s.pr.author?.login ?? 'quelqu’un'} le ${dateFr(s.pr.createdAt, false)}). La restauration remplacera son texte par celui de la version choisie et la remettra au statut « Brouillon ». Les modifications en cours resteront consultables dans l’historique de la demande sur GitHub, mais ne seront plus dans le brouillon.${s.autresFichiers?.length ? ' Les autres fichiers de ce brouillon (images par exemple) sont conservés.' : ''}`;
      $('#avertissement-lien').href = s.pr.url;
      avertissement.hidden = false;
      valider.textContent = 'Remplacer le brouillon';
      valider.disabled = true;
    } else {
      avertissement.hidden = true;
      valider.textContent = 'Créer le brouillon';
      valider.disabled = false;
    }
    dialogue.showModal();
  });
}

async function executerRestauration() {
  const dialogue = $('#confirmation');
  const valider = $('#confirmation-valider');
  await enAttente(valider, async () => {
    try {
      const { chemin, collection, slug, libelle } = etat.contenu;
      const res = await etat.client.restaurer({
        chemin,
        collection,
        slug,
        libelleContenu: libelle,
        version: etat.choisie,
        utilisateur: etat.compte?.login,
        remplacer: etat.situation?.etat === 'brouillon' && $('#confirmation-remplacer').checked,
      });
      dialogue.close();
      const resultat = $('#resultat');
      resultat.replaceChildren(
        el('h2', { tabindex: '-1', id: 'titre-resultat', text: res.nature === 'cree' ? 'Brouillon créé' : 'Brouillon remplacé' }),
        el('p', { text: `La version du ${dateFr(etat.choisie.date)} de « ${libelle} » est maintenant un brouillon. Elle suit le circuit habituel : relecture, puis publication dans le back-office. Le site ne change qu’à la publication.` }),
        el('p', { class: 'discret', text: 'Si le back-office est déjà ouvert dans un autre onglet, cliquez sur son bouton d’actualisation pour voir le brouillon.' }),
        el('p', {}, el('a', { class: 'bouton bouton-principal', href: '../#/workflow', text: 'Ouvrir le circuit éditorial' }), ' ', el('a', { href: res.url, target: '_blank', rel: 'noopener', text: `Voir la demande n° ${res.numero} sur GitHub` })),
      );
      resultat.hidden = false;
      $('#titre-resultat').focus();
      annoncer('');
    } catch (e) {
      dialogue.close();
      annoncer(texteErreur(e), 'erreur');
    }
  });
}

/* ---------- Lien direct ?chemin=… ---------- */

async function lienDirect() {
  const chemin = new URLSearchParams(location.search).get('chemin');
  if (!chemin) return;
  const trouve = trouverContenu(etat.config, chemin);
  if (!trouve) {
    annoncer(`Le fichier « ${chemin} » ne correspond à aucun contenu du back-office.`, 'erreur');
    return;
  }
  $('#collection').value = trouve.collection.nom;
  await choisirCollection(trouve.collection.nom);
  $('#contenu').value = chemin;
  await chargerContenu(chemin, $('#contenu').selectedOptions[0]?.textContent);
}

/* ---------- Démarrage ---------- */

async function demarrer() {
  $('#collection').addEventListener('change', (e) => choisirCollection(e.target.value).catch((err) => annoncer(texteErreur(err), 'erreur')));
  $('#formulaire-contenu').addEventListener('submit', (e) => {
    e.preventDefault();
    const liste = $('#contenu');
    if (!liste.value) {
      annoncer('Choisissez un contenu dans la liste.', 'avertissement');
      liste.focus();
      return;
    }
    annoncer('');
    const bouton = e.submitter ?? $('#voir-versions');
    enAttente(bouton, () => chargerContenu(liste.value, liste.selectedOptions[0]?.textContent).catch((err) => annoncer(texteErreur(err), 'erreur')));
  });
  $('#plus-versions').addEventListener('click', (e) => chargerPlus(e.currentTarget).catch((err) => annoncer(texteErreur(err), 'erreur')));
  $('#restaurer').addEventListener('click', (e) => preparerRestauration(e.currentTarget).catch((err) => annoncer(texteErreur(err), 'erreur')));
  $('#confirmation-remplacer').addEventListener('change', (e) => { $('#confirmation-valider').disabled = !e.target.checked; });
  $('#confirmation-annuler').addEventListener('click', () => $('#confirmation').close());
  $('#confirmation').addEventListener('close', () => $('#restaurer').focus());
  $('#confirmation-formulaire').addEventListener('submit', (e) => {
    e.preventDefault();
    executerRestauration();
  });

  try {
    const reponse = await fetch('../config.yml', { cache: 'no-store' });
    if (!reponse.ok) throw new Error(`config.yml introuvable (${reponse.status})`);
    etat.config = lireConfig(await reponse.text(), jsyaml);
  } catch (e) {
    annoncer(`La configuration du back-office n’a pas pu être lue (${e.message}). Prévenez l’équipe technique.`, 'erreur');
    return;
  }
  if (!etat.config.circuitEditorial) {
    annoncer('Le circuit éditorial n’est pas activé dans le back-office : la restauration en brouillon n’est pas possible.', 'erreur');
    return;
  }
  remplirCollections();
  const session = lireSession();
  if (!session) {
    afficherConnexion();
    return;
  }
  try {
    await ouvrirSession(session.jeton, session.source);
    await lienDirect();
  } catch (e) {
    if (e instanceof ErreurGitHub && e.statut === 401) {
      try { sessionStorage.removeItem(CLE_SESSION_PAGE); } catch { /* ignoré */ }
      afficherConnexion('Votre session GitHub a expiré. Reconnectez-vous.');
    } else {
      annoncer(texteErreur(e), 'erreur');
    }
  }
}

demarrer();
