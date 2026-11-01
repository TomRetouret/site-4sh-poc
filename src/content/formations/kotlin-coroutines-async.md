---
titre: "Kotlin : asynchronicité avec les coroutines"
groupe: "kotlin-coroutines-async"
sous_titre: "Intermédiaire"
categorie: "Develop"
niveau: "Intermédiaire"
chapo: "Maîtrisez l'asynchronicité en Kotlin grâce aux coroutines."
meta_title: "Formation Kotlin Coroutines : Maîtrisez l'asynchronicité en Kotlin"
meta_description: "Maîtrisez l'asynchronicité en Kotlin grâce aux coroutines. Formation intermédiaire pour créer un code fluide, réactif et performant."
prix: "3500 € HT"
duree: "<b>1 jour</b> (7h00)"
participants: "1 à 8"
note: "4,5 / 5"
avis: 6
depuis: "janvier 2023"
theorie: 60
pratique: 40
image: "/uploads/ancien-site/assets/img/svg/trainings/kotlin-asynchronicite-coroutines-fondamental.svg"
sessions:
  - "Le 25/09/2026"
pour_qui: "Cette formation s'adresse aux développeurs Kotlin, aux architectes logiciels et aux leads techniques souhaitant approfondir leurs connaissances en programmation asynchrone avec Kotlin. Elle convient particulièrement aux professionnels travaillant sur des applications mobiles Android, des services backend, ou des applications réactives nécessitant une gestion efficace de la concurrence."
prerequis:
  - "Bonnes connaissances du langage Kotlin (syntaxe de base, fonctions, classes, lambdas)"
  - "Expérience préalable en développement d'applications (mobile ou backend)"
  - "Familiarité avec les concepts de base de la programmation asynchrone (callbacks, futures, promesses)"
objectifs:
  - "Comprendre les fondements théoriques et le fonctionnement interne des coroutines Kotlin"
  - "Implémenter des solutions asynchrones élégantes avec les coroutines"
  - "Maîtriser les différents contextes d'exécution et dispatchers pour optimiser les performances"
  - "Gérer efficacement le cycle de vie des coroutines via les scopes et la cancellation"
  - "Composer des tâches asynchrones complexes à l'aide des builders de coroutines"
  - "Implémenter des flux de données réactifs avec les Kotlin Flows"
  - "Savoir tester correctement du code asynchrone basé sur les coroutines"
programme:
  - titre: "Principe des coroutines"
    items: ["Concept et historique des coroutines", "Différence entre threads et coroutines", "Les suspending functions et leur fonctionnement", "Séquentialité apparente du code asynchrone"]
  - titre: "Les contextes de coroutines"
    items: ["Éléments de contexte (Job, Dispatcher, CoroutineExceptionHandler)", "Héritage de contexte", "Combinaison et personnalisation des contextes", "Dispatchers prédéfinis (Default, IO, Main, Unconfined)"]
  - titre: "Le pattern de l'event-loop"
    items: ["Concept de l'event-loop dans la programmation asynchrone", "Implémentation avec les coroutines", "Cas d'utilisation pratiques"]
  - titre: "L'API pour créer et exécuter une coroutine"
    items: ["Coroutine builders : launch, async, runBlocking", "Différences et cas d'utilisation appropriés", "Gestion des retours de résultats avec Deferred"]
  - titre: "Les scopes et la cancelability"
    items: ["Concept de CoroutineScope", "Gestion du cycle de vie des coroutines", "Implémentation de la cancellation et des timeouts", "Coopération et points de suspension"]
  - titre: "Les flows, hot et cold"
    items: ["Introduction aux Kotlin Flows", "Différences entre hot flows et cold flows", "StateFlow et SharedFlow", "Transformation d'autres sources réactives en Flow"]
  - titre: "Les opérateurs de flow"
    items: ["Opérateurs de transformation (map, filter, etc.)", "Opérateurs de combinaison (zip, combine, merge)", "Opérateurs de contrôle d'erreur et de complétion", "Opérateurs de contexte et de buffer"]
  - titre: "Les tests avec des coroutines"
    items: ["TestCoroutineDispatcher et TestCoroutineScope", "Simulation du temps avec runBlockingTest", "Techniques avancées pour tester le code asynchrone", "Bonnes pratiques et pièges à éviter"]
programme_pdf: "https://drive.google.com/file/d/1Mp33DjpiL0TjbmMngU4wSm40p6EXGl0q/view"
programme_pdf_poids: "675 Ko"
---
Les coroutines Kotlin constituent une solution pour la programmation asynchrone, offrant un mécanisme léger qui permet de suspendre l'exécution d'une fonction sans bloquer le thread sous-jacent, ce qui facilite l'écriture de code asynchrone de manière séquentielle et plus lisible.

Cette formation a pour objectif de permettre aux développeurs de maîtriser les concepts fondamentaux et avancés des coroutines en Kotlin. Au terme de cette formation, les développeurs seront en mesure de combiner efficacement coroutines, flows et autres composants de l'architecture moderne pour créer des applications performantes, maintenables et réactives. Ils disposeront des compétences nécessaires pour transformer des opérations complexes comme les appels réseau, les accès à la base de données ou tout autre code asynchrone en code lisible, robuste et facile à déboguer.

La formation alterne entre exposés théoriques, démonstrations pratiques et exercices hands-on. Les participants travailleront sur des cas concrets tels que le développement d'applications réactives, la gestion des appels API asynchrones, et la mise en œuvre de traitements parallèles. Chaque module théorique est suivi par un atelier pratique permettant de mettre en application les concepts étudiés. Cette formation sera focalisée sur l'utilisation des coroutines dans un environnement JVM.
