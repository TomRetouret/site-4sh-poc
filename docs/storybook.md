# Storybook du design system 4SH

Le Storybook montre les composants du site **tels que le site les rend** : vrais gabarits Nunjucks
(`src/_includes/composants/**`), vrais filtres et shortcodes (`eleventy.config.js`, `eleventy/*.js`),
vraies feuilles de styles (`src/assets/*.css`). Il est publié avec le site sous `/storybook/` et n'est
jamais indexé.

- Version : Storybook 10.6.2, rendu HTML (`@storybook/html-vite`), constructeur Vite 8.
- Page d'accueil dans Storybook : « Design system 4SH / Introduction » (`stories/Introduction.mdx`).

## Lancer en local

```bash
npm ci                    # une fois, ou après un changement de package-lock.json
npm run storybook         # Storybook en développement : http://localhost:6006
npm run dev               # le site Eleventy seul, comme avant (inchangé)
npm run build-storybook   # Storybook statique dans dist/storybook/
npm run build             # site Eleventy dans dist/, puis Storybook dans dist/storybook/ (Netlify)
```

En développement, une modification d'un composant `.njk`, d'un fichier de `src/_data/` ou d'un filtre
de `eleventy/` recharge l'aperçu. Une modification d'une feuille de `src/assets/` aussi (rechargez
la page si besoin).

Pour voir le Storybook statique comme en ligne : `npm run build`, puis servir `dist/`
(par exemple `npx serve dist`) et ouvrir `/storybook/`. Ouvrir `dist/storybook/` seul ne suffit pas :
les feuilles de styles sont celles du site (`/assets/...`), servies à la racine.

## Organisation des fichiers

| Fichier | Rôle |
| --- | --- |
| `.storybook/main.mjs` | Configuration : stories, extension Docs, branchement du plugin Vite. |
| `.storybook/preview.js` | Décorateur global : polices et feuilles du site dans l'ordre de `base.njk`. |
| `.storybook/4sh/plugin-vite.mjs` | Précompile les gabarits `.njk`, embarque les données de `src/_data/` et enveloppe les filtres du site pour le navigateur. |
| `.storybook/4sh/nunjucks-navigateur.js` | Environnement Nunjucks du navigateur : exécute `eleventy.config.js` avec une configuration factice. |
| `.storybook/4sh/rendre-bloc.js` | `rendreBloc(type, args, options)` et `blocExemple(page, type)`. |
| `stories/Introduction.mdx` | Page « Design system 4SH ». |
| `stories/blocs/*.stories.js` | Une story par type de bloc. |

Rubriques de la barre latérale : **Fondations** (jetons de la charte), **Composants** (morceaux hors
blocs), **Blocs** (types de blocs du back-office).

## Ajouter une story de bloc (5 étapes)

1. **Créer le fichier** `stories/blocs/<NomDuBloc>.stories.js`, en copiant `ChiffresCles.stories.js`.
2. **Nommer** : `title: "Blocs/<Nom affiché dans le back-office>"` et `tags: ["autodocs"]` (page Docs automatique).
3. **Rendre** en une ligne : `render: (args, { parameters }) => rendreBloc("<type>", args, parameters.bloc)`.
   Options utiles dans `parameters.bloc` : `gabarit: "offre"`, `filAriane`, `serre`, `famille`,
   `urlPage: "/en/"` (libellés anglais), `contexte` (références, articles...). Feuille propre à une page
   (l'équivalent de `extraCss`) : `parameters.feuilles: ["/assets/logiciel-metier.css"]`.
4. **Données d'exemple** tirées du contenu réel : `args: blocExemple("<page>", "<type>")`, où `<page>` est
   un fichier de `src/_data/contenus/fr/` (`accueil`, `logiciel_metier`...). Une variante = une story de
   plus, avec ses `args` modifiés.
5. **Contrôles** : un `argTypes` par champ de `docs/back-office/schema-blocs.md`, avec le libellé du
   back-office en `name`, `select` ou `inline-radio` et `options` pour les listes fermées, `object` pour
   les listes et objets, `if: { arg: "variante", eq: "sobre" }` pour un champ propre à une variante,
   et la règle de saisie en `description`.

Vérifier ensuite avec `npm run storybook`, puis `npm run build`.

## Limites connues

- **Filtres rendus dans le navigateur.** Les filtres sont ceux du site, exécutés dans le navigateur.
  Les accès disque passent par une copie embarquée de `src/_data/**/*.json` et de la liste des
  composants. Un filtre qui lirait un autre fichier du disque (fiches Markdown, images) n'y trouve
  rien et prend sa valeur de repli.
- **Images non optimisées.** Le shortcode `image` sort une simple `<img>`, sans variantes AVIF ou WebP
  ni `srcset`, et sans largeur ni hauteur calculées. Le cadrage (`object-position`) est conservé.
- **Collections vides.** Références, formations, technologies : le contexte des blocs reçoit une liste
  vide (`ctx.references`). Un bloc qui en dépend (`projet_vedette`, `projets`) doit recevoir ses fiches
  par `options.contexte`. Les articles du blog viennent de `src/_data/blog_fallback.json`.
- **Filtres d'Eleventy.** Seul `slugify` est fourni (le seul utilisé par les composants). Un composant
  qui utiliserait `url`, `log` ou `inputPathToUrl` lèverait une erreur, affichée dans la story.
- **Scripts.** Les balises `<script>` d'un composant (ex. `hero-signal.js`) s'exécutent ; les scripts
  globaux du site (`script.js`, `mouvement.js` : carrousels, compteurs, entrées au défilement) ne sont pas
  chargés. Les blocs restent entièrement visibles (amélioration progressive).
- **Formulaire de contact final** : ajouté par l'aiguilleur après les blocs, il n'apparaît pas dans les stories.
- **Styles du site publiés à part.** Le Storybook statique lit `/assets/...` à la racine du domaine : il
  fonctionne publié avec le site, pas ouvert seul.
- **Polices** auto-hébergées, comme le site (`/assets/polices.css`, fichiers sous `src/assets/polices/`) : aucun appel à Google Fonts.

## Publication et indexation

- `npm run build` (commande Netlify) produit `dist/` puis `dist/storybook/`. Les pages du site sont
  identiques à un build sans Storybook (seul `robots.txt` gagne une ligne).
- `netlify.toml` : en-tête `X-Robots-Tag: noindex, nofollow` sur `/storybook/*`, **à conserver après la
  mise en production** (contrairement à l'en-tête global de préproduction).
- `src/robots.njk` : `Disallow: /storybook/`, collé au groupe `User-agent` de `seo.robots_txt`.
- Eleventy ne lit que `src/` : les dossiers `.storybook/` et `stories/` ne sont jamais traités par lui.

## Données d'exemple des stories

`.storybook/4sh/contenus-site.js` lit les en-têtes YAML des pages de prestation, de la page de démonstration et des fiches références, et expose `blocDe` (n-ième bloc d'un type dans une page), `blocDemo`, `sectionPrestation`, `referencesSite` et `PAGES` (paramètres de story par type de page). Les données de l'accueil et des pages institutionnelles viennent de `blocExemple` (`rendre-bloc.js`), qui lit `src/_data/contenus/`.
