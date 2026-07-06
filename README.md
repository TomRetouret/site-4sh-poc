# Site 4SH (refonte) - Eleventy + CMS git

Site statique généré avec [Eleventy](https://www.11ty.dev/), branché à un CMS git ([Decap CMS](https://decapcms.org/)). Une collègue peut remplir le contenu en autonomie via une interface web : chaque modification devient un commit git, qui redéclenche la mise en ligne.

## Ce que le CMS pilote

- **Formations** : ajouter / modifier / supprimer des fiches (une fiche = un fichier `src/content/formations/*.md`). Le catalogue et les pages détail se régénèrent automatiquement.
  - **Une fiche = un niveau.** Une techno peut avoir plusieurs niveaux (Essentiel, Fondamental, Intermédiaire, Avancé), chacun sa page, son prix, ses dates et son formateur. On les relie par le champ `groupe` (même valeur pour tous les niveaux d'une techno, ex. `angular`). Le catalogue affiche alors une seule carte par techno (avec une puce par niveau) et la fiche affiche un sélecteur de niveau.
- **Page d'accueil** : titre, accroche, boutons, secteurs, FAQ (`src/_data/accueil.json`).
- **Réglages du site** : coordonnées, pied de page, logos clients (`src/_data/site.json`).
- **Images** : upload depuis l'admin (`src/uploads/`).

La **navigation / méga-menu** reste dans le code (`src/_includes/base.njk`). C'est volontaire : c'est de la structure, pas du contenu courant, et ça évite qu'une mauvaise manip casse le menu.

## Structure

```
src/
  _data/            site.json, accueil.json  (contenus éditables globaux)
  _includes/        base.njk (layout), formation.njk (gabarit fiche)
  assets/           styles.css, script.js, learning.css, catalogue.css, logiciel-metier.css
  content/formations/   une fiche = un .md (frontmatter = champs, corps = description)
  uploads/          images uploadées par le CMS
  index.njk         accueil       ->  /
  logiciel-metier.njk             ->  /logiciel-metier/
  formations/index.njk  catalogue ->  /formations/
admin/              index.html + config.yml  (interface CMS)
.eleventy.js        configuration Eleventy
netlify.toml        configuration de déploiement Netlify
```

## Développer en local

```bash
npm install
npm run dev      # http://localhost:8080 avec rechargement auto
npm run build    # génère le site dans dist/
```

## Mettre en ligne (GitHub + Netlify + CMS Sveltia)

Le site est statique ; le CMS (Sveltia) écrit dans le dépôt GitHub, et Netlify reconstruit à chaque commit.

### 1. Pré-vol (à faire avant de pousser)

- `admin/config.yml` → `backend.repo` : remplacer `ORG/site-4sh` par le vrai dépôt (`branch: main`).
- `src/_data/seo.json` (`url`) et `admin/config.yml` (`site_url`, `display_url`) : mettre le domaine de prod.
- Déposer la photo d'équipe dans `src/uploads/equipe-4sh.jpg` (sinon 404 sur l'accueil).

### 2. Pousser sur GitHub (depuis votre machine)

```bash
cd site-4sh
git init            # si pas déjà fait
git add -A
git commit -m "Mise en ligne du site 4SH"
git branch -M main
git remote add origin git@github.com:ORG/site-4sh.git
git push -u origin main
```

### 3. Déployer sur Netlify

1. Netlify → « Add new site » → « Import from GitHub » → sélectionner le dépôt.
2. Rien à configurer : le `netlify.toml` fournit la commande (`npm run build`) et le dossier publié (`dist`).
3. Le site est en ligne sur `https://<site>.netlify.app` (puis brancher le domaine).

### 4. Activer l'authentification du CMS (login « avec GitHub »)

Netlify Identity / Git Gateway est déprécié : on utilise l'auth GitHub de Sveltia via un petit **Cloudflare Worker gratuit** (`sveltia-cms-auth`).

1. Créer une **GitHub OAuth App** (Settings → Developer settings → OAuth Apps) ; callback = l'URL du worker.
2. Déployer le worker `sveltia-cms-auth` (https://github.com/sveltia/sveltia-cms-auth) sur Cloudflare avec le client ID/secret de l'OAuth App.
3. Dans `admin/config.yml`, décommenter et renseigner `backend.base_url` avec l'URL du worker.
4. L'admin est ensuite accessible sur `https://<site>/admin/` (login GitHub).

En local, pas besoin de tout ça : `npm run dev` puis `/admin/` → « Work with Local Repository » (Chrome/Edge/Brave).

## Notes

- `dist/` et `node_modules/` sont ignorés par git (`.gitignore`).
- Les images d'illustration pointent encore vers `www.4sh.fr` (logos technos, Qualiopi...). À rapatrier dans `src/uploads/` au moment de la vraie mise en production.
- Les formulaires (contact, devis, pré-inscription) sont des maquettes : à brancher sur le vrai back / service d'envoi.
- Périmètre porté : accueil, logiciel-métier, catalogue formations, fiches formation. Les autres entrées de menu pointent vers `#` en attendant leurs pages.
