// Page « Versions publiées » du back-office 4SH : fonctions pures (sans navigateur ni réseau).
// Testables sous Node. La lecture YAML est fournie par l'appelant (js-yaml) pour rester sans dépendance.
//
// Les règles de nommage reprennent celles de Sveltia CMS 0.256.1 (code source, fichiers
// src/lib/services/workflow/branch.js, labels.js, entries.js) :
//  - branche du circuit éditorial : cms/<nom de la collection>/<slug>, le slug ayant ses « % » et « / » encodés ;
//  - slug d'une fiche de collection « dossier » : chemin du fichier dans le dossier, sans extension ;
//  - slug d'un fichier de collection « fichiers » : le nom (name) du fichier dans la configuration ;
//  - étiquette de statut : <préfixe><statut>, préfixe « sveltia-cms/ » par défaut.

export const PREFIXE_ETIQUETTE_DEFAUT = 'sveltia-cms/';
export const PREFIXES_ETIQUETTE_ANCIENS = ['netlify-cms/', 'decap-cms/'];
export const STATUTS = ['draft', 'pending_review', 'pending_publish', 'pending_deletion'];
export const LIBELLES_STATUT = {
  draft: 'Brouillon',
  pending_review: 'En relecture',
  pending_publish: 'Prêt à publier',
  pending_deletion: 'Suppression en attente',
};

const FORMAT_PAR_EXTENSION = { md: 'frontmatter', markdown: 'frontmatter', json: 'json', yml: 'yaml', yaml: 'yaml', toml: 'toml' };

/** Retire les barres obliques de début et de fin. */
const nettoyerChemin = (chemin = '') => String(chemin).replace(/^\/+|\/+$/g, '');

/**
 * Lit la configuration Sveltia (texte de admin/config.yml) et en garde ce qui sert à la page.
 * @param {string} texte Contenu YAML.
 * @param {{ load: (s: string) => any }} yaml Bibliothèque js-yaml.
 */
export function lireConfig(texte, yaml) {
  const brut = yaml.load(texte) ?? {};
  const backend = brut.backend ?? {};
  if (backend.name !== 'github') {
    throw new Error('Le back-office n’est pas branché sur GitHub : la page des versions ne sait pas le lire.');
  }
  const [owner, repo] = String(backend.repo ?? '').split('/');
  if (!owner || !repo) throw new Error('Le dépôt GitHub (backend.repo) est absent de la configuration.');
  const i18n = brut.i18n ?? {};
  const locales = Array.isArray(i18n.locales) ? i18n.locales : [];
  const localeDefaut = i18n.default_locale ?? locales[0] ?? '';
  const collections = (brut.collections ?? []).map((c) => lireCollection(c, { i18n, localeDefaut }));
  return {
    owner,
    repo,
    branche: backend.branch ?? 'main',
    authRacine: String(backend.base_url ?? 'https://api.netlify.com').replace(/\/+$/, ''),
    authChemin: nettoyerChemin(backend.auth_endpoint ?? 'auth'),
    authScope: [backend.auth_scope ?? 'repo', 'user'].flat().join(','),
    prefixeEtiquette: backend.cms_label_prefix || PREFIXE_ETIQUETTE_DEFAUT,
    circuitEditorial: (typeof brut.publish_mode === 'string' ? brut.publish_mode : brut.publish_mode?.type) === 'editorial_workflow',
    locales,
    localeDefaut,
    structureI18n: i18n.structure ?? 'single_file',
    collections,
  };
}

function lireCollection(c, { i18n, localeDefaut }) {
  const base = {
    nom: c.name,
    libelle: c.label ?? c.name,
    libelleSingulier: c.label_singular ?? c.label ?? c.name,
    i18n: !!c.i18n,
  };
  if (Array.isArray(c.files)) {
    return {
      ...base,
      type: 'fichiers',
      fichiers: c.files.map((f) => {
        const extension = (String(f.file).split('.').pop() || '').toLowerCase();
        return {
          nom: f.name,
          libelle: f.label ?? f.name,
          modeleChemin: nettoyerChemin(f.file),
          // Pour un fichier multilingue, on restaure la version de la langue par défaut.
          chemin: nettoyerChemin(String(f.file).replaceAll('{{locale}}', localeDefaut)),
          format: f.format ?? c.format ?? FORMAT_PAR_EXTENSION[extension] ?? 'frontmatter',
          champs: f.fields ?? [],
        };
      }),
    };
  }
  const extension = c.extension ?? (c.format === 'json' ? 'json' : 'md');
  let dossier = nettoyerChemin(c.folder);
  let dossierLangue = dossier;
  if (dossier.includes('{{locale}}')) {
    dossierLangue = dossier.replaceAll('{{locale}}', localeDefaut);
  } else if (c.i18n && (i18n.structure ?? 'single_file') === 'multiple_folders' && localeDefaut) {
    dossierLangue = `${dossier}/${localeDefaut}`;
  }
  return {
    ...base,
    type: 'dossier',
    dossier,
    dossierLangue,
    extension,
    format: c.format ?? FORMAT_PAR_EXTENSION[extension] ?? 'frontmatter',
    champIdentifiant: c.identifier_field ?? 'title',
    resume: c.summary ?? '',
    gabaritChemin: c.path ?? '',
    champs: c.fields ?? [],
  };
}

/** Encode un slug comme Sveltia pour le nom de branche (« % » puis « / »). */
export const encoderSlug = (slug) => String(slug).replaceAll('%', '%25').replaceAll('/', '%2F');

/** Nom de la branche du circuit éditorial pour un contenu. */
export const nomBranche = (nomCollection, slug) => `cms/${nomCollection}/${encoderSlug(slug)}`;

/** Échappe un texte pour une expression régulière. */
const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Retrouve la collection, le slug et le libellé correspondant au chemin d'un fichier du dépôt.
 * @returns {{ collection: object, slug: string, fichier?: object } | null}
 */
export function trouverContenu(config, chemin) {
  const p = nettoyerChemin(chemin);
  for (const collection of config.collections) {
    if (collection.type === 'fichiers') {
      for (const fichier of collection.fichiers) {
        const motif = new RegExp(`^${echapper(fichier.modeleChemin).replaceAll(echapper('{{locale}}'), '[^/]+')}$`);
        if (motif.test(p)) return { collection, slug: fichier.nom, fichier };
      }
      continue;
    }
    if (collection.gabaritChemin) continue; // gabarit « path » non géré (aucune collection du site n'en a)
    const ext = `.${collection.extension}`;
    if (!p.endsWith(ext)) continue;
    const dossiers = [collection.dossierLangue];
    if (collection.dossier.includes('{{locale}}')) {
      dossiers.push(...config.locales.map((l) => collection.dossier.replaceAll('{{locale}}', l)));
    } else if (collection.dossierLangue !== collection.dossier) {
      dossiers.push(...config.locales.map((l) => `${collection.dossier}/${l}`));
    } else {
      dossiers.push(collection.dossier);
    }
    for (const d of new Set(dossiers)) {
      const prefixe = d ? `${d}/` : '';
      if (!p.startsWith(prefixe)) continue;
      const sousChemin = p.slice(prefixe.length, -ext.length);
      // Pas de sous-dossier : aucune collection du site n'utilise de fiches imbriquées.
      if (!sousChemin || sousChemin.includes('/')) continue;
      return { collection, slug: sousChemin };
    }
  }
  return null;
}

/** Va chercher une valeur par un chemin pointé (« entete.titre »). */
export function lireChemin(objet, chemin) {
  return String(chemin)
    .split('.')
    .reduce((v, k) => (v == null ? undefined : v[k]), objet);
}

/** Construit le titre lisible d'une fiche à partir du résumé ou du champ identifiant de la collection. */
export function titreFiche(collection, donnees, slug) {
  if (!donnees || typeof donnees !== 'object') return slug;
  if (collection.resume) {
    let vide = true;
    const texte = collection.resume.replace(/\{\{\s*([^}|]+?)\s*(\|[^}]*)?\}\}/g, (_, cle) => {
      const v = lireChemin(donnees, cle.replace(/^fields\./, ''));
      if (v != null && v !== '') vide = false;
      return v == null ? '' : String(v);
    });
    if (!vide) return texte.replace(/\s+/g, ' ').trim();
  }
  for (const cle of [collection.champIdentifiant, 'title', 'titre', 'nom', 'name']) {
    const v = cle ? lireChemin(donnees, cle) : undefined;
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return slug;
}

/**
 * Lit le contenu d'un fichier selon son format : objet de données, avec le corps Markdown sous la
 * clé « body » (nom du champ utilisé par Sveltia).
 */
export function analyserContenu(texte, format, yaml) {
  if (texte == null) return null;
  if (format === 'json') return JSON.parse(texte);
  if (format === 'yaml' || format === 'yml') return yaml.load(texte) ?? {};
  // Front matter YAML (format par défaut des fichiers .md)
  const m = /^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/.exec(texte);
  if (!m) return { body: texte };
  const donnees = yaml.load(m[1]) ?? {};
  const corps = m[2].replace(/^\r?\n/, '');
  return corps.trim() ? { ...donnees, body: corps } : { ...donnees };
}

/** Aplatit un objet en couples chemin pointé / valeur simple. */
export function aplatir(valeur, prefixe = '', sortie = new Map()) {
  if (valeur instanceof Date) {
    sortie.set(prefixe, valeur.toISOString().slice(0, 10));
  } else if (Array.isArray(valeur)) {
    if (!valeur.length && prefixe) sortie.set(prefixe, []);
    valeur.forEach((v, i) => aplatir(v, prefixe ? `${prefixe}.${i}` : String(i), sortie));
  } else if (valeur && typeof valeur === 'object') {
    const cles = Object.keys(valeur);
    if (!cles.length && prefixe) sortie.set(prefixe, {});
    cles.forEach((k) => aplatir(valeur[k], prefixe ? `${prefixe}.${k}` : k, sortie));
  } else {
    sortie.set(prefixe, valeur);
  }
  return sortie;
}

/**
 * Donne le libellé lisible d'un chemin pointé, d'après les champs de la configuration.
 * Ex. « blocs.2.titre » devient « Blocs › Bandeau n° 3 › Titre ».
 */
export function libelleChemin(champs, chemin, racine) {
  const morceaux = String(chemin).split('.');
  const libelles = [];
  let liste = champs ?? [];
  let champCourant = null;
  let valeur = racine;
  for (const m of morceaux) {
    if (Array.isArray(valeur) && /^\d+$/.test(m)) {
      const element = valeur[Number(m)];
      const rang = `n° ${Number(m) + 1}`;
      if (champCourant?.types) {
        const cleType = champCourant.typeKey ?? champCourant.type_key ?? 'type';
        const def = champCourant.types.find((t) => t.name === element?.[cleType]);
        libelles.push(def ? `${def.label ?? def.name} ${rang}` : `Élément ${rang}`);
        liste = def?.fields ?? [];
        champCourant = null;
      } else if (champCourant?.field) {
        libelles.push(`Élément ${rang}`);
        const sous = champCourant.field;
        liste = sous.fields ?? [];
        champCourant = sous.fields ? null : sous;
      } else {
        libelles.push(`Élément ${rang}`);
        liste = champCourant?.fields ?? [];
        champCourant = null;
      }
      valeur = element;
      continue;
    }
    if (m === 'body' && !liste.some((c) => c.name === 'body')) {
      libelles.push('Corps du texte');
      champCourant = null;
      valeur = valeur?.[m];
      continue;
    }
    const champ = liste.find((c) => c.name === m);
    libelles.push(champ?.label ?? m);
    champCourant = champ ?? null;
    liste = champ?.fields ?? [];
    valeur = valeur?.[m];
  }
  return libelles.join(' › ');
}

/**
 * Compare la version en ligne et la version à restaurer, champ par champ.
 * @returns {{ chemin: string, libelle: string, enLigne: any, restauree: any, nature: 'modifie'|'ajoute'|'retire' }[]}
 */
export function comparerChamps(enLigne, restauree, champs) {
  const a = aplatir(enLigne ?? {});
  const b = aplatir(restauree ?? {});
  const chemins = [...new Set([...a.keys(), ...b.keys()])];
  const differences = [];
  for (const chemin of chemins) {
    const va = a.get(chemin);
    const vb = b.get(chemin);
    if (JSON.stringify(va) === JSON.stringify(vb)) continue;
    const nature = !a.has(chemin) ? 'ajoute' : !b.has(chemin) ? 'retire' : 'modifie';
    const racine = b.has(chemin) ? restauree : enLigne;
    differences.push({ chemin, libelle: libelleChemin(champs, chemin, racine), enLigne: va, restauree: vb, nature });
  }
  return differences;
}

/**
 * Différence ligne à ligne (plus longue sous-suite commune). Suffisant pour des fichiers de contenu.
 * @returns {{ type: 'egal'|'ajout'|'retrait', texte: string }[] | null} null si les textes sont trop longs.
 */
export function diffLignes(avant, apres, limite = 4_000_000) {
  const a = String(avant ?? '').split(/\r?\n/);
  const b = String(apres ?? '').split(/\r?\n/);
  // Retire le début et la fin communs pour réduire le calcul.
  let debut = 0;
  while (debut < a.length && debut < b.length && a[debut] === b[debut]) debut += 1;
  let fin = 0;
  while (fin < a.length - debut && fin < b.length - debut && a[a.length - 1 - fin] === b[b.length - 1 - fin]) fin += 1;
  const ma = a.slice(debut, a.length - fin);
  const mb = b.slice(debut, b.length - fin);
  if (ma.length * mb.length > limite) return null;
  const n = ma.length;
  const m = mb.length;
  const t = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      t[i][j] = ma[i] === mb[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    }
  }
  const res = a.slice(0, debut).map((texte) => ({ type: 'egal', texte }));
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (ma[i] === mb[j]) {
      res.push({ type: 'egal', texte: ma[i] });
      i += 1;
      j += 1;
    } else if (t[i + 1][j] >= t[i][j + 1]) {
      res.push({ type: 'retrait', texte: ma[i] });
      i += 1;
    } else {
      res.push({ type: 'ajout', texte: mb[j] });
      j += 1;
    }
  }
  while (i < n) res.push({ type: 'retrait', texte: ma[i++] });
  while (j < m) res.push({ type: 'ajout', texte: mb[j++] });
  a.slice(a.length - fin).forEach((texte) => res.push({ type: 'egal', texte }));
  return res;
}

/** Traduit les messages de commit par défaut de Sveltia en français. */
export function traduireMessage(message) {
  const m = /^(?:\[skip ci\]\s*)?(Create|Update|Delete) (.+?) “(.+)”$/.exec(String(message ?? '').trim());
  if (!m) return String(message ?? '').trim();
  const verbe = { Create: 'Création', Update: 'Modification', Delete: 'Suppression' }[m[1]];
  return `${verbe} de « ${m[3]} » (${m[2]})`;
}

/**
 * Transforme l'historique GitHub (GraphQL, commits de la branche principale touchant le fichier)
 * en liste de versions publiées. Une demande de fusion publiée ne compte qu'une fois : on garde
 * son dernier commit touchant le fichier, c'est ce contenu qui a été mis en ligne.
 * @param {object[]} noeuds Nœuds `history` (du plus récent au plus ancien).
 * @param {string} branche Branche principale (main).
 */
export function regrouperHistorique(noeuds, branche) {
  const vus = new Set();
  const versions = [];
  for (const n of noeuds) {
    const pr = (n.associatedPullRequests?.nodes ?? []).find((p) => p.merged && p.baseRefName === branche) ?? null;
    if (pr) {
      if (vus.has(pr.number)) continue;
      vus.add(pr.number);
    }
    const blob = n.file?.oid ?? null;
    const auteurCommit = n.author?.user?.login ?? n.author?.name ?? 'inconnu';
    versions.push({
      commit: n.oid,
      blob,
      mode: n.file?.mode != null ? Number(n.file.mode).toString(8) : '100644',
      supprime: !blob,
      date: pr?.mergedAt ?? n.committedDate,
      modifiePar: n.author?.name || auteurCommit,
      publiePar: pr ? (pr.mergedBy?.login ?? null) : (n.committer?.user?.login ?? n.committer?.name ?? null),
      message: traduireMessage(pr?.title ?? n.messageHeadline),
      pr: pr ? { numero: pr.number, url: pr.url } : null,
      url: n.url ?? null,
    });
  }
  return versions;
}

/** Statut du circuit éditorial d'après les étiquettes d'une demande de fusion. */
export function statutDepuisEtiquettes(etiquettes, prefixe = PREFIXE_ETIQUETTE_DEFAUT) {
  const prefixes = [...new Set([prefixe, PREFIXE_ETIQUETTE_DEFAUT, ...PREFIXES_ETIQUETTE_ANCIENS])];
  for (const p of prefixes) {
    const s = STATUTS.find((st) => etiquettes.includes(`${p}${st}`));
    if (s) return s;
  }
  return null;
}

/** Remplace l'étiquette de statut par celle du brouillon, en gardant les autres étiquettes. */
export function etiquettesBrouillon(etiquettes, prefixe = PREFIXE_ETIQUETTE_DEFAUT) {
  const prefixes = [...new Set([prefixe, PREFIXE_ETIQUETTE_DEFAUT, ...PREFIXES_ETIQUETTE_ANCIENS])];
  const statut = prefixes.flatMap((p) => STATUTS.map((s) => `${p}${s}`));
  return [...etiquettes.filter((e) => !statut.includes(e)), `${prefixe}draft`];
}

/**
 * Décide ce que la restauration peut faire, au vu des demandes de fusion ouvertes.
 * @param {object} args
 * @param {object[]} args.prsEtiquetees Demandes ouvertes portant une étiquette du back-office (avec fichiers).
 * @param {object[]} args.prsBranche Demandes ouvertes depuis la branche du contenu (étiquetées ou non).
 * @returns {{ etat: 'libre' } | { etat: 'brouillon', pr: object, statut: string } | { etat: 'bloque', raison: string, pr?: object }}
 */
export function analyserSituation({ chemin, branche, brancheBase, prefixe, prsEtiquetees, prsBranche }) {
  const memeDepot = (p) => !p.isCrossRepository && p.baseRefName === brancheBase;
  const touche = prsEtiquetees.filter((p) => memeDepot(p) && (p.files?.nodes ?? []).some((f) => f.path === chemin));
  const surBranche = prsBranche.filter((p) => !p.isCrossRepository);
  const autre = touche.find((p) => p.headRefName !== branche);
  if (autre) {
    return {
      etat: 'bloque',
      pr: autre,
      raison: `Ce contenu a déjà une modification en cours sous un autre nom (demande n° ${autre.number}). Terminez-la ou abandonnez-la dans le back-office, puis recommencez.`,
    };
  }
  const pr = touche.find((p) => p.headRefName === branche) ?? null;
  if (pr) {
    const statut = statutDepuisEtiquettes((pr.labels?.nodes ?? []).map((l) => l.name), prefixe);
    if (statut === 'pending_deletion') {
      return { etat: 'bloque', pr, raison: 'Une suppression de ce contenu est en attente de publication. Annulez-la dans le back-office avant de restaurer une version.' };
    }
    const autresFichiers = (pr.files?.nodes ?? []).filter((f) => f.path !== chemin);
    return { etat: 'brouillon', pr, statut, autresFichiers: autresFichiers.map((f) => f.path) };
  }
  if (surBranche.length) {
    return {
      etat: 'bloque',
      pr: surBranche[0],
      raison: `La branche de ce contenu est utilisée par une autre demande de fusion (n° ${surBranche[0].number}) que le back-office ne gère pas. Demandez à l'équipe technique de la fermer.`,
    };
  }
  return { etat: 'libre' };
}

/** Date lisible en français. */
export function dateFr(iso, avecHeure = true) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso ?? '');
  const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' };
  if (avecHeure) Object.assign(options, { hour: '2-digit', minute: '2-digit' });
  return new Intl.DateTimeFormat('fr-FR', options).format(d).replace(':', ' h ');
}

/** Titre et message du commit de restauration. */
export function messageRestauration({ libelleContenu, version }) {
  return `Restauration de « ${libelleContenu} » (version du ${dateFr(version.date, false)})`;
}

/** Corps de la demande de fusion de restauration. */
export function corpsRestauration({ chemin, version, utilisateur }) {
  return [
    'Restauration d’une version publiée antérieure, créée depuis la page « Versions publiées » du back-office (/admin/versions/).',
    '',
    `- Fichier : \`${chemin}\``,
    `- Version restaurée : commit ${version.commit} du ${dateFr(version.date)}${version.pr ? ` (demande n° ${version.pr.numero})` : ''}`,
    `- Demandée par : ${utilisateur ?? 'inconnu'}`,
    '',
    'À relire puis publier depuis le tableau du circuit éditorial du back-office.',
  ].join('\n');
}
