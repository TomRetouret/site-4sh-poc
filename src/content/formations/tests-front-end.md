---
entete:
  titre: Tests Front End
  sous_titre: Les fondamentaux
  niveau: Fondamental
  groupe: tests-front-end
  categorie: Develop
  chapo: Assurez la fiabilité de votre application grâce aux tests front end.
  image: /uploads/ancien-site/assets/img/svg/trainings/tests-frontend-fondamental.svg
inscription:
  prix: 2250
  sessions:
    - debut: '2026-12-07'
      fin: '2026-12-09'
  programme_pdf: https://drive.google.com/file/d/1kcftfgi9Ec2-TzRC7G4YKRWx7Gbh4bcJ/view
  programme_pdf_poids: 726 Ko
chiffres:
  duree_jours: 3
  duree_heures: 21
  participants_min: 1
  participants_max: 8
  depuis: janvier 2023
  theorie: 60
  avis: 0
public:
  pour_qui: |-
    Cette formation s'adresse à des développeurs d'applications mobiles (Android, iOS), des développeurs full stack, des tech leads et des architectes techniques souhaitant étendre leurs compétences vers le développement multiplateforme avec Kotlin.

    Elle est particulièrement pertinente pour les équipes cherchant à partager du code entre différentes plateformes et à optimiser leur processus de développement.
  prerequis:
    - Connaissance de base du langage Kotlin
    - Expérience en développement mobile (Android ou iOS)
    - Notions de programmation orientée objet
    - Une connaissance préalable de Swift est un plus pour la partie iOS, mais n'est pas obligatoire
    - Une connaissance préalable de JavaScript / TypeScript est un plus pour la partie JS, mais n'est pas obligatoire
objectifs:
  - Comprendre et choisir la bonne stratégie de tests
  - Savoir tester unitairement des composants et fonctions JS/TS
  - Savoir mocker des dépendances
  - Savoir écrire et maintenir des tests E2E robustes
  - Savoir tirer parti de l'outillage autours des tests dans un processus industrialisé
programme:
  - partie: Module 1
    titre: Comprendre les tests frontend et leurs enjeux
    points:
      - Pourquoi tester ?
      - Pyramide de tests & stratégie de couverture
      - '- Unitaire vs intégration vs e2e'
      - '- Coût, maintenance, rapidité'
      - Tests frontend spécifiques
      - '- DOM, événements, async, mocks, accessibilité, visual testing'
      - '- Gestion de l’état (store, props, contextes)'
      - Bonnes pratiques
      - '- Tests isolés, lisibles, maintenables'
      - '- CI/CD et automatisation'
      - 'Tour d''horizon du test frontend : Jest, Vitest, Testing Library, Cypress, Playwright, MSW…'
  - partie: Module 2
    titre: Tests unitaires frontend avec Vitest
    points:
      - Présentation de Vitest
      - '- Configuration, comparaison avec Jest, rapidité, intégration TS/Vite'
      - '- Fichiers de test, commandes, coverage'
      - Tester des fonctions pures
      - '- Tests simples'
      - '- Test aux limites'
      - '- Property based testing'
      - Tester des composants UI avec Testing Library
      - '- Render, queries (getByText, findByRole, etc.), events, assertions'
      - '- Tests async (await, timers, useEffect…)'
      - '- Exemple avec un composant formulaire'
      - Mocking
      - '- Mock de modules (fetch, axios, etc.), timers, hooks custom'
      - '- Mock de stores (Pinia, Vuex, Zustand...)'
      - 'Spécificités avec votre framework: Angular | Vue | React (au choix)'
      - Coverage & intégration CI
      - '- Rapport de couverture'
      - '- Seuils'
      - '- GitHub Actions'
      - Structurer les tests dans un projet réel
      - '- Convention de nommage'
      - '- Dossiers'
      - '- Isolation logique'
  - partie: Module 3
    titre: Tests end-to-end avec Playwright
    points:
      - Présentation de Playwright
      - '- Comparaison avec Cypress, Puppeteer'
      - '- Navigation, multibrowser, auto-waiting, screenshots'
      - Installation et configuration
      - '- Playwright Test Runner'
      - '- Browsers (Chromium, Firefox, WebKit), headless mode'
      - Structure d’un test E2E
      - '- Page model, navigation, assertions, fixtures'
      - '- Sélecteurs robustes, rôles, accessibilité'
      - Scénarios utilisateur courants
      - '- Login / logout'
      - '- Formulaires, validation, erreurs serveur'
      - '- Navigation, composants dynamiques'
      - Screenshots, vidéos, debug interactif
      - Mock d’API avec Playwright
      - '- Route interception'
      - '- Fixtures'
      - '- Réponses simulées'
      - 'Spécificités avec votre framework : Angular | Vue | React (au choix)'
      - Tests parallèles & configuration CI
      - '- CI GitHub'
      - '- Tests par navigateur'
      - '- Reporting'
formations_liees:
  - angular-fondamental
intertitres:
  description: Description formation Tests FrontEnd
  programme: Programme formation Tests FrontEnd
referencement:
  meta_title: 'Formation Tests FrontEnd : formation et développement de compétences tests frontEnd'
  meta_description: 'Formation 4SH Test Front-End : maîtrisez les tests unitaires, d''intégration et end-to-end avec Jest, Testing Library et Cypress pour vos applications web.'
  indexation: true
---
Assurer la fiabilité d’une application frontend passe aujourd’hui par une stratégie de tests robuste et bien maîtrisée. Cette formation vous propose d’adopter les bons réflexes pour tester efficacement vos interfaces web, depuis la logique métier jusqu’aux parcours utilisateurs les plus critiques.

Vous apprendrez à concevoir des tests automatisés pertinents, maintenables et alignés sur les besoins réels de votre projet. Grâce à un accompagnement progressif, mêlant théorie, bonnes pratiques et mises en situation concrètes, vous serez en mesure d’intégrer le test dans votre quotidien de développement.

En fonction de vos besoins, il est possible de personnaliser en amont certaines parties de la formation pour s'adapter à votre stack technique (React, Vue, Angular) ainsi qu'aux outils de test utilisés dans votre contexte (par exemple : Vitest pour les TU, Playwright pour les tests E2E, etc.).
