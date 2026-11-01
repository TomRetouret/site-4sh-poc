# Secteurs, Clients & Solutions, Technologies, Catégories de formation : schéma des formulaires

Quatre collections dossier (Sveltia CMS 0.256.1), un fichier Markdown par page. Gabarits fixes, alimentés par des champs dans l'ordre de la page. Style : aucun tiret cadratin ni demi-cadratin dans les libellés.

| Collection | Dossier | Gabarit | Configuration |
|---|---|---|---|
| `secteurs` Secteurs (3 pages) | `src/content/secteurs/` | `src/_includes/secteur.njk` | `admin/config/collections/040-secteurs.yml` |
| `pages_secteurs` Clients & Solutions (9 pages) | `src/content/pages-secteurs/` | `src/_includes/secteur-libre.njk` | `050-pages_secteurs.yml` |
| `technologies` Technologies (8 fiches) | `src/content/technologies/` | `src/_includes/technologie.njk` | `080-technologies.yml` |
| `categories` Catégories de formation (5 pages) | `src/content/categories/` | `src/_includes/categorie.njk` | `030-categories.yml` |

Après modification d'un morceau : `node scripts/assembler-config.js` (jamais `admin/config.yml` à la main). Filtres et contrôles de build : `eleventy/collections.js`. Aperçus : `admin-shared/apercus-collections.js` (chargé par `admin/index.html`). Migration : `scripts/migrer-collections.js` (`--essai` pour un bilan sans écriture).

## Conventions communes

- Groupes : comme pour les références, les champs restent à la racine du fichier et le groupe est le préfixe du libellé (« En-tête · ... »). Seul le Référencement est un vrai objet.
- `*mot*` affiche le mot en rouge dans les titres (filtre `accent`). `**mot**` met en gras dans les champs courts des secteurs et dans l'accroche des pages Clients & Solutions (filtre `gras`, appliqué avant `accent`) ; dans les champs Markdown, c'est le gras normal.
- Référencement : objet `referencement` { `meta_title`, `meta_description`, `indexation` } (et non `seo`, qui masquerait la donnée globale `seo` lue par `base.njk`). Les fichiers `*.11tydata.js` calculent `title`, `description` (replis : voir chaque collection) et `noindex` : vrai seulement si `indexation` vaut explicitement `false` (ou s'il reste un ancien `noindex: true`). `noindex` est lu par `base.njk` et par le plan du site.
- Images : les logos (Clients & Solutions, Technologies) ont pour texte alternatif le nom de la page (automatique, comme les logos des références). Une image insérée dans un texte Markdown sans texte alternatif (`![](...)`) est signalée au build.
- « Rang dans la liste du back-office » (`ordre` des Secteurs et des Clients & Solutions) ne sert qu'au tri dans le back-office : le menu du site est dans Navigation. Pour les Technologies, `ordre` règle bien l'ordre des cartes de la page Expertises techniques.
- Contrôles de build (`[collections] ...`, sans bloquer) : fiche référence ou formation introuvable, section sans titre après la première, sous-partie sans titre, image Markdown sans texte alternatif, catégorie sans nom.

## Sections de page (Clients & Solutions, Technologies)

Le contenu principal n'est plus un grand champ Markdown où l'on reconstruisait la mise en page avec des `##` et `###`, mais une liste `sections` :

```yaml
sections:
  - titre: "Intertitre (H2), vide seulement pour un texte d'introduction en tête"
    texte: "Markdown : paragraphes, listes, gras, liens"
    sous_parties:
      - titre: "Sous-titre (H3)"
        texte: "Markdown"
```

Le filtre `corpsSections` recompose le Markdown (`## titre`, texte, `### sous-titre`, texte) et le rend avec l'instance Markdown d'Eleventy ; le HTML passe ensuite dans le filtre `blocs` d'`eleventy.config.js`, qui choisit la mise en page comme avant : fonds alternés, première section en étapes sur fond sombre, sous-parties en étapes (titre « approche », « méthode », « démarche », « comment »..., 3 minimum), en atouts (« pourquoi », « choisir », « atout », « engagement »...) ou en cartes (carrousel au-delà de 3), liste de 3 puces ou plus en grille de cartes, paragraphe fait d'un seul lien en bouton, lien vers `/references/<slug>/` en aperçu de la fiche, dernière section courte avec un lien en bandeau d'appel à l'action. Le rendu est donc identique à l'ancien corps de texte. S'il reste un corps de texte (fichier non migré), il est utilisé à la place.

Choix : ces pages n'ont pas été passées dans la bibliothèque de blocs (`schema-blocs.md`) : la mise en page automatique du filtre `blocs` n'a pas d'équivalent bloc par bloc, et le rendu devait rester identique. Les sections donnent des champs atomiques (titre, texte, sous-parties) sans changer le rendu.

## Secteurs (`secteur.njk`)

| Groupe | Clé | Widget | Obligatoire | Rendu |
|---|---|---|---|---|
| En-tête | `titre` Nom du secteur | string, 40 car. | oui | fil d'Ariane, surtitre « Secteur · nom », titre par défaut |
| En-tête | `h1` Grand titre | string, 70 car., accent | oui | H1 |
| En-tête | `accroche` | text | oui | accroche, description par défaut |
| Défis | `defis_intro`, `defis[]` | text, liste de string (gras) | non | section « Les défis de votre métier » (masquée si liste vide) |
| Opportunités | `opportunites_intro`, `opportunites[]` | text, liste de string (gras) | non | section « Les opportunités... » |
| Pourquoi 4SH | `pourquoi[]` { `titre`, `paras[]` } | liste | non | atouts sur deux colonnes |
| Notre approche | `comment_intro`, `etapes[]` { `titre`, `texte` } | text, liste | non | étapes sur fond sombre |
| Références clients | `references` | relation multiple vers Références | non | cartes de références |
| Back-office | `ordre` | entier | non | tri du back-office uniquement |
| Référencement | `referencement` | objet | non | repli titre : « nom - Logiciel métier sur mesure \| 4SH », description : accroche |

Surtitres et titres des sections : collection Libellés (`libelles.secteur.*`), communs aux trois pages.

## Clients & Solutions (`secteur-libre.njk`)

| Groupe | Clé | Widget | Obligatoire | Rendu |
|---|---|---|---|---|
| En-tête | `titre` Nom de la page | string, 50 car. | oui | fil d'Ariane, alt du logo, titre par défaut |
| En-tête | `categorie` Type de page | select Client / Solution | oui | surtitre |
| En-tête | `h1` | string, 110 car., accent | oui | H1 |
| En-tête | `chapo` Accroche | text (gras) | oui | accroche, description par défaut |
| En-tête | `logo` | image | non | logo (pages Solution) |
| En-tête | `cta_label`, `cta_url` | string | non | bouton (replis : « Contactez-nous », `/#contact`) |
| Sections | `sections[]` | liste (voir plus haut) | non | contenu principal |
| Chiffres clés | `chiffres[]` { `chiffre`, `label` } | liste, 4 max. | non | bandeau |
| Références | `references` | relation multiple | non | cartes, sans celles déjà présentées dans les sections |
| Questions fréquentes | `faq[]` | liste | non | accordéon |
| Back-office | `ordre` | entier | non | tri du back-office |
| Référencement | `referencement` | objet | non | repli titre : « nom - 4SH », description : accroche |
| Suivi interne | `source_url` | string | non | non affiché |

`cta_titre` et `cta_texte` figuraient dans l'ancien formulaire mais n'étaient lus par aucun gabarit : retirés.

## Technologies (`technologie.njk`)

`nom`, `famille`, `logo`, `accroche_courte` et `ordre` sont aussi lus par la page Expertises techniques (FR et EN) : ne pas les renommer.

| Groupe | Clé | Widget | Obligatoire | Rendu |
|---|---|---|---|---|
| Identité | `nom` | string, 30 car. | oui | fil d'Ariane, carte, surtitres par défaut |
| Identité | `famille` | select build / run / formation | oui | couleur (`famille-<valeur>` sur le body et la carte) |
| Identité | `logo` | image | non | en-tête et carte |
| En-tête | `h1`, `intro` | string accent, text | oui | H1, chapô, description par défaut |
| Pourquoi | `pourquoi_eyebrow`, `pourquoi_titre`, `pourquoi_intro`, `atouts[]` { `titre`, `texte` } | | atouts oui | section Pourquoi (repli surtitre : « Pourquoi nom ? ») |
| Références clients | `references[]` { `fiche` (relation vers Références, facultative), `titre`, `texte` } | liste | non | cartes ; visuel, logo, secteur et lien viennent de la fiche |
| Contenu détaillé | `corps_eyebrow`, `corps_titre`, `corps_sombre`, `sections[]` | | non | bloc détaillé (repli surtitre : « Communauté et écosystème ») ; `corps_sombre` : texte continu sur fond sombre, sans mise en page automatique |
| Formations liées | `formations[]` { `titre`, `formation` (relation vers Formations) } | liste | non | cartes et bouton « Nos formations » |
| Questions fréquentes | `faq_titre`, `faq[]` | | non | accordéon (repli titre : « Questions fréquentes sur nom ») |
| Carte de la page mère | `accroche_courte`, `ordre` | text 90 car., entier | accroche oui | carte de la page Expertises techniques |
| Référencement | `referencement` | objet | non | repli titre : « nom - Expertise technique 4SH », description : intro |
| Suivi interne | `requete_cible`, `source_url`, `source_confluence`, `guide_source_url` | string | non | non affichés |

Anciennement, `pourquoi_eyebrow`, `faq_titre` et `faq` étaient affichés mais absents du formulaire, et les références et formations se saisissaient par adresse (`lien`, `url`) : elles passent en relations (`fiche`, `formation`), l'adresse est calculée.

## Catégories de formation (`categorie.njk`)

| Groupe | Clé | Widget | Obligatoire | Rendu |
|---|---|---|---|---|
| | `nom` Catégorie | select Develop, Design, DevOps, Outils, IA | oui | relie les fiches formation (relation Catégorie) et remplit le catalogue |
| En-tête | `h1` | string, 70 car., accent | non | H1 (repli : « Formations nom ») |
| En-tête | `intro` | text | oui | chapô, description par défaut |
| Texte de présentation | `body` | markdown (titres 2 et 3, gras, listes, liens) | oui | texte sous le catalogue |
| Questions fréquentes | `faq[]` | liste | non | accordéon sous le texte |
| Référencement | `referencement` | objet | non | repli titre : « Formations nom - 4SH », description : intro |

Le texte de présentation reste un champ Markdown : c'est un texte éditorial en prose (colonne de lecture), sans mise en page automatique à reconstruire. `IA` manquait dans la liste fermée de l'ancien formulaire.

## Migration (`scripts/migrer-collections.js`)

Idempotente ; sauvegarde des originaux dans `$HOME/sauvegarde-collections/<dossier>/` (jamais écrasée) ; avant d'écrire, compare le rendu de chaque valeur convertie à l'ancienne (corps Markdown rendu, gras, titre et description, indexation, liens des références et formations) et refuse la fiche en cas d'écart. Conversions : `meta_title`, `meta_description`, `noindex` vers `referencement` ; `<strong>` vers `**...**` ; corps vers `sections` ; `lien` et `url` vers les relations `fiche` et `formation` ; clés réordonnées comme le formulaire.

Écart volontaire : l'accroche de Hubit et du Simulateur de bornes contenait des balises `<strong>` affichées en clair (texte échappé) ; elles deviennent `**...**`, affichées en gras.
