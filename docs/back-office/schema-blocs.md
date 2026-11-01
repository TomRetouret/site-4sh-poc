# Bibliothèque des blocs (preuve de concept back-office)

Ce fichier fait foi pour le rendu Eleventy, la configuration de Sveltia et les gabarits d'aperçu.
Toute divergence se règle ici d'abord. Style : aucun tiret cadratin ni demi-cadratin dans les libellés.

Pages qui utilisent la bibliothèque : l'accueil (FR et EN), les pages d'offre (voir `schema-logiciel-metier.md`) et les pages de démonstration.

## Où vivent les blocs

| Quoi | Où |
|---|---|
| Définition des champs (source unique) | `admin/config/blocs.yml` |
| Recopie dans les collections | `node scripts/generer-blocs.js` (entre les repères `# >>> BLOCS:<profil>` et `# <<< BLOCS`), puis `node scripts/assembler-config.js` |
| Rendu | `src/_includes/composants/blocs/<type>.njk`, appelé par `aiguilleur.njk` |
| Filtres propres aux blocs | `eleventy.config.js` (accueil) et `eleventy/logiciel-metier.js` (texteRiche, surtitreOffre, fichesReferences, blocsSerres, deuxChiffres, classeEtapes) |
| Aperçus | `admin-shared/apercus.js` (un composant par type) ; enveloppe des pages d'offre dans `admin-shared/apercus-logiciel-metier.js` |

Profils du générateur (blocs autorisés par collection) :
- `accueil` : les 11 blocs d'origine, avec `i18n: true` ajouté à chaque champ (`090-accueil.yml`) ;
- `demo` : toute la bibliothèque (`110-demo.yml`) ;
- `offre` : hero, chiffres_cles, texte_simple, etapes, benefices, technologies, projet_vedette, projets, cartes_secteurs, logos_clients, equipe, derniers_articles, faq, appel_action (`115-pages_offre.yml`). Cartes d'offres et Méthode 4D restent propres à l'accueil.

Le générateur refuse un champ sans `required` booléen.

## Gabarit « offre » et marges

L'aiguilleur reçoit un 6e argument facultatif `options` : `gabarit` (« offre » pour une page d'offre), `fil_ariane`, `references` (`collections.references`), `appels_action`. Avec le gabarit « offre », Chiffres clés, Logos clients et FAQ reprennent le balisage des pages intérieures (voir chaque bloc). Sans options, le rendu de l'accueil est inchangé.

Chaque composant reçoit `(b, ctx, serre)`. `serre` est vrai quand le bloc suit directement une section blanche (blocs masqués ignorés) : la section perd sa marge haute (`style="padding-top:0"`), comme sur les pages d'origine. Sections blanches : texte_simple, etapes, benefices, projet_vedette, logos_clients, faq, technologies en nuage. Blocs concernés par le retrait : texte_simple, etapes, benefices, projet_vedette, logos_clients (gabarit offre). La FAQ garde sa marge haute nulle en toutes circonstances.

## Emplacement des données

- Accueil FR : `src/_data/contenus/fr/accueil.json` (donnée globale `contenus.fr.accueil`)
- Accueil EN : `src/_data/contenus/en/accueil.json` (donnée globale `contenus.en.accueil`)
- Témoignages (contenu partagé) : `src/_data/temoignages/fr/<slug>.json` et `src/_data/temoignages/en/<slug>.json` (donnée globale `temoignages.fr.<slug>`)
- Les anciens fichiers `src/_data/accueil.json` et `src/_data/en/accueil.json` sont conservés tels quels (retour arrière), mais ne sont plus lus par l'accueil.

## Forme d'un fichier d'accueil

```json
{
  "seo": { "meta_title": "...", "meta_description": "..." },
  "blocs": [ { "type": "hero", "masquer": false, "...": "champs du bloc" } ]
}
```

- `blocs` est rendu dans l'ordre. Un bloc avec `masquer: true` n'est pas rendu.
- Le formulaire de contact final reste automatique en fin de page (hors blocs, non déplaçable).
- Un champ facultatif laissé vide n'affiche rien (pas de balise vide), sauf mention contraire.
- Clé de type de bloc : champ `type` (convention Sveltia et Decap : `typeKey: type`).

## Objets réutilisés

- **Lien** `{ "texte": "", "lien": "" }` : libellés « Texte du bouton » / « Destination (adresse ou #ancre) ».
- **Image** `{ "fichier": "", "alt": "", "decorative": false, "credit": "", "cadrage": "centre" }`
  - `fichier` « Image » (widget image) ; `alt` « Texte alternatif », obligatoire sauf si `decorative` ; `decorative` « Image décorative (aucune information à transmettre) » ; `credit` « Crédit photo » ; `cadrage` « Cadrage » liste fermée : centre, haut, bas, gauche, droite (défaut centre).
  - Rendu : `cadrage` différent de `centre` ajoute `style="object-position: <valeur css>"` (haut = center top, bas = center bottom, gauche = left center, droite = right center) ; au cadrage centre, aucun attribut ajouté.

## Champs communs à tous les blocs

- `type` (caché, fixé par le type)
- `masquer` booléen, « Masquer ce bloc (il reste enregistré) », défaut false

## Les 16 types de blocs

Les 11 premiers viennent de l'accueil ; texte_simple, etapes, benefices, projet_vedette et appel_action ont été ajoutés pour les pages d'offre. Cartes secteurs et Derniers articles font partie de la bibliothèque (décision du 1er novembre 2026). Les autres blocs prévus pour atteindre 20 types arriveront avec les fiches Formation et Référence.

Libellé du type entre guillemets ; puis champs `nom` : « Libellé » (widget) [obligatoire ?] , aide.
La convention *mot* (astérisques) met un mot en rouge dans tous les titres marqués (accent) : rendu par le filtre `accent`.

### hero : « Hero (haut de page) »
- `variante` : « Variante » (select fermé) [non, défaut `expressif`] : `expressif` = Expressive (accueil), `sobre` = Sobre (pages d'offre et pages intérieures). Vide = expressive (les fichiers de l'accueil n'ont pas ce champ).
- `offre` : « Offre (surtitre coloré) » (select fermé) [non] : `build` = 4SH Build, `run` = 4SH Run, `learning` = 4SH Learning, `institutionnel` = 4SH institutionnel. Variante sobre uniquement.
- `titre_page` : « Titre de la page (H1) » (string) [oui], aide « Lu par Google et les lecteurs d'écran. 60 caractères maximum. Expressive : affiché en petit au-dessus de l'accroche. Sobre : c'est le grand titre ; mettez un mot entre *astérisques* pour l'afficher en rouge. »
- `accroche` : « Accroche » (string) [non, mais exigée en variante expressive], aide « Variante expressive uniquement... » (accent)
- `chapo` : « Chapô » (text) [non], aide « 40 mots maximum. »
- `bouton_principal` : Lien « Bouton principal » [oui] (lien par défaut `#contact`)
- `bouton_secondaire` : Lien « Bouton secondaire » [non] (lien par défaut `/references/`)
- `note` : « Note sous les boutons » (string) [non]
- `etiquettes` : « Étiquettes » (liste de chaînes, 4 au maximum) [non], variante sobre uniquement
- `encart` : objet « Encart visuel » (variante expressive uniquement) : `afficher` « Afficher l'encart » (boolean, défaut true), `titre` « Titre de l'encart » (string), `lignes` « Lignes » (list de `{ cle « Mot-clé », valeur « Texte » }`), `badge` « Badge » (string), `badge_note` « Note du badge » (string)
- Rendu expressif : identique au hero actuel de l'accueil. L'encart (`.hero-visuel`) n'est rendu que si `encart.afficher`. La liste `ol.hero-4d` reprend les étapes du premier bloc `methode_4d` de la page (numero, phase), même si ce bloc est masqué.
- Rendu sobre : `.hero-interne` des pages intérieures. Fil d'Ariane « Accueil › <nom> » si l'aiguilleur reçoit `fil_ariane` ; surtitre `.eyebrow.eyebrow-offre` déduit de `offre` (filtre `surtitreOffre` : build « 4SH Build · Concevoir & développer », run « 4SH Run · Faire vivre & auditer », learning « 4SH Learning », institutionnel « 4SH », vide = pas de surtitre) ; `h1` = `titre_page` (accent) ; chapô, boutons, note ; `.chips` avec les étiquettes. L'offre donne aussi la classe `famille-<offre>` du `body` (calculée dans le fichier de données de la page).

### logos_clients : « Logos clients (Ils nous confient leur métier) »
- Gabarit « offre » : bandeau discret `.clients` (`p.tt` puis `.marquee ul li`, noms sans lien), dans sa propre `section` (marge haute retirée si elle suit une section blanche).
- `titre` : « Titre » (string) [non], aide « Laisser vide pour reprendre l'intitulé des réglages du site. »
- Les noms viennent des réglages du site (`site.clients`) : contenu partagé.
- Rendu : section `.confiance` actuelle ; titre = `titre` ou, à défaut, `site.clients_intro | replace(" :", "") | replace(":", "")`.

### cartes_offres : « Cartes d'offres (Build, Run, Learning) »
- `surtitre` « Surtitre » (string), `titre` « Titre » (string, accent) [oui], `sous_titre` « Sous-titre » (text)
- `cartes` « Cartes » (list, 1 à 3) de :
  - `offre` « Couleur d'offre » (select fermé) : `build` = 4SH Build, `run` = 4SH Run, `learning` = 4SH Learning, `institutionnel` = 4SH institutionnel
  - `titre` « Titre » (string) [oui], `texte` « Texte » (text) [oui]
  - `liens` « Liens » (list de Lien)
  - `lien_bas` Lien « Lien de bas de carte »
- Rendu : section `.fond-doux` des portes actuelle. Picto, classe de famille et étiquette d'offre déduits de `offre` (build : picto 1, `famille-build`, « 4SH Build » ; run : picto 2, `famille-run`, « 4SH Run » ; learning : picto 3, `famille-formation`, « 4SH Learning » ; institutionnel : picto 1, aucune classe de famille, « 4SH »). Les liens affichent `texte` tel quel (plus de préfixe « → » à retirer).

### chiffres_cles : « Chiffres clés »
- `chiffres` « Chiffres » (list, 2 à 4) de `valeur` « Chiffre » (string) [oui], `texte` « Libellé » (string) [oui], `note` « Note (petit texte) » (string)
- Rendu : bandeau `.chiffres` actuel (les anciens champs `compte` et `suffixe`, inutilisés, disparaissent).

### cartes_secteurs : « Cartes secteurs (carrousel) »
- `surtitre`, `titre` (accent) [oui], `sous_titre`
- `cartes` (list) de `titre` [oui], `texte` (text), `lien` Lien « Lien de la carte »
- Rendu : section secteurs actuelle (macro `carrousel("Secteurs", "car--secteurs", false)`).

### methode_4d : « Méthode 4D »
- `surtitre`, `titre` (accent) [oui], `sous_titre`
- `etapes` « Étapes » (list, 4) de `numero` « Numéro » (string), `phase` « Phase » (string), `titre` « Titre » (string), `texte` « Texte » (text)
- Rendu : section `.section-sombre` actuelle ; `frise_etapes` attend `num` et `label` : adapter (numero vers num, phase vers label) sans changer le HTML produit.

### projets : « Projets (carrousel de réalisations) »
- `surtitre`, `titre` (accent) [oui], `sous_titre`
- `projets` « Projets » (list) de :
  - `secteur` « Secteur » (string), `client` « Client » (string) [oui]
  - `image` Image « Visuel du projet » (alt par défaut à la migration : « <client>, <secteur> »)
  - `description` « Description » (text)
  - `temoignage` « Témoignage » (relation vers la collection témoignages de la même langue, valeur = slug) [non]
  - `chiffres` « Chiffres du projet » (list de `valeur` « Chiffre » (accent), `libelle` « Libellé »)
  - `bouton` Lien « Bouton du projet »
- `bouton_bas` Lien « Bouton sous le carrousel » (lien par défaut `/references/`)
- Rendu : section réalisations actuelle. Citation et signature viennent du témoignage relié : `blockquote` = citation ; ligne `.auteur` = auteur, fonction et entreprise non vides joints par « , », affichée dès que l'un des trois est rempli (l'auteur est facultatif).

### technologies : « Technologies »
- `surtitre`, `titre` (accent) [oui], `sous_titre`
- `affichage` « Affichage » (select fermé) [non, défaut `nuage`] : `nuage` = Nuage de mots (accueil), `cartes` = Cartes avec logo
- `technos` « Technologies » (list) de `nom` « Nom » [oui], `lien` « Destination » (string), `logo` « Logo » (image, affichage cartes uniquement ; texte alternatif = nom)
- Rendu nuage : mur typographique actuel (lien vide replié sur `#`, comme avant).
- Rendu cartes : `section.section-sombre` puis `.socle` de `.socle-carte` (logo, `h3` nom, lien « En savoir plus → » seulement si `lien` est rempli). Libellé commun écrit dans le composant (à déplacer dans les libellés du site plus tard). Le contenu partagé Technologies n'est pas relié pour l'instant.

### faq : « Questions fréquentes »
- `titre` « Titre » [oui] (accent, harmonisé avec les autres blocs), `sous_titre` « Sous-titre »
- `questions` (list) de `question` « Question » [oui], `reponse` « Réponse » (text) [oui]
- Rendu : section FAQ actuelle avec son JSON-LD FAQPage. Gabarit « offre » : le titre n'a pas la classe `centre` (balisage de la page d'origine).

### derniers_articles : « Derniers articles du blog »
- `titre` « Titre » (string, accent), défaut « Nos derniers *articles* »
- `lien_tout` Lien « Lien vers le blog », défaut { texte « Tout le blog », lien « https://blog.4sh.fr/ » }
- Les articles sont récupérés automatiquement au build (donnée `blog`) ; bloc non rendu s'il n'y a pas d'article.

### equipe : « Équipe (photo et texte) »
- `surtitre`, `titre` (accent) [oui], `texte` (text)
- `photo` Image « Photo de l'équipe » (alt par défaut : titre sans astérisques)
- `bouton` Lien, défaut { texte « Notre entreprise », lien « /notre-entreprise/ » }
- Rendu : section `.equipe` actuelle (img avec width 1360 height 583).

### texte_simple : « Texte simple »
- `surtitre` « Surtitre » [non], `titre` « Titre » (accent) [oui]
- `texte` « Texte » (markdown) [oui] : éditeur restreint aux boutons gras, lien, liste à puces, liste numérotée (`buttons`, `editor_components: []`, `modes: [rich_text]`). Paragraphes séparés par une ligne vide.
- Rendu : `section` puis `.container` : `p.eyebrow`, `h2.sec-titre`, `div.prose` contenant le texte passé au filtre `texteRiche` (markdown-it limité : paragraphes, gras, liens, listes ; HTML brut, titres, images et citations désactivés ; l'italique `*mot*` donne `<em class="accent">`, comme la convention accent). Styles : `logiciel-metier.css`.

### etapes : « Étapes ou processus »
- `surtitre` [non], `titre` (accent) [oui], `sous_titre` « Sous-titre » (text) [non]
- `etapes` « Étapes » (list, 3 à 6) [oui] de `phase` « Phase » [non], `titre` « Titre » [oui], `texte` « Texte » (text) [oui]
- Plus de champ numéro : le numéro est calculé selon la position (01, 02..., filtre `deuxChiffres`).
- Rendu : `div.etapes` avec la classe `trois`, `quatre`, `cinq` ou `six` selon le nombre d'étapes ; chaque `.etape` : `span.num`, `span.num-label` (si phase), `h3`, `p`. Distinct de la Méthode 4D (qui garde son numéro saisi et son lien avec le hero).

### benefices : « Liste de bénéfices »
- `surtitre` [non], `titre` (accent) [oui], `sous_titre` (text) [non]
- `benefices` « Bénéfices » (list, 3 à 6) [oui] de `titre` « Titre » [oui], `texte` « Texte » (string) [non]
- Rendu : `div.atouts` de `.atout` : `span.n` (rang automatique), `h3`, `p` (si texte).

### projet_vedette : « Projet vedette »
- `surtitre` [non], `titre` (accent) [oui]
- `ancre` « Ancre de la section » (string, motif `^[a-z0-9-]*$`) [non, défaut `realisations`] : `id` de la section, cible d'un bouton `#realisations`
- `secteur` « Secteur » [non], `client` « Client » [oui], `description` « Description » (text) [non]
- `temoignage` « Témoignage » (relation vers `temoignages`, valeur = slug) [non]
- `chiffres` « Chiffres du projet » (list, 3 au maximum) de `valeur` « Chiffre » (accent) [oui], `libelle` « Libellé » [oui]
- `bouton` Lien « Bouton du projet » [non]
- `references` « Autres références » (relation multiple vers `references`, valeur = slug, 3 au maximum) [non]
- Rendu : `section` (id = ancre) ; `.cas` avec `.cas-visuel` (secteur, `.logo-client`, description) et `.cas-corps` (citation et signature du témoignage, comme le bloc projets ; `.cas-chiffre` ; bouton). Puis `.realisations` de `.real-carte`, une par fiche reliée trouvée (filtre `fichesReferences`) : `.secteur` = `client` de la fiche, `h3` = `titre`, `p` = `resume`, lien « Voir la référence → » vers la fiche. Seuls le slug et les champs `titre`, `client`, `resume` des fiches sont lus.

### appel_action : « Appel à l'action final »
- `titre` (accent) [oui], `texte` « Texte » (text) [non]
- `appel` « Bouton » (relation vers `appels_action`, valeur = slug) [oui]
- `fond` « Fond » (select fermé) [oui, défaut `doux`] : `blanc` = Blanc, `doux` = Gris clair (`.fond-doux`), `sombre` = Sombre (`.section-sombre`)
- Rendu : `section.cta-final` centrée : `h2.sec-titre`, `p.sec-sous`, bouton `.btn.btn-primary` (texte et destination de l'appel relié).

## Collection témoignages (contenu partagé)

Fichier JSON par témoignage et par langue : `citation` « Citation » (text) [oui], `auteur` « Nom » (string) [non, jamais inventé], `fonction` « Fonction » (string) [non], `entreprise` « Entreprise » (string) [oui].
Libellé de collection : « Témoignages » ; singulier « Témoignage » ; identifiant et résumé `{{entreprise}} {{auteur}}` ; slug `{{entreprise}} {{auteur}}`. Les relations affichent `{{entreprise}} {{auteur}}`.

## Collection appels à l'action (contenu partagé)

Fichier JSON par appel : `src/_data/appels_action/<slug>.json` (donnée globale `appels_action.<slug>`), sans version anglaise pour l'instant. Champs : `intitule` « Intitulé interne » [oui] (jamais affiché), `texte` « Texte du bouton » [oui], `lien` « Destination (adresse ou #ancre) » [oui, défaut `#contact`]. Relié par le bouton flottant des pages d'offre et par le bloc appel_action.

## Résumés dans la liste des blocs (summary)

Chaque type affiche son libellé suivi du titre principal : par exemple `Cartes d'offres : {{titre}}`, `Hero : {{titre_page}}`, `Projet vedette : {{client}}`, `Chiffres clés`, `Logos clients`, et « (masqué) » pour un bloc masqué.

## Exigence de rendu

Après migration, `dist/index.html` et `dist/en/index.html` doivent être identiques à ceux d'avant (à l'espace près). Copies de référence : `$HOME/baseline/fr.html` et `$HOME/baseline/en.html` dans le shell du poste.
Depuis le passage de la page Logiciel métier en blocs (référence `$HOME/baseline2/`), seul écart volontaire sur l'accueil FR : INFOPORT ajouté aux réglages du site, donc au bandeau Logos clients.

## Amorçage des témoignages

Les citations actuelles de l'accueil sont vides. La collection est amorcée avec les témoignages déjà publiés dans `src/_data/logiciel_metier.json` (ceux qui ont un auteur), découpés en auteur, fonction et entreprise quand l'auteur contient des virgules. Aucun témoignage n'est inventé. Les citations de `page_formations.json` sont des textes de gabarit : ne pas les reprendre. Pas de témoignage anglais pour l'instant.

## Pages de démonstration (scénario « créer une page »)

- Dossier `src/demo/`, un fichier Markdown par page, contenu entièrement en front matter : `titre` « Titre de la page » (string, obligatoire), `seo` (même objet que l'accueil), `blocs` (toute la bibliothèque, profil `demo`).
- Le titre sert de fil d'Ariane au hero sobre. La couleur d'offre (hero sobre) et la feuille `logiciel-metier.css` (si un bloc des pages d'offre est présent) sont calculées dans `src/demo/demo.11tydata.js`.
- Rendu : gabarit `src/_includes/page-blocs.njk`, adresse `/demo/<nom-du-fichier>/`, jamais indexé, absent du plan du site.
- Page d'amorce : `src/demo/exemple.md`, marquée [DÉMO].
- Le dossier des données de l'accueil s'appelle `src/_data/contenus/` (et non `blocs/`) pour éviter un conflit de nom avec le champ `blocs` des pages de démonstration.
