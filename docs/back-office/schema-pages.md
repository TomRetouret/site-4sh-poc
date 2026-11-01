# Pages uniques et réglages (back-office)

Ce fichier fait foi pour les pages uniques du site (pages institutionnelles, pages mères, pages légales) et pour les réglages communs. Bibliothèque de blocs : `schema-blocs.md`. Style : aucun tiret cadratin ni demi-cadratin dans les libellés.

## Organisation dans le CMS

| Collection (nom technique) | Fichiers (nom technique : chemin) | Configuration |
|---|---|---|
| Pages institutionnelles (`pages_institutionnelles`, multilingue activé) | `notre_demarche` : `src/_data/contenus/fr/notre_demarche.json` ; `notre_entreprise` (FR et EN dans le même écran) : `src/_data/contenus/{fr,en}/notre_entreprise.json` ; `page_ia` : `src/intelligence-artificielle.md` ; `page_podcasts` : `src/_data/page_podcasts.json` ; `contact` : `src/_data/contact.json` | `admin/config/collections/120-pages.yml` |
| Pages mères (`pages_meres`) | `page_formations`, `page_references`, `page_technologies`, `page_glossaire` : `src/_data/<nom>.json` | idem |
| Pages légales (`pages_legales`) | `page_mentions_legales` : `src/mentions-legales.md` ; `page_rgpd` : `src/rgpd.md` | idem |
| Réglages (`reglages`) | `site` : `src/_data/site.json` ; `menu` : `src/_data/navigation.json` ; `libelles` : `src/_data/libelles.json` ; `seo` : `src/_data/seo.json` | `130-seo.yml` (`140-navigation.yml` et `150-libelles.yml` ne contiennent plus qu'un commentaire) |
| Pages et réglages (anglais) (`pages_en`) | `en_page_formations`, `en_page_technologies`, `en_site`, `en_navigation`, `en_libelles`, `en_seo` : `src/_data/en/<fichier>.json` | `160-pages_en.yml`, mêmes formulaires (ancres YAML `&f_page_formations`, `&f_page_technologies`, `&f_site`, `&f_navigation`, `&f_libelles`, `&f_seo`) |

Les anciennes collections `pages`, `seo`, `navigation` et `libelles` n'existent plus ; les chemins des fichiers sont inchangés (sauf Notre démarche et Notre entreprise, passées en blocs). Le nom technique de chaque fichier sert aussi d'aperçu (`admin-shared/apercus-pages.js`, chargé par `admin/index.html`).

Conventions communes : groupe **Référencement** replié en tête (`seo` dans un fichier JSON, `referencement` dans le front matter d'une page Markdown pour ne pas masquer la donnée globale `seo`) ; puis les groupes dans l'ordre de la page (`hero` = haut de page) ; chaque champ déclare `required` ; les aides disent où le texte apparaît et sa longueur conseillée ; mot entre *astérisques* = mot en rouge (filtre `accent`) là où l'aide le dit.

## Pages institutionnelles en blocs

- Notre démarche : `src/notre-demarche.njk`, données `contenus.fr.notre_demarche` (`{ seo, blocs }`), profil de blocs `institutionnel` (français seul).
- Notre entreprise et Company : corps commun `src/_includes/composants/pages/entreprise.njk`, données `contenus.fr.notre_entreprise` et `contenus.en.notre_entreprise`, profil `institutionnel_bilingue` (`i18n: true` sur chaque champ, comme l'accueil). Chaque langue a sa propre liste de blocs : Company n'a pas l'encart Charte RSE.
- Rendu par l'aiguilleur commun (`rendre_blocs`, gabarit « offre » : balisage des pages intérieures), formulaire de contact final automatique. Titre et description : `notre-demarche.11tydata.js`, `notre-entreprise.11tydata.js`, et pour Company `src/en/en.11tydata.js` (clé de front matter `contenusKey: notre_entreprise`).
- Profils (`admin/config/blocs/_profils.yml`) : les deux profils proposent les blocs ci-dessous et les blocs éditoriaux de la bibliothèque (hero, texte_simple, chiffres_cles, etapes, benefices, texte_image, image_pleine, appel_action, portraits, equipe, logos_clients, projet_vedette, technologies, telechargement, faq, derniers_articles). Les six blocs ajoutés sont aussi proposés dans le profil `demo`.
- Migration : `node scripts/migrer-pages-institutionnelles.js` (lit les anciens `src/_data/notre_demarche.json`, `notre_entreprise.json`, `en/notre_entreprise.json`, conservés pour le retour arrière et plus lus ; idempotent, mais repart des anciens fichiers et écrase donc toute modification faite depuis dans le CMS).

### Blocs ajoutés à la bibliothèque

Libellé du type entre guillemets ; puis champs `nom` : « Libellé » (widget) [obligatoire ?].

**hero_institutionnel : « Haut de page institutionnelle »** (`hero-interne`)
- `fil_ariane` « Fil d'Ariane » (liste de chaînes, 4 au plus) [non] : la première étape renvoie vers `/`, les suivantes sont séparées par `›`. Saisi en entier (y compris « Accueil »), pour garder le rendu d'origine ; les textes sont échappés sauf l'apostrophe (filtre `texteHtml`).
- `surtitre` [non], `titre_page` « Titre de la page (H1) » [oui] (accent), `chapo` (text) [non]
- `bouton_principal` Lien [oui] (défaut `#contact`), `bouton_secondaire` Lien [non, rendu si son texte est rempli] ; une destination contenant `://` s'ouvre dans un nouvel onglet.
- `etiquettes` (4 au plus) [non]
- `illustration` (select fermé) [oui, défaut `aucune`] : `aucune`, `demarche` (schéma « De votre idée à la mise en production »), `entreprise` (schéma des agences). Les schémas SVG, avec leurs textes français, sont écrits dans le composant.

**chiffres_compteurs : « Chiffres animés »** (`section` sans marge, `.chiffres`)
- `chiffres` (2 à 6) [oui] de `valeur` « Chiffre » [oui], `texte` « Libellé » [oui], `note` [non] (petit texte), `animer` « Animer le chiffre » (boolean, défaut vrai).
- Compteur déduit du chiffre (filtre `compteurChiffre`, `eleventy/pages.js`) : « 96% » donne `data-compte="96" data-suffixe="%"`, « 2007 » donne `data-compte="2007"` ; rien si le chiffre ne commence pas par un entier suivi de texte sans chiffre. Remplace les anciens champs `compte` et `suffixe`.
- Plus de 4 chiffres : le conteneur reçoit `tabindex="0" role="group" aria-label="Chiffres clés"` (bandeau défilant, atteignable au clavier), comme l'ancienne page Notre entreprise.

**frise_methode : « Frise de méthode (fond sombre) »** (`section.section-sombre`, macro `frise_etapes`)
- `ancre` (motif `^[a-z0-9-]*$`) [non] : `id` de la section, cible d'un bouton `#ancre` ; `surtitre`, `titre` [oui], `sous_titre`
- `etapes` (3 à 6) [oui] de `numero` [oui], `phase` [non], `titre` [oui], `texte` [oui]. Distinct de `methode_4d` : pas de tracé décoratif ni de lien avec le hero expressif.

**cartes_numerotees : « Cartes numérotées »** (`.atouts`, macro `carte_atout`)
- `sans_marge_haute` « Coller au bloc précédent » (boolean) ; `surtitre`, `titre` [oui], `sous_titre`
- `affichage` (select fermé) [oui, défaut `grille`] : `grille`, `carrousel` (macro `carrousel`, variante `car--blocs`, sans défilement automatique ; nommé par le surtitre, à défaut le titre sans astérisques)
- `colonnes` (select fermé) [oui, défaut `auto`] : `auto`, `2`, `3`, `4` (grille seulement : `grid-template-columns`)
- `cartes` (2 à 12) [oui] de `titre` [oui], `texte` [oui] ; numéro selon la position.

**cartes_texte : « Cartes de texte »**
- `sans_marge_haute`, `surtitre`, `titre` [oui], `sous_titre`
- `presentation` (select fermé) [oui, défaut `encadrees`] : `encadrees` (`.socle` de `.socle-carte`, texte 14,5 px) ou `colonnes` (`.offres-liees` de `.col-carte`, texte 15 px)
- `fond` (select fermé) [oui, défaut `blanc`] : `blanc`, `sombre` (`section-sombre sur-sombre`, texte `--sur-nuit`)
- `colonnes` (select fermé) [oui, défaut `auto`] : cartes encadrées seulement
- `cartes` (1 à 12) [oui] de `titre` [oui], `texte` (text) [non, retour à la ligne = `<br>`, accent], `lien` { `texte`, `lien` } [non] : `a.socle-lien` « texte → », nouvel onglet si `://`.

**encart_bouton : « Encart avec bouton »**
- `sans_marge_haute` ; `presentation` (select fermé) [oui, défaut `encadre`] : `encadre` (`.col-carte` centrée sur fond crème, bouton plein) ou `libre` (`.sect-libre` de 820 px, bouton contour)
- `titre` [oui], `texte` [non], `bouton` Lien [oui].

Marges : ces blocs ne participent pas au calcul automatique `blocsSerres` (liste fermée de `eleventy/logiciel-metier.js`) ; la case « Coller au bloc précédent » retire leur marge haute.

### Correspondance avec les anciennes pages

Notre démarche : hero (illustration `demarche`) ; chiffres_compteurs ; frise_methode (ancre `methode`) ; cartes_numerotees grille 3 colonnes (Démarche UX) ; cartes_numerotees carrousel (Engagements) ; cartes_texte colonnes (Dispositifs). Notre entreprise : hero (`entreprise`) ; texte_simple (À propos, un paragraphe par ancien élément) ; chiffres_compteurs ; cartes_texte encadrées 3 colonnes (Culture tech), fond sombre (Valeurs), 4 colonnes sans texte (Métiers) ; encart_bouton encadré (Recrutement) ; cartes_texte (Agences, adresse en texte, lien « Voir sur la carte ») ; encart_bouton libre (Charte RSE, page française seulement).

## Fiches structurées

Migration : `node scripts/migrer-pages-uniques.js` (idempotent : un fichier qui a déjà son groupe `seo` ou `referencement` est laissé tel quel).

| Page | Groupes, dans l'ordre de la page | Gabarit |
|---|---|---|
| Formations (FR, EN) | `seo` ; `hero` { surtitre, titre, chapo, note, note_detail, bouton_principal, bouton_secondaire, etiquettes, etapes (les 3 mots de l'animation) } ; `pourquoi` { titre, cartes (3) } ; `catalogue` { titre, sous_titre } ; `agenda` { titre, sous_titre, mois [ { mois, sessions [ { jour, mois_court, duree, logo, titre, categorie, lieu, modalite, url } ] } ], bouton } ; `qualiopi` { titre, texte } ; `temoignages` { titre, liste } | `composants/pages/formations.njk` |
| Expertises techniques (FR, EN) | `seo` ; `hero` { surtitre, titre, intro, bouton } ; `phares` { titre } ; `autres` { intro, technos [ { nom, logo } ] } | `composants/pages/technologies.njk` |
| Références | `seo` ; `hero` { surtitre, titre, chapo } | `src/references/index.njk` |
| Glossaire | `seo` ; `hero` { surtitre, titre, chapo } | `src/glossaire.njk` |
| Contact | `seo` ; `hero` { titre, chapo } (arguments, téléphone, villes, formulaire : Réglages du site) | `src/contact.njk` |
| Podcasts | `seo` ; `hero` { surtitre, titre, chapo, plateformes [ { label, url } ] } ; `episodes` | `src/podcasts.njk` |
| Intelligence artificielle (front matter) | `referencement` ; `titre` (fil d'Ariane) ; `hero` { surtitre, titre, chapo, bouton } ; corps Markdown ; `references` ; `faq` ; `contact_final` ; `suivi` (notes internes) | `src/_includes/page-libre.njk` |
| Mentions légales, RGPD (front matter) | `referencement` ; `titre` ; `h1` ; `maj` ; corps Markdown ; `suivi` | `src/_includes/page-legale.njk` |

Textes alternatifs : logos de l'agenda (alt = titre de la formation) et tuiles « Autres technologies » (alt = nom) sont générés ; les aides le disent. Champs retirés car jamais affichés : `page_glossaire.cta_*`, `page_technologies.cta_*` (valeurs dans l'historique Git). Le bouton du haut de page Expertises techniques, écrit en dur, devient `hero.bouton` (même texte, y compris en anglais).

## Pages légales

Texte en Markdown limité : titres de niveau 2 et 3, gras, liens, listes (`buttons`, `editor_components: []`). Aucun HTML dans les deux pages au 1er novembre 2026. La notice RGPD contient deux tableaux Markdown : son éditeur s'ouvre en mode texte (`modes: [raw, rich_text]`). Le rendu Markdown du site n'a pas changé (le HTML y reste techniquement accepté).

## Réglages

Réglages du site (`site.json`, et `en/site.json`) : clés inchangées (elles sont lues par tous les gabarits), champs rangés par zone, avec un préfixe de libellé qui dit où le texte apparaît : Coordonnées, Bloc contact (bas des pages et page Contact), Formulaire de contact, Logos clients, Pied de page, Documents téléchargeables. Ajouts : l'adresse des liens légaux du pied de page (absente du formulaire jusqu'ici), les clés `url` et `formulaire._note_sujets` en champs cachés (conservées), réseaux sociaux en liste fermée, motifs de saisie (téléphone, e-mail). Retrait : un champ « Lien » orphelin des Documents.

Menu (`navigation.json`) : listes fermées avec libellés (mise en page, couleur de colonne, icônes, dont `code` et `data` qui manquaient, apparence des boutons de droite) ; clés `_note` et `colonnes[]._liens_a_venir` en champs cachés (conservées). Textes récurrents : ajout des clés lues par les gabarits mais absentes du formulaire (`formation.documents_titre`, `formation.programme_pdf_label`, groupe `merci` de la page de remerciement) ; `required` explicite partout. SEO : aides et motif de l'adresse du site.

### Mentions des agences (aucune donnée modifiée)

| Où sur le site | Texte actuel | Où le saisir |
|---|---|---|
| Pied de page, bloc contact, page Contact | « Bordeaux · Capbreton · Paris » | Réglages du site, Coordonnées · Villes des agences (`site.villes`, `en/site.json`) |
| Bloc contact (arguments) | « à Bordeaux, Capbreton et Paris » | Réglages du site, Bloc contact, Arguments |
| Notre entreprise / Company, bloc Nos agences | Le Haillan, Bordeaux (7 rue Esmangard), Capbreton, Paris ; sous-titre « du Haillan, de Bordeaux et de Capbreton » (sans Paris) | Pages institutionnelles, Notre entreprise, bloc Cartes de texte « Nos agences » |
| Notre entreprise, description SEO | « Bordeaux, Capbreton et Paris » | Notre entreprise, Référencement |
| Notre entreprise, schéma du haut de page | Bordeaux, Capbreton, Paris | Écrit dans `composants/blocs/hero_institutionnel.njk` |
| Accueil, bloc Projets (note) | « Bordeaux (Le Haillan) · Bordeaux centre · Capbreton » | Page d'accueil, bloc Projets |
| Accueil, hero et description SEO | « Bordeaux, Capbreton ou à distance », « Bordeaux et Capbreton » | Page d'accueil |
| Logiciel métier | « Bordeaux · Capbreton · Paris » (étiquette et note du hero) | Pages d'offre, Logiciel métier |
| Contact, description SEO | « Bordeaux, Capbreton, Paris » | Pages institutionnelles, Contact, Référencement |
| Mentions légales | siège 6 place de la Madeleine, Paris | Pages légales, Mentions légales |
| Données structurées (toutes les pages) | Le Haillan, Capbreton, Paris | Écrit dans `src/_includes/base.njk` |

## Vérification

Rendu comparé à `$HOME/baseline4/` (espaces et commentaires ignorés) : pages identiques, sauf les titres et descriptions SEO de Podcasts, Intelligence artificielle, Mentions légales et RGPD, qui s'affichent désormais (avant : titre par défaut, ou code du fichier de données pour Podcasts). Plan du site : mêmes adresses (seules les dates `lastmod` et l'ordre suivent les dates des fichiers).
