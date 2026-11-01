# Schéma des fiches formation (Sveltia CMS)

Preuve de concept back-office, branche `poc/back-office`. La fiche formation reste une collection structurée : un gabarit fixe (`src/_includes/formation.njk`) alimenté par la fiche, sans constructeur de pages libre. Correspondance champ par champ avec l'ancien schéma : `correspondance-champs.md` et `correspondance-champs.csv` (lignes Formation).

## Fichiers

| Rôle | Fichier |
|---|---|
| Configuration de la collection Formations | `admin/config/collections/010-formations.yml` |
| Configuration de la collection Équipe | `admin/config/collections/015-equipe.yml` |
| Fiches (48) | `src/content/formations/<slug>.md` (front matter + description en corps de texte) |
| Fiches Équipe (5) | `src/_data/equipe/<slug>.json`, lues par le site comme donnée globale `equipe` |
| Mise en forme (prix, durée, note, sessions, formateur) | `eleventy/formations.js` |
| Données calculées de chaque fiche | `src/content/formations/formations.11tydata.js` |
| Aperçus dans Sveltia | `admin-shared/apercus-formations.js` (gabarits `formations` et `equipe`) |
| Migration de l'ancien format | `scripts/migrer-formations.js` |

Après toute modification d'un fichier de `admin/config/collections/`, lancer `node scripts/assembler-config.js`.

## Groupes du formulaire, dans l'ordre de la page

Obligatoire = exigé pour passer en relecture ou publier. Un brouillon incomplet reste enregistrable (`allow_incomplete_drafts`).

| Groupe (clé) | Champ (clé) | Type | Obligatoire | Affichage |
|---|---|---|---|---|
| En-tête (`entete`) | Nom de la formation (`titre`) | texte | oui | « Formation <nom> » dans le H1, le fil d'Ariane, le catalogue |
| | Complément du titre (`sous_titre`) | texte | non | en rouge après le nom (sans tiret) |
| | Niveau (`niveau`) | liste : Essentiel, Fondamental, Intermédiaire, Avancé | oui | sélecteur de niveau, pré-inscription, tri |
| | Famille (`groupe`) | texte, minuscules sans espace | non | regroupe les niveaux au catalogue |
| | Catégorie (`categorie`) | relation vers Catégories | oui | fil d'Ariane, surtitre, autres formations |
| | Accroche (`chapo`) | texte long | oui | sous le titre, description SEO par défaut, carte du catalogue |
| | Logo ou illustration (`image`) | image ou lien | non | visuel de la fiche et du catalogue |
| Inscription (`inscription`) | Prix par participant (`prix`) | nombre entier, € HT | oui | « 1500 € HT » ; « à partir de » au catalogue |
| | Afficher « À partir de » (`prix_a_partir`) | case | non | « À partir de 700 € HT » |
| | Prochaines sessions (`sessions[]`) | liste de `debut` / `fin` (dates, obligatoires dans chaque session) | non | « Du JJ/MM/AAAA au JJ/MM/AAAA », « Le JJ/MM/AAAA » si un seul jour |
| | Programme détaillé (`programme_pdf`) | lien | oui (Qualiopi) | carte Documents |
| | Poids du PDF (`programme_pdf_poids`) | texte | non | « (PDF, 724 Ko) » |
| Chiffres clés (`chiffres`) | Durée en jours (`duree_jours`) | nombre (pas de 0,5) | non | « 3 jours », « 1,5 jours », « 1/2 journée » |
| | Durée en heures (`duree_heures`) | nombre (pas de 0,5) | non | « (21h00) », « (3h30) » |
| | Durée, saisie libre (`duree_texte`) | texte | non | remplace jours et heures ; partie avant la parenthèse en gras |
| | Participants minimum (`participants_min`) | nombre entier, défaut 1 | non | « 1 à 8 personnes » |
| | Participants maximum (`participants_max`) | nombre entier | oui | |
| | Note moyenne (`note`) | nombre de 0 à 5 | non | « 4,7 / 5 » |
| | Nombre d'avis (`avis`) | nombre entier | non | « · 12 avis » |
| | Proposée depuis (`depuis`) | texte | non | « Depuis janvier 2023 » |
| | Part de théorie (`theorie`) | nombre de 0 à 100 | non | barre théorie / pratique ; pratique = 100 moins la théorie (calculée) |
| Description (`body`) | | texte mis en forme | oui | section Description |
| Public visé et prérequis (`public`) | Public visé (`pour_qui`) | texte long | oui (Qualiopi) | « Pour qui ? » |
| | Prérequis (`prerequis[]`) | liste de textes, au moins 1 | oui (Qualiopi) | « Prérequis » |
| Objectifs pédagogiques (`objectifs[]`) | | liste de textes, au moins 1 | oui (Qualiopi) | section Objectifs |
| Programme (`programme[]`) | Titre du chapitre (`titre`), Points abordés (`points[]`) | liste | oui (Qualiopi) | accordéon, premier chapitre ouvert |
| Formateur (`formateur`) | Personne (`personne`) | relation vers Équipe (slug) | non | section Formateur (absente si vide) |
| | Fonction propre à cette formation (`fonction`) | texte | non | remplace la fonction de la fiche Équipe |
| | Présentation propre à cette formation (`presentation`) | texte, paragraphes séparés par une ligne vide | non | remplace la présentation de la fiche Équipe |
| Questions fréquentes (`faq[]`) | `question`, `reponse` | liste | non | accordéon |
| Référencement (`referencement`, replié) | Titre SEO (`meta_title`) | texte | non | onglet ; vide = « Formation <nom> - 4SH » |
| | Description SEO (`meta_description`) | texte long | non | vide = accroche |
| | Afficher dans les moteurs de recherche (`indexation`) | case, cochée par défaut | non | décochée = `noindex` et absente du plan du site |

Le groupe Référencement s'appelle `referencement` et non `seo` : une clé `seo` dans la fiche masquerait la donnée globale `seo` (`src/_data/seo.json`) que lit `base.njk` (adresse canonique, indexation du site).

## Équipe (`src/_data/equipe/<slug>.json`)

| Champ (clé) | Type | Obligatoire |
|---|---|---|
| Prénom et nom (`nom`) | texte | oui |
| Fonction (`fonction`) | texte | non |
| Photo (`photo`) | image ou lien | non |
| Texte alternatif de la photo (`photo_alt`) | texte | non |
| Courte présentation (`presentation`) | texte, paragraphes séparés par une ligne vide | non |

Le slug (nom du fichier) est fixé à la création : renommer la personne ne casse pas les relations. Sur les fiches formation, le texte alternatif de la photo reste « <nom>, formateur <formation> chez 4SH » (rendu inchangé) ; `photo_alt` est prévu pour les autres usages (bloc Équipe).

## Rendu

`formations.11tydata.js` remet les groupes à plat sous les anciens noms (`titre`, `prix`, `duree`, `participants`, `note`, `sessions`, `pratique`, `noindex`...) avec les fonctions de `eleventy/formations.js`. Les gabarits, le catalogue (`composants/catalogue.njk`), les pages de catégorie et les collections `formations` et `formationsParGroupe` de `eleventy.config.js` lisent donc les mêmes valeurs qu'avant. Seules différences dans `formation.njk` : `chap.points` au lieu de `chap.items`, et `formateur_vue` (fiche Équipe résolue) au lieu de `formateur`.

Sessions passées : une session est masquée dès que sa date de début est antérieure à la date du build (heure de Paris). Si toutes sont masquées, le bloc « Prochaine(s) session(s) » disparaît. Le site étant statique, il faut reconstruire pour que le masquage avance : prévoir une reconstruction quotidienne (par exemple un déclenchement planifié du déploiement Netlify). La variable `DATE_REFERENCE_SESSIONS=AAAA-MM-JJ` force la date de référence (contrôle de non-régression).

## Migration

`node scripts/migrer-formations.js [--essai]` : lit toutes les fiches, convertit, vérifie chaque valeur en la remettant en forme avec les fonctions du site (une valeur dont le rendu diffère est signalée et sa fiche n'est pas écrite), crée les fiches Équipe absentes, copie les originaux dans `~/sauvegarde-formations/<horodatage>/`. Idempotent : une fiche déjà convertie n'est pas réécrite.

Formateurs : pour chaque personne, la fiche Équipe reprend la fonction, la photo et la présentation les plus fréquentes ; une fiche formation qui diffère garde sa fonction ou sa présentation dans les champs « propre à cette formation » (6 fonctions et 14 présentations sur 21 fiches).

## À tester dans Sveltia

- Chemins à point (`entete.titre`) dans `identifier_field`, `summary` et `sortable_fields` (la documentation ne les mentionne que pour les slugs).
- Écriture des dates de session : Sveltia les écrit sans guillemets en YAML ; le rendu accepte les deux formes.
- Suppression d'une fiche Équipe reliée (bloquée selon la documentation).
