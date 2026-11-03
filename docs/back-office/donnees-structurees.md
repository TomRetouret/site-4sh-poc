# Données structurées (schema.org)

Balisage JSON-LD lu par les moteurs de recherche et les assistants IA, invisible sur les pages. Il est généré à chaque
construction du site, à partir des contenus déjà saisis : rien à ressaisir. Mise en place : 3 novembre 2026.

## Ce qui est généré

| Schéma | Pages | Source |
|---|---|---|
| Organisation (`Organization`) | toutes | Réglages · Données structurées (`src/_data/donnees_structurees.json`) : nom, logo, adresses, téléphone, réseaux |
| Fil d'Ariane (`BreadcrumbList`) | toutes celles qui affichent un fil d'Ariane | le fil d'Ariane affiché (`<nav class="fil-ariane">`) |
| FAQ (`FAQPage`) | toutes celles qui affichent des questions fréquentes | les questions et réponses affichées (blocs `.faq`) |
| Cours (`Course`) | fiches formation | titre, accroche, prix, sessions à venir, durée, note et nombre d'avis de la fiche ; modalités et devise dans les Réglages |
| Étude de cas (`Article`) | fiches référence | grand titre, sous-titre, visuel, date de mise à jour, client |
| JSON-LD personnalisé | page par page | champ réservé à l'agence SEO (voir plus bas) |

Le schéma suit toujours ce qui est affiché : une question ajoutée à une FAQ, un prix ou une session modifiés sont repris
au build suivant.

## Où régler

- **Réglages · Données structurées** : activer ou couper un schéma sur tout le site ; fiche Organisation ; modalités des cours.
- **Groupe « Données structurées » du Référencement de chaque page** (replié, à ne toucher qu'en cas de besoin) :
  - FAQ, Fil d'Ariane, Schéma propre à la page : décocher pour ne pas générer ce schéma sur cette page ;
  - JSON-LD personnalisé : un objet JSON ou une liste d'objets schema.org, sans balise `<script>`, ajouté tel quel
    (`@context` ajouté s'il manque). Exemple : `{"@type": "Event", "name": "Meetup 4SH", "startDate": "2027-03-12"}`.

## Contrôles

À la construction du site, les problèmes sont signalés par des lignes `[données structurées] <adresse> : <message>`
(journal Netlify), sans bloquer la mise en ligne : JSON personnalisé invalide (ignoré), objet sans `@type` (ignoré),
formation sans prix ou sans durée.

Tester une page publiée :
- Google, test des résultats enrichis : https://search.google.com/test/rich-results
- Validateur schema.org (tous les types) : https://validator.schema.org

Bon à savoir : depuis 2023, Google n'affiche plus les FAQ en résultats enrichis, sauf pour des sites officiels de l'État ou
de santé. Le balisage reste valide et utilisé par d'autres moteurs.

## Technique

- `eleventy/donnees-structurees.js` : filtres `donneesStructurees` (écrit les scripts dans le `<head>`) et `sansJsonLd`
  (retire du corps de page les JSON-LD écrits par les composants, pour éviter les doublons).
- `src/_includes/base.njk` : appel des deux filtres. Réglages de page : `referencement.donnees_structurees` (fiches Markdown)
  ou `seo.donnees_structurees` (pages en JSON, exposé par leur `.11tydata.js` sous `donnees_structurees_page`).
- CMS : groupe défini une fois dans `admin/config/collections/010-formations.yml` (ancres `&f_donnees_structurees`, et
  `&f_donnees_structurees_i18n` dans `090-accueil.yml` pour les pages bilingues), réutilisé par alias ; fichier de réglages
  dans `130-seo.yml`. Après modification : `node scripts/assembler-config.js`.
- Ajouter un schéma automatique : une fonction dans `eleventy/donnees-structurees.js`, un interrupteur dans `activer`.
