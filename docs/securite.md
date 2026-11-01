# Sécurité du site 4SH : audit et mesures

Audit du 1er novembre 2026 sur la branche `main` du dépôt public `TomRetouret/site-4sh-poc` (site Eleventy 3 sur Netlify, préproduction `eclectic-conkies-63f114.netlify.app`, production prévue sur `www.4sh.fr`).

Légende des gravités : **critique** (exploitable tout de suite, dégâts importants), **haute**, **moyenne**, **basse**, **info**.
Statut : **corrigé** (fait dans le dépôt), **à faire (Tom)**, **à faire (gabarits)** (modification décrite, à appliquer par la personne qui tient les gabarits).

## Synthèse

| # | Constat | Gravité | Statut |
|---|---------|---------|--------|
| 1 | Formulaire de contact : le destinataire du courriel était lu dans un champ caché modifiable par le visiteur (relais de spam vers n'importe quelle adresse) | **critique** | corrigé |
| 2 | Le jeton GitHub du back-office (portée `repo`, compte personnel) est lisible par tout script exécuté sur le domaine : aucune Content-Security-Policy | **haute** | en partie corrigé, à faire (Tom) |
| 3 | Portée OAuth `repo` sur le compte personnel de Tom : un jeton volé donne l'accès en écriture à **tous** ses dépôts, privés compris | **haute** | à faire (Tom) |
| 4 | Scripts tiers sans intégrité (Sveltia sur unpkg, js-yaml sur jsDelivr) | **moyenne** | corrigé |
| 5 | Dépendances de build : 7 vulnérabilités hautes et 3 moyennes (`npm audit`) | **moyenne** | 4 hautes corrigées, reste à faire (Tom) |
| 6 | En-têtes de sécurité HTTP absents (HSTS, nosniff, Referrer-Policy, Permissions-Policy, anti-encadrement) | **moyenne** | corrigé |
| 7 | Versions non figées pour Eleventy et eleventy-img (`^`) | **basse** | corrigé |
| 8 | Pas de Dependabot | **basse** | corrigé (fichier ajouté), activation à faire (Tom) |
| 9 | Adresses de destination des formulaires publiées dans le HTML | **basse** | à faire (gabarits) |
| 10 | Secrets dans le dépôt ou son historique | **info** | rien trouvé |
| 11 | Fichiers sensibles publiés dans `dist/` | **info** | rien trouvé, une page d'essai à retirer |
| 12 | Workflow GitHub Actions | **info** | déjà conforme |
| 13 | Storybook public | **info** | rien de sensible |

## 1. Secrets (dépôt et historique Git)

**Méthode.** `gitleaks 8.21.2` sur les 63 commits de toutes les branches locales et distantes (`git` et `dir`), puis recherches ciblées dans `git log -p --all` : jetons GitHub (`ghp_`, `gho_`, `github_pat_`), clés AWS, Google, Slack, OpenAI, clés privées, crochets Netlify (`api.netlify.com/build_hooks/...`), clés Mailjet, affectations `apikey=`, `secret=`, `password=`, `token=`, adresses e-mail et numéros de téléphone.

**Constat : aucun secret.** Le crochet de build n'apparaît que sous la forme `https://api.netlify.com/build_hooks/...` (documentation). Les clés Mailjet sont lues dans les variables d'environnement Netlify. Adresses présentes : `tom.retouret@4sh.fr` (auteur des commits, adresse professionnelle), `contact@`, `commerce@`, `dpo@4sh.fr` (publiques), des adresses fictives d'exemple et les contacts des sous-traitants de la notice RGPD. Téléphone : le standard de 4SH, publié sur le site.

**Info.** L'adresse du Worker OAuth (`sveltia-cms-auth.tom-retouret.workers.dev`) est publique par nature (elle figure dans `admin/config.yml` publié) : ce n'est pas un secret, sa protection repose sur `ALLOWED_DOMAINS` (section 6).

**À faire (Tom).**
- Activer sur GitHub, Settings, Code security : *Secret scanning* et *Push protection* (gratuits pour un dépôt public).
- Le dossier `Claude outputs/` (archives `dist-*.tgz`, prototypes) n'est pas suivi mais n'est pas non plus ignoré : l'ajouter à `.gitignore` pour éviter de le publier par mégarde.

## 2. Dépendances

**Constat.** `npm audit` : 7 hautes, 3 moyennes, toutes dans des outils de **build** (rien n'est envoyé au navigateur du visiteur, sauf les bibliothèques intégrées à Storybook). Ce sont surtout des dénis de service sur des entrées malveillantes ; les entrées viennent ici du dépôt (rédacteurs authentifiés), d'où une gravité moyenne.

**Corrigé (mises à jour mineures ou correctives, sans changement de version des paquets directs) :**

| Paquet (dépendance indirecte) | Avant | Après |
|---|---|---|
| brace-expansion | 1.1.15 | 1.1.21 |
| js-yaml (via gray-matter) | 3.15.0 | 3.15.2 |
| js-yaml | 4.3.0 | 4.3.2 |
| liquidjs | 10.27.1 | 10.30.1 |
| markdown-it | 14.3.0 | 14.3.3 |

Versions figées dans `package.json` : `@11ty/eleventy` 3.1.6 et `@11ty/eleventy-img` 6.0.4 (les versions déjà installées par le fichier de verrouillage, le build ne change pas). Le fichier de verrouillage garde les binaires macOS de sharp.

**Vérification.** Build complet avant et après dans une copie propre (`npm ci` puis `npm run build`) : les 132 pages du site, `admin/`, `admin-shared/`, `assets/`, `img/` et `uploads/` sont identiques octet pour octet ; `sitemap.xml` ne diffère que par les dates `lastmod` (heure du build) et l'ordre, mêmes URL. Dans `dist/storybook/`, seuls les noms hachés des morceaux JavaScript changent (ils embarquent js-yaml et markdown-it mis à jour) ; même liste de fichiers, même rendu.

**Reste (à faire, Tom) :**
- **sharp 0.33.5 et image-size 1.2.1** (haute) via `@11ty/eleventy-img` 6 : failles de libvips, libheif et librsvg, déni de service sur images forgées. Correctif uniquement dans `@11ty/eleventy-img` 7 (version majeure, sharp 0.35). Les images traitées viennent du dépôt (dépôts des rédacteurs, déjà convertis en WebP par Sveltia). À planifier : passer à eleventy-img 7.1.1 dans une branche, vérifier que les images générées (`dist/img/`) restent correctes, puis fusionner.
- **minimatch** (moyenne) via `@11ty/recursive-copy`, dépendance d'Eleventy : pas de correctif dans Eleventy 3.1.x à ce jour. Attendre une version d'Eleventy ; Dependabot la proposera.
- Sur le Mac, `node_modules` ne correspond plus au fichier de verrouillage : lancer `npm ci` (Netlify le fait de lui-même).

## 3. En-têtes HTTP (`netlify.toml`)

### Ce qui est posé

Pour toutes les pages (règle `/*`), **bloquant** :

| En-tête | Valeur | Rôle |
|---|---|---|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | HTTPS obligatoire pendant un an (pas de `preload` sans décision) |
| X-Content-Type-Options | `nosniff` | pas d'interprétation d'un fichier comme script |
| Referrer-Policy | `strict-origin-when-cross-origin` | les sites tiers ne voient que le domaine |
| X-Frame-Options | `SAMEORIGIN` | pas d'encadrement par un autre site ; l'aperçu de Sveltia et Storybook (iframes du même site) fonctionnent |
| Permissions-Policy | caméra, micro, géolocalisation, paiement, USB, etc. désactivés | |
| Content-Security-Policy | `object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'` | socle minimal, compatible avec le site, l'admin et Storybook |

Politiques complètes :

| Zone | En-tête | Mode |
|---|---|---|
| Site public (`/*`) | `Content-Security-Policy-Report-Only` | observation |
| Back-office (`/admin/*`, y compris `/admin/versions/`) | `Content-Security-Policy-Report-Only` | observation |
| Storybook (`/storybook/*`) | `Content-Security-Policy` | **bloquant** |

**Site public (observation).** `script-src 'self'` plus les empreintes SHA-256 des 6 scripts en ligne des gabarits (modale de pré-inscription, sommaire des références, bandeau compact, filtres des formulaires et des références, animation d'attente) et, avec `'unsafe-hashes'`, des 3 gestionnaires `onclick` de la modale de formation. `style-src 'self' 'unsafe-inline'` (les gabarits et les contenus contiennent environ 1 900 attributs `style`). Images : le site, `data:`, `www.4sh.fr`, `secure.gravatar.com`, `i0.wp.com` (vignettes du blog). Polices : le site seulement ; **les polices Google ne sont volontairement pas autorisées** (elles sont en cours de remplacement par des polices auto-hébergées ; à la date du dernier build elles n'apparaissent plus dans les pages). Test local (Chrome sans interface, politique appliquée en **mode bloquant**) sur 35 pages représentatives : **aucune violation**, la modale de formation s'ouvre.

**Back-office (observation).** Sveltia charge à la demande d'autres modules depuis `unpkg.com` (voir section 4), compile du WebAssembly (conversion des images en WebP) et crée un Worker `blob:`. Politique : scripts du site et de `unpkg.com` avec `'wasm-unsafe-eval'` ; connexions vers `api.github.com`, le Worker OAuth, `unpkg.com`, `www.githubstatus.com` ; images et médias de toute origine HTTPS (avatars GitHub, aperçus) ; iframes du site, `blob:` et YouTube ; polices et feuilles Google **temporairement** (elles sont encore chargées par `admin-shared/apercus.js`, à retirer quand l'aperçu passera aux polices auto-hébergées). Non testé en navigateur : unpkg n'était pas joignable depuis l'environnement d'audit.

**Storybook (bloquant).** Scripts en ligne et `'unsafe-eval'` nécessaires (Storybook compile les gabarits Nunjucks dans le navigateur). Testé en local sur 41 stories et le gestionnaire : aucune violation, tout s'affiche. Storybook ne manipule aucun jeton, ce relâchement est acceptable.

### Point d'attention : règles qui se recouvrent

`/admin/` et `/storybook/` reçoivent à la fois les en-têtes de `/*` et ceux de leur règle. La documentation Netlify ne dit pas si deux valeurs du même en-tête sont combinées ou si la règle la plus précise l'emporte. Les politiques sont écrites pour fonctionner dans les deux cas (la politique bloquante de Storybook contient le socle de `/*`). Effet possible : dans l'admin et Storybook, la console peut aussi afficher les rapports de la politique stricte du site ; les ignorer.

**Vérification après déploiement (Tom, 2 min) :**
```
curl -sI https://eclectic-conkies-63f114.netlify.app/ | grep -iE "strict|content-security|x-frame|referrer|permissions|nosniff"
curl -sI https://eclectic-conkies-63f114.netlify.app/admin/ | grep -i content-security
curl -sI https://eclectic-conkies-63f114.netlify.app/storybook/ | grep -i content-security
```

### Passer en mode bloquant (à faire, Tom)

1. Déployer, puis ouvrir la console du navigateur (onglet Console) : chaque écart s'affiche sous la forme « [Report Only] Refused to ... ».
2. **Site** : parcourir l'accueil, une formation (ouvrir la modale de pré-inscription), les références (filtres), le contact (envoyer un essai), le glossaire, une page anglaise. Aucun message : dans `netlify.toml`, règle `/*`, remplacer la ligne `Content-Security-Policy = "object-src ..."` par la politique stricte (renommer `Content-Security-Policy-Report-Only` en `Content-Security-Policy` et supprimer l'ancienne ligne courte, dont les directives sont reprises).
   **Attention :** comme cette politique s'appliquerait aussi à `/admin/` si Netlify combine les règles, vérifier ensuite que l'admin fonctionne. Si l'admin casse, c'est que Netlify combine : garder alors la politique stricte en observation, et la poser plutôt dans une balise `<meta http-equiv="Content-Security-Policy">` de `src/_includes/base.njk` (voir plus bas), que l'admin n'utilise pas.
3. **Back-office** : faire une séance complète (connexion, modification d'une page avec aperçu, dépôt d'une image JPEG, ouverture d'un PDF, enregistrement, publication, page Versions publiées, restauration en brouillon). Aucun message : renommer l'en-tête de la règle `/admin/*` en `Content-Security-Policy`.
4. Si un script en ligne des gabarits change, son empreinte change et le navigateur le signale avec la bonne valeur (`sha256-...`) : remplacer l'empreinte dans `netlify.toml`.

**Recommandation pour les gabarits (à faire, gabarits).** Déplacer les 6 scripts en ligne dans `src/assets/*.js` et remplacer les `onclick` de `src/_includes/formation.njk` par des `addEventListener` : la politique du site pourra alors se réduire à `script-src 'self'` sans empreintes à entretenir. Variante si l'on préfère une balise dans `base.njk` (ne gère pas `frame-ancestors`, déjà couvert par l'en-tête) :
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.4sh.fr https://secure.gravatar.com https://i0.wp.com; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
```

## 4. Scripts chargés depuis un CDN

| Script | Avant | Après |
|---|---|---|
| Sveltia CMS 0.256.1 (`admin/index.html`, unpkg) | sans intégrité | `integrity="sha384-LPT86oZkLhmoF84O1jKZBSaFJOVvKv8sjXDKap1SOaSwzbC8F6HH7rTJWekmAzG9" crossorigin="anonymous"` |
| js-yaml (`admin/versions/page.js`, jsDelivr 4.1.0) | import ES sans intégrité possible | **auto-hébergé** : `admin/versions/vendor/js-yaml-4.3.2.js` (+ licence MIT) |

**Comment les empreintes ont été obtenues.** Archives téléchargées depuis le registre npm (`npm pack`), dont l'empreinte SHA-512 a été comparée à celle publiée par le registre (`dist.integrity`) : identiques. Les CDN n'étaient pas joignables directement ; l'API de jsDelivr publie, pour la même version, une empreinte SHA-256 identique à celle du fichier du paquet pour `@sveltia/cms@0.256.1/dist/sveltia-cms.js` (`sWkkk+e7VjA6W/qwjwnTNPLtDoW5axfQ8uLMyxByTLY=`) et pour `js-yaml@4.1.0/dist/js-yaml.mjs`. unpkg sert les fichiers des paquets npm tels quels.

**Pourquoi js-yaml est auto-hébergé.** Un `import` de module ES ne peut pas porter d'attribut `integrity`. Le copier dans le site supprime tout script tiers d'une page qui manipule le jeton GitHub. Passage de 4.1.0 à 4.3.2 au passage (4.1.0 est concernée par une pollution de prototype via les clés de fusion, corrigée en 4.1.1, et par les dénis de service corrigés en 4.3.2). Contrôle : `config.yml` et les 178 en-têtes YAML des contenus donnent exactement le même résultat avec les deux versions. Empreinte SHA-256 du fichier : `zqJ2x+FfQJoa2+XRd6ungkOYpHT3z3Ar1Xlix9VwY28=`.

**Vérifier l'empreinte de Sveltia avant fusion (Tom, 1 min) :**
```
curl -s https://unpkg.com/@sveltia/cms@0.256.1/dist/sveltia-cms.js | openssl dgst -sha384 -binary | openssl base64 -A
```
Résultat attendu : `LPT86oZkLhmoF84O1jKZBSaFJOVvKv8sjXDKap1SOaSwzbC8F6HH7rTJWekmAzG9`. Si la page d'admin reste blanche après déploiement avec, dans la console, « Failed to find a valid digest in the 'integrity' attribute », c'est que le fichier servi diffère : ne pas retirer l'attribut sans comprendre pourquoi.

**À chaque montée de version de Sveltia :** recalculer l'empreinte avec la commande ci-dessus (nouvelle version dans l'URL) et la reporter dans `admin/index.html`.

**Limite connue (moyenne, à suivre).** Sveltia charge lui-même, à la demande, d'autres modules depuis `unpkg.com`, **sans intégrité** : ses propres morceaux (`@sveltia/cms@0.256.1/dist/chunks/*`), ses traductions, et des bibliothèques (`@jsquash/webp` pour la conversion des images, `@discourse/heic`, `exifr`, `pdfjs-dist`, `turndown`, `svgo`, `leaflet`, `terra-draw`, `dayjs`, `immutable`, `@sveltia/ui` et `@shikijs` pour la coloration). Une compromission d'unpkg ou d'un de ces paquets donnerait l'exécution de code dans l'admin, donc l'accès au jeton. Réduction possible plus tard : servir Sveltia depuis le site (paquet npm installé au build et copié dans `dist/admin/`), ce qui rend au moins ses morceaux locaux ; les bibliothèques externes resteraient sur unpkg.

## 5. Fonction de formulaire `netlify/functions/submission-created.js`

**Constat (critique, corrigé).** La fonction envoyait le courriel à l'adresse du champ caché `destinataire`. N'importe qui pouvait soumettre un formulaire Netlify avec `destinataire=victime@exemple.com` et un message de son choix : le site devenait un relais de spam signé « Site 4SH » depuis l'adresse d'envoi validée chez Mailjet, avec à la clé le blocage du compte Mailjet et la réputation du domaine 4sh.fr.

**Correction.**
- Le champ `destinataire` est **ignoré**. Le destinataire est déduit du type de demande (`sujet`) grâce à la liste blanche `formulaire.sujets` de `src/_data/site.json` et `src/_data/en/site.json` (modifiable dans le back-office), embarquée dans la fonction au déploiement (`[functions] included_files` dans `netlify.toml`). Sujet inconnu ou absent : `MAIL_DEFAUT`.
- Toute adresse de destination doit en plus appartenir à un domaine autorisé : `MAIL_DOMAINES_AUTORISES`, `4sh.fr` par défaut (sous-domaines compris).
- Objet du courriel : le libellé de la liste blanche, jamais le texte envoyé par le visiteur.
- Injection d'en-têtes : l'API Mailjet est en JSON (pas d'en-têtes bruts), et les caractères de contrôle (retours à la ligne compris) sont retirés des champs d'une ligne ; l'adresse de réponse n'est utilisée que si elle est valide.
- Injection HTML : toutes les valeurs étaient déjà échappées ; conservé.
- Tailles : message limité à 5 000 caractères, autres champs à 300, 20 champs au plus, noms de champs filtrés.
- Journaux : plus aucune donnée saisie ni adresse ; le détail des refus Mailjet (qui peut reprendre des adresses) n'est plus journalisé, seulement le statut.
- Pot de miel rempli : soumission ignorée (double sécurité, Netlify l'écarte déjà).
- La fonction n'est pas appelable directement depuis Internet : Netlify signe les événements et vérifie la signature avant d'invoquer une fonction d'événement.

Tests réalisés : destinataire forgé ignoré, sujet connu routé vers l'adresse de la liste, sujet inconnu sans `MAIL_DEFAUT` non envoyé, `MAIL_DEFAUT` hors domaine autorisé refusé, retours à la ligne neutralisés, balises échappées.

**À faire (Tom) dans Netlify, Site configuration, Environment variables :**
- Définir `MAIL_DEFAUT` (par exemple `contact@4sh.fr`) : sans elle, une demande au sujet inconnu reste seulement dans Netlify Forms.
- Si une adresse de sujet est hors de `4sh.fr`, l'ajouter à `MAIL_DOMAINES_AUTORISES` (domaines séparés par des virgules).
- Donner aux variables `MJ_APIKEY_PUBLIC` et `MJ_APIKEY_PRIVATE` la portée **Functions** uniquement (pas Builds) : un build de demande de fusion (Dependabot, contribution) ne pourra pas les lire.

**Protection anti-spam des formulaires.** Les quatre formulaires (`contact-bandeau`, `contact-page`, `devis-formation`, `preinscription-formation`) ont déjà le pot de miel Netlify (`netlify-honeypot="bot-field"` et le champ masqué). Pas de reCAPTCHA : il ajoute un élément visible et un service Google (à déclarer dans la notice RGPD). À activer seulement si du spam passe (`data-netlify-recaptcha="true"` sur la balise `form` et `<div data-netlify-recaptcha="true"></div>` avant le bouton) ; il faudrait alors autoriser `https://www.google.com` et `https://www.gstatic.com` dans `script-src` et `frame-src`.

**À faire (gabarits), basse.** Le champ caché `destinataire` et les attributs `data-email` des options ne servent plus et publient les adresses de destination dans le HTML (moissonnage par les robots de spam). Les retirer : `src/_includes/composants/formulaires.njk` (attribut `data-email="{{ s.email }}"` de l'option, ligne `<input type="hidden" name="destinataire" ...>`), `src/_includes/formation.njk` (même ligne dans la modale), et la recopie dans `src/assets/formulaires.js`. Sans effet visible. Même fichier, détail mineur : `formulaires.js` insère le libellé des options avec `innerHTML` ; ces libellés viennent du back-office (rédacteurs de confiance), mais `textContent` serait plus sûr.

## 6. Back-office

**Page `/admin/versions/` (vérifiée, conforme).**
- Aucune donnée n'est injectée en HTML : tout passe par `textContent`, `createElement` et `createTextNode` (fonction `el`). Les seuls liens dynamiques (`href`) sont les adresses `html_url` renvoyées par l'API GitHub.
- Le jeton n'est jamais journalisé (`console.error` ne reçoit que des erreurs) ; il n'est envoyé qu'à `https://api.github.com` (en-tête `Authorization`). La connexion propre à la page passe par le Worker, et la réponse n'est acceptée que de la fenêtre ouverte et de l'origine exacte du Worker.
- Le jeton obtenu par la page est rangé dans `sessionStorage` (effacé à la fermeture de l'onglet) ; celui de Sveltia est dans `localStorage` (clé `sveltia-cms.user`), par conception de Sveltia.
- js-yaml est désormais servi par le site (section 4).

**Risque principal (haute).** Tout script exécuté sur le domaine du site (faille XSS dans un contenu, script tiers compromis, module d'unpkg compromis) peut lire le jeton de `localStorage`. D'où l'importance de la CSP (section 3), du passage en mode bloquant, et de la portée du jeton :

**Portée OAuth `repo` (haute, à faire, Tom).** La portée `repo` donne lecture et écriture sur **tous** les dépôts, privés compris, du compte qui se connecte, ici le compte personnel de Tom (et de chaque rédacteur). Recommandations, par ordre de priorité :
1. Transférer le dépôt dans une **organisation GitHub 4SH** et y créer l'application OAuth du back-office (propriété de l'organisation). Dans l'organisation, Settings, Third-party access, activer la restriction des applications OAuth : les jetons ne valent que pour les dépôts de l'organisation, et l'application doit être approuvée.
2. Les rédacteurs utilisent un compte GitHub **dédié** au site (pas leur compte personnel de développeur), membre de l'équipe du dépôt seulement, avec double authentification obligatoire.
3. Tant que le dépôt est public, la portée `public_repo` suffit à Sveltia : ajouter `auth_scope: public_repo` sous `backend` dans `admin/config/00-base.yml` (la page Versions lit la même clé) et vérifier que le Worker transmet bien la portée demandée (sinon elle reste `repo,user`, codée dans le Worker).
4. Plus tard, envisager une **GitHub App** (droits limités au seul dépôt, jetons courts), que Sveltia sait aussi utiliser.

**Worker `sveltia-cms-auth` (à vérifier, Tom).** Cloudflare, Workers & Pages, `sveltia-cms-auth`, Settings, Variables : `ALLOWED_DOMAINS` doit contenir **exactement** les domaines utiles (`eclectic-conkies-63f114.netlify.app`, puis `www.4sh.fr`), sans joker large du type `*.netlify.app` (n'importe quel site Netlify pourrait sinon obtenir des jetons de vos rédacteurs). `GITHUB_CLIENT_SECRET` doit être une variable de type *Secret*. Au passage en organisation, recréer Worker et application OAuth au nom de 4SH.

**Fichiers publiés dans `dist/` (vérifié).** Pas de carte de source (`.map`), pas de `docs/`, pas de `scripts/` de migration, pas de sources de Storybook, pas de sauvegarde ; les morceaux `admin/config/` ne sont pas publiés (seul `admin/config.yml` assemblé l'est, ce qui est nécessaire). `.gitkeep` vides publiés dans `admin-shared/` et `uploads/` (sans conséquence). Métadonnées des images : seulement Photoshop, pas de géolocalisation.
- **À faire (rangement), basse :** la page d'essai `/demo/essai-blocs/` est publiée (en `noindex`) : la retirer avant la mise en production si elle n'a plus d'usage.

## 7. GitHub

- **Workflow `reconstruction-quotidienne.yml` : déjà conforme.** `permissions: {}` (aucun droit sur le dépôt), aucune action tierce (un simple `curl`, donc rien à épingler par hachage), secret passé par variable d'environnement et masqué dans les journaux, `timeout-minutes: 5`. Règle pour la suite : toute action ajoutée doit être épinglée par hachage de commit complet (`uses: actions/checkout@<40 caractères> # v4.x.y`), et les permissions déclarées au plus juste par tâche.
- **Dependabot : ajouté** (`.github/dependabot.yml`) pour npm et GitHub Actions, hebdomadaire (lundi 6 h 17, heure de Paris), regroupé (une demande pour les mises à jour mineures et correctives, une pour les majeures). **À faire (Tom)** : Settings, Code security, activer *Dependency graph*, *Dependabot alerts* et *Dependabot security updates*.
- **Fusion automatique : à cadrer (Tom).** Ne jamais fusionner automatiquement les demandes de Dependabot ni celles d'un contributeur extérieur : relire, attendre l'aperçu Netlify et le build. Si la fusion automatique est réglée au niveau du dépôt, la réserver aux demandes du circuit éditorial de Sveltia.
- **Protection de `main` (constatée active).** À vérifier : demandes de fusion obligatoires, historique linéaire, interdiction des poussées forcées et de la suppression, règles appliquées aussi aux administrateurs.
- **Secrets.** `NETLIFY_BUILD_HOOK` est le seul secret GitHub : il ne permet que de lancer un build (pas de lecture), le renouveler dans Netlify (Build hooks) en cas de doute. Activer *Secret scanning* et *Push protection* (section 1).
- **Organisation 4SH (recommandé avant la production).** Transférer le dépôt (`Settings, Transfer`), double authentification obligatoire pour les membres, application OAuth et Worker au nom de 4SH, accès des rédacteurs par équipe, Netlify relié au dépôt de l'organisation. Le dépôt peut rester public (site vitrine), mais un dépôt privé réduirait l'exposition (historique, configuration du back-office) ; dans ce cas, la portée OAuth `repo` redevient nécessaire, d'où l'intérêt de la restriction d'organisation.

## 8. Storybook public (`/storybook/`)

Contenu exposé : composants et blocs du design system, alimentés par les contenus du site (déjà publics) et des exemples fictifs (`prenom@entreprise.fr`). Pas de données personnelles hors celles déjà publiées sur le site (photo d'équipe, adresses génériques), pas de brouillon, pas de carte de source, pas de code source des stories. `noindex` conservé. Politique de sécurité bloquante propre (section 3).

## Vérifications faites

- YAML (`dependabot.yml`, workflow) et TOML (`netlify.toml`) analysés sans erreur.
- Build complet avant et après (copie propre, `npm ci`) : pages identiques, voir section 2.
- Politiques de sécurité du site et de Storybook appliquées en mode bloquant sur un serveur local avec Chrome sans interface : aucune violation.
- Fonction de formulaire : tests unitaires listés en section 5.
