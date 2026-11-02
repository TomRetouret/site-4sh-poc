# Pages de prestation en blocs

Ce fichier fait foi pour les pages `/prestations/<nom>/` (21 à l'origine, plus les 5 pages d'offre ajoutées le 2 novembre 2026 : `build`, `run`, `developpement-sur-mesure`, `expertise-produit`, `audits`) tirées de `src/content/prestations/*.md` (la page Logiciel métier, elle, suit `schema-logiciel-metier.md`). Style : aucun tiret cadratin ni demi-cadratin dans les libellés.

## En bref

Avant : un long corps Markdown que le filtre `blocs` d'`eleventy.config.js` découpait en devinant la mise en page (chaque H2 une section, les H3 en cartes, atouts ou étapes selon des mots du titre, une liste de 3 éléments ou plus en cartes, un paragraphe réduit à un lien en bouton, deux sections de texte d'affilée en deux colonnes, etc.).

Après : le contributeur choisit explicitement chaque section parmi cinq blocs à champs atomiques. Le rendu HTML est identique à l'ancien. Seuls restent calculés, comme avant : le fond alterné, le temps fort sur fond sombre et le petit numéro des sections.

| Quoi | Où |
|---|---|
| Contenus | `src/content/prestations/<nom>.md`, tout en front matter (corps vide) |
| Gabarit de page | `src/_includes/prestation.njk` ; données calculées : `src/content/prestations/prestations.11tydata.js` |
| Blocs (rendu) | `src/_includes/composants/blocs/section_*.njk`, morceaux communs dans `_section.njk` |
| Blocs (CMS) | `admin/config/blocs/section_*.yml`, profil `prestation` (`_profils.yml`) |
| Filtres | `eleventy/prestations.js` : `misePageSections`, `refsDesSections`, `mdSection`, `mdTitre`, `echappeSection`, `libelleCarrousel`, `nomProjetSection`, `adresseExterne` |
| Collection CMS | `admin/config/collections/060-pages_prestations.yml` (repères `# >>> BLOCS:prestation`) |
| Aperçus | `admin-shared/apercus-prestations.js` (gabarit de page, chargé par `admin/index.html`) et `admin-shared/apercus-bloc-section_*.js` |
| Migration | `scripts/migrer-prestations.js` ; originaux dans `$HOME/sauvegarde-prestations/` (shell du poste) |

Le filtre `blocs` d'`eleventy.config.js` n'est plus utilisé par les prestations ; il reste en place pour les autres gabarits qui s'en servent encore.

## Forme d'un fichier

```yaml
titre: UX Design                 # nom court : fil d'Ariane, onglet si pas de titre SEO
ordre: 21
entete:
  offre: build                   # build | run (liste fermée)
  titre_h1: "Agence UX design : concevoir des expériences *utiles*"
  chapo: "..."
  bouton: { texte: Parlons de votre projet UX, lien: /contact/ }
  parent: { texte: Application mobile, lien: /prestations/application-mobile/ }   # pages par ville seulement
chiffres: [ { chiffre: "+15 ans", label: "d'expertise" } ]                         # facultatif
blocs: [ { type: section_texte, ... }, ... ]
references: [ timetobeem ]
faq_titre: "FAQ - ..."            # facultatif : titre des questions fréquentes
faq: [ { question: "...", reponse: "..." } ]
referencement: { meta_title: "...", meta_description: "...", indexation: true }
source_url: ...                  # mémos non affichés : source_url, source_confluence, requete_cible, slug_prevu
```

## Champs fixes du gabarit (et pourquoi)

Toutes les pages ont la même ossature, dans le même ordre : en-tête, bandeau de chiffres, sections, références, questions fréquentes, formulaire de contact. Ce qui ne se déplace ni ne se répète est donc un champ fixe : le contributeur ne peut ni l'oublier ni le mettre au mauvais endroit. Les blocs existants Hero, Chiffres clés et FAQ ont un autre balisage (`hero-interne`, `chiffres`) : les réutiliser aurait changé le rendu.

- **En-tête de page** (`entete`, obligatoire) : `offre` « Couleur d'offre » (select fermé, obligatoire, défaut build) : `build` = « 4SH Build · Concevoir & développer », `run` = « 4SH Run · Faire vivre & auditer ». Remplace la déduction depuis `famille_label`. Donne le surtitre du hero et la classe `famille-<offre>` du body (`offre` calculé dans `prestations.11tydata.js`). `titre_h1` « Grand titre de la page (H1) » [oui], convention *mot* en rouge (filtre `accent`). `chapo` « Chapô » [non]. `bouton` (texte et destination [oui], défauts « Parlons de votre projet » et `/contact/`). `parent` « Page parente (fil d'Ariane) » [non].
- Rendu : macro `hero` de `composants/page.njk`, inchangée (fil d'Ariane « Accueil › [parent ›] titre », surtitre, h1, chapô, bouton). Sans offre reconnue, surtitre « Prestation ».
- **Chiffres clés** (`chiffres`, 4 au maximum) : `chiffre` et `label` [oui]. Macro `bandeau_chiffres`, inchangée. Aucune page n'en a aujourd'hui.
- **Références en bas de page** (`references`, relation multiple vers `references`) : macro `bloc_references`, sans les fiches déjà reliées dans une section Projets visible (filtre `refsDesSections`, qui remplace la mémoire `refsMisesEnAvant` du filtre `blocs`).
- **Questions fréquentes** (`faq`) : `question` et `reponse` [oui]. Macro `faq_section` (accordéon et JSON-LD). Titre : `faq_titre` « Titre des questions fréquentes » [non] (ajouté le 2 novembre 2026 pour reprendre les titres de l'ancien site), sinon les libellés (`libelles.secteur.faq_titre`). La réponse est du texte simple : une liste y reste affichée avec ses tirets.
- **Référencement** (`referencement`, groupe replié) : `meta_title`, `meta_description`, `indexation` « Afficher dans les moteurs de recherche » (case cochée par défaut). Nommé `referencement` et non `seo` : une donnée de page `seo` masquerait la donnée globale `seo` lue par `base.njk` (`seo.indexation`, `seo.url`). Même convention que les fiches références. `prestations.11tydata.js` calcule `title`, `description` (repli sur le chapô) et `noindex` (vrai si `noindex: true` est présent ou si la case est décochée), lu par `base.njk` et le plan du site.
- **Formulaire de contact** : automatique en fin de page (macro `contact_final`).

## Les sections (blocs du profil `prestation`)

Champs communs : `masquer` (booléen), `titre` « Titre de la section » [non : vide seulement pour le texte d'introduction en haut de page], `texte` (Markdown : gras, italique, liens, listes à puces et numérotées), `boutons` « Boutons » [non, 3 au maximum] de `texte` et `lien` [oui] (le premier rouge, les suivants en contour ; une adresse `https://` s'ouvre dans un nouvel onglet).

| Type | Libellé | Éléments propres | Rendu (identique à l'ancien filtre) |
|---|---|---|---|
| `section_texte` | Section de texte | `disposition` [oui, défaut `empile`] : `empile` = titre au-dessus, `colonnes` = titre à gauche, texte à droite, `bandeau` = bandeau d'appel centré sans numéro | `section.sect-bloc` ; colonnes : `.sect-duo` ; bandeau : `.sect-bloc--cta` |
| `section_cartes` | Section en cartes | `cartes` [oui, au moins 1] de `titre` [non], `texte` [non], `lien` [non] | `.sect-defis` de `.sect-defi`, carrousel `.carrousel.car--blocs` à partir de 4 cartes |
| `section_atouts` | Section d'atouts (deux colonnes) | `atouts` [oui], mêmes champs que les cartes | `.sect-atouts` de `.sect-atout` |
| `section_etapes` | Section en étapes | `etapes` [oui] de `titre` [oui], `texte` [non] | `.sect-etapes` de `.sect-etape` |
| `section_projets` | Section de projets | `projets` [oui] de `titre` [oui], `texte` [non], `reference` (relation vers `references`) [non], `lien_texte` [non], `lien` [non] | `.sect-refs-inline` (ou carrousel `car--refs` à partir de 4) de `.sect-ref-carte` |

Autre bloc proposé dans le profil `prestation` (depuis le 2 novembre 2026) : **Derniers articles du blog** (`derniers_articles`, composant partagé inchangé). `prestation.njk` lui transmet `ctx.blog` (articles récupérés au build). Il garde son propre balisage (`section.blog-accueil`) : il compte dans l'alternance des fonds mais n'affiche ni fond calculé ni numéro.

Détails de rendu :
- Le texte d'introduction s'affiche dans `div.sect-prose` ; les listes reçoivent la classe `sect-liste` (liste à cocher). Markdown rendu avec le même moteur qu'Eleventy (`mdSection`), titres en Markdown en ligne (`mdTitre`).
- Carte ou atout avec `lien` : toute la carte devient un lien (`a.sect-defi--lien`, titre et « Découvrir → »), le texte n'est pas affiché. Sans titre, la carte ne montre que son texte.
- Projet : visuel, logo, client et secteur lus dans la fiche reliée ; sans fiche, le visuel montre le début du titre (avant la première virgule) et l'étiquette « Projet ». Lien : `lien`, sinon la fiche reliée ; libellé : `lien_texte`, sinon « Voir la référence ». Sans fiche ni lien, pas de lien.
- Le libellé accessible d'un carrousel est le titre de la section.

### Calculé, jamais réglé à la main (filtre `misePageSections`)

Sur les blocs visibles, dans l'ordre : le fond est blanc, puis gris clair une section sur deux (`sect-bloc--creme`) ; la première **Section en étapes** qui n'ouvre pas la page passe sur fond sombre (`sect-bloc--sombre`, une seule fois par page), comme le faisait le filtre. Chaque section titrée reçoit un numéro (01, 02...) affiché au-dessus du titre (sauf en bandeau, qui compte quand même).

### Ce que le filtre devinait et que le contributeur choisit désormais

- Le traitement des sous-titres (cartes, atouts, étapes) : avant, déduit de mots du titre (« méthode », « pourquoi »...) et de la longueur des textes, puis inversé si deux sections voisines avaient le même. La migration a figé le résultat affiché.
- Deux colonnes et bandeau final : avant, automatiques (deux sections de texte d'affilée ; dernière section courte avec un bouton). Désormais une disposition de la Section de texte.
- Les boutons : avant, tout paragraphe réduit à un lien, où qu'il soit dans la section. Désormais le champ Boutons.
- Les projets : avant, détectés par les liens `/references/...` du texte. Désormais la relation « Fiche référence reliée ».
- Non repris (aucune page ne l'utilisait) : la section qui met en avant une seule référence à côté du texte (`sect-bloc--ref`). Le script de migration la signale s'il la rencontre.

## Images (remise des images de l'ancien site, 2 novembre 2026)

Toutes facultatives ; sans elles, le rendu est inchangé. Fichiers sous `/uploads/ancien-site/`.
- **Illustration de l'en-tête** (`entete.illustration` : `fichier`, `alt`, `decorative`, cochée par défaut) : ajoutée par `prestation.njk` dans le hero (classe `sect-hero--illu`, `figure.presta-hero-illu`), à droite du texte à partir de 1024 px, masquée en dessous (comme sur l'ancien site). Le macro `hero` de `composants/page.njk` n'est pas modifié.
- **Illustration de carte** (`section_cartes`, champ `illustration` de chaque carte, même forme) : `span.sect-defi-illu` en tête de la carte (macro `carte` de `_section.njk`), aussi dans une carte cliquable.
- **Visuel et logo de projet** (`section_projets`, champs `image` et `logo` de chaque projet, même forme) : remplacent le visuel et le logo de la fiche reliée ; utiles pour un projet sans fiche ou quand l'ancienne page montrait un autre visuel que la fiche.
- **Texte et image** (`texte_image`, ajouté au profil `prestation`) : pour une section dont l'ancienne page avait une photo. `prestation.njk` charge sa feuille (`/assets/blocs.css`) comme l'aiguilleur. Il compte dans l'alternance des fonds mais garde son propre fond blanc et n'a pas de numéro.
- Styles : `src/assets/prestations-images.css`, chargée seulement si la page a une illustration d'en-tête ou de carte.
- Non repris (charte) : les motifs de fond du hero (`design-logo.svg`, `dev-logo.svg`, `management-logo.svg`, aplats rose pâle) et les petites illustrations « étoile » (`illu-ourOffers.svg`, `illu-note.svg`) ; les logos d'outils et d'hébergeurs (aucun emplacement à logos dans le gabarit).
- Aperçus Sveltia (`apercus-prestations.js`, `apercus-bloc-section_*.js`) : ces nouveaux champs n'y sont pas encore dessinés.

## Collection « Prestations » dans Sveltia

Ordre du formulaire : Nom court, Ordre, En-tête de page, Chiffres clés, Sections de la page (liste de blocs, `typeKey: type`), Références en bas de page, Questions fréquentes, Référencement (replié), mémos non affichés. Résumé : `{{titre}}` ; tri par ordre ou nom. Plus de champ « Contenu » (corps Markdown). Les types de sections sont recopiés par `node scripts/generer-blocs.js` puis `node scripts/assembler-config.js` (jamais `admin/config.yml` à la main).

Aperçu : `ApercuPrestation` (en-tête, chiffres, sections avec fond et numéro calculés comme sur le site, rappel des références, questions fréquentes) ; chaque section par `apercus-bloc-section_*.js`. Le Markdown y est rendu de façon simplifiée.

## Migration

`node scripts/migrer-prestations.js` (`--essai` pour vérifier sans écrire, `--fichier <nom>.md` pour un seul fichier). Pour chaque fichier encore au format ancien :
1. découpe le Markdown source en sections (H2) et éléments (H3 ou liste), sans réécrire le texte ;
2. prend le type de chaque section dans le rendu actuel du filtre `blocs` ;
3. rend les nouveaux blocs avec les composants du site et compare au rendu du filtre (à l'espace près), ainsi que les références exclues du bas de page ; relit le YAML produit et le rend à nouveau ;
4. n'écrit que si tout est identique, après copie de l'original dans `$HOME/sauvegarde-prestations/` (jamais écrasée).
Ce qu'il ne sait pas convertir à coup sûr (élément de liste à plusieurs paragraphes, titre en gras non séparable, lien de projet non séparable, section à référence unique, champ inconnu, code Nunjucks dans le corps...) est signalé et le fichier reste intact. Un fichier déjà converti est ignoré (idempotent).

Résultat du 1er novembre 2026 : 21 fichiers convertis, aucun signalement ; les 21 pages et toutes les autres pages du site sont identiques avant et après (comparaison à l'espace près, sans commentaires HTML).

Retour arrière : recopier les originaux de `$HOME/sauvegarde-prestations/` et reprendre l'ancien `prestation.njk` et l'ancien `prestations.11tydata.js` dans l'historique Git.

## Pages par ville : à trancher

Six pages déclinent deux offres par ville : `application-mobile-bordeaux`, `-lyon`, `-paris` et `application-saas-bordeaux`, `-lyon`, `-paris`. Rien n'a été fusionné.

Ce qui est commun :
- La structure. Mobile : 8 sections dans le même ordre sur les trois villes (introduction, présentation en colonnes, enjeux, étapes, budget, projets, « pourquoi nous », bandeau final). SaaS : même trame (Paris a une section de présentation en plus).
- La page parente dans le fil d'Ariane, le bouton et les références de bas de page (identiques pour le mobile).
- Mobile : la section Projets reprend les 4 mêmes projets (IZIVIA, Filhet-Allard, CHEP, Naxos) avec le même texte sur les trois villes, plus le bouton « Voir toutes nos références ». SaaS : un seul atout commun aux trois villes.
- Aucun élément n'est repris de la page générale (`application-mobile`, `application-saas`).

Ce qui diffère : tous les titres, introductions, étapes, atouts et questions fréquentes sont rédigés pour chaque ville (requêtes visées : « développement application mobile Bordeaux », « agence SaaS Lyon »...). Les pages ne sont donc pas des doublons.

Options :
1. **Contenu partagé pour ce qui est vraiment commun** (recommandé si le référencement local reste un objectif) : garder les six pages, et sortir la galerie de projets dans un contenu partagé (par exemple une collection « Galeries de projets » reliée par une section Projets), pour ne mettre à jour qu'une fois les 4 projets du mobile. Coût : un nouveau type de contenu et une relation ; aucun changement visible.
2. **Redirection 301 vers la page générale** (si l'agence SEO constate que ces pages n'apportent pas de trafic local) : retirer les six pages, rediriger dans `src/_redirects`, reprendre au besoin une section « Nos implantations » sur la page générale (elle existe déjà sur `application-saas`). Coût : perte du ciblage par ville.

Décision attendue : objectif de référencement local maintenu ou non (avis de l'agence SEO sur le trafic de ces six pages).

## Limites connues, non vérifié

- Interface Sveltia non ouverte : formulaire, ajout et glisser des sections, aperçus et relecture du Markdown par l'éditeur riche non vérifiés à l'écran. L'éditeur riche peut réécrire la syntaxe Markdown à l'enregistrement (puces `-`, échappements) sans changer le rendu, à confirmer.
- Les blocs `section_*` ne sont pas dans le profil `demo` : leurs styles sont dans `secteurs.css`, que les pages de démonstration ne chargent pas.
- Plan du site : mêmes adresses ; la date `lastmod` dépend de la date des fichiers.
