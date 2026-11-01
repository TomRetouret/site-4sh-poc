# Protocole des tests contributeurs : Sveltia CMS et Decap CMS

Preuve de concept back-office du site 4SH. Tests avec 5 contributeurs non techniques, semaine du 30 novembre 2026.
Préparation technique : voir `mise-en-place.md`. Schéma des blocs : voir `schema-blocs.md`.
Rédigé le 1er novembre 2026.

## 1. Objectifs

1. **Choisir l'outil** du futur back-office entre Sveltia CMS (`/admin/`) et Decap CMS (`/admin-decap/`), sur une grille pondérée et 4 critères éliminatoires.
2. **Vérifier que des personnes non techniques** savent faire seules les tâches courantes : créer une page, gérer des blocs, enregistrer un brouillon, passer en relecture, publier, prévisualiser.
3. **Vérifier le circuit éditorial** : rien n'arrive en ligne sans publication, et seul un éditeur publie.
4. **Repérer les blocages** à corriger par configuration, libellés ou développement spécifique, quel que soit l'outil retenu.

Ce qu'on ne teste pas : la performance, la mise en production, la migration des contenus existants (estimée à part, critère « coût de migration »).

## 2. Profil des testeurs

- 5 personnes de 4SH qui écriront réellement sur le site : marketing, commerce, recrutement, consultants qui rédigent.
- Aucune connaissance de Git ni de GitHub exigée. À l'aise avec un navigateur et un outil de traitement de texte.
- **À exclure :** les développeurs, les personnes qui ont construit ou vu la preuve de concept, les personnes qui utilisent déjà l'admin actuelle chaque semaine (elles connaissent Sveltia : à noter si on ne peut pas faire autrement).
- Chaque testeur a un compte GitHub invité sur le dépôt de test avec le rôle éditeur (voir `mise-en-place.md`, étape 7) et s'est connecté une fois aux deux outils avant sa session.
- Codes : T1 à T5. Aucun nom dans les grilles.

## 3. Rôles pendant la session

- **Animateur (Tom) :** accueille, lit les consignes, relance, décide quand aider. Ne montre jamais où cliquer avant la fin du temps d'autonomie.
- **Observateur :** chronomètre, remplit la grille, note les verbatims. Vérifie l'état du site en ligne et des demandes de fusion entre deux scénarios.

## 4. Organisation de la semaine

| Jour | Créneau | Testeur | Premier outil |
|---|---|---|---|
| Lundi 30 novembre | matin | T1 | Sveltia |
| Lundi 30 novembre | après-midi | T2 | Decap |
| Mardi 1er décembre | matin | T3 | Sveltia |
| Mardi 1er décembre | après-midi | T4 | Decap |
| Mercredi 2 décembre | matin | T5 | Sveltia |
| Jeudi 3 décembre | | Synthèse et notation (Tom + observateur, 2 h) | |

L'ordre alterné compense l'effet d'apprentissage : le second outil profite toujours de ce qu'on a compris sur le premier.
Prévoir 30 min entre deux sessions pour la remise à zéro du dépôt (`mise-en-place.md`, étape 9).

## 5. Déroulé d'une session de 60 minutes

| Minute | Temps | Contenu |
|---|---|---|
| 0 à 4 | Accueil | Remerciements, but du test, accord pour l'enregistrement d'écran (facultatif) |
| 4 à 6 | Consignes | Lecture du texte ci-dessous |
| 6 à 28 | Outil A | Parcours de base (S1, S2, S3, S7, S5, S6) puis 2 paires tournantes |
| 28 à 31 | Questionnaire A | 10 questions SUS + 3 questions courtes |
| 31 à 53 | Outil B | Mêmes scénarios, sur des contenus distincts |
| 53 à 56 | Questionnaire B | Idem |
| 56 à 60 | Clôture | Préférence et pourquoi, questions libres |

### Parcours de chaque testeur

13 scénarios sur deux outils ne tiennent pas en 44 minutes. Chaque testeur joue donc :

- **le parcours de base**, enchaîné sur une même page : S1 créer, S2 blocs, S3 brouillon incomplet, S7 vrai site, S5 relecture, S6 publier (environ 12 min) ;
- **deux paires tournantes sur trois** (environ 5 min chacune), les mêmes sur les deux outils :
  - paire P1 : S4 (modifier une page publiée) et S10 (restaurer une version publiée) ;
  - paire P2 : S8 (aperçus ordinateur, tablette, mobile) et S9 (de l'aperçu au champ) ;
  - paire P3 : S11 (contenu partagé) et S12 (version anglaise).

| Testeur | Premier outil | Paires |
|---|---|---|
| T1 | Sveltia | P1, P2 |
| T2 | Decap | P2, P3 |
| T3 | Sveltia | P3, P1 |
| T4 | Decap | P1, P2 |
| T5 | Sveltia | P2, P3 |

Chaque paire est jouée par 3 ou 4 testeurs. S13 est joué par l'animateur et l'observateur (section 8).

### Règles de temps et d'aide

- Temps maximal par scénario : **4 minutes** (paires : 3 minutes par scénario).
- Si le testeur est bloqué **2 minutes** sans progresser, ou le demande, l'animateur donne une aide graduée :
  1. reformuler la consigne ;
  2. indiquer la zone de l'écran (« regardez en haut ») ;
  3. montrer.
- Le scénario est alors noté « avec aide ». Au-delà du temps maximal, ou après l'aide 3, il est noté « échec » et on passe au suivant.
- Si un scénario dépend du précédent en échec, l'animateur remet l'état attendu (ou le fait lui-même) sans le compter.

### Texte des consignes (à lire)

> Merci d'être là. On compare deux outils pour modifier le site de 4SH. On teste les outils, pas vous : si quelque chose est difficile, c'est l'outil qui est en cause, et c'est exactement ce qu'on cherche.
> Je vais vous donner des tâches une par une, sur papier. Faites comme si vous étiez seul au bureau. Dites à voix haute ce que vous cherchez, ce que vous pensez, ce qui vous surprend.
> Je ne vous aiderai pas tout de suite. Si vous êtes bloqué, dites-le. Vous pouvez abandonner une tâche à tout moment.
> Tout ce que vous verrez est un site de test. Rien de ce que vous faites n'arrive sur le vrai site. Les contenus marqués [DÉMO] sont fictifs.
> On fera la même chose sur deux outils, avec un petit questionnaire après chacun. Ça dure une heure.

## 6. Les scénarios

Chaque consigne est remise sur une carte imprimée. Elle dit **quoi faire**, jamais **où cliquer**.
Dans les consignes, `Tn` est remplacé par le code du testeur et `[outil]` par S (Sveltia) ou D (Decap), pour que chaque testeur travaille sur des contenus distincts dans chaque outil.

**Important :** les consignes ci-dessous supposent l'option A de la section 11 (pages de démonstration). Avec l'option B, adapter les cartes selon le tableau de la section 11.

Pour chaque scénario, l'observateur note : **résultat** (réussi sans aide / avec aide / échec), **temps**, **erreurs** (fausses pistes, mauvais clic durable, action à refaire, perte de données), **verbatim**.

### Parcours de base

#### S1. Créer une page

- **Consigne :** « 4SH organise une journée portes ouvertes. Créez une nouvelle page pour l'annoncer. Titre : “[DÉMO] Portes ouvertes Tn [outil]”. Ajoutez une phrase d'introduction de votre choix. »
- **Données de départ :** la page n'existe pas.
- **Critère de réussite :** la page existe dans l'outil, avec le bon titre et une introduction, enregistrée au moins en brouillon.
- **À noter :** comment le testeur trouve où créer une page ; s'il comprend le nom de l'adresse (slug) ; s'il cherche un bouton « enregistrer ».

#### S2. Ajouter, déplacer, dupliquer et masquer un bloc

- **Consigne :** « Sur votre page, ajoutez un bloc de chiffres clés avec deux chiffres : “250 visiteurs” et “12 ateliers”. Ajoutez ensuite des questions fréquentes avec une question de votre choix. Placez les questions fréquentes au-dessus des chiffres. Faites une copie du bloc de chiffres. Enfin, faites en sorte que la copie ne s'affiche pas sur le site, sans la supprimer. »
- **Données de départ :** la page de S1, sans bloc ou avec un bloc Hero.
- **Critère de réussite :** 4 actions faites : ajout (chiffres clés, questions fréquentes), déplacement, duplication, masquage (case « Masquer ce bloc » cochée sur la copie, bloc toujours présent).
- **À noter :** chaque action séparément (réussie ou non) ; confusion entre masquer et supprimer ; usage du glisser-déposer ou des flèches ; lecture des résumés de blocs.

#### S3. Enregistrer un brouillon incomplet

- **Consigne :** « On vous appelle en réunion. Ajoutez un bloc d'équipe sur votre page, écrivez seulement le surtitre “Nos équipes”, et mettez votre travail de côté pour le reprendre plus tard. »
- **Données de départ :** la page de S2. Le titre du bloc équipe est obligatoire et reste vide.
- **Critère de réussite :** le travail est enregistré (brouillon visible dans l'outil après rechargement de la page) malgré le champ obligatoire vide, ou l'outil explique clairement pourquoi ce n'est pas possible et le testeur trouve une solution.
- **À noter :** message d'erreur affiché et compréhension ; perte du travail ; le testeur sait-il retrouver son brouillon.

#### S7. Prévisualiser le vrai site

- **Consigne :** « Avant d'aller plus loin, regardez votre page telle qu'elle apparaîtra vraiment sur le site 4SH, avec sa mise en page réelle. »
- **Données de départ :** le brouillon de S3 complété par l'animateur si besoin (titre du bloc équipe rempli), demande de fusion ouverte, aperçu Netlify construit ou en cours.
- **Critère de réussite :** le testeur ouvre l'aperçu Netlify de sa page (adresse `deploy-preview-...`), et non seulement l'aperçu intégré au formulaire, et y voit ses blocs.
- **À noter :** temps d'attente de l'aperçu ; le testeur distingue-t-il l'aperçu intégré du vrai site ; compréhension d'un aperçu « en cours de construction ».

#### S5. Passer en relecture

- **Consigne :** « Votre page est prête. Demandez à votre responsable de la relire avant qu'elle soit mise en ligne. »
- **Données de départ :** le brouillon de S7.
- **Critère de réussite :** le statut du contenu passe à « en relecture » (ou équivalent).
- **À noter :** compréhension des statuts (brouillon, en relecture, prêt) ; le testeur pense-t-il que la page est déjà en ligne.

#### S6. Publier

- **Consigne :** « Vous êtes maintenant le responsable. Vous avez relu la page, elle vous convient. Mettez-la en ligne. »
- **Données de départ :** la page de S5 en relecture. Le compte du testeur a le droit de publier.
- **Critère de réussite :** la page est visible sur le site de test en ligne (l'observateur vérifie l'adresse publique après le déploiement).
- **À noter :** passage par « prêt » ; message pendant l'attente des vérifications ; le testeur sait-il quand c'est vraiment en ligne ; erreur affichée si l'aperçu n'est pas terminé.

### Paire P1

#### S4. Modifier une page publiée sans toucher la version en ligne

- **Consigne :** « La page “[DÉMO] Formation découverte” est en ligne. Changez sa phrase d'introduction pour “Nouvelle session en janvier [DÉMO]”. Votre responsable doit valider avant que le changement apparaisse sur le site : pour l'instant, rien ne doit changer en ligne. »
- **Données de départ :** page « [DÉMO] Formation découverte » publiée, aucune demande de fusion ouverte sur elle.
- **Critère de réussite :** modification enregistrée en brouillon ; la page en ligne garde l'ancienne introduction (l'observateur vérifie).
- **À noter :** peur de « casser le site » ; le testeur sait-il dire si c'est en ligne ou non ; clic sur publier par erreur.

#### S10. Restaurer une version publiée

- **Consigne :** « Hier, quelqu'un a modifié par erreur la page “[DÉMO] Offre d'essai” et l'a mise en ligne. Remettez la page dans l'état où elle était avant cette erreur, puis remettez cette version en ligne. »
- **Données de départ :** page « [DÉMO] Offre d'essai » publiée deux fois : version 1 avec l'introduction « Testez nos services pendant un mois [DÉMO] », version 2 avec « TEXTE MODIFIÉ PAR ERREUR ». Le testeur ne connaît pas le texte de la version 1.
- **Critère de réussite :** la version 1 est de nouveau en ligne, retrouvée par l'outil (historique ou équivalent) et non réécrite de mémoire.
- **À noter :** existence d'un historique ; le testeur le trouve-t-il ; s'il doit passer par GitHub, c'est un échec pour un contributeur. **Critère éliminatoire** (section 10).

### Paire P2

#### S8. Voir les aperçus ordinateur, tablette et mobile

- **Consigne :** « Vérifiez que la page “[DÉMO] Formation découverte” s'affiche bien sur un ordinateur, sur une tablette et sur un téléphone, sans quitter votre poste. »
- **Données de départ :** page publiée, ouverte ou non dans l'outil.
- **Critère de réussite :** le testeur affiche les trois formats (dans l'outil ou dans l'aperçu du site).
- **À noter :** fonction intégrée ou non ; si le testeur redimensionne la fenêtre ou utilise les outils du navigateur, le noter « réussi avec contournement » dans les erreurs.

#### S9. Aller d'un élément de l'aperçu à son champ

- **Consigne :** « Dans l'aperçu de la page d'accueil, vous voyez une faute dans un des chiffres clés. En partant de ce chiffre dans l'aperçu, allez directement à l'endroit où on le corrige. »
- **Données de départ :** accueil FR, bloc Chiffres clés avec la note « [DÉMO] fote volontaire ».
- **Critère de réussite :** un clic (ou deux) sur l'élément de l'aperçu place le testeur dans le bon champ du formulaire. Si l'outil ne le permet pas, noter « non disponible » et chronométrer le temps pour trouver le champ autrement.
- **À noter :** existence de la fonction ; temps pour trouver le champ sans elle.

### Paire P3

#### S11. Modifier un contenu partagé et voir les pages concernées

- **Consigne :** « Le témoignage de démonstration “[DÉMO] Camille Exemple” doit être raccourci. Remplacez sa citation par “Une équipe à l'écoute. [DÉMO]”. Avant d'enregistrer, trouvez sur quelles pages du site ce témoignage apparaît. »
- **Données de départ :** témoignage de démonstration (section 11) relié à un projet du bloc Projets de l'accueil FR.
- **Critère de réussite :** citation modifiée en brouillon ; le testeur cite l'accueil comme page concernée, et voit la nouvelle citation dans un aperçu.
- **À noter :** l'outil montre-t-il les pages qui utilisent le témoignage ; le testeur comprend-il que la modification touche plusieurs endroits ; ne jamais laisser modifier un témoignage réel.

#### S12. Modifier la version anglaise

- **Consigne :** « Sur la version anglaise de la page d'accueil, remplacez le texte du bouton principal par “Talk to us [DEMO]”. La version française ne doit pas changer. »
- **Données de départ :** accueil EN et FR dans leur état de départ.
- **Critère de réussite :** bouton principal de l'accueil EN modifié en brouillon ; accueil FR inchangé.
- **À noter :** comment le testeur passe d'une langue à l'autre ; modification par erreur de la version française.

### S13. Se connecter à plusieurs avec des droits différents (animateur)

Joué une fois par outil, pendant la répétition générale ou le jeudi 3 décembre, par l'animateur (compte éditeur) et l'observateur (compte contributeur), dans deux navigateurs.

- **Consigne :** « Le contributeur crée “[DÉMO] Actualité S13 [outil]”, l'enregistre et la passe en relecture. Il essaie de la publier. L'éditeur la retrouve, corrige un mot, la passe à “prêt” et la publie. Pendant ce temps, le contributeur ouvre la même page. »
- **Données de départ :** deux comptes invités (Write) ; seul l'éditeur peut pousser sur `main` (protection de branche).
- **Critère de réussite :** le contributeur ne peut pas publier, ou reçoit un refus clair ; l'éditeur publie ; aucune modification n'est écrasée sans avertissement ; chacun voit le bon statut.
- **À noter :** message vu par le contributeur ; publication proposée puis refusée (moins bien) ou absente (mieux) ; comportement quand deux personnes ouvrent le même contenu ; attente de l'aperçu à la publication. **Critère éliminatoire** (section 10).

## 7. Grille d'observation

Une grille par testeur et par outil. Résultat : **S** = réussi sans aide, **A** = avec aide (niveau 1, 2 ou 3), **E** = échec, **N** = non joué, **ND** = fonction non disponible.

| Testeur : T__ | Outil : Sveltia / Decap | Ordre : 1er / 2e | Date : |

| Scénario | Résultat (S / A1 / A2 / A3 / E / N / ND) | Temps (mm:ss) | Erreurs (nombre et nature) | Verbatim |
|---|---|---|---|---|
| S1 Créer une page | | | | |
| S2a Ajouter un bloc | | | | |
| S2b Déplacer un bloc | | | | |
| S2c Dupliquer un bloc | | | | |
| S2d Masquer un bloc | | | | |
| S3 Brouillon incomplet | | | | |
| S7 Vrai site | | | | |
| S5 Relecture | | | | |
| S6 Publier | | | | |
| S4 Page publiée intacte | | | | |
| S10 Restaurer | | | | |
| S8 Trois formats | | | | |
| S9 Aperçu vers champ | | | | |
| S11 Contenu partagé | | | | |
| S12 Version anglaise | | | | |

Contrôles de l'observateur pendant la session :

- [ ] Après S4 : la page en ligne est inchangée.
- [ ] Après S6 : la page est en ligne (heure de mise en ligne : ____).
- [ ] Après S12 : l'accueil FR est inchangé.
- [ ] Avant l'outil B : aucune demande de fusion ouverte sur les contenus que le testeur va toucher.

Remarques générales (incidents techniques, temps d'attente des aperçus, bugs) :

## 8. Questionnaire après chaque outil

### 8.1 Échelle SUS (10 questions)

Réponse de 1 (pas du tout d'accord) à 5 (tout à fait d'accord).

1. Je pense que j'aimerais utiliser cet outil régulièrement.
2. J'ai trouvé cet outil inutilement compliqué.
3. J'ai trouvé cet outil facile à utiliser.
4. Je pense que j'aurais besoin de l'aide d'une personne technique pour utiliser cet outil.
5. J'ai trouvé que les différentes fonctions de cet outil étaient bien intégrées.
6. J'ai trouvé qu'il y avait trop d'incohérences dans cet outil.
7. J'imagine que la plupart des gens apprendraient très vite à utiliser cet outil.
8. J'ai trouvé cet outil très lourd à utiliser.
9. Je me suis senti en confiance en utilisant cet outil.
10. J'ai dû apprendre beaucoup de choses avant de pouvoir utiliser cet outil.

**Calcul :** pour les questions impaires, note moins 1 ; pour les paires, 5 moins la note. Additionner les 10 résultats et multiplier par 2,5. On obtient un score de 0 à 100. Repère courant : 68 est la moyenne ; en dessous de 50, l'outil pose problème.

Note : traduction de travail. Une traduction française validée existe (F-SUS, Gronier et Baudet, 2021) ; la reprendre mot pour mot si on veut comparer avec d'autres études.

### 8.2 Trois questions courtes

1. Sur une échelle de 1 à 5, à quel point étiez-vous sûr de savoir si votre travail était en ligne ou non ?
2. Qu'est-ce qui vous a le plus gêné ?
3. Qu'est-ce qui vous a le plus plu ?

### 8.3 En clôture (après les deux outils)

- Si vous deviez utiliser un des deux outils chaque semaine, lequel choisiriez-vous ? Pourquoi ?
- Y a-t-il une tâche que vous n'auriez pas osé faire seul ?

## 9. Grille de notation

Remplie le jeudi 3 décembre par Tom et l'observateur. Chaque critère reçoit une note de 0 à 5 par outil. Note pondérée = note × poids. Total sur 5, puis sur 100 (× 20).

| Critère | Poids | Comment on note (0 à 5) | Sveltia | Decap |
|---|---|---|---|---|
| Réussite des contributeurs | 30 % | 5 × moyenne des points sur S1 à S12 (S = 1, A1 ou A2 = 0,5, A3 ou E = 0). Le score SUS moyen sert à départager deux notes proches. | | |
| Circuit de publication | 15 % | Réussite de S3, S4, S5, S6, S10 ; clarté des statuts ; attente de l'aperçu avant fusion ; aucun contenu en ligne par erreur | | |
| Aperçu | 15 % | Réussite de S7, S8, S9 ; fidélité de l'aperçu intégré au vrai site ; délai de l'aperçu Netlify | | |
| Écart à l'interface à trois zones | 10 % | 5 = structure de la page, formulaire du bloc et aperçu visibles ensemble, sans développement ; 0 = très loin de la cible | | |
| Développement spécifique | 10 % | 5 = aucun code à écrire au-delà de la configuration ; 0 = gabarits d'aperçu, composants et contournements lourds. Estimation par le développeur, en jours | | |
| Connexion et droits | 10 % | Résultat de S13 ; simplicité de la connexion (étape 6 de la mise en place) ; droits contributeur et éditeur respectés | | |
| Exploitation et maintenance | 5 % | Rythme des versions, activité du projet, dépendances à héberger (Worker d'authentification), facilité de mise à jour | | |
| Coût de migration | 5 % | Effort pour passer de l'admin actuelle à l'outil (configuration, contenus, formation) | | |
| **Total pondéré (sur 5)** | 100 % | | | |
| **Total (sur 100)** | | | | |

Note sur « l'interface à trois zones » : il s'agit de la cible d'ergonomie du projet (structure de la page, formulaire, aperçu). Préciser la définition retenue par écrit avant la notation, pour noter les deux outils sur la même base.

## 10. Critères éliminatoires

Un outil qui ne satisfait pas l'un de ces quatre critères est écarté, quelle que soit sa note. Un critère est « satisfait » si la fonction existe et marche, même si un testeur a eu besoin d'aide ; il est « non satisfait » si elle n'existe pas ou ne marche pas, même avec l'aide de l'animateur.

| Critère éliminatoire | Vérifié par | Sveltia | Decap |
|---|---|---|---|
| 1. Enregistrer un brouillon sans toucher la version en ligne | S3, S4 | oui / non | oui / non |
| 2. Voir l'aperçu du vrai site avant publication | S7 | oui / non | oui / non |
| 3. Restaurer une version publiée depuis l'outil | S10 | oui / non | oui / non |
| 4. Plusieurs contributeurs avec des droits distincts | S13 | oui / non | oui / non |

Si les deux outils échouent sur le même critère, la décision revient à Tom : développement spécifique, contournement accepté, ou autre outil.

## 11. Jeu de données de départ à préparer

À mettre en place dans le dépôt de test avant la répétition générale, puis à figer avec l'étiquette `etat-depart` (voir `mise-en-place.md`, étape 9).

**Règles :**

- Tout contenu fictif porte « [DÉMO] » dans son titre ou son texte.
- Aucun contenu fictif n'est attribué à un vrai client, une vraie entreprise ou une vraie personne.
- Les témoignages réels amorcés depuis `logiciel_metier.json` ne sont touchés par aucun scénario.
- Le dépôt de test ne revient jamais vers le dépôt du site réel.

| Contenu | Détail | Pour |
|---|---|---|
| Témoignage de démonstration | Fichier `src/_data/temoignages/fr/demo-camille-exemple.json` : citation « Un accompagnement clair du début à la fin. [DÉMO] », auteur « [DÉMO] Camille Exemple », fonction « Personne fictive », entreprise « Entreprise fictive (démonstration) » | S11 |
| Lien du témoignage | Un projet du bloc Projets de l'accueil FR pointe vers `demo-camille-exemple` (projet de démonstration, client « [DÉMO] Client fictif ») | S11 |
| Page « [DÉMO] Formation découverte » (option A) | Publiée, introduction « Prochaine session en mars [DÉMO] », un bloc Hero et un bloc Chiffres clés | S4, S8 |
| Page « [DÉMO] Offre d'essai » (option A) | Publiée en deux commits successifs : version 1 « Testez nos services pendant un mois [DÉMO] », puis version 2 « TEXTE MODIFIÉ PAR ERREUR » | S10 |
| Accueil FR | Note d'un chiffre clé remplacée par « [DÉMO] fote volontaire » | S9 |
| Accueil EN | État d'origine | S12 |
| Témoignages « [DÉMO] Alex Exemple » et « [DÉMO] Dominique Exemple » (option B) | Personnes et entreprises fictives, publiés ; Dominique publié deux fois comme pour S10 | S4, S10 |
| Images | 2 ou 3 images libres de droits déjà présentes dans `src/uploads`, avec texte alternatif | S2 (si le testeur ajoute une image) |
| Demandes de fusion | Aucune ouverte | toutes les sessions |
| Cartes de consigne | 13 cartes imprimées par outil et par testeur, avec `Tn` et `[outil]` déjà remplis | toutes les sessions |

**Écart avec la preuve de concept au 1er novembre 2026, à trancher avant le 20 novembre :**

La configuration ne contient **aucune collection de pages construites par blocs** : les blocs n'existent que sur la page d'accueil, et Decap ne propose que l'accueil et les témoignages (voir `natif-config-specifique.md`). Les scénarios S1, S2 et S4 à S10 supposent pourtant des pages créables. Deux options :

- **Option A (recommandée) :** le développeur ajoute dans les deux outils une collection « Pages de démonstration » (un fichier par page, mêmes 11 blocs que l'accueil, gabarit Eleventy qui réutilise le rendu de l'accueil). Le protocole s'applique tel quel. Effort à estimer par le développeur.
- **Option B (sans développement) :** on adapte les données des scénarios comme suit.

| Scénario | Option A (pages de démonstration) | Option B (sans développement) |
|---|---|---|
| S1 | Créer « [DÉMO] Portes ouvertes Tn [outil] » | Créer le témoignage « [DÉMO] Témoignage Tn [outil] » (création d'un contenu, sans blocs) |
| S2, S3, S7, S5, S6 | Sur la page créée en S1 | Sur l'accueil FR (chaque session repart de `etat-depart`) |
| S4 | Page « [DÉMO] Formation découverte » | Témoignage publié « [DÉMO] Alex Exemple » |
| S8, S9 | Page « [DÉMO] Formation découverte », accueil FR | Accueil FR |
| S10 | Page « [DÉMO] Offre d'essai » | Témoignage « [DÉMO] Dominique Exemple », publié deux fois (version 1 puis « TEXTE MODIFIÉ PAR ERREUR ») |
| S11, S12 | Inchangés | Inchangés |

Avec l'option B, S1 ne mesure plus la création d'une page : le noter dans la synthèse. Chez Sveltia, l'accueil FR et l'accueil EN forment un seul contenu (deux langues) : un testeur qui joue S4 ou S12 après le parcours de base travaille sur un contenu déjà publié, sans conflit.

**Restauration (S10) :** d'après `natif-config-specifique.md`, aucun des deux outils n'a de restauration native d'une version publiée (Sveltia montre l'historique sans bouton de restauration, Decap n'a pas d'historique). S'attendre à « ND » pour les deux, donc au critère éliminatoire 3 non satisfait des deux côtés. Préparer dès maintenant la décision de la section 10 (contournement accepté, développement spécifique, ou autre outil). Le scénario reste joué pour mesurer ce que fait un contributeur face à ce besoin.

**Autres vérifications avec le développeur :**

- Un brouillon incomplet (S3) ne doit pas faire échouer le build Eleventy de l'aperçu. Sinon l'aperçu de S7 sera rouge (la doc Sveltia signale ce cas pour les schémas stricts). Sveltia est configuré avec `allow_incomplete_drafts: true` ; Decap n'a pas d'équivalent connu.
- `site_url` des deux configurations doit pointer vers le site de test, sinon S7 envoie vers le vrai site.

## 12. Après les tests

- Synthèse en une page : note pondérée, critères éliminatoires, 5 principaux blocages par outil avec verbatims, recommandation.
- Liste des corrections de configuration ou de libellés à faire quel que soit l'outil.
- Archiver les grilles (codes testeurs uniquement) dans `docs/back-office/`.
