# Revenir à une version publiée antérieure

Preuve de concept back-office du site 4SH (Sveltia CMS 0.256.1, circuit éditorial activé).
Page : `/admin/versions/` du site, par exemple https://eclectic-conkies-63f114.netlify.app/admin/versions/
Rédigé le 1er novembre 2026. Les points non vérifiés sur le site réel sont signalés par **[Non vérifié]**.

## En bref

- Sveltia CMS ne sait pas revenir à une ancienne version. La page `/admin/versions/` ajoute cette fonction à côté du back-office.
- On choisit une page ou une fiche, on voit ses versions publiées (date, qui a modifié, qui a publié, description), on compare une version avec celle en ligne, champ par champ.
- « Restaurer » ne touche pas au site : la page crée un **brouillon** dans le back-office, exactement comme si quelqu'un avait refait la modification à la main. Il suit le circuit habituel : relecture, puis publication dans Sveltia.
- La page n'écrit jamais sur `main`. Elle réutilise la session GitHub du back-office : pas de nouveau mot de passe, pas de secret dans le dépôt.

## Mode d'emploi (contributeur)

1. Ouvrez le back-office (`/admin/`) et connectez-vous avec GitHub, comme d'habitude.
2. Dans le même navigateur, ouvrez `/admin/versions/` (à garder en favori). En haut à droite : « Connecté à GitHub : votre nom ».
   Si la page affiche « Vous n'êtes pas connecté », cliquez sur « Se connecter avec GitHub » : la même fenêtre de connexion que le back-office s'ouvre.
3. **Choisir le contenu** : choisissez le type de contenu (Formations, Pages, Page d'accueil…), puis la page ou la fiche, et cliquez sur « Voir les versions ».
4. **Versions publiées** : une ligne par mise en ligne, la plus récente en haut. La ligne verte « Version en ligne » est celle que le site affiche aujourd'hui.
5. Cliquez sur « Comparer » à côté de la version qui vous intéresse. La page liste les champs qui changeraient : à gauche ce qui est en ligne aujourd'hui, à droite ce que la restauration remettrait. Pour les textes longs, les lignes retirées sont en rouge (« − ») et les lignes remises en vert (« + »). « Voir le fichier complet, ligne à ligne » montre le fichier entier.
6. Cliquez sur « Restaurer cette version en brouillon… », lisez la fenêtre de confirmation, puis « Créer le brouillon ».
7. Cliquez sur « Ouvrir le circuit éditorial » : le brouillon apparaît dans la colonne « Brouillon ». Ouvrez-le, vérifiez, passez-le en relecture puis publiez comme toute autre modification. Le site change à la publication seulement.

Si le back-office était déjà ouvert dans un autre onglet, cliquez sur son bouton d'actualisation (il relit aussi tout seul toutes les 5 minutes, ou quand on revient sur l'onglet).

### Quand un brouillon existe déjà pour ce contenu

La fenêtre de confirmation l'indique en jaune, avec son statut (Brouillon, En relecture, Prêt à publier), qui l'a ouvert et quand. Pour continuer, il faut cocher « J'ai compris : remplacer le brouillon existant ». Dans ce cas :

- le texte du brouillon est remplacé par la version choisie, et le brouillon repasse au statut « Brouillon » ;
- les modifications qu'il contenait ne sont pas perdues : elles restent dans l'historique de la demande sur GitHub (lien « Voir ce brouillon sur GitHub ») ;
- les autres fichiers du brouillon (une image ajoutée, par exemple) sont conservés ;
- un commentaire est ajouté sur la demande pour garder la trace du remplacement.

Sans case cochée, rien n'est écrit.

### Messages possibles

| Message | Ce qu'il faut faire |
|---|---|
| Vous n'êtes pas connecté | Se connecter au back-office, puis recharger la page ; ou cliquer « Se connecter avec GitHub ». |
| Votre session GitHub a expiré | Se reconnecter. |
| Votre compte peut consulter l'historique mais n'a pas le droit d'écrire | Demander l'accès en écriture au dépôt à Tom. |
| Cette version est identique à la version en ligne | Rien à faire, choisir une autre version. |
| Ce contenu a déjà une modification en cours sous un autre nom | Terminer ou abandonner ce brouillon dans le back-office, puis recommencer. |
| Une suppression de ce contenu est en attente | L'annuler dans le back-office avant de restaurer. |
| La branche de ce contenu est utilisée par une autre demande de fusion | Prévenir l'équipe technique (demande ouverte à la main sur GitHub). |
| Le brouillon a été modifié pendant l'opération | Quelqu'un a enregistré ce brouillon au même moment : recharger la page et recommencer. |
| La fenêtre de connexion a été bloquée | Autoriser les fenêtres surgissantes pour le site. |

### Lien direct

`/admin/versions/?chemin=src/_data/contact.json` ouvre directement l'historique d'un fichier (chemin dans le dépôt). Utile pour un lien depuis une documentation.

## Comment ça marche (pour l'équipe technique)

### Approche retenue : page autonome dans le navigateur

Fichiers : `admin/versions/index.html`, `page.js` (interface), `logique.js` (règles, sans réseau, testable sous Node), `github.js` (appels GitHub, transport injectable), `versions.css`. Seule dépendance : js-yaml 4.1.0 en module depuis jsDelivr (version figée). La page est copiée telle quelle par Eleventy avec le reste de `admin/`. `admin/index.html` n'a pas été modifié.

1. **Configuration** : la page lit `/admin/config.yml` au chargement (dépôt, branche, Worker OAuth, préfixe d'étiquettes, collections et champs). Toute nouvelle collection est prise en compte sans toucher à la page.
2. **Session** : Sveltia garde la session dans le `localStorage` du site, clé `sveltia-cms.user`, en JSON `{ backendName: "github", token, login, … }` (code source de Sveltia : `src/lib/services/user/constants.js`, `account.svelte.js`). La page est sur le même domaine, elle lit ce jeton sans le recopier ailleurs. Sinon, elle ouvre le même Worker (`<base_url>/auth?provider=github&site_id=<domaine>&scope=repo,user`) avec le protocole de messages de Sveltia et Decap ; le jeton obtenu reste dans le `sessionStorage` de l'onglet (effacé à la fermeture).
3. **Liste des contenus** : une requête GraphQL lit le dossier de la collection sur `main` avec le texte des fichiers, pour afficher les titres (résumé ou champ identifiant de la collection).
4. **Historique** : requête GraphQL `history(path:)` sur `main`. Chaque commit est rattaché à sa demande de fusion (`associatedPullRequests`). Une publication = une demande fusionnée : on garde son dernier commit touchant le fichier, daté de la fusion, avec « modifié par » (auteur du commit) et « publié par » (`mergedBy`). Les commits faits directement sur `main` (avant la protection de branche) apparaissent aussi.
5. **Comparaison** : JSON ou front matter YAML lus, aplatis en chemins (`entete.titre`, `blocs.2.titre`), libellés repris des champs de la configuration (« En-tête › Nom de la formation », « Blocs › Bandeau n° 3 › Titre »). Différence ligne à ligne maison (pas de bibliothèque).
6. **Restauration**, au format exact attendu par Sveltia 0.256.1 (vérifié dans son code source : `services/workflow/branch.js`, `labels.js`, `entries.js`, `backends/git/github/workflow.js` et `pull-requests.js`) :
   - branche `cms/<nom de la collection>/<slug>` ; slug = nom du fichier sans extension pour une collection dossier, `name` du fichier pour une collection de fichiers ; `%` et `/` encodés comme Sveltia ;
   - un seul commit, créé par l'API Git (arbre `main` + le blob de l'ancienne version, réutilisé tel quel : contenu identique à l'octet) ;
   - demande de fusion vers `main`, **en brouillon GitHub** (`draft: true`), étiquette `sveltia-cms/draft` ;
   - Sveltia la reconnaît car elle part d'une branche du dépôt, vise `main`, porte une étiquette de statut, a un nom de branche `cms/…` et ne contient qu'un fichier de la collection.
   - Branche laissée par une ancienne demande fermée, sans demande ouverte : remise à zéro depuis `main`, comme Sveltia.
   - Brouillon existant (même branche) : refus sans accord explicite ; avec accord, commit ajouté sur la branche (mise à jour non forcée, donc refusée si quelqu'un a enregistré entre-temps), étiquette remise à `draft`, demande repassée en brouillon, commentaire de trace.
   - Demande ouverte pour le même fichier depuis une autre branche, demande non étiquetée sur la branche, suppression en attente : refus avec explication.
   - Pour une collection multilingue (page d'accueil, témoignages), seule la version française est restaurée ; Sveltia garde la version anglaise publiée.

### Pourquoi pas un workflow GitHub Actions

Envisagé en repli : un formulaire déclenche un workflow avec le chemin et la version, qui ouvre la même demande. Écarté parce que :

- il faut un formulaire de déclenchement : soit l'interface GitHub Actions (trop technique pour un contributeur), soit un appel `workflow_dispatch` depuis le navigateur, qui demande de toute façon le jeton de l'utilisateur ; la page autonome fait alors directement le travail ;
- il ne permet pas la comparaison lisible avant restauration, qui est le cœur du besoin ;
- la demande serait ouverte par le robot `github-actions` et non par la personne, et les demandes créées avec le jeton du robot ne déclenchent pas les vérifications (la vérification Netlify obligatoire est faite par l'application Netlify, à confirmer, mais d'autres contrôles du dépôt le seraient par Actions) ;
- il ajoute des fichiers dans `.github/`, domaine de l'exploitation.

La page autonome n'a besoin d'aucun secret, d'aucun serveur, et agit au nom de la personne connectée, avec ses droits GitHub.

### Limites connues

- Contenu supprimé : la page liste les contenus présents sur `main`. Un contenu supprimé n'apparaît pas dans la liste ; on peut l'ouvrir avec le lien direct `?chemin=…`, mais la restauration d'un contenu supprimé n'a pas été testée **[Non vérifié]**.
- Fichier renommé : l'historique suit le chemin actuel seulement (pas les versions sous l'ancien nom). Les fiches ne sont pas renommées par Sveltia tant qu'on ne change pas leur slug.
- Images : la restauration remet le texte de la fiche, pas les images supprimées depuis de la médiathèque. Si une ancienne version pointe vers une image supprimée, l'aperçu le montrera.
- Le titre de la demande est en français (« Restauration de « Page Contact » (version du 6 octobre 2026) ») ; à la publication, Sveltia l'utilise comme message du commit de fusion.
- 40 versions sont chargées à la fois (bouton « Afficher les versions plus anciennes »). 100 demandes ouvertes au plus sont examinées pour détecter un brouillon existant, comme Sveltia.
- Si `cms_label_prefix` ou `root_dir` est ajouté plus tard au `backend`, le préfixe d'étiquette est suivi automatiquement ; `root_dir` ne l'est pas.
- Une montée de version de Sveltia peut changer ces règles : rejouer le plan de test ci-dessous à chaque montée de version.

## Plan de test sur le site de test

Durée : 30 à 40 minutes. Prérequis : le contenu de `admin/versions/` est publié sur le site de test (fusionné dans `main` et déployé par Netlify). Un compte GitHub avec droit d'écriture sur `TomRetouret/site-4sh-poc`. Un second navigateur ou une fenêtre privée pour le test 9.

Préparation (une fois) : dans le back-office, modifier la page « Contact » (collection Pages) deux fois, en publiant à chaque fois : 1re publication « Téléphone A », 2e publication « Téléphone B ». Faire de même avec une fiche Formation (changer le titre puis un module du programme).

| N° | Action | Résultat attendu | OK ? |
|---|---|---|---|
| 1 | Se connecter au back-office, puis ouvrir `/admin/versions/` dans un nouvel onglet | « Connecté à GitHub : <nom> (session du back-office) » ; l'étape 1 s'affiche | |
| 2 | Choisir « Pages » puis « Page Contact », cliquer « Voir les versions » | Liste des publications, la plus récente en haut et en vert « Version en ligne » ; dates, auteurs, descriptions en français (« Modification de … ») ; un lien « demande n° … » par ligne publiée par le back-office | |
| 3 | Vérifier le nombre de lignes | Une ligne par publication, pas une par enregistrement de brouillon (si un brouillon a été enregistré trois fois avant publication, une seule ligne) | |
| 4 | Cliquer « Comparer » sur la version « Téléphone A » | « 1 champ(s) changeront » ; libellé lisible du champ (pas le nom technique) ; « En ligne aujourd'hui : Téléphone B », « Après restauration : Téléphone A » | |
| 5 | Ouvrir « Voir le fichier complet, ligne à ligne » | Une ligne rouge « − » (B) et une ligne verte « + » (A) | |
| 6 | Navigation au clavier seul (Tab, Maj+Tab, Entrée, Espace, Échap) de l'étape 1 à la fenêtre de confirmation | Tout est atteignable, le focus est visible ; Échap ferme la fenêtre et rend le focus au bouton « Restaurer » | |
| 7 | « Restaurer cette version en brouillon… » puis « Créer le brouillon » | Message « Brouillon créé » ; le site en ligne n'a pas changé (recharger la page Contact du site) | |
| 8 | Cliquer « Ouvrir le circuit éditorial » | La page Contact est dans la colonne « Brouillon » ; en l'ouvrant, le téléphone vaut « Téléphone A » ; sur GitHub, la demande est en brouillon, étiquette `sveltia-cms/draft`, branche `cms/pages/contact`, un seul fichier modifié | |
| 9 | Dans Sveltia, passer en relecture puis publier (avec un second compte si la relecture croisée est exigée) | Publication normale, vérification Netlify passée, fusion ; le site affiche « Téléphone A » après déploiement ; la branche `cms/pages/contact` est supprimée | |
| 10 | Revenir sur `/admin/versions/`, recharger l'historique de Contact | Nouvelle ligne en haut « Restauration de « Page Contact » … », en vert | |
| 11 | Brouillon existant : dans Sveltia, modifier Contact (« Téléphone C ») et enregistrer sans publier ; puis dans `/admin/versions/`, restaurer « Téléphone B » | La fenêtre affiche l'avertissement jaune (statut, auteur, date) ; « Remplacer le brouillon » reste grisé tant que la case n'est pas cochée | |
| 12 | Annuler | Rien n'a changé : le brouillon contient toujours « Téléphone C » | |
| 13 | Recommencer, cocher la case, « Remplacer le brouillon » | « Brouillon remplacé » ; dans Sveltia (après actualisation), le brouillon contient « Téléphone B » et est au statut Brouillon ; sur GitHub, un commentaire de trace et l'ancien commit « Téléphone C » visible dans l'historique de la demande | |
| 14 | Faire passer ce brouillon « En relecture » dans Sveltia, puis le remplacer à nouveau depuis `/admin/versions/` | Le brouillon repasse en colonne « Brouillon » et en brouillon GitHub | |
| 15 | Abandonner le brouillon dans Sveltia, puis restaurer à nouveau une version | Création normale (la branche laissée par l'abandon, s'il en reste une, est remise à zéro) | |
| 16 | Fiche formation : choisir Formations, la fiche préparée, comparer la version d'avant les deux changements | Les champs modifiés apparaissent avec des libellés comme « En-tête › Nom de la formation », « Programme › … n° 2 › … » | |
| 17 | Page d'accueil (multilingue) : restaurer une version française | Dans Sveltia, le brouillon montre la version française restaurée et la version anglaise inchangée | |
| 18 | Se déconnecter du back-office, recharger `/admin/versions/` | « Vous n'êtes pas connecté » et bouton « Se connecter avec GitHub » ; la connexion par ce bouton fonctionne (fenêtre du Worker) | |
| 19 | Avec un compte GitHub sans droit d'écriture (ou invité non accepté) | Avertissement « peut consulter l'historique mais n'a pas le droit d'écrire » ; la restauration échoue avec un message clair | |
| 20 | Tenter de restaurer la ligne « Version en ligne » | Pas de bouton « Comparer » sur cette ligne | |
| 21 | Téléphone et écran étroit : ouvrir la page sur mobile | Pas de défilement horizontal de la page ; le tableau des versions défile seul | |
| 22 | Ouvrir `/admin/versions/?chemin=src/_data/contact.json` | L'historique de Contact s'ouvre directement | |

À noter pendant le test : tout message incompréhensible, tout écart entre ce que montre la comparaison et ce que montre le brouillon dans Sveltia, le temps de chargement de l'historique.

## Points à vérifier en vrai

- **[Non vérifié]** Requêtes GraphQL et REST sur le vrai dépôt : écrites d'après la documentation GitHub et le code de Sveltia, testées avec des réponses simulées seulement (aucun accès au compte GitHub de Tom).
- **[Non vérifié]** Apparition du brouillon dans le tableau de Sveltia (tests 8, 13, 14) : déduite du code source de Sveltia 0.256.1, à confirmer.
- **[Non vérifié]** Le Worker `sveltia-cms-auth` accepte la connexion depuis `/admin/versions/` (même domaine, donc a priori oui ; test 18).
- **[Non vérifié]** Déclenchement de la vérification Netlify sur la demande de restauration, et fusion automatique à la publication (test 9).

## Vérifications faites le 1er novembre 2026

- Syntaxe des trois modules contrôlée (`node --check`).
- 17 tests Node avec réponses GitHub simulées, sur la vraie configuration `admin/config.yml` et une vraie fiche formation : correspondance fichier, collection et slug pour tous les fichiers des collections ; nom de branche ; regroupement de l'historique par publication ; comparaison champ par champ avec libellés ; création de la demande (corps des requêtes, brouillon, étiquette, aucune écriture sur `main`) ; branche orpheline ; brouillon existant avec et sans accord ; brouillon modifié entre-temps ; version identique ; session expirée ; absence de tirets longs.
