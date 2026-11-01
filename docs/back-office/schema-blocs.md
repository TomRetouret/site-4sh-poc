# Schéma des blocs de la page d'accueil (preuve de concept back-office)

Ce fichier fait foi pour le rendu Eleventy, la configuration de Sveltia et de Decap, et les gabarits d'aperçu.
Toute divergence se règle ici d'abord. Style : aucun tiret cadratin ni demi-cadratin dans les libellés.

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
- Clé de type de bloc : champ `type` (convention Sveltia et Decap : `typeKey: type`).

## Objets réutilisés

- **Lien** `{ "texte": "", "lien": "" }` : libellés « Texte du bouton » / « Destination (adresse ou #ancre) ».
- **Image** `{ "fichier": "", "alt": "", "decorative": false, "credit": "", "cadrage": "centre" }`
  - `fichier` « Image » (widget image) ; `alt` « Texte alternatif », obligatoire sauf si `decorative` ; `decorative` « Image décorative (aucune information à transmettre) » ; `credit` « Crédit photo » ; `cadrage` « Cadrage » liste fermée : centre, haut, bas, gauche, droite (défaut centre).
  - Rendu : `cadrage` différent de `centre` ajoute `style="object-position: <valeur css>"` (haut = center top, bas = center bottom, gauche = left center, droite = right center) ; au cadrage centre, aucun attribut ajouté.

## Champs communs à tous les blocs

- `type` (caché, fixé par le type)
- `masquer` booléen, « Masquer ce bloc (il reste enregistré) », défaut false

## Les 11 types de blocs

Libellé du type entre guillemets ; puis champs `nom` : « Libellé » (widget) [obligatoire ?] , aide.
La convention *mot* (astérisques) met un mot en rouge dans tous les titres marqués (accent) : rendu par le filtre `accent`.

### hero : « Hero (haut de page) »
- `titre_page` : « Titre de la page (H1) » (string) [oui], aide « Affiché en petit au-dessus de l'accroche. Lu par Google et les lecteurs d'écran. 60 caractères maximum. »
- `accroche` : « Accroche » (string) [oui], aide « Mettez un mot entre *astérisques* pour l'afficher en rouge. Environ 40 caractères. » (accent)
- `chapo` : « Chapô » (text) [non], aide « 40 mots maximum. »
- `bouton_principal` : Lien « Bouton principal » [oui] (lien par défaut `#contact`)
- `bouton_secondaire` : Lien « Bouton secondaire » [non] (lien par défaut `/references/`)
- `note` : « Note sous les boutons » (string) [non]
- `encart` : objet « Encart visuel » : `afficher` « Afficher l'encart » (boolean, défaut true), `titre` « Titre de l'encart » (string), `lignes` « Lignes » (list de `{ cle « Mot-clé », valeur « Texte » }`), `badge` « Badge » (string), `badge_note` « Note du badge » (string)
- Rendu : identique au hero actuel. L'encart (`.hero-visuel`) n'est rendu que si `encart.afficher`. La liste `ol.hero-4d` reprend les étapes du premier bloc `methode_4d` de la page (numero, phase), même si ce bloc est masqué.

### logos_clients : « Logos clients (Ils nous confient leur métier) »
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
- Rendu : section réalisations actuelle. Citation et auteur viennent du témoignage relié : `blockquote` = citation ; ligne `.auteur` = auteur, fonction et entreprise non vides joints par « , ».

### technologies : « Technologies (mur) »
- `surtitre`, `titre` (accent) [oui], `sous_titre`
- `technos` « Technologies » (list) de `nom` « Nom » [oui], `lien` « Destination » (string)

### faq : « Questions fréquentes »
- `titre` « Titre » [oui], `sous_titre` « Sous-titre »
- `questions` (list) de `question` « Question » [oui], `reponse` « Réponse » (text) [oui]
- Rendu : section FAQ actuelle avec son JSON-LD FAQPage.

### derniers_articles : « Derniers articles du blog »
- `titre` « Titre » (string, accent), défaut « Nos derniers *articles* »
- `lien_tout` Lien « Lien vers le blog », défaut { texte « Tout le blog », lien « https://blog.4sh.fr/ » }
- Les articles sont récupérés automatiquement au build (donnée `blog`) ; bloc non rendu s'il n'y a pas d'article.

### equipe : « Équipe (photo et texte) »
- `surtitre`, `titre` (accent) [oui], `texte` (text)
- `photo` Image « Photo de l'équipe » (alt par défaut : titre sans astérisques)
- `bouton` Lien, défaut { texte « Notre entreprise », lien « /notre-entreprise/ » }
- Rendu : section `.equipe` actuelle (img avec width 1360 height 583).

## Collection témoignages (contenu partagé)

Fichier JSON par témoignage et par langue : `citation` « Citation » (text) [oui], `auteur` « Nom » (string) [oui], `fonction` « Fonction » (string), `entreprise` « Entreprise » (string).
Libellé de collection : « Témoignages » ; singulier « Témoignage » ; résumé `{{auteur}}, {{entreprise}}`.

## Résumés dans la liste des blocs (summary)

Chaque type affiche son libellé suivi du titre principal : par exemple `Cartes d'offres : {{titre}}`, `Hero : {{accroche}}`, `Chiffres clés`, `Logos clients`.

## Exigence de rendu

Après migration, `dist/index.html` et `dist/en/index.html` doivent être identiques à ceux d'avant (à l'espace près). Copies de référence : `$HOME/baseline/fr.html` et `$HOME/baseline/en.html` dans le shell du poste.

## Amorçage des témoignages

Les citations actuelles de l'accueil sont vides. La collection est amorcée avec les témoignages déjà publiés dans `src/_data/logiciel_metier.json` (ceux qui ont un auteur), découpés en auteur, fonction et entreprise quand l'auteur contient des virgules. Aucun témoignage n'est inventé. Les citations de `page_formations.json` sont des textes de gabarit : ne pas les reprendre. Pas de témoignage anglais pour l'instant.

## Pages de démonstration (scénario « créer une page »)

- Dossier `src/demo/`, un fichier Markdown par page, contenu entièrement en front matter : `titre` « Titre de la page » (string, obligatoire), `seo` (même objet que l'accueil), `blocs` (mêmes 11 types de blocs que l'accueil).
- Rendu : gabarit `src/_includes/page-blocs.njk`, adresse `/demo/<nom-du-fichier>/`, jamais indexé, absent du plan du site.
- Page d'amorce : `src/demo/exemple.md`, marquée [DÉMO].
- Le dossier des données de l'accueil s'appelle `src/_data/contenus/` (et non `blocs/`) pour éviter un conflit de nom avec le champ `blocs` des pages de démonstration.
