# Bibliothèque de composants

Tout ce qui est partagé entre plusieurs pages vit ici. Les pages et les
gabarits décrivent ce qu'ils affichent, ils ne recopient plus le balisage.

## Où va quoi

| Dossier                 | Contenu                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `src/_includes/`        | Les **gabarits** (`layout:`) : base, prestation, secteur, etc.  |
| `src/_includes/composants/`       | Les **composants** partagés, en macros                |
| `src/_includes/composants/pages/` | Les **corps de page partagés entre le français et l'anglais** |

## Convention

Un composant est une **macro Nunjucks à paramètres explicites**. On lit ce
qu'il attend dans sa signature, et il ne dépend d'aucune variable invisible.

```njk
{% from "composants/page.njk" import hero %}
{{ hero(titre, h1=h1, eyebrow="Prestation", chapo=chapo) }}
```

Les macros ne voient pas le contexte de la page qui les appelle : tout ce
dont elles ont besoin se passe en paramètre, `site` et `page.url` compris.
C'est ce qui permet à une même section de servir la version française et la
version anglaise avec deux jeux de données différents.

Un composant mérite sa place ici s'il est **utilisé par au moins deux
gabarits**, ou s'il est un corps de page partagé. Une carte qui n'existe que
sur une page reste dans la section qui la porte : la sortir n'ajouterait
qu'un niveau d'indirection.

## Inventaire

### `page.njk` - chrome de page

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `doodle(type)` | Les tracés manuscrits de la charte : `vague`, `vague-large`, `asterisque`, `fleche`, `fleche-mini`, `spirale` | le hero, l'accueil, le bloc de contact |
| `fil_ariane(courant, parents)` | Fil d'Ariane, « Accueil » ajouté d'office | le hero, les fiches |
| `hero(titre, h1, eyebrow, chapo, parents, ariane, trace, logo, ctas)` | Le hero sombre des pages éditoriales | prestation, page libre, secteur, secteur libre, page légale, podcasts, merci |
| `bandeau_chiffres(chiffres)` | La bande sombre de résultats chiffrés | prestation, page libre, secteur libre |

### `sections.njk` - sections

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `faq_accordeon(items, style)` | La liste dépliante seule | fiches technologie, `faq_section` |
| `faq_schema(items)` | Le JSON-LD `FAQPage` | fiches technologie, `faq_section` |
| `faq_section(items, titre, creme)` | FAQ complète : section, titre, accordéon et schéma | prestation, page libre, secteur libre |
| `bloc_references(slugs, toutes, eyebrow, titre)` | Les fiches références liées à une page | prestation, page libre, secteur, secteur libre |
| `frise_etapes(etapes)` | La frise en quatre temps de la méthode 4D | accueil, notre démarche |
| `carrousel(libelle, variante, auto)` | Enveloppe de carrousel, à appeler avec `{% call %}` | accueil (secteurs et réalisations), notre démarche |

### `cartes.njk` - cartes

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `carte_ref(ref, une)` | La fiche référence du catalogue | index des références, `bloc_references` |
| `apercu_projet(titre, texte, fiche, lien, libelle_lien)` | Carte d'aperçu d'un projet : titre et texte de la page, visuel et logo de la fiche | fiches technologie |
| `carte_atout(atout, rang)` | Carte numérotée « pourquoi nous » | notre démarche, fiches technologie |

### `formulaires.njk` - formulaires

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `champ_sujet(f, id, defaut)` | Le choix du type de demande, qui porte le destinataire | tous les formulaires |
| `case_rgpd(f, id)` | La case de consentement | tous les formulaires |
| `formulaire(f, url_page, nom, avec_tel, sujet_defaut, sujet_id, rgpd_id)` | Le formulaire de contact | contact, `contact_final` |
| `contact_final(site, url_page, nom)` | Le grand bloc de contact sombre de fin de page | 15 pages |
| `devis(d, f, url_page, id, style, sujet_defaut)` | Le bloc de demande de devis | catalogue, catégories, fiches formation |

### `catalogue.njk` et `icones.njk`

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `grille(groupes, libelles, categorie)` | Recherche, onglets et grille du catalogue de formations | catalogue, pages de catégorie |
| `navicone(nom)` | Le jeu d'icônes du mégamenu | `en-tete.njk` |

### `en-tete.njk` et `pied-de-page.njk` - en-tête et pied de page du site

| Macro | Rôle | Utilisé par |
| --- | --- | --- |
| `en_tete(navigation, rubrique, lang, alt_url, url_page)` | Logo, menu et méga-menus, sélecteur de langue, actions, bouton « Menu » | base (toutes les pages, sauf `hideHeader`) |
| `pied_de_page(site, url_page)` | Logo blanc, signature, coordonnées, colonnes de liens, mentions et réseaux | base (toutes les pages) |

Stories : Composants/En-tête et Composants/Pied de page (données de `navigation.json` et `site.json`, français et anglais).

### `pages/` - corps partagés entre le français et l'anglais

Chaque fichier expose une macro `corps(...)`. La page française et la page
anglaise l'appellent avec leur propre jeu de données : une section modifiée
ici l'est dans les deux langues, ce qui évite la dérive entre les deux
versions.

| Fichier | Pages | Appel |
| --- | --- | --- |
| `pages/accueil.njk` | `/` et `/en/` | `corps(accueil, site, blog, page.url)` |
| `pages/entreprise.njk` | `/notre-entreprise/` et `/en/company/` | `corps(notre_entreprise, site, page.url)` |
| `pages/technologies.njk` | `/expertises-techniques/` et `/en/tech-expertise/` | `corps(page_technologies, site, collections.technologies, page.url)` |
| `pages/formations.njk` | `/formations/` et `/en/training/` | `corps(page_formations, site, libelles, collections.formationsParGroupe, site.documents, page.url)` |

## Ajouter un composant

1. Le poser dans le fichier de sa famille, en macro, avec un commentaire qui
   dit ce que fait chaque paramètre.
2. L'ajouter à l'inventaire ci-dessus.
3. Reconstruire et **comparer le HTML produit avant et après** : une
   extraction de composant ne doit rien changer au rendu. Le script de
   comparaison utilisé lors de la mise en place compare les 128 pages à
   espaces normalisés et JSON-LD canonisé.

## Points d'attention

- La carte d'aperçu de projet existe en deux exemplaires : la macro
  `apercu_projet` et son équivalent JavaScript dans le filtre `blocs` de
  `eleventy.config.js` (chercher `carteRefItem`). Une retouche sur l'une doit
  être reportée sur l'autre.
- `contact_final` est importé sous le nom `bloc_contact` dans les gabarits,
  parce qu'un champ de front matter s'appelle déjà `contact_final`.
- La page anglaise des formations reçoit `docs = false` : elle n'affiche pas
  les liens catalogue, Qualiopi, accessibilité et CGV, alors que les données
  anglaises les portent. Lui passer `en.site.documents` suffit à les activer.
