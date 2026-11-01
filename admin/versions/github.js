// Page « Versions publiées » : accès à l'API GitHub (REST et GraphQL) et restauration en brouillon.
// Le transport (fetch) est injectable pour les tests.

import {
  analyserSituation,
  corpsRestauration,
  etiquettesBrouillon,
  messageRestauration,
  nomBranche,
  regrouperHistorique,
} from './logique.js';

export class ErreurGitHub extends Error {
  constructor(message, { statut = 0, detail = '' } = {}) {
    super(message);
    this.name = 'ErreurGitHub';
    this.statut = statut;
    this.detail = detail;
  }
}

/** Traduit une réponse d'erreur GitHub en message compréhensible. */
export function messageErreur(statut, detail = '') {
  if (statut === 0) return 'GitHub ne répond pas. Vérifiez votre connexion internet puis réessayez.';
  if (statut === 401) return 'Votre session GitHub a expiré. Reconnectez-vous puis réessayez.';
  if (statut === 403 && /rate limit/i.test(detail)) return 'GitHub limite temporairement le nombre de demandes. Patientez quelques minutes puis réessayez.';
  if (statut === 403) return 'Votre compte GitHub n’a pas le droit de faire cette action sur le dépôt du site.';
  if (statut === 404) return 'Élément introuvable sur GitHub (dépôt, fichier ou branche). Il a peut-être été supprimé entre-temps.';
  if (statut === 409) return 'Le dépôt a changé pendant l’opération. Rechargez la page puis réessayez.';
  if (statut === 422) return `GitHub a refusé l’opération${detail ? ` : ${detail}` : ''}.`;
  if (statut >= 500) return 'GitHub rencontre un problème. Réessayez dans quelques minutes.';
  return `Erreur GitHub (${statut})${detail ? ` : ${detail}` : ''}.`;
}

const encoderSegments = (chemin) => String(chemin).split('/').map(encodeURIComponent).join('/');

/** Décode du base64 en texte UTF-8, sous Node comme dans le navigateur. */
function base64VersTexte(b64) {
  const binaire = atob(String(b64).replace(/\s/g, ''));
  const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(octets);
}

/**
 * Crée un client pour le dépôt du site.
 * @param {object} args
 * @param {string} args.jeton Jeton OAuth GitHub.
 * @param {string} args.owner Propriétaire du dépôt.
 * @param {string} args.repo Nom du dépôt.
 * @param {string} args.branche Branche principale.
 * @param {string} [args.prefixeEtiquette] Préfixe des étiquettes du circuit éditorial.
 * @param {typeof fetch} [args.fetchImpl]
 */
export function creerClient({ jeton, owner, repo, branche, prefixeEtiquette = 'sveltia-cms/', fetchImpl = globalThis.fetch?.bind(globalThis), api = 'https://api.github.com' }) {
  const depot = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  async function requete(methode, chemin, corps, { accept = 'application/vnd.github+json', tolerer = [] } = {}) {
    let reponse;
    try {
      reponse = await fetchImpl(`${api}${chemin}`, {
        method: methode,
        headers: {
          Accept: accept,
          Authorization: `Bearer ${jeton}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(corps !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: corps !== undefined ? JSON.stringify(corps) : undefined,
        cache: 'no-store',
      });
    } catch (e) {
      throw new ErreurGitHub(messageErreur(0), { statut: 0, detail: String(e?.message ?? e) });
    }
    if (tolerer.includes(reponse.status)) return { statut: reponse.status, donnees: await lireJson(reponse) };
    if (!reponse.ok) {
      const donnees = await lireJson(reponse);
      const detail = [donnees?.message, ...(donnees?.errors ?? []).map((e) => e.message ?? e.code)].filter(Boolean).join(' ; ');
      throw new ErreurGitHub(messageErreur(reponse.status, detail), { statut: reponse.status, detail });
    }
    if (reponse.status === 204) return null;
    return accept.includes('raw') ? reponse.text() : lireJson(reponse);
  }

  async function lireJson(reponse) {
    try {
      return await reponse.json();
    } catch {
      return null;
    }
  }

  async function graphql(query, variables = {}) {
    const res = await requete('POST', '/graphql', { query, variables: { owner, repo, ...variables } });
    if (res?.errors?.length) {
      const detail = res.errors.map((e) => e.message).join(' ; ');
      const statut = res.errors.some((e) => e.type === 'NOT_FOUND') ? 404 : res.errors.some((e) => e.type === 'FORBIDDEN') ? 403 : 422;
      throw new ErreurGitHub(messageErreur(statut, detail), { statut, detail });
    }
    return res?.data ?? {};
  }

  return {
    requete,
    graphql,

    /** Compte connecté et droit d'écriture sur le dépôt. */
    async verifierAcces() {
      const [utilisateur, infosDepot] = await Promise.all([requete('GET', '/user'), requete('GET', depot)]);
      return {
        login: utilisateur.login,
        nom: utilisateur.name || utilisateur.login,
        peutEcrire: !!(infosDepot.permissions?.push || infosDepot.permissions?.admin),
      };
    },

    /** Fichiers d'un dossier sur la branche principale, avec leur texte (pour afficher les titres). */
    async listerDossier(dossier) {
      const data = await graphql(
        `query($owner: String!, $repo: String!, $expr: String!) {
          repository(owner: $owner, name: $repo) {
            object(expression: $expr) { ... on Tree { entries { name path type object { ... on Blob { text } } } } }
          }
        }`,
        { expr: `${branche}:${dossier}` },
      );
      return (data.repository?.object?.entries ?? []).filter((e) => e.type === 'blob');
    },

    /** Texte d'un fichier sur la branche principale (null s'il n'existe pas). */
    async lireFichierActuel(chemin) {
      const data = await graphql(
        `query($owner: String!, $repo: String!, $expr: String!) {
          repository(owner: $owner, name: $repo) { object(expression: $expr) { ... on Blob { oid text isTruncated } } }
        }`,
        { expr: `${branche}:${chemin}` },
      );
      const blob = data.repository?.object;
      if (!blob) return null;
      return { blob: blob.oid, texte: blob.isTruncated ? await this.lireBlob(blob.oid) : blob.text };
    },

    /** Texte d'un blob par son identifiant. */
    async lireBlob(oid) {
      const data = await graphql(
        `query($owner: String!, $repo: String!, $oid: GitObjectID!) {
          repository(owner: $owner, name: $repo) { object(oid: $oid) { ... on Blob { text isTruncated isBinary } } }
        }`,
        { oid },
      );
      const blob = data.repository?.object;
      if (!blob) throw new ErreurGitHub(messageErreur(404), { statut: 404 });
      if (blob.isBinary) throw new ErreurGitHub('Ce fichier n’est pas un texte : il ne peut pas être comparé.', { statut: 422 });
      if (!blob.isTruncated) return blob.text;
      const brut = await requete('GET', `${depot}/git/blobs/${oid}`);
      return base64VersTexte(brut.content);
    },

    /**
     * Versions publiées d'un fichier (commits de la branche principale), regroupées par publication.
     * @returns {Promise<{ versions: object[], suite: string | null }>}
     */
    async historique(chemin, { apres = null, nombre = 40 } = {}) {
      const data = await graphql(
        `query($owner: String!, $repo: String!, $ref: String!, $path: String!, $first: Int!, $after: String) {
          repository(owner: $owner, name: $repo) {
            ref(qualifiedName: $ref) {
              target {
                ... on Commit {
                  history(path: $path, first: $first, after: $after) {
                    pageInfo { hasNextPage endCursor }
                    nodes {
                      oid url committedDate messageHeadline
                      author { name user { login } }
                      committer { name user { login } }
                      file(path: $path) { oid mode }
                      associatedPullRequests(first: 5) {
                        nodes { number title url merged mergedAt baseRefName mergedBy { login } }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        { ref: `refs/heads/${branche}`, path: chemin, first: nombre, after: apres },
      );
      const h = data.repository?.ref?.target?.history;
      if (!h) throw new ErreurGitHub(messageErreur(404), { statut: 404 });
      return { noeuds: h.nodes, versions: regrouperHistorique(h.nodes, branche), suite: h.pageInfo.hasNextPage ? h.pageInfo.endCursor : null };
    },

    /** Demandes de fusion ouvertes : celles du back-office (étiquetées) et celles de la branche du contenu. */
    async demandesOuvertes(brancheContenu) {
      const prefixes = [...new Set([prefixeEtiquette, 'sveltia-cms/', 'netlify-cms/', 'decap-cms/'])];
      const etiquettes = prefixes.flatMap((p) => ['draft', 'pending_review', 'pending_publish', 'pending_deletion'].map((s) => `${p}${s}`));
      const champs = 'id number title url isDraft isCrossRepository baseRefName headRefName headRefOid createdAt author { login } labels(first: 20) { nodes { name } } files(first: 100) { nodes { path } }';
      const data = await graphql(
        `query($owner: String!, $repo: String!, $labels: [String!], $head: String!) {
          repository(owner: $owner, name: $repo) {
            etiquetees: pullRequests(states: OPEN, labels: $labels, first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) { nodes { ${champs} } }
            branche: pullRequests(states: OPEN, headRefName: $head, first: 20) { nodes { ${champs} } }
          }
        }`,
        { labels: etiquettes, head: brancheContenu },
      );
      return { prsEtiquetees: data.repository?.etiquetees?.nodes ?? [], prsBranche: data.repository?.branche?.nodes ?? [] };
    },

    /** Situation du contenu avant restauration (libre, brouillon existant, bloqué). */
    async situation({ chemin, collection, slug }) {
      const branche_ = nomBranche(collection, slug);
      const { prsEtiquetees, prsBranche } = await this.demandesOuvertes(branche_);
      return { branche: branche_, ...analyserSituation({ chemin, branche: branche_, brancheBase: branche, prefixe: prefixeEtiquette, prsEtiquetees, prsBranche }) };
    },

    /** Crée un commit qui remet le fichier à la version voulue, par-dessus le commit parent donné. */
    async commitRestauration({ parent, chemin, version, message }) {
      const commitParent = await requete('GET', `${depot}/git/commits/${parent}`);
      const arbre = await requete('POST', `${depot}/git/trees`, {
        base_tree: commitParent.tree.sha,
        tree: [{ path: chemin, mode: version.mode || '100644', type: 'blob', sha: version.blob }],
      });
      const commit = await requete('POST', `${depot}/git/commits`, { message, tree: arbre.sha, parents: [parent] });
      return commit.sha;
    },

    /**
     * Restaure une version sous forme de brouillon du circuit éditorial.
     * @param {object} args
     * @param {string} args.chemin Chemin du fichier.
     * @param {string} args.collection Nom de la collection.
     * @param {string} args.slug Slug du contenu.
     * @param {string} args.libelleContenu Titre lisible du contenu.
     * @param {object} args.version Version choisie (issue de regrouperHistorique).
     * @param {string} [args.utilisateur] Login de la personne connectée.
     * @param {boolean} [args.remplacer] Accord pour remplacer un brouillon existant.
     * @returns {Promise<{ nature: 'cree'|'remplace', numero: number, url: string, branche: string }>}
     */
    async restaurer({ chemin, collection, slug, libelleContenu, version, utilisateur, remplacer = false }) {
      if (!version?.blob) throw new ErreurGitHub('Cette version ne contient pas le fichier (il avait été supprimé) : elle ne peut pas être restaurée ici.', { statut: 422 });
      const actuel = await this.lireFichierActuel(chemin);
      if (actuel?.blob === version.blob) {
        throw new ErreurGitHub('Cette version est identique à la version en ligne : il n’y a rien à restaurer.', { statut: 422 });
      }
      const s = await this.situation({ chemin, collection, slug });
      const message = messageRestauration({ libelleContenu, version });
      const refChemin = `${depot}/git/refs/heads/${encoderSegments(s.branche)}`;

      if (s.etat === 'bloque') throw new ErreurGitHub(s.raison, { statut: 409 });

      if (s.etat === 'brouillon') {
        if (!remplacer) {
          throw new ErreurGitHub('Un brouillon existe déjà pour ce contenu. Confirmez son remplacement pour continuer.', { statut: 409, detail: 'brouillon-existant' });
        }
        // On repart de l'état réel de la demande de fusion, lu à l'instant.
        const pr = await requete('GET', `${depot}/pulls/${s.pr.number}`);
        const sha = await this.commitRestauration({ parent: pr.head.sha, chemin, version, message });
        const maj = await requete('PATCH', refChemin, { sha, force: false }, { tolerer: [422] });
        if (maj?.statut === 422) {
          throw new ErreurGitHub('Le brouillon a été modifié pendant l’opération. Rechargez la page puis réessayez.', { statut: 409 });
        }
        const etiquettes = (pr.labels ?? []).map((l) => l.name);
        await requete('PUT', `${depot}/issues/${pr.number}/labels`, { labels: etiquettesBrouillon(etiquettes, prefixeEtiquette) });
        if (!pr.draft) {
          await graphql(
            `mutation($id: ID!) { convertPullRequestToDraft(input: { pullRequestId: $id }) { pullRequest { isDraft } } }`,
            { id: pr.node_id },
          );
        }
        await requete('POST', `${depot}/issues/${pr.number}/comments`, {
          body: `${message}\n\nLe contenu de ce brouillon a été remplacé par la version du commit ${version.commit} (demandé par ${utilisateur ?? 'inconnu'}). Le brouillon repasse au statut « Brouillon ».`,
        });
        return { nature: 'remplace', numero: pr.number, url: pr.html_url, branche: s.branche };
      }

      // Aucun brouillon : nouvelle branche depuis la branche principale, comme le fait Sveltia.
      const tete = await requete('GET', `${depot}/git/ref/heads/${encoderSegments(branche)}`);
      const sha = await this.commitRestauration({ parent: tete.object.sha, chemin, version, message });
      const creation = await requete('POST', `${depot}/git/refs`, { ref: `refs/heads/${s.branche}`, sha }, { tolerer: [422] });
      if (creation?.statut === 422) {
        // Branche laissée par une ancienne demande fermée ou fusionnée (aucune demande ouverte, vérifié
        // plus haut) : Sveltia la remet à zéro dans ce cas, on fait de même.
        await requete('PATCH', refChemin, { sha, force: true });
      }
      const pr = await requete('POST', `${depot}/pulls`, {
        title: message,
        head: s.branche,
        base: branche,
        draft: true,
        body: corpsRestauration({ chemin, version, utilisateur }),
      });
      await requete('POST', `${depot}/issues/${pr.number}/labels`, { labels: [`${prefixeEtiquette}draft`] });
      return { nature: 'cree', numero: pr.number, url: pr.html_url, branche: s.branche };
    },
  };
}
