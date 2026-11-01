# Correspondance des champs, lot 0 (4 pages pilotes)

Source : `admin/config.yml` au commit HEAD (90ce9b7) et les gabarits du même commit. Le détail ligne à ligne est dans `correspondance-champs.csv` (séparateur point-virgule, UTF-8 avec BOM pour Excel).

Lecture des colonnes :
- **ordre d'affichage** suit le HTML réellement produit (1, 2, 2.1 pour un sous-champ) ; « en-tête » = balises du `<head>`, « non affiché » = champ jamais rendu sur la page.
- **champ actuel** `(nouveau)` = champ cible sans équivalent actuel, le plus souvent une valeur aujourd'hui codée en dur dans le gabarit.
- **bloc cible** : nom du bloc de la bibliothèque, suivi de sa clé technique entre crochets. Pour l'accueil, clés et libellés sont ceux de `schema-blocs.md`, repris tels quels.

## Contrôle de couverture

Comptage par script (parcours récursif de la config, chaque liste, objet et sous-champ compté), puis comparaison avec la colonne « champ actuel » du CSV :

| Page | Champs dans la config | Présents dans le CSV | Manquants | Nouveaux champs cibles | Lignes CSV |
|---|---|---|---|---|---|
| Accueil | 81 | 81 | 0 | 11 | 92 |
| Logiciel métier | 82 | 82 | 0 | 3 | 85 |
| Formation | 41 | 41 | 0 | 0 | 41 |
| Référence | 26 | 26 | 0 | 1 | 27 |
| **Total** | **230** | **230** | **0** | **15** | **245** |

## Accueil

- **Champs** : 81 avant, 87 après (85 dans les blocs, 2 dans Référencement). La hausse vient des destinations de boutons, des textes alternatifs et du choix d'offre, aujourd'hui codés en dur ou déduits de la position.
- **Blocs dans l'ordre** : Hero (expressif), Logos clients, Cartes d'offres, Chiffres clés, Cartes secteurs, Méthode 4D, Présentation d'un projet (carrousel `projets`), Technologies, FAQ, Derniers articles, Équipe ou portraits. Formulaire de contact final automatique, hors blocs.
- **Supprimés (2)** : `chiffres[].compte` et `chiffres[].suffixe`, jamais lus par le gabarit.
- **Reprise manuelle (2)** : `realisations[].citation` et `auteur`, remplacés par un lien vers un témoignage partagé. Ils sont vides sur les 3 projets, donc il n'y a rien à perdre.
- **Problèmes relevés** :
  - Couplage caché : dès que `equipe_photo` est remplie (c'est le cas), l'encart du hero (`hero_visuel_*`, 6 champs) n'est plus affiché. Les rédacteurs remplissent des champs invisibles. Le champ « Afficher l'encart » le remplace, repris à « non » pour garder le rendu.
  - Destinations codées en dur : boutons du hero (`#contact`, `/references/`), bouton Équipe (`/notre-entreprise/`), titre et lien du blog.
  - L'accroche est découpée en 3 champs (début, mot accentué, fin) : elle est fusionnée en un seul champ avec la convention *astérisques*.
  - Le picto, la couleur et l'étiquette des cartes d'offres dépendent de leur position : si on réordonne les cartes, Build devient Run.
  - Libellés trompeurs : `hero_surtitre` est le H1 ; « Texte du visuel » est affiché comme description du projet.
  - Les liens vides se replient sur `#` (liens morts) dans les cartes, les secteurs et les technologies.

## Logiciel métier

- **Champs** : 82 avant, 62 après (59 dans les blocs, 2 dans Référencement, 1 lien vers un appel à l'action partagé).
- **Blocs dans l'ordre** : Hero (sobre), Chiffres clés, Texte simple (Pourquoi), Étapes ou processus, Technologies (affichage cartes), Texte simple (Pour qui), Liste de bénéfices, Présentation d'un projet, Logos clients, Derniers articles, FAQ. Le bouton flottant se rattache aux appels à l'action partagés et le contact final reste commun au site.
- **Supprimés (17)** :
  - `compte` et `suffixe`, inutilisés ;
  - `methode_etapes[].num`, numéro calculé selon la position (à valider) ;
  - `socle_cartes[].lien_label`, toujours « En savoir plus → » ;
  - `secteur`, `titre` et `texte` des autres cartes de réalisations, repris de la fiche référence reliée ;
  - `realisations_clients` (2 lignes), doublon des réglages du site ;
  - `blog_eyebrow` et `blog_articles` (8 lignes), remplacés par la récupération automatique du blog. Les 3 articles actuels pointent vers `#`.
- **Reprise manuelle (2)** : citation et auteur de la réalisation vedette (SIMAR). La citation n'a pas d'auteur : il faut un nom pour créer le témoignage partagé, sinon on l'abandonne.
- **Problèmes relevés** :
  - « Hero · accroche » désigne le chapô, alors que sur l'accueil l'accroche est le grand titre.
  - « Logo (texte) » est le nom du client, pas une image.
  - L'aide de `pour_qui_paragraphes` parle d'astérisques, alors que le contenu contient du HTML (`<strong>`).
  - Codés en dur : le surtitre d'offre « 4SH Build · Concevoir & développer » (front matter), le fil d'Ariane, le libellé « Voir la référence → », la destination `#contact` du bouton flottant, l'ancre `#realisations`.
  - Du HTML est saisi à la main dans les paragraphes : à convertir en mise en forme, puis à relire.
  - Les 5 étapes (Cadrage, Design, Build, Deploy, Run) ne sont pas la Méthode 4D, alors que le nom technique est `methode_` : d'où le bloc Étapes.
  - INFOPORT figure dans le bandeau clients de la page mais pas dans `site.clients`.
  - La FAQ n'a pas de données structurées sur cette page (le bloc FAQ les ajoute).

## Formation (collection, 48 fiches)

- **Champs** : 41 avant, 37 dans la fiche après (34 champs, 3 dans Référencement), plus 4 saisis une seule fois dans le contenu partagé Équipe. La fiche reste un contenu partagé « Formations ». Son gabarit est un enchaînement fixe de blocs alimentés par la fiche.
- **Blocs dans l'ordre** : Hero (sobre), carte d'inscription (prix, sessions, Téléchargement du programme), Chiffres clés (durée, participants, note, ancienneté, théorie), Texte simple (description, public, prérequis), Liste de bénéfices (objectifs), Étapes ou processus en accordéon (programme), Équipe ou portraits (formateur), FAQ. Les modalités, les autres formations et le devis restent automatiques.
- **Supprimé (1)** : `pratique`, toujours égal à 100 moins la théorie (vérifié sur les 48 fiches).
- **Reprise manuelle (6 lignes)** : le formateur et ses sous-champs. 5 formateurs distincts (prénoms seuls) sur 21 fiches deviennent 5 fiches Équipe.
- **Conversions automatiques à prévoir** :
  - prix texte « 1500 € HT » vers un nombre ;
  - sessions « Du JJ/MM/AAAA au JJ/MM/AAAA » vers deux dates ;
  - durée HTML `<b>3 jours</b> (21h00)` vers jours et heures, sauf la fiche en fourchette « 1 à 5 jours », à reprendre à la main ;
  - note « 4,7 / 5 » vers un nombre ;
  - `noindex` inversé en « Afficher dans les moteurs de recherche ».
- **Problèmes relevés** :
  - Le lien de catégorie du fil d'Ariane pointe en dur vers `/formations/`.
  - La liste 1 à 8 participants de la pré-inscription est codée en dur.
  - Les liens de sommaire Objectifs et Programme s'affichent même quand la section est vide.
  - Le préfixe « Formation » est imposé dans le H1.
  - L'aide du sous-titre (« - Les fondamentaux ») pousse à saisir un tiret, et le sous-titre doublonne le niveau.
  - « Note » est ambigu.
  - Les 48 illustrations sont hébergées sur l'ancien site (www.4sh.fr) et les 48 programmes sur Google Drive.
  - Le corps de texte est en dernier dans le formulaire alors qu'il s'affiche en premier.

## Référence (collection, 18 fiches)

- **Champs** : 26 avant, 30 après (27 champs, 3 dans Référencement). Le texte unique « Étude de cas » devient 4 rubriques et un texte alternatif est ajouté au visuel.
- **Blocs dans l'ordre** : Hero (sobre), Chiffres clés, Téléchargement, Présentation d'un projet (rubriques, identité, galerie). Navigation précédent / suivant et contact final automatiques. Titre, client, résumé, logo, visuel, secteurs, technologies, expertises et ordre vont dans le contenu partagé « Références clients », réutilisé par les cartes et par le bloc Présentation d'un projet des autres pages.
- **Supprimé (1)** : `source_url`, jamais affiché ni utilisé par le code.
- **Reprise manuelle (8 lignes)** :
  - secteurs (9 valeurs libres) à relier à la collection Secteurs existante ;
  - technologies (25 valeurs libres) à relier au contenu partagé Technologies ;
  - expertises (19 valeurs avec doublons, « UX » et « 4SH UX ») à ramener à une liste fermée ;
  - découpage de l'étude de cas en 4 rubriques (15 fiches sur 18 suivent les mêmes intertitres) ;
  - textes alternatifs de la galerie, aujourd'hui figés en « titre, visuel N ».
- **Problèmes relevés** :
  - La fiche PDF est affichée deux fois.
  - Les chiffres clés sont vides sur les 18 fiches.
  - Les textes alternatifs du visuel et de la galerie sont générés et ne décrivent rien.
  - La date de mise à jour est un texte libre.

## Constat transverse

- 24 listes et la catégorie des formations sont obligatoires sans le dire : `required` est absent de la config, donc Sveltia les exige par défaut. Il faut le déclarer explicitement, bloc par bloc.
- Les titres SEO mélangent « - 4SH » et « | 4SH ».

## Décisions à faire valider

1. **Blocs hors bibliothèque** : `schema-blocs.md` utilise « Cartes secteurs » et « Derniers articles », absents des 18 blocs. Faut-il les ajouter à la bibliothèque (20 blocs), ou rabattre les secteurs sur Cartes d'offres et retirer le blog ?
2. **Hero sobre** : le H1 (`titre_page`) devient le grand titre et il n'y a pas d'accroche séparée. Le choix de l'offre (`hero.offre`) remplace le surtitre codé en dur.
3. **Blog de la page Logiciel métier** : remplacer les 3 articles saisis à la main (liens morts) par la récupération automatique, sans surtitre.
4. **Bloc Technologies** : ajouter un affichage « cartes » avec logo (page Logiciel métier). Autre option : relier le bloc au contenu partagé Technologies plutôt que saisir nom et lien à la main. Cela vaudrait aussi pour l'accueil, mais modifierait `schema-blocs.md`.
5. **Présentation d'un projet** : ajouter au bloc une liste « Autres références » reliée aux fiches (cartes de la page Logiciel métier). Faut-il aussi relier la réalisation vedette à la fiche Infoport au lieu de la ressaisir ?
6. **Numérotation des étapes** : numéro calculé selon la position dans le bloc Étapes (le bloc Méthode 4D garde son numéro saisi, comme l'arrête le schéma).
7. **Bandeau clients** : supprimer la liste propre à la page Logiciel métier au profit des réglages du site, après y avoir ajouté INFOPORT.
8. **Formations** : passer prix, durée, participants, note et sessions en champs typés (nombres, dates), avec masquage automatique des sessions passées. Calculer la part de pratique. Rendre obligatoires le public visé, les prérequis, les objectifs, le programme et le PDF du programme (attendus Qualiopi).
9. **Formateurs** : en faire des fiches du contenu partagé Équipe. Garder ou non une présentation propre à chaque formation ?
10. **PDF et illustrations** : rester sur des liens Google Drive et des images de l'ancien site, ou déposer les fichiers dans le site (le poids du PDF serait alors calculé et le champ supprimé) ?
11. **Références** : découper l'étude de cas en 4 rubriques fixes. Que faire des 3 fiches qui ne suivent pas ce plan ? Fixer la liste fermée des expertises.
12. **Témoignage sans auteur** (SIMAR) : obtenir un nom ou abandonner la citation.
13. **Indexation** : inverser la case « Cacher de Google » en « Afficher dans les moteurs de recherche », cochée par défaut.
14. **Suffixe des titres SEO** : l'ajouter automatiquement et l'harmoniser (« | 4SH » ou « - 4SH »).
