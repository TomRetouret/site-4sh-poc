# Mise en place de la preuve de concept back-office (Sveltia CMS et Decap CMS)

Guide pas à pas pour préparer l'environnement de test avant la semaine du 30 novembre 2026.
Public : Tom (product owner). Aucune commande n'est à taper par Tom, sauf mention contraire.
Rédigé le 1er novembre 2026. Les points non vérifiés sont signalés par **[Non vérifié]** et repris en fin de document.

## En bref

- On copie la branche `poc/back-office` dans un nouveau dépôt GitHub `site-4sh-poc`, sur l'organisation GitHub de 4SH.
- On branche ce dépôt sur un site Netlify de test, avec un aperçu par demande de fusion.
- Les deux outils se connectent avec GitHub par le Worker Cloudflare `sveltia-cms-auth`, déjà en service.
- Les testeurs utilisent leur propre compte GitHub. On règle qui peut publier par une protection de branche.

## Qui fait quoi

| Rôle | Qui | Ce qu'il fait |
|---|---|---|
| Tom | product owner | décisions, Netlify, Cloudflare, invitations, répétition |
| Propriétaire GitHub 4SH | un owner de l'organisation GitHub 4SH | création du dépôt, validation des applications (Netlify, OAuth) |
| Développeur | un dev 4SH, ou Claude sur le poste de Tom | copie de la branche, vérification des fichiers de configuration |
| Testeurs | les 5 contributeurs | créer ou communiquer leur compte GitHub, accepter l'invitation |
| Observateur | un collègue de Tom | deuxième compte pour le scénario 13, prise de notes |

## Durée totale estimée

| Étape | Qui | Durée |
|---|---|---|
| 0. Décisions préalables | Tom | 20 min |
| 1. Vérifier la branche | Développeur | 15 min |
| 2. Créer le dépôt de test | Propriétaire GitHub + Développeur | 20 min |
| 3. Régler le dépôt | Propriétaire GitHub ou Tom | 10 min |
| 4. Créer le site Netlify | Tom (+ propriétaire GitHub pour l'application Netlify) | 30 min |
| 5. Protéger les aperçus | Tom | 10 min (niveau gratuit) |
| 6. Authentification GitHub | Tom + propriétaire GitHub | 30 min |
| 7. Comptes des testeurs | Tom + testeurs | 15 min pour Tom, 10 min par testeur sans compte |
| 8. Droits et protection de branche | Propriétaire GitHub ou Tom | 30 min |
| 9. Jeu de données de départ | Tom + Développeur | 1 h |
| 10. Répétition générale | Tom + Observateur | 1 h |
| **Total** | | **environ 5 h de travail, sur 2 à 3 jours calendaires** (les validations par un owner prennent souvent plus de temps que le travail lui-même) |

Conseil : finir les étapes 0 à 8 au plus tard le vendredi 20 novembre. Il reste ainsi une semaine pour corriger.

---

## Étape 0. Décisions préalables

**Qui :** Tom. **Durée :** 20 min.

Trois questions conditionnent la suite. Les réponses ne se trouvent pas dans le dépôt : il faut les obtenir de l'admin GitHub et de l'admin Netlify de 4SH.

1. **Quel est le forfait GitHub de l'organisation 4SH ?** (Free, Team ou Enterprise)
   - La protection de branche et la fusion automatique (auto-merge) sont disponibles sur les dépôts **publics** avec GitHub Free. Sur un dépôt **privé**, il faut GitHub Team ou plus (source : doc GitHub, « About protected branches » et « Automatically merging a pull request »).
   - La restriction « qui peut pousser sur la branche » n'existe que pour les dépôts d'une **organisation**, pas d'un compte personnel.
2. **Le dépôt de test sera-t-il public ou privé ?**
   - **Recommandation : public**, sauf si 4SH a GitHub Team et un forfait Netlify Pro. Raisons :
     - protection de branche et auto-merge gratuits sur un dépôt public ;
     - sur Netlify, les contributeurs Git sont gratuits et illimités sur les dépôts publics (page tarifs Netlify). Sur un dépôt privé avec le forfait gratuit, un build déclenché par un commit d'une personne qui n'est pas membre de l'équipe Netlify peut être bloqué (« Build blocked: Unrecognized Git contributor », signalé sur le forum Netlify). Or chaque testeur signe ses propres commits par le CMS.
   - Ce que ça implique : le code du site devient lisible par tous. Contrôle fait le 1er novembre : aucun fichier de secret dans la branche (la fonction `netlify/functions/submission-created.js` lit ses clés Mailjet dans des variables d'environnement Netlify, pas dans le code). Le contenu est celui d'un site public. Le jeu de données de test reste fictif.
3. **Quelle équipe Netlify héberge le site de test, et avec quel forfait ?** (voir l'étape 5 pour l'effet sur la protection des aperçus)

Noter les réponses ici avant de continuer :

- Organisation GitHub : `__________` (forfait : `______`)
- Dépôt : public / privé
- Équipe Netlify : `__________` (forfait : `______`)

Dans la suite, `<org>` désigne le nom de l'organisation GitHub de 4SH.

---

## Étape 1. Vérifier la branche

**Qui :** Développeur. **Durée :** 15 min.

Avant de copier quoi que ce soit, vérifier que la branche `poc/back-office` contient bien :

- [ ] `admin/index.html` qui charge Sveltia CMS **en version fixe 0.256.1** (pas « dernière version ») ;
- [ ] `admin-decap/index.html` qui charge Decap CMS **en version fixe 3.17.3** ;
- [ ] dans `admin/config.yml` et `admin-decap/config.yml` :
  - `backend.name: github`
  - `backend.repo: <org>/site-4sh-poc` (le nom de l'organisation doit être exactement celui de l'étape 0)
  - `backend.branch: main`
  - `backend.base_url: https://sveltia-cms-auth.tom-retouret.workers.dev`
  - circuit éditorial activé (`publish_mode` : `type: editorial_workflow` chez Sveltia, `editorial_workflow` chez Decap)
  - `site_url` et `display_url` qui pointent vers l'adresse du site Netlify de test (pas vers www.4sh.fr) ;
- [ ] `npm run build` passe sans erreur et produit `dist/index.html` et `dist/en/index.html` ;
- [ ] `netlify.toml` garde l'en-tête `X-Robots-Tag: noindex, nofollow` sur toutes les pages.

**Constat du 1er novembre 2026 :** les deux interfaces sont en place, en version fixe (`@sveltia/cms@0.256.1`, `decap-cms@3.17.3`), en circuit éditorial, avec le Worker en `base_url`. Deux corrections restent à faire dans **les deux** `config.yml` :

- `backend.repo` vaut `TomRetouret/site-4sh-poc` : le remplacer par `<org>/site-4sh-poc` ;
- `site_url` et `display_url` valent `https://www.4sh.fr` : les remplacer par l'adresse du site de test (étape 4). Sinon les liens « voir sur le site » envoient les testeurs sur le vrai site, ce qui fausse le scénario S7.

Autre constat utile pour le protocole : la configuration Decap ne contient que la page d'accueil et les témoignages. Aucune collection de pages construites par blocs n'existe dans les deux outils (voir `protocole-tests.md`, section 11).

---

## Étape 2. Créer le dépôt de test

**Qui :** Propriétaire GitHub (5 min), puis Développeur (15 min). **Durée :** 20 min.

1. **Propriétaire GitHub :** sur github.com, organisation `<org>`, bouton « New repository ».
   - Nom : `site-4sh-poc`
   - Visibilité : selon l'étape 0 (public recommandé)
   - **Ne rien cocher** (pas de README, pas de licence, pas de .gitignore) : le dépôt doit être vide.
   - Ajouter Tom comme administrateur du dépôt (Settings, Collaborators and teams, rôle Admin). Tom pourra ainsi faire les étapes 3 et 8 lui-même.
2. **Développeur :** pousser la branche comme branche `main` du nouveau dépôt, depuis le dossier du site :

   ```bash
   git push https://github.com/<org>/site-4sh-poc.git poc/back-office:main
   ```

   Cette commande ne modifie ni le dépôt `TomRetouret/site-4sh` ni ses branches. Elle n'emporte que l'historique de la branche.
3. **Développeur :** poser une étiquette sur l'état de départ, utile pour remettre le dépôt à zéro entre deux sessions :

   ```bash
   git push https://github.com/<org>/site-4sh-poc.git poc/back-office:refs/tags/etat-depart
   ```

   (Si le jeu de données de l'étape 9 est ajouté après, déplacer l'étiquette sur le commit final.)

Résultat attendu : le dépôt `<org>/site-4sh-poc` affiche les fichiers du site sur `main`.

---

## Étape 3. Régler le dépôt

**Qui :** Tom (admin du dépôt) ou propriétaire GitHub. **Durée :** 10 min.

Dans le dépôt, Settings, General, rubrique « Pull Requests » :

- [ ] **Allow auto-merge : coché.** Indispensable pour Sveltia (voir l'étape 8).
- [ ] Allow merge commits : coché (réglage par défaut).
- [ ] Allow squash merging : laisser coché (Decap peut l'utiliser si on active son option `squash_merges`).
- [ ] Automatically delete head branches : facultatif. Les deux outils suppriment eux-mêmes la branche après publication.

---

## Étape 4. Créer le site Netlify de test

**Qui :** Tom, avec le propriétaire GitHub pour une validation. **Durée :** 30 min.

1. Sur app.netlify.com, dans l'équipe choisie à l'étape 0 : « Add new project », puis « Import an existing project », puis GitHub.
2. Netlify demande d'installer son application GitHub sur l'organisation `<org>`. **Seul un owner de l'organisation peut l'autoriser.** Limiter l'accès au seul dépôt `site-4sh-poc` (« Only select repositories »).
3. Choisir le dépôt `site-4sh-poc`, puis :
   - Branch to deploy : `main`
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Ces valeurs sont aussi dans `netlify.toml` (avec Node 22), qui prime sur l'interface.
4. Nom du site : voir l'étape 5 (un nom difficile à deviner est un premier niveau de protection). Exemple : `site-4sh-poc-k7q2m`. L'adresse sera `https://site-4sh-poc-k7q2m.netlify.app`.
5. Lancer le premier déploiement. Vérifier que la page d'accueil, `/en/`, `/admin/` et `/admin-decap/` s'ouvrent.
6. **Aperçus des demandes de fusion :** Project configuration, Build & deploy, Continuous deployment, « Branches and deploy contexts ». Régler **Deploy Previews : Any pull request against your production branch**. Laisser les « Branch deploys » sur « None » (inutile ici).
7. **Ne pas** renseigner les variables Mailjet (`MJ_APIKEY_PUBLIC`, etc.) : le formulaire de contact du site de test doit rester inactif. Les soumissions resteront dans Netlify Forms.
8. Noter l'adresse exacte du site, puis revenir à l'étape 1 si `site_url` dans les deux `config.yml` ne correspond pas (le développeur la corrige dans le dépôt de test).

Résultat attendu : chaque demande de fusion ouverte par un des outils affiche, dans GitHub, une vérification Netlify nommée sur le modèle `netlify/<nom-du-site>/deploy-preview`, avec un lien vers l'aperçu.

**[Non vérifié]** Le nom exact de la vérification Netlify est donné de mémoire. Il apparaîtra dans GitHub dès la première demande de fusion. Decap exige que ce nom contienne le mot « deploy » pour afficher son lien d'aperçu (doc Decap, « Deploy Preview Links ») ; sinon il faut renseigner `preview_context` dans `admin-decap/config.yml`.

---

## Étape 5. Protéger les aperçus

**Qui :** Tom. **Durée :** 10 min pour le niveau 1 ou 2, 30 min pour le niveau 3.

Le site de test et ses aperçus montrent le site 4SH avec des contenus de démonstration. Le risque principal est qu'un contenu fictif soit indexé ou partagé comme s'il était réel.

**Contrainte importante :** les testeurs doivent pouvoir ouvrir `/admin/` et `/admin-decap/` sur le site de **production** de test, et les aperçus. Ils n'ont pas de compte Netlify. Un site « Private » (connexion Netlify) les bloquerait.

| Niveau | Ce que ça fait | Forfait Netlify | Coût | Effort pour les testeurs |
|---|---|---|---|---|
| 1. Lien public non indexé | Tout le monde peut ouvrir le lien, les moteurs ne l'indexent pas | Tous | 0 € | Aucun |
| 2. Adresse difficile à deviner | Niveau 1 + nom de site aléatoire | Tous | 0 € | Aucun |
| 3. Mot de passe partagé | Un mot de passe unique demandé à l'ouverture | Pro | 20 $ par mois pour l'équipe (tarif affiché le 1er novembre 2026) | Saisir un mot de passe |
| 4. Authentification nominative | Connexion par compte (membres de l'équipe Netlify, ou SSO) | Enterprise | Sur devis | Créer un compte Netlify ou passer par le SSO |

Détails vérifiés sur la doc Netlify (« Site protection », « How to password protect a Netlify site or deploy previews ») :

- Niveau 1 : `netlify.toml` ajoute déjà `X-Robots-Tag: noindex, nofollow` à toutes les pages, aperçus compris. **[Non vérifié]** Netlify ajoute aussi d'office un `noindex` sur les aperçus selon plusieurs fils de son forum, mais je ne l'ai pas trouvé dans la doc officielle. L'en-tête du dépôt suffit de toute façon.
- Niveau 1 : sur les forfaits à crédits, chaque projet a un réglage « Project visibility » (Public, Private, Password), avec une portée « production et aperçus » ou « aperçus seulement ». Vérifier que la visibilité est **Public** pour la production **et** pour les aperçus. Netlify propose désormais des projets privés par défaut, et les aperçus peuvent rester privés tant qu'on ne change pas ce réglage.
- Niveau 2 : l'adresse d'un aperçu suit le modèle `deploy-preview-<numéro>--<nom-du-site>.netlify.app`. Le numéro se devine. C'est le nom du site qui protège. Ne pas publier ce nom ailleurs que dans les invitations.
- Niveau 3 : « Basic password protection for your entire site is available on all Pro plans ». Le mot de passe protège alors aussi `/admin/`. Sur Pro à crédits, la portée « Previews only » existe. Sur les anciens forfaits, protéger seulement les aperçus est réservé à Enterprise.
- Niveau 4 : la protection par connexion d'équipe (« Team login protection ») et le SSO sont réservés à Enterprise. Les « Git Contributors » ne peuvent pas s'y connecter.
- Forfaits Free et Personal : pas de mot de passe. Un projet privé n'y est visible que par le propriétaire de l'équipe.

**Recommandation pour la preuve de concept : niveaux 1 et 2**, gratuits, parce que toutes les données de test sont fictives et marquées comme telles. Passer au niveau 3 seulement si 4SH a déjà un forfait Pro, ou si une donnée réelle doit entrer dans le test.

**[Non vérifié]** Avec le niveau 3, chaque aperçu a son propre sous-domaine. Je n'ai pas pu vérifier si le mot de passe est redemandé pour chaque aperçu, ni si l'aperçu intégré au CMS fonctionne derrière ce mot de passe.

---

## Étape 6. Authentification GitHub pour les deux outils

**Qui :** Tom (Cloudflare, 15 min) et propriétaire GitHub (validation, 5 min). **Durée :** 30 min avec le test.

### Comment ça marche

1. Le testeur clique sur « Se connecter avec GitHub » dans l'outil.
2. L'outil ouvre une fenêtre vers le Worker `sveltia-cms-auth.tom-retouret.workers.dev`, qui renvoie vers GitHub.
3. GitHub demande au testeur d'autoriser l'**application OAuth GitHub** liée au Worker.
4. Le Worker récupère un jeton et le renvoie à l'outil. L'outil agit ensuite **au nom du testeur**, avec ses droits sur le dépôt.

### 6.1 Application OAuth GitHub

L'application OAuth existe déjà : c'est celle de l'admin actuelle, créée sur le compte personnel de Tom. Sa « Authorization callback URL » doit être `https://sveltia-cms-auth.tom-retouret.workers.dev/callback` (README de sveltia-cms-auth). Rien à créer pour la preuve de concept.

À vérifier par Tom (5 min) : github.com, Settings (de son compte), Developer settings, OAuth Apps, l'application du Worker, callback URL correcte.

**Point bloquant probable : la validation par l'organisation.** Sur une organisation créée récemment, les restrictions d'accès des applications OAuth sont **activées par défaut**. Une application non validée n'a aucun accès API aux ressources privées de l'organisation, et ne peut rien créer ni modifier sur ses ressources publiques (doc GitHub, « About OAuth app access restrictions »). Concrètement, sans validation, aucun testeur ne pourra enregistrer quoi que ce soit.

Que faire :

1. À la première connexion, l'écran d'autorisation GitHub propose « Request » à côté de l'organisation `<org>`. Tom clique dessus.
2. Le propriétaire GitHub reçoit une notification et valide l'application (Organization settings, Third-party access, OAuth application policy).
3. Une fois validée, elle l'est pour tous les testeurs.

**Pour plus tard (hors preuve de concept) :** au transfert du site vers 4SH, créer une application OAuth et un Worker appartenant à 4SH, et non au compte personnel de Tom.

### 6.2 Worker Cloudflare `sveltia-cms-auth`

Le Worker sert déjà l'admin actuelle. Il suffit d'autoriser l'adresse du site de test.

1. Tom se connecte au tableau de bord Cloudflare, Workers & Pages, `sveltia-cms-auth`, Settings, Variables and Secrets.
2. Repérer la variable `ALLOWED_DOMAINS`.
   - **Si elle a une valeur :** ajouter à la fin, après une virgule, le nom d'hôte du site de test, sans `https://` ni chemin. Exemple : `www.4sh.fr,site-4sh-poc-k7q2m.netlify.app`. **Ne pas effacer les valeurs existantes**, sinon l'admin actuelle ne se connecte plus.
   - **Si elle est vide :** tous les sites sont acceptés. Ça marche, mais le README la dit « fortement recommandée » (anti-abus et sécurité). Dans ce cas, la renseigner avec l'adresse actuelle de l'admin **et** celle du site de test, puis tester l'admin actuelle tout de suite.
3. Enregistrer et déployer.

Ce que contrôle le Worker (lu dans son code source, `src/index.js`) : à l'aller, il compare le paramètre `site_id` envoyé par l'outil aux motifs de `ALLOWED_DOMAINS` (le joker `*` remplace un ou plusieurs caractères). Si rien ne correspond, il répond « UNSUPPORTED_DOMAIN ». Les autres variables (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) ne changent pas.

L'admin ne se lance que depuis l'adresse de production du site de test. Inutile d'ajouter les adresses des aperçus.

### 6.3 Et pour Decap ? Le même Worker convient

**Réponse : oui, d'après la documentation et le code, mais pas encore testé de bout en bout.**

Sources :

- README de sveltia-cms-auth : l'authentificateur est compatible avec Netlify CMS (devenu Decap CMS), tout en étant conçu pour Sveltia.
- Code du Worker : il répond aux chemins `/auth` et `/oauth/authorize`, puis `/callback`. Il fait la poignée de main `authorizing:github` avec la fenêtre de l'outil, puis envoie `authorization:github:success:{"provider":"github","token":"..."}`. C'est le protocole historique de Netlify CMS, que Decap reprend.
- Doc Decap (« Backends overview ») : `base_url` est l'hôte du client OAuth, « required when using an external OAuth server ». `auth_endpoint` vaut `auth` par défaut pour GitHub, ce qui correspond au chemin `/auth` du Worker.
- Le Worker demande la portée `repo,user` par défaut. Decap a besoin d'écrire dans le dépôt et d'ouvrir des demandes de fusion : la portée `repo` couvre ces besoins.

Donc, dans `admin-decap/config.yml` : `base_url: https://sveltia-cms-auth.tom-retouret.workers.dev`, et pas de `auth_endpoint`.

**Plan B si la connexion Decap échoue** (15 min) : utiliser le client OAuth intégré à Netlify, que Decap utilise par défaut (`base_url` absent). Il faut alors une seconde application OAuth GitHub dont la callback est `https://api.netlify.com/auth/done`, puis renseigner son identifiant et son secret dans Netlify (Project configuration, Access & security, OAuth, « Install provider »). **[Non vérifié]** Cette procédure est donnée de mémoire. Le README de sveltia-cms-auth confirme seulement que ce client intégré existe pour les sites sur Netlify.

### 6.4 Test de connexion

Tom, avec son compte :

- [ ] `/admin/` : connexion, la liste des contenus s'affiche.
- [ ] `/admin-decap/` : connexion, la liste des contenus s'affiche.
- [ ] L'admin actuelle (site de production 4SH) se connecte toujours.

---

## Étape 7. Comptes GitHub des testeurs

**Qui :** Tom (15 min) et chaque testeur (10 min s'il n'a pas de compte). **Durée :** à lancer au moins 10 jours avant les tests.

### Pourquoi ne pas créer 5 comptes de test

Les conditions d'utilisation de GitHub interdisent qu'une personne tienne plus d'un compte gratuit (« One person or legal entity may maintain no more than one free Account »). Un seul compte « machine » supplémentaire est admis, et il est réservé aux tâches automatisées. Tom ne peut donc pas créer 5 comptes de test à son nom. **On invite les comptes personnels des testeurs.**

### Comptes nécessaires

| Compte | Personne | Rôle pendant les tests |
|---|---|---|
| T1 à T5 | les 5 testeurs | éditeur (peut publier), pour pouvoir jouer le scénario 6 |
| Animateur | Tom (compte `TomRetouret`) | éditeur, admin du dépôt |
| Observateur | un collègue | contributeur (ne peut pas publier), pour le scénario 13 |

### Ce qu'on envoie aux testeurs (Tom, 15 min)

Un message court, au moins 10 jours avant :

- créer un compte sur github.com avec leur adresse 4SH s'ils n'en ont pas, et valider l'adresse ;
- activer la double authentification si GitHub la demande (une application d'authentification sur le téléphone suffit) ;
- envoyer leur identifiant GitHub à Tom ;
- accepter l'invitation au dépôt quand elle arrive (le lien expire au bout de quelques jours, **[Non vérifié]** durée exacte).

**[Non vérifié]** GitHub impose progressivement la double authentification aux comptes qui contribuent du code. Je n'ai pas vérifié si un compte neuf est concerné, ni le délai. Si l'organisation exige la double authentification de ses collaborateurs, elle est obligatoire.

### Invitations (Tom, admin du dépôt)

Dépôt `site-4sh-poc`, Settings, Collaborators and teams, « Add people » : inviter chaque identifiant avec le rôle **Write**.
Le rôle Write est le minimum : les deux outils créent une branche par contenu modifié directement dans le dépôt. Qui peut publier se règle à l'étape 8, pas par le rôle.

Si les testeurs sont membres de l'organisation GitHub 4SH, on peut créer deux équipes (`poc-editeurs`, `poc-contributeurs`) à la place des invitations individuelles. Les collaborateurs extérieurs ne peuvent pas entrer dans une équipe : on les cite alors un par un.

**[Non vérifié]** Sur un dépôt **privé** d'une organisation GitHub Team, chaque collaborateur extérieur occupe une licence payante. Sur un dépôt public, ce n'est pas le cas.

---

## Étape 8. Droits et protection de la branche `main`

**Qui :** Tom (admin du dépôt) ou propriétaire GitHub. **Durée :** 30 min, test compris.

### Ce qu'on veut obtenir

- Un **contributeur** enregistre des brouillons, les passe en relecture et prêt, mais **ne peut pas publier**.
- Un **éditeur** publie. Publier = fusionner la demande de fusion dans `main`.
- Une publication **attend que l'aperçu Netlify soit construit** avant d'arriver sur `main`.

### Réglages (Settings, Branches, « Add classic branch protection rule », motif `main`)

- [ ] **Require a pull request before merging** : coché. **Required approvals : 0.**
  Ne pas exiger d'approbation : Sveltia n'attend automatiquement que si les vérifications sont le seul blocage, pas une revue requise (doc Sveltia, « Editorial workflow »). Et Sveltia n'approuve pas une demande de fusion ouverte par la même personne.
- [ ] **Require status checks to pass before merging** : coché, avec la vérification Netlify `deploy-preview` du site de test.
  La vérification n'apparaît dans la liste qu'après une première demande de fusion. Faire ce réglage après le test 1 ci-dessous, puis le compléter.
- [ ] **Restrict who can push to matching branches** : coché, avec l'animateur et les 5 testeurs (ou l'équipe `poc-editeurs`). **Pas l'observateur.**
  Cette option n'existe que pour les dépôts d'une organisation (publics sur GitHub Free, tous sur GitHub Team). Elle réserve l'écriture sur `main`, donc la fusion, aux personnes listées.
- [ ] Ne pas cocher « Require conversation resolution » ni « Require linear history » (inutile et source de blocages).

### Pourquoi l'auto-merge est exigé par Sveltia

D'après la doc Sveltia (https://sveltiacms.app/en/docs/workflows/editorial, lue le 1er novembre 2026) :

- quand on publie alors que des vérifications tournent encore, Sveltia active la fusion automatique de la demande de fusion, épinglée au commit vérifié. GitHub fusionne dès que les vérifications passent ;
- Sveltia contrôle toutes les 10 secondes, pendant une heure au plus. La publication échoue si une vérification échoue, si la demande est fermée, si l'auto-merge est désactivé ou si le délai expire ;
- sur GitHub, « the repository has to allow auto-merge » (d'où l'étape 3) ;
- Sveltia n'attend que si les vérifications sont le **seul** blocage, pas une revue requise ni un conflit.

Côté GitHub, l'auto-merge n'est proposé que sur une demande de fusion qui ne peut pas être fusionnée tout de suite, et seule une personne avec le droit d'écriture peut l'activer (doc GitHub).

Côté Decap : la doc ne dit pas si la publication attend les vérifications. **[Non vérifié]** Il est probable que Decap tente la fusion tout de suite et affiche une erreur si l'aperçu n'est pas prêt. C'est un comportement à observer pendant la répétition (étape 10) et à noter dans la grille, critère « circuit de publication ».

### Tests (Tom + Observateur, 15 min)

1. L'observateur (contributeur) crée un brouillon dans Sveltia : une demande de fusion apparaît dans GitHub, avec la vérification Netlify et un lien d'aperçu.
2. Ajouter alors la vérification requise (réglage ci-dessus).
3. L'observateur passe le brouillon à « prêt » puis cherche à publier : le bouton n'est pas proposé ou la publication est refusée.
4. Tom publie juste après une nouvelle modification, pendant que l'aperçu se construit : Sveltia attend, puis la demande de fusion est fusionnée.
5. Même chose dans Decap. Noter le comportement exact.
6. Vérifier que `main` a reçu les deux publications et que le site de test est à jour.

---

## Étape 9. Jeu de données de départ

**Qui :** Tom (contenu) et Développeur (dépôt). **Durée :** 1 h.

Le détail est dans `protocole-tests.md`, section « Jeu de données de départ ». À retenir ici :

- tout contenu fictif porte la mention « [DÉMO] » et n'est jamais attribué à un vrai client ni à une vraie personne ;
- les témoignages réels amorcés depuis `logiciel_metier.json` restent tels quels et ne servent à aucun scénario ;
- une fois les données en place, déplacer l'étiquette `etat-depart` sur ce commit ;
- aucune demande de fusion ne doit rester ouverte au départ d'une session.

**Remise à zéro entre deux sessions (Développeur, 10 min) :** fermer les demandes de fusion ouvertes, supprimer leurs branches, puis remettre `main` sur `etat-depart`. Cette dernière opération réécrit `main` : il faut lever un instant la protection de branche, ou la faire avec un compte admin. Prévoir 30 min entre deux sessions.

**Attention, les deux outils travaillent sur le même dépôt.** Sveltia refuse d'enregistrer un contenu qui a déjà une demande de fusion ouverte qu'il ne reconnaît pas, par exemple créée par Decap (doc Sveltia, « Known limitations »). Entre le passage sur un outil et le passage sur l'autre, l'observateur vérifie qu'aucune demande de fusion ne reste ouverte sur les contenus du scénario suivant, ou fait travailler le testeur sur des contenus distincts (c'est ce que prévoit le protocole).

---

## Étape 10. Répétition générale

**Qui :** Tom (animateur) et l'Observateur. **Durée :** 1 h, la semaine du 23 novembre.

- Jouer une session complète avec l'observateur dans le rôle du testeur, sur les deux outils.
- Chronométrer : si le temps dépasse 60 min, retirer un scénario tournant (voir le protocole).
- Jouer le scénario 13 (deux comptes, droits différents).
- Faire une remise à zéro complète et vérifier l'état de départ.

---

## Liste de contrôle finale

À cocher au plus tard le vendredi 27 novembre 2026.

**Dépôt GitHub**
- [ ] Dépôt `<org>/site-4sh-poc` créé, `main` = branche `poc/back-office` + jeu de données
- [ ] Étiquette `etat-depart` sur le bon commit
- [ ] « Allow auto-merge » coché
- [ ] Protection de `main` : demande de fusion requise (0 approbation), vérification Netlify requise, poussée réservée aux éditeurs
- [ ] Application Netlify autorisée sur le dépôt
- [ ] Application OAuth du Worker validée par l'organisation

**Configuration des outils**
- [ ] Sveltia 0.256.1 et Decap 3.17.3 chargés en version fixe
- [ ] `backend.repo`, `branch`, `base_url`, `publish_mode` corrects dans les deux `config.yml`
- [ ] `site_url` pointe vers le site de test

**Netlify**
- [ ] Site de test en ligne, build `npm run build`, dossier `dist`
- [ ] Aperçus activés pour toute demande de fusion vers `main`
- [ ] Visibilité Public pour la production et les aperçus (ou mot de passe si niveau 3)
- [ ] En-tête `X-Robots-Tag: noindex` présent (vérifiable dans l'onglet Réseau du navigateur)
- [ ] Variables Mailjet absentes

**Authentification**
- [ ] `ALLOWED_DOMAINS` contient l'admin actuelle et le site de test
- [ ] Connexion réussie sur `/admin/` et `/admin-decap/`
- [ ] Admin actuelle toujours fonctionnelle

**Comptes et droits**
- [ ] 5 testeurs ont accepté l'invitation (rôle Write)
- [ ] Chaque testeur s'est connecté une fois aux deux outils avant sa session (5 min, à distance), pour régler la double authentification et l'autorisation OAuth hors du temps de test
- [ ] Observateur = contributeur : publication impossible, vérifiée
- [ ] Éditeur : publication avec attente de l'aperçu, vérifiée sur Sveltia ; comportement Decap noté

**Session**
- [ ] Jeu de données en place, aucune demande de fusion ouverte
- [ ] Grilles d'observation et questionnaires imprimés ou prêts en ligne
- [ ] Répétition générale faite, durée tenue

---

## Ce qui n'a pas pu être vérifié

1. **Forfaits GitHub et Netlify de 4SH** : inconnus. Ils décident du choix public ou privé et du niveau de protection.
2. **Contenu final de la branche** : la branche évoluait encore le 1er novembre. `backend.repo` et `site_url` sont à corriger (étape 1), et il n'existe pas de collection de pages à blocs pour le scénario S1.
3. **Connexion Decap par le Worker** : compatible d'après le README et le code, non testée de bout en bout.
4. **Plan B Decap par le client OAuth de Netlify** : procédure donnée de mémoire.
5. **Comportement de Decap quand l'aperçu n'est pas prêt** au moment de publier : non documenté.
6. **Nom exact de la vérification Netlify** dans GitHub : à lire sur la première demande de fusion.
7. **`noindex` automatique de Netlify sur les aperçus** : vu sur le forum, pas dans la doc. Sans effet ici grâce à `netlify.toml`.
8. **Mot de passe Netlify (niveau 3)** et aperçus sur sous-domaines distincts : comportement non vérifié.
9. **Double authentification GitHub** pour des comptes neufs, durée de validité des invitations, coût des collaborateurs extérieurs sur un dépôt privé : non vérifiés.
10. **Builds bloqués pour contributeur non reconnu** (dépôt privé, Netlify gratuit) : vu sur le forum Netlify, pas dans la doc officielle.

## Sources consultées le 1er novembre 2026

- Sveltia CMS, Editorial workflow : https://sveltiacms.app/en/docs/workflows/editorial
- sveltia-cms-auth, README et `src/index.js` : https://github.com/sveltia/sveltia-cms-auth
- Decap CMS, Backends overview : https://decapcms.org/docs/backends-overview/
- Decap CMS, Editorial workflows : https://decapcms.org/docs/editorial-workflows/
- Decap CMS, Deploy preview links : https://decapcms.org/docs/deploy-preview-links/
- Decap CMS, External OAuth clients : https://decapcms.org/docs/external-oauth-clients/
- Netlify, Site protection : https://docs.netlify.com/manage/security/secure-access-to-sites/site-protection/
- Netlify, How to password protect a site or deploy previews : https://www.netlify.com/knowledge-base/how-to-password-protect-a-netlify-site-or-deploy-previews.md
- Netlify, Protect deploys : https://docs.netlify.com/deploy/protect-deploys/
- Netlify, tarifs : https://netlify.com/pricing/
- Forum Netlify, contributeur Git non reconnu : https://answers.netlify.com/t/build-blocked-unrecognized-git-contributor-repositorio-privado-plan-gratuito/169177
- GitHub, About protected branches : https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub, Automatically merging a pull request : https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
- GitHub, About OAuth app access restrictions : https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions
- GitHub, Terms of Service (section B.3) : https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
