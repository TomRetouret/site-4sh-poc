# Fiches références : schéma du formulaire

Collection dossier `references` (Sveltia CMS 0.256.1), un fichier Markdown par fiche dans `src/content/references/`, toutes les données en front matter (plus de corps de texte). Gabarit fixe : `src/_includes/reference.njk`. Configuration : `admin/config/collections/020-references.yml` et `025-listes.yml`, puis `node scripts/assembler-config.js`. Aperçu : `admin-shared/apercus-references.js`. Filtres et contrôles de build : `eleventy/references.js`.

## Groupes du formulaire (ordre de la page)

Les champs lus par les cartes des autres pages (`titre`, `client`, `resume`, `logo`, `image`, `ordre`, `h1`, ainsi que `secteurs` et `technologies`) restent à la racine du fichier : le groupe est indiqué par le préfixe du libellé. Sveltia n'a pas de groupe purement visuel ; seuls l'étude de cas et le référencement sont de vrais objets.

| Groupe | Champ (clé) | Widget | Obligatoire | Rendu |
|---|---|---|---|---|
| En-tête | `titre` Nom du projet | string, 50 car. | oui | fil d'Ariane, cartes, navigation entre projets |
| En-tête | `h1` Titre de la fiche | string, 140 car. max. (60 conseillés), *accent* | oui | grand titre (repli : `titre`) |
| En-tête | `sous_titre` | text | non | chapô, retours à la ligne conservés (repli sur `resume` seulement si le champ est absent ; vide = pas de chapô) |
| En-tête | `type_projet` | text | non | bloc « Type » sous « Client » dans la colonne de droite |
| En-tête | `client` | string | oui | colonne Client, alt du logo |
| En-tête | `logo` | image | oui | logo de l'en-tête et des cartes |
| En-tête | `stats[]` (`chiffre`, `label`) | liste, 4 max. | non | bandeau de chiffres |
| Téléchargement | `fiche_pdf` | string (lien) | non | bouton de l'en-tête et de la colonne |
| Téléchargement | `lien_externe` (`libelle`, `url`) | objet replié | non | second bouton de l'en-tête, nouvel onglet |
| Téléchargement | `maj` | datetime, stocké AAAA-MM-JJ | non | « Dernière mise à jour : JJ/MM/AAAA » (filtre `dateMaj`) |
| Téléchargement | `maj_repli` | string | non | affiché tel quel si `maj` est vide (ancienne date non convertible) |
| Étude de cas | `etude.entreprise` | markdown | non | « Entreprise et activité » |
| Étude de cas | `etude.missions` | markdown | non | « Nos missions » |
| Étude de cas | `etude.enjeux_objectifs.intro` / `.enjeux` / `.objectifs` | text / markdown / markdown | non | « Enjeux & Objectifs », « Les enjeux », « Les objectifs » |
| Étude de cas | `etude.points_cles.intertitre` | select (5 intertitres) | non | intertitre de la rubrique 4 |
| Étude de cas | `etude.points_cles.texte` / `.projet` | markdown | non | points clés, puis « Les points clés du projet » |
| Étude de cas | `etude.complements` | markdown, 2 500 car. | non | après les points clés, intertitres saisis |
| Identité du projet | `secteurs` | relation multiple vers Listes de référence, 1 à 3 | oui | surtitre, pastilles, filtres |
| Identité du projet | `technologies` | idem | non | pastilles, cartes, filtres |
| Identité du projet | `expertises` | idem | non | pastilles |
| Visuels | `image` | image | oui | visuel de l'en-tête et des cartes |
| Visuels | `image_alt`, `image_decorative` | string 120 car., case | non (voir plus bas) | alt du visuel (fiche et cartes) |
| Visuels | `galerie[]` (`image`, `alt`, `decorative`) | liste | non | galerie |
| Visuels | `illustrations[]` (`image`, `intertitre`, `alt`, `decorative`) | liste | non | images dans l'étude de cas, à la fin de la partie qui suit l'intertitre indiqué (avant l'intertitre H2 ou H3 suivant ; introuvable ou vide : fin de l'étude de cas). Image décorative limitée à 420 px de large |
| Carte de liste | `image_carte`, `image_carte_alt` | image, string 120 car. | non | visuel de la carte de la page Nos réussites seulement (repli : `image`) ; les cartes des autres pages lisent toujours `image` |
| Carte de liste | `resume` | text, 160 car. | oui | carte de la page Nos réussites |
| Carte de liste | `ordre` | nombre entier | non | tri des cartes et navigation |
| Référencement | `referencement.meta_title`, `.meta_description`, `.indexation` | objet replié | non | `<title>`, description, robots |

Rubriques : une rubrique vide n'est pas affichée (son intertitre non plus). Les intertitres sont fixes dans `eleventy/references.js` (constante `INTERTITRES`), la liste des intertitres de points clés aussi (`INTERTITRES_POINTS_CLES`, à garder identique aux `options` de la config). Le filtre `etudeDeCas` recompose le Markdown et le rend avec l'instance Markdown d'Eleventy : le rendu est celui de l'ancien corps de texte, et le sommaire « Sur cette page » (construit sur les H2) fonctionne toujours.

Textes alternatifs : obligatoires sauf case « décorative ». Sveltia ne sait pas rendre un champ obligatoire selon une case : `required: false` dans la config, mais l'aperçu affiche un avertissement et le build écrit `[références] ... sans texte alternatif`. Image décorative : `alt=""`.

Indexation : la case « Afficher dans les moteurs de recherche » (cochée par défaut) remplace « Cacher cette page de Google ». `references.11tydata.js` calcule `noindex` (lu par `base.njk`) : vrai seulement si la case est explicitement décochée, ou si un ancien `noindex: true` subsiste.

`source_url` : retiré du formulaire, valeur gardée dans les fichiers (mémoire de migration, jamais affichée).

## Listes de référence

Collection fichier `listes`, fichier `src/_data/listes.json` : `secteurs`, `technologies`, `expertises`, chacune une liste d'objets `{ "nom": "..." }`. Les fiches enregistrent le nom (texte), donc les cartes et filtres existants n'ont pas changé. Renommer ou supprimer une valeur ne met pas à jour les fiches : le build signale toute valeur de fiche absente des listes (`[références] ... absent de la liste ...`).

Valeurs reprises telles quelles : 9 secteurs, 25 technologies. Expertises : 19 valeurs ramenées à 13 par fusion des doublons évidents, en gardant le nom d'offre « 4SH ... » :

| Avant | Après | Fiches |
|---|---|---|
| UX | 4SH UX | izivia-app-mobile, izivia-portail, timetobeem |
| Data | 4SH Data | beclm-ia, cin |
| Digital | 4SH Digital | cin, izivia-app-mobile, izivia-portail |
| Facility | 4SH Facility | beclm, cin, izivia-app-mobile, izivia-portail |
| Learning | 4SH Learning | izivia-app-mobile, izivia-portail |
| Studio | 4SH Studio | beclm, timetobeem |

Non fusionnés (à arbitrer) : « 4SH Digital Strategy » et « 4SH Digital », « Product Design » et « Design », et côté technologies « HTML » et « HTML5 ».

## Migration

`node scripts/migrer-references.js` (ou `--essai` pour le bilan sans écriture). Idempotent ; originaux copiés une seule fois dans `~/sauvegarde-references/`. Le découpage n'est accepté que si le rendu Markdown recomposé est identique à celui de l'ancien corps ; sinon la fiche est laissée telle quelle et signalée.

Découpage : les sections H2 reconnues dans l'ordre du plan vont dans leur rubrique ; à la première section hors plan, elle et toutes les suivantes vont dans « Compléments » (l'ordre d'affichage est donc conservé).

Plan suivi : 15 fiches sur 18 ont exactement la suite « Entreprise et activité / Nos missions / Enjeux & Objectifs (### Les enjeux, ### Les objectifs) / Les points clés de ... / Les points clés du projet ». Les 3 autres :
- `beclm-ia` : « Enjeux principaux », « Rôle de 4SH », « Focus sur l'intelligence artificielle » ne correspondent à aucune rubrique : rangés dans Compléments (seule fiche concernée). Missions, enjeux et points clés y sont vides.
- `filhet-allard` : « Les points clés de la solution » avec deux sous-titres (Côté utilisateur, Côté entreprise), sans « points clés du projet » : tient dans la rubrique 4.
- `timetobeem` : « Les points clés » avec un sous-titre « Les outils », sans « points clés du projet » : tient dans la rubrique 4.

`arrg` a une phrase d'introduction avant « Les enjeux » : d'où le champ `intro`.

## Points signalés, rendu inchangé

- La fiche PDF est affichée deux fois (bouton de l'en-tête et bouton de la colonne de droite).
- Les chiffres clés (`stats`) sont vides sur les 18 fiches : le bandeau n'apparaît donc jamais.
- Les textes alternatifs repris (« titre » pour le visuel, « titre, visuel N » pour la galerie) ne décrivent rien : à réécrire fiche par fiche.
- `beclm-ia` n'a pas de date de mise à jour.

## Reprise du contenu de l'ancien site (novembre 2026)

- Textes des 18 fiches repris mot pour mot de www.4sh.fr (ponctuation et coquilles comprises), liens vers les sites clients rétablis dans « Entreprise et activité ».
- Les 5 fiches de l'ancien gabarit « reference » (beclm-ia, cfluide, filhet-allard, izivia-app-mobile, timetobeem) : grand titre et chapô = titre et paragraphe d'en-tête de l'ancienne page, `type_projet` = ancien « Type », tout le corps dans « Compléments » (intertitres d'origine), pas de date de mise à jour (absente de l'ancienne page). Filhet-Allard n'a pas de chapô (`sous_titre: ""`).
- `resume` = texte de la carte de l'ancienne page Nos réussites.
- Navigation précédent / suivant en boucle (`references.11tydata.js`), dans l'ordre du champ `ordre` (= ordre de l'ancienne page).
- Page liste (`src/references/index.njk`) : bandeau de chiffres retiré, cartes sans secteur ni technologies (macro locale), surtitre affiché seulement s'il est rempli.
- `admin-shared/apercus-references.js` n'affiche pas encore `type_projet` ni `lien_externe`.


## Images de l'ancien site (novembre 2026)

- Champs ajoutés : `illustrations[]` (rendu dans `reference.njk`, insertion après l'intertitre choisi, sans changer `eleventy/references.js`) et `image_carte` / `image_carte_alt` (lus seulement par `src/references/index.njk`). Config : `020-references.yml` (assembler-config à relancer).
- 13 fiches au plan classique : illustration de l'ancienne rubrique « Enjeux & Objectifs » remise après « Les objectifs », cochée décorative.
- 5 fiches de l'ancien gabarit « reference » : visuel d'en-tête, galerie (= carrousel de l'ancienne page, dans l'ordre) et images des sections (`illustrations`) repris de l'ancienne page ; le visuel de la carte de la page liste (`image_carte`) garde celui de l'ancienne page liste quand il diffère.
- Non repris faute d'emplacement : logos de technologies colorés (les technologies sont des pastilles texte), logos clients blancs de l'ancien en-tête sombre, second logo Century 21 (Naxos), logos des projets voisins (la navigation précédent / suivant n'a pas de logo).
