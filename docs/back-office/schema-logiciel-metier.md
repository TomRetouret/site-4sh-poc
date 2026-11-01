# Page Logiciel métier en blocs (page d'offre)

Ce fichier fait foi pour la page `/prestations/logiciel-metier/` : données, configuration de Sveltia, rendu et aperçu. Les blocs eux-mêmes sont décrits dans `schema-blocs.md` ; l'origine de chaque champ est dans `correspondance-champs.md` et `correspondance-champs.csv` (section Logiciel métier). Style : aucun tiret cadratin ni demi-cadratin.

## Fichiers

| Rôle | Fichier |
|---|---|
| Données de la page | `src/_data/contenus/fr/logiciel_metier.json` (donnée globale `contenus.fr.logiciel_metier`) |
| Ancien fichier, conservé pour retour arrière, plus lu | `src/_data/logiciel_metier.json` |
| Migration (idempotente) | `node scripts/migrer-logiciel-metier.js` |
| Gabarit | `src/logiciel-metier.njk` (aiguilleur des blocs, gabarit « offre ») |
| Titre, description, couleur d'offre | `src/logiciel-metier.11tydata.js` |
| Styles | `src/assets/logiciel-metier.css` (inchangé, plus quelques règles pour les étapes à 3, 4 ou 6 et le bloc appel_action) |
| Filtres | `eleventy/logiciel-metier.js` |
| Configuration Sveltia | `admin/config/collections/115-pages_offre.yml` (page), `105-appels_action.yml` (contenu partagé), `100-temoignages.yml` (auteur facultatif) ; blocs générés depuis `admin/config/blocs/<type>.yml` |
| Aperçu | `admin-shared/apercus-logiciel-metier.js` (enveloppe de page) et `admin-shared/apercus.js` (blocs) |

## Forme du fichier de données

```json
{
  "nom": "Logiciel métier",
  "bouton_flottant": "parlons-de-votre-projet",
  "seo": { "meta_title": "...", "meta_description": "..." },
  "blocs": [ { "type": "hero", "masquer": false, "variante": "sobre", "offre": "build", "...": "..." } ]
}
```

- `nom` « Nom de la page (fil d'Ariane) » (string) [oui] : texte après « Accueil › ».
- `bouton_flottant` « Bouton flottant » (relation vers `appels_action`) [non] : vide = pas de bouton flottant.
- `seo` « Référencement » (objet replié, en tête du formulaire) [oui] : `meta_title` « Titre SEO » [oui], `meta_description` « Méta-description » [oui]. Sveltia 0.256.1 n'a pas d'onglets dans un formulaire : le Référencement est un groupe séparé et replié, placé avant le reste.
- `blocs` « Blocs de la page » [oui] : profil `offre` de la bibliothèque (voir `schema-blocs.md`).

## Blocs de la page, dans l'ordre

| Rang | Bloc | Reprend |
|---|---|---|
| 1 | hero, variante sobre, offre `build` | `hero_h1`, `hero_chapo`, boutons, `hero_chips` ; le surtitre codé en dur devient l'offre Build |
| 2 | chiffres_cles | `chiffres` (sans `compte` ni `suffixe`, jamais lus) |
| 3 | texte_simple (Pourquoi) | `pourquoi_*` ; paragraphes fusionnés et HTML converti en Markdown |
| 4 | etapes | `methode_*` ; `num` supprimé (calculé), `label` devient `phase` |
| 5 | technologies, affichage cartes | `socle_*` ; `lien_label` supprimé (libellé commun), `lien_url` devient `lien` |
| 6 | texte_simple (Pour qui) | `pour_qui_*` ; HTML converti en Markdown |
| 7 | benefices | `atouts_*`, `atouts` |
| 8 | projet_vedette, ancre `realisations` | `realisations_eyebrow`, `realisations_titre`, `realisations_vedette` ; citation vers le témoignage partagé `infoport` ; cartes vers les fiches `cin` et `izivia-portail` |
| 9 | logos_clients | `realisations_clients_titre` ; les noms viennent des réglages du site |
| 10 | derniers_articles | `blog_titre` ; articles récupérés automatiquement, lien « Tout le blog » |
| 11 | faq | `faq_titre`, `faq_sous`, `faq` |

Le formulaire de contact final reste commun au site (hors blocs). Le bouton flottant suit, s'il est relié.

## Contenus partagés amorcés par la migration

- `src/_data/temoignages/fr/infoport.json` : la citation de la réalisation vedette, `auteur` vide, `entreprise` « Infoport » (indiquée dans le secteur de la réalisation). Aucun nom inventé.
- `src/_data/appels_action/parlons-de-votre-projet.json` : « Parlons de votre projet » vers `#contact`, comme l'ancien bouton flottant.
- `src/_data/site.json` : INFOPORT ajouté aux clients, après CIN, avec le lien `/references/infoport/`.

## Rendu

`src/logiciel-metier.njk` appelle `rendre_blocs(blocs, site, blog, temoignages.fr, page.url, { gabarit: "offre", fil_ariane: nom, references: collections.references, appels_action })`, puis le bouton flottant (`a.btn.btn-primary.sticky-cta`). La feuille `logiciel-metier.css` reste chargée par `extraCss`. La classe `famille-build` du `body` vient de l'offre du hero (`offre` calculé dans le fichier de données de la page), et non plus de `famille_label`.

## Écarts de rendu volontaires avec l'ancienne page

1. Blog : la section saisie à la main (surtitre « Le blog », 3 articles vers `#`) devient le bloc Derniers articles automatique (`section.blog-accueil`, lien « Tout le blog »).
2. Autres références : les cartes affichent le client, le titre et le résumé des fiches reliées (« CIN », « EDF business service - Professionnel ») au lieu des textes saisis sur la page.
3. Bandeau clients : il sort de la section Réalisations pour devenir le bloc Logos clients (sa propre section, même apparence `.clients`), alimenté par les réglages du site.
4. Témoignage : la citation est désormais signée « Infoport » (ligne `.auteur`), puisque le témoignage partagé porte l'entreprise.
5. FAQ : le bloc ajoute les données structurées FAQPage (JSON-LD), absentes de l'ancienne page.
6. Commentaires HTML : les commentaires du balisage ne sont plus les mêmes (sans effet visible).

## Aperçu dans Sveltia

Gabarit `ApercuPageOffre`, enregistré sous le nom du fichier (`logiciel_metier`) : rappel du référencement, blocs dessinés par `rendreBlocs()` avec `gabarit: 'offre'`, feuille `logiciel-metier.css` ajoutée dans l'aperçu seulement, mention du formulaire de contact, bouton flottant (affiché dans le flux). Les données liées (témoignage, fiches références, appels à l'action, clients) sont lues avec `getCollection`. Gabarit `ApercuAppelAction` pour la collection `appels_action`.

## Ajouter une autre page d'offre

1. Créer `src/_data/contenus/fr/<page>.json` (même forme).
2. Copier `src/logiciel-metier.njk` et `src/logiciel-metier.11tydata.js` en changeant le permalien et le nom de la donnée.
3. Dans `115-pages_offre.yml`, copier l'entrée `logiciel_metier` (repères `# >>> BLOCS:offre` et `# <<< BLOCS` compris) et adapter `name`, `label`, `file`, `preview_path`.
4. Ajouter le nom du fichier à `NOMS_PAGES_OFFRE` dans `apercus-logiciel-metier.js`.
5. Lancer `node scripts/generer-blocs.js` puis `node scripts/assembler-config.js`.

## Décisions prises en l'absence de consigne

- Collection « Pages d'offre » (`pages_offre`), une entrée par page, plutôt qu'une collection dédiée à Logiciel métier.
- Le nom du fil d'Ariane est un champ de la page (`nom`), le surtitre vient de `hero.offre`.
- Marge haute calculée (filtre `blocsSerres`) plutôt qu'un champ à cocher : aucune case de mise en page pour les rédacteurs.
- Balisage propre aux pages intérieures obtenu par l'option `gabarit: "offre"` de l'aiguilleur (Chiffres clés, Logos clients, FAQ), pour garder l'accueil et cette page identiques.
- Libellés « En savoir plus → » et « Voir la référence → » écrits dans les composants, pas dans les libellés du site (fichier partagé avec un autre chantier en cours).
- Lien de technologie vide en affichage cartes : pas de lien (au lieu d'un lien mort vers `#`).
- Bloc appel_action relié aux appels à l'action partagés plutôt qu'un bouton saisi dans le bloc.
- Pas de bloc Introduction : Texte simple couvre le besoin.
- Accueil : ses 11 blocs seulement (les nouveaux blocs ne sont pas proposés sur l'accueil bilingue).
