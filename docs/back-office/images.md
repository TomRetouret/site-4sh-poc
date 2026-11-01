# Images : optimisation automatique

Le site produit lui-même, au build, des images légères et adaptées à chaque écran.
Le contributeur dépose une seule image ; le reste est automatique.

## Pour le contributeur

### Ce qui est automatique

- **Une seule image à déposer.** Au build, le site en tire des variantes AVIF et WebP
  (formats modernes, 3 à 10 fois plus légers) et une copie au format d'origine pour les
  vieux navigateurs, en 400, 800, 1200 et 1600 px de large (jamais plus large que l'original).
- **Le navigateur choisit seul** la variante la plus légère qui convient à la taille de
  l'écran et à sa densité (téléphone, écran Retina, grand écran).
- **Chargement différé** : les images sous la ligne de flottaison ne se chargent qu'à
  l'approche du défilement (sauf le visuel principal d'une fiche référence, chargé tout de suite).
- **Largeur et hauteur réservées** : la page ne « saute » pas pendant le chargement.
- **Le cadrage** choisi dans le back-office (centre, haut, bas, gauche, droite) est conservé
  sur toutes les variantes : il indique quelle partie de l'image reste visible quand
  l'emplacement la recadre.
- **Au dépôt dans Sveltia**, les photos JPEG, PNG et HEIC sont converties en WebP
  (qualité 85) et réduites à 2400 px de large ou de haut au plus. Un fichier de plus de
  10 Mo est refusé. Voir le réglage plus bas.

### Taille conseillée

| Emplacement | Format conseillé | Largeur conseillée |
|---|---|---|
| Visuel principal et galerie d'une fiche référence | paysage 16/10 | 2000 px |
| Carte de référence, aperçu de projet | paysage 4/3 (recadré) | 1600 px |
| Visuel d'une réalisation (bloc Projets) | paysage | 1600 px |
| Photo d'équipe | très large (21/9 ou 3/2, recadrée) | 2400 px |
| Photo de formateur | carré | 500 px |

Une image plus grande ne sert à rien : elle est réduite au dépôt puis au build. Une image
plus petite reste nette jusqu'à sa largeur réelle mais ne sera pas agrandie.

Toujours remplir le **texte alternatif** (ou cocher « image décorative »).

### Ce qui n'est pas automatique

- **Le choix du cadrage** : si un visage ou un sujet est coupé, changer le cadrage dans le
  bloc (champ « Cadrage »), quand le champ existe.
- **Les logos et pictogrammes** (logos clients, logos de technologies, pictos de formation,
  icônes du menu) ne passent pas par l'optimisation : déposer de préférence un **SVG**,
  ou un PNG déjà de petite taille (moins de 400 px de large, moins de 30 Ko). Les logos PNG
  très lourds (par exemple 1200 px pour un logo affiché en 120 px) restent lourds.
- **Les images externes** (adresse en http ou https, images du blog, avatars) et les **SVG**
  et **GIF** sont affichés tels quels.
- **Les images insérées dans un texte libre en Markdown** ne sont pas concernées (aucune à ce jour).
- **Les images déposées avant ce réglage** ne sont pas reconverties dans le dépôt Git ; le site
  sert malgré tout leurs variantes optimisées.

## Réglage Sveltia (conversion dès le dépôt)

Dans `admin/config/00-base.yml` (puis `node scripts/assembler-config.js`) :

```yaml
media_libraries:
  default:
    config:
      max_file_size: 10485760
      transformations:
        jpeg: { format: webp, quality: 85, width: 2400, height: 2400 }
        png: { format: webp, quality: 85, width: 2400, height: 2400 }
        heic: { format: webp, quality: 85, width: 2400, height: 2400 }
```

Documenté dans les types publics de Sveltia CMS 0.256.1 (`types/public.d.ts`, options
`SharedMediaLibraryOptions.transformations`, `max_file_size`, et
`RasterImageTransformationOptions` : `format` vaut uniquement `webp`, `quality` 85 par
défaut, `width` et `height` maximums, jamais d'agrandissement). La conversion est faite
par le navigateur du contributeur ; s'il ne sait pas encoder le WebP, l'image est
enregistrée en PNG. La clé générique `raster_image` existe aussi, mais elle convertirait
les GIF animés et les AVIF : on cible donc seulement JPEG, PNG et HEIC.

## Pour le développeur

### Le shortcode `image`

Fichier : `eleventy/images.js` (chargé automatiquement), dépendance `@11ty/eleventy-img`.

```njk
{% image chemin, texteAlternatif, { sizes: "(max-width: 767px) 100vw, 600px", cadrage: b.cadrage } %}
```

Options : `sizes` (défaut `100vw`), `cadrage`, `classe`, `loading` (défaut `lazy`),
`decoding` (défaut `async`), `width` et `height` (pour imposer le ratio déclaré ; par
défaut les dimensions réelles), `style` (correctif appliqué seulement aux images
optimisées, par exemple `height:auto` quand la feuille de style fixe la largeur sans la hauteur).
Variante filtre : `{{ chemin | imageResponsive(alt, { ... }) | safe }}`.

Sortie : `<picture style="display:contents">` avec une `<source>` AVIF et une WebP, et une
`<img>` au format d'origine avec `srcset`, `sizes`, `width`, `height`, `loading`, `decoding`.
`display:contents` évite que le `<picture>` crée une boîte : l'`<img>` garde la mise en page
prévue par les feuilles de style existantes (object-fit, position absolue).

Le shortcode est synchrone (il marche dans les macros Nunjucks) : les dimensions sont lues
tout de suite, les fichiers sont générés en tâche de fond et le build attend leur fin.

Les cartes d'aperçu de référence fabriquées en JS par le filtre `blocs` de
`eleventy.config.js` sont traitées par une transformation (`images-apercus-refs`) qui
réécrit uniquement la balise img du visuel (`<div class="sect-ref-visuel"><img ...>`).
Si ce balisage change dans le filtre, mettre à jour l'expression de la transformation.

Emplacements traités : cartes de référence et aperçus de projet (`composants/cartes.njk`
et filtre `blocs`), fiche référence (visuel et galerie), blocs `projets` et `equipe`,
accueil historique (`composants/pages/accueil.njk`), fiche formation (visuel et photo du
formateur).

### Cache

- Les variantes sont écrites dans `.cache/eleventy-img/` (ignoré par Git), puis copiées
  dans `dist/img/` à la fin du build (seulement celles utilisées). Une variante déjà présente
  dans le cache n'est jamais recalculée (nom = empreinte du fichier source et des réglages).
- Dossier modifiable par la variable d'environnement `IMAGES_CACHE_DIR`.
- Mesures : build à froid (installation neuve, cache vide) 38 s ; build suivant 0,7 s ;
  avant l'optimisation 1,4 s.

**Netlify** ne conserve pas `.cache/` d'un build à l'autre par défaut : sans réglage, chaque
déploiement régénère tout (environ 40 s de plus). Deux options, au choix :

1. Plugin `netlify-plugin-cache` (recommandé) : ajouter dans `netlify.toml`
   ```toml
   [[plugins]]
     package = "netlify-plugin-cache"
     [plugins.inputs]
       paths = [".cache/eleventy-img"]
   ```
   et `npm install --save-dev netlify-plugin-cache`.
2. Placer le cache dans `node_modules/.cache/` (que Netlify garde avec les dépendances tant
   que `package-lock.json` ne change pas) : variable d'environnement Netlify
   `IMAGES_CACHE_DIR=node_modules/.cache/eleventy-img`. Le cache est perdu à chaque
   changement de dépendances.

Aucune des deux n'est activée à ce jour.
