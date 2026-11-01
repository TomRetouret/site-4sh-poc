# Sveltia et Decap : ce qui est natif, configuré ou à développer

Preuve de concept back-office, branche `poc/back-office`. Même page d'accueil en blocs, même schéma (`docs/back-office/schema-blocs.md`), deux outils :

- Sveltia CMS 0.256.1 : `/admin/` (`admin/index.html`, `admin/config.yml`)
- Decap CMS 3.17.3 : `/admin-decap/` (`admin-decap/index.html`, `admin-decap/config.yml`)
- Gabarits d'aperçu communs : `/admin-shared/apercus.js` (chargé par les deux interfaces)

Légende de la colonne « Statut » :

- **Vérifié (doc)** : lu dans la documentation officielle à la date du 1er novembre 2026, lien en fin de document.
- **Validé (local)** : contrôlé ici sans dépôt de test (lecture des YAML avec js-yaml, cohérence avec `src/_data/contenus/fr/accueil.json` et `en/accueil.json`).
- **À tester** : non documenté ou dépendant du dépôt de test, de GitHub ou de Netlify. À confirmer en recette.

## 1. Ce qui a été configuré

| Élément | Sveltia (`admin/config.yml`) | Decap (`admin-decap/config.yml`) |
|---|---|---|
| Page d'accueil | Collection « Page d'accueil » (`accueil`), un fichier `accueil` : `src/_data/contenus/{{locale}}/accueil.json`, français par défaut, anglais | Collection « Page d'accueil » (`accueil`), deux fichiers : `accueil_fr` et `accueil_en` |
| Ancien accueil | Retiré de « Pages » et de « Pages (English) » ; `src/_data/accueil.json` et `src/_data/en/accueil.json` restent sur le disque | Non repris (périmètre limité) |
| Référencement | Groupe « Référencement » (`seo`), replié, séparé des blocs | Identique |
| Blocs | Liste à types `blocs`, `typeKey: type`, 11 types, blocs repliés, résumé par type avec mention « (masqué) » | Identique (mêmes champs, contrôlé par script) |
| Témoignages | Collection de dossier `src/_data/temoignages/{{locale}}`, JSON, multilingue | Collection de dossier `src/_data/temoignages`, multilingue `multiple_folders` (même arborescence `fr/`, `en/`) |
| Pages de démonstration | Collection de dossier « Pages de démonstration » (`demo`) : `src/demo/*.md`, front matter, création autorisée, `titre` puis `seo` et `blocs` (mêmes 11 types), français seulement, aperçu `demo/{{slug}}/` | Identique |
| Lien projet vers témoignage | Champ relation `temoignage`, valeur = slug | Identique |
| Circuit éditorial | `publish_mode` en objet : `type: editorial_workflow`, `allow_incomplete_drafts: true` | `publish_mode: editorial_workflow` |
| Liens d'aperçu | `show_preview_links: true`, `preview_path: "{{locale}}/"` et `omit_default_locale_from_preview_path: true` | `show_preview_links: true`, `preview_path` `""` (fr) et `en/` (en) |
| Adresse du site | `site_url` et `display_url` : `https://eclectic-conkies-63f114.netlify.app` | Identique |
| Dépôt | `TomRetouret/site-4sh-poc`, branche `main` (à remplacer par le dépôt de test 4SH) | Identique |
| Authentification | Worker `sveltia-cms-auth` (même `base_url` qu'aujourd'hui) | Même Worker (voir section 4) |

Noms à connaître pour les gabarits d'aperçu : fichier `accueil` (Sveltia), fichiers `accueil_fr` et `accueil_en` (Decap), collection `temoignages` (les deux). `apercus.js` enregistre déjà ces noms.

Choix de saisie communs aux deux outils :

- Tous les champs ont un `required` explicite (Decap rend un champ obligatoire par défaut si rien n'est précisé).
- Listes fermées en `select` avec libellé et valeur : couleur d'offre (`build`, `run`, `learning`, `institutionnel`), cadrage d'image (`centre`, `haut`, `bas`, `gauche`, `droite`, défaut `centre`).
- Bornes de listes : cartes d'offres 1 à 3, chiffres clés 2 à 4, étapes 4D exactement 4 (Decap exige `min` et `max` ensemble).
- Valeurs par défaut de la spec reprises (`#contact`, `/references/`, « Nos derniers *articles* », lien du blog, bouton « Notre entreprise »).
- Champ `type` non déclaré : il est écrit par l'outil (`typeKey`). Sveltia refuse d'ailleurs un sous-champ qui porte le nom du `typeKey`.

## 2. Natif, configuré, à développer

| Besoin | Sveltia | Decap |
|---|---|---|
| Blocs à types, réordonnables | Natif (liste à types). Vérifié (doc) | Natif (variable types). Vérifié (doc) |
| Résumé des blocs repliés | Natif, configuré (`summary` par type, filtre `ternary`). Vérifié (doc) ; rendu de `ternary` dans un résumé de liste : à tester | Natif, configuré (`summary`, filtre `ternary` listé). Vérifié (doc) ; à tester dans une liste à types |
| Masquer un bloc sans le supprimer | Configuré (booléen `masquer`) + rendu Eleventy | Identique |
| Texte alternatif obligatoire sauf image décorative | À développer : aucune condition entre champs documentée. Aujourd'hui : aide sous le champ, contrôle possible au build | À développer (widget personnalisé). La doc renvoie aux widgets personnalisés pour toute validation complexe |
| Multilingue de la page d'accueil | Natif : un écran, deux langues, fichier par langue grâce à `{{locale}}` dans le chemin. Vérifié (doc) | Pas possible avec un fichier par langue : Decap n'accepte que `single_file` pour une collection de fichiers. Contourné par deux fichiers distincts. Vérifié (doc) |
| Multilingue des témoignages | Natif (`{{locale}}` dans `folder`). Vérifié (doc) | Natif (`multiple_folders`). Vérifié (doc) |
| Édition côte à côte des langues, copie, traduction automatique | Natif. Vérifié (doc) | Non documenté pour ce cas (deux fichiers séparés) |
| Témoignages partagés et relation | Natif. Création d'un témoignage depuis le champ relation, renommage propagé, suppression bloquée si elle casse une référence. Vérifié (doc) | Natif, sélection seulement. Vérifié (doc) |
| Aperçu fidèle des blocs | À développer : gabarit `apercus.js` (déjà en cours) | À développer : obligatoire, Decap n'affiche pas les listes à types sans gabarit enregistré. Vérifié (doc) |
| Circuit éditorial (Brouillon, En relecture, Prêt) | Natif, configuré. Vérifié (doc) | Natif, configuré. Vérifié (doc) |
| Liens vers l'aperçu de déploiement | Natif (déploiements GitHub, statuts de commit, check runs). Vérifié (doc) ; fonctionnement réel avec Netlify : à tester | Natif (statuts de commit dont le nom contient « deploy »). Vérifié (doc) ; à tester |
| Droits par rôle | Absent. Réglages par collection pour tout le monde (`publish: false`, `delete: false`) ; sinon droits du dépôt GitHub | Absent. Droits du dépôt GitHub (accès en écriture exigé) |

## 3. Limites constatées dans la doc

### Brouillon incomplet

- **Sveltia** : `allow_incomplete_drafts` (vrai par défaut) permet d'enregistrer un brouillon avec des champs obligatoires vides, seulement au statut Brouillon. Les autres règles (`pattern`, `min`, `max`) restent appliquées, et les champs obligatoires sont exigés pour passer en relecture ou publier. Vérifié (doc). La doc prévient qu'un site qui valide son schéma au build peut échouer sur un commit de brouillon : le rendu Eleventy doit tolérer des champs vides dans l'aperçu de déploiement. À tester.
- **Decap** : aucun réglage équivalent dans la doc ; elle ne dit rien de la validation à l'enregistrement d'un brouillon. À tester (comportement attendu : enregistrement refusé tant qu'un champ obligatoire est vide).

### Multilingue

- **Sveltia** : pour une collection de fichiers, l'organisation vient du chemin `file` ; `structure` est ignoré. Les champs sans `i18n` sont masqués dans les autres langues (valeur par défaut `false`). L'héritage de `i18n` dans les listes et objets n'est pas documenté : `i18n: true` a donc été posé sur chaque champ de l'accueil. Vérifié (doc). Lien d'aperçu par langue (`{{locale}}` dans `preview_path`) : documenté pour les collections de dossier seulement, à tester sur le fichier d'accueil (risque : lien `/fr/` au lieu de `/`).
- **Decap** : `single_file` seul pour une collection de fichiers ; dans une liste, seul `i18n: true` sur la liste est pris en compte, les réglages des sous-champs sont ignorés. Vérifié (doc). Témoignages sans version anglaise : création ou non d'un fichier `en/` à l'enregistrement, à tester.
- **Les deux** : la relation enregistre le slug ; l'aperçu et le rendu cherchent le témoignage de la même langue. Comportement de la liste de choix depuis l'accueil anglais (témoignages français proposés ou non) : à tester.

### Aperçu vers champ

- **Sveltia** : un clic dans l'aperçu met en évidence et déplie le champ correspondant ; défilement synchronisé. Vérifié (doc) pour l'aperçu standard ; avec un gabarit personnalisé comme `apercus.js` : à tester.
- **Decap** : rien dans la doc consultée. Considéré comme absent, à confirmer.

### Largeurs d'aperçu

- **Sveltia** : volets redimensionnables à la souris, aperçu masquable ; pas de préréglages mobile, tablette, bureau dans la doc. Vérifié (doc).
- **Decap** : aucun réglage de largeur documenté (seulement `editor: preview: false`).
- **Les deux** : des boutons de largeur sont à développer dans le gabarit d'aperçu si le besoin est confirmé.

### Restauration d'une version publiée

- **Sveltia** : abandonner une modification en cours ferme sa pull request et laisse la version publiée en place. L'historique du fichier montre les commits et leurs différences, sans bouton de restauration d'une ancienne version. Annulations possibles avant enregistrement (champ, langue, entrée). Pas d'action « Dépublier » : la suppression passe elle aussi par le circuit. Vérifié (doc).
- **Decap** : suppression des modifications non publiées et action « Dépublier » (citées par la doc de Sveltia comme différence) ; aucun historique de versions dans l'interface. Revenir à une version plus ancienne demande un retour arrière Git. Vérifié (doc) pour l'absence dans les pages consultées.

### Contenus liés

- **Sveltia** : bouton d'ajout dans le champ relation, enregistré dans le même commit, et dans la même pull request en circuit éditorial. Limites : pas de bouton d'ajout dans certains cas de circuit éditorial ; un témoignage créé depuis la relation partage la pull request de l'accueil et ne peut pas être modifié à part. Vérifié (doc).
- **Decap** : sélection d'un contenu existant seulement ; affichage par gabarit (`{{auteur}}, {{entreprise}}`) et stockage du slug par `{{slug}}` documentés. Vérifié (doc).

### Droits

- **Les deux** : pas de rôles rédacteur et valideur dans l'outil. Tout repose sur les droits du dépôt GitHub (accès en écriture pour se connecter). Vérifié (doc).
- **Sveltia** : on ne peut pas approuver sa propre pull request ; `publish: false` sur une collection oblige une autre personne à publier, mais s'applique à tout le monde. Une règle de protection de branche sur `main` reste le vrai verrou. Vérifié (doc), à régler dans le dépôt de test.

## 4. Authentification GitHub

- Le Worker `sveltia-cms-auth` répond sur `/auth` et `/callback` (et `/oauth/authorize`, `/oauth/redirect`) et renvoie le jeton par le message `authorization:github:success:{...}` attendu par Decap. Decap appelle par défaut `base_url` + `/auth` et accepte un serveur OAuth externe via `base_url`. Le dépôt du Worker se dit « compatible with Netlify CMS (now Decap CMS) ». Vérifié (code source et doc) ; à tester en vrai.
- Le Worker ne figure pas dans la liste des clients OAuth de la doc Decap (liste communautaire, non exhaustive).
- Le domaine du site de test doit être déclaré dans `ALLOWED_DOMAINS` du Worker, sinon le jeton n'est pas transmis.

## 5. Reste à tester avec le dépôt de test

1. Connexion GitHub sur `/admin/` et `/admin-decap/` avec le même Worker.
2. Création d'un brouillon incomplet (Sveltia : accepté ; Decap : refus attendu).
3. Création des pull requests, étiquettes de statut, passage Brouillon, En relecture, Prêt, publication.
4. Aperçu de déploiement Netlify : lien affiché dans les deux outils, y compris pour une pull request en brouillon GitHub (Sveltia utilise le mode brouillon de GitHub au statut Brouillon).
5. Lien d'aperçu par langue de l'accueil (Sveltia `{{locale}}/`).
6. Rendu des résumés avec `ternary` et du gabarit `apercus.js` dans les deux outils.
7. Relation témoignage depuis l'accueil anglais et depuis une page de démonstration (collection sans multilingue reliée à une collection multilingue) ; fichier `en/` créé ou non pour un témoignage sans traduction.
8. Build Eleventy sur une branche de brouillon avec des champs obligatoires vides.

## 6. Documentation consultée

Sveltia CMS :

- Circuit éditorial : https://sveltiacms.app/en/docs/workflows/editorial
- Circuits : https://sveltiacms.app/en/docs/workflows
- Aperçus de déploiement : https://sveltiacms.app/en/docs/workflows/deploy-previews
- Fonctionnalités : https://sveltiacms.app/en/features
- Multilingue : https://sveltiacms.app/en/docs/i18n , https://sveltiacms.app/en/docs/i18n/structures , https://sveltiacms.app/en/docs/i18n/options , https://sveltiacms.app/en/docs/i18n/slugs
- Liste : https://sveltiacms.app/en/docs/fields/list
- Objet : https://sveltiacms.app/en/docs/fields/object
- Relation : https://sveltiacms.app/en/docs/fields/relation
- Éditeur (aperçu, historique, annulations) : https://sveltiacms.app/en/docs/ui/content-editor
- Worker d'authentification : https://github.com/sveltia/sveltia-cms-auth (et `src/index.js`)

Decap CMS :

- Multilingue : https://decapcms.org/docs/i18n/
- Listes à types : https://decapcms.org/docs/variable-type-widgets/
- Circuit éditorial : https://decapcms.org/docs/editorial-workflows/
- Liens d'aperçu : https://decapcms.org/docs/deploy-preview-links/
- Widgets : https://decapcms.org/docs/widgets/
- Relation : https://decapcms.org/docs/widgets/relation/
- Résumés et filtres : https://decapcms.org/docs/summary-strings/
- Options de configuration : https://decapcms.org/docs/configuration-options/
- Backends (base_url, auth_endpoint) : https://decapcms.org/docs/backends-overview/
- GitHub : https://decapcms.org/docs/github-backend/
- Clients OAuth externes : https://decapcms.org/docs/external-oauth-clients/
