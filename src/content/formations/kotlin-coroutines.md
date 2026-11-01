---
entete:
  titre: Kotlin Coroutines
  sous_titre: Avancé
  niveau: Avancé
  groupe: kotlin-coroutines
  categorie: Develop
  chapo: Maîtrisez les fonctionnalités avancées des Kotlin Coroutines pour écrire un code asynchrone performant et maintenable.
  image: /uploads/ancien-site/assets/img/svg/trainings/kotlin-cor-avance.svg
inscription:
  prix: 1800
  sessions:
    - debut: "2026-10-12"
      fin: "2026-10-14"
  programme_pdf: https://drive.google.com/file/d/15ALfacgzs98WWOJsaypBivKMmWgDfzhN/view
  programme_pdf_poids: 703 Ko
chiffres:
  duree_jours: 3
  duree_heures: 21
  participants_min: 1
  participants_max: 8
  depuis: janvier 2023
  theorie: 60
public:
  pour_qui: Cette formation informatique s'adresse à des développeurs Kotlin qui souhaitent parfaire leur maîtrise de l'API coroutine. Même si la majorité des concepts couverts est multi plateforme, certains exemples et cas d'usages s'adressent particulièrement à la cible JVM.
  prerequis:
    - Maîtriser les bases de la programmation objet
    - Maîtriser les bases de la programmation concurrente (notion de Thread et d'accès concurrent à la mémoire)
    - Maîtriser le langage Kotlin
objectifs:
  - Maîtriser l'usage des coroutines
  - Comprendre le modèle de concurrence sous jacent
  - Comprendre la structured concurrency et son application
  - Maîtriser les CoroutineScope et leurs usages
  - Maîtriser les Job et leur application
  - Savoir faire communiquer des coroutines
  - Savoir interopérer les CoroutineContext et les Threads de la JVM
  - Comprendre et maîtriser la gestion des erreurs et leur propagation
  - Savoir traiter des flux de données asynchrones
  - Appréhender l'implémentation interne des coroutines et son implication
programme:
  - titre: Introduction
    points: []
  - titre: "Coroutines Basics : introduction à l'utilisation des coroutines"
    points:
      - "Coroutine : définition et API de base"
      - Appels non bloquants et mot clef suspend
      - Les bases de l'API Flow
      - Utilisation de l'API Job pour synchroniser des coroutines
  - titre: Orchestration de coroutines Basics
    points:
      - Async / Await
      - Concurrence structurée avec coroutineScope
  - titre: Modèle de concurrence
    points:
      - Quelles threads pour exécuter les coroutines ?
      - Quelles implications pour les coroutines ?
      - La notion de Dispatcher et son usage
  - titre: "Job : cancel et timeout"
    points:
      - Comprendre le mécanisme d'annulation de coroutine
      - Modèle coopératif
      - Gestion du NonCancellable
      - Exécution avec timeout
  - titre: CoroutineContext
    points:
      - Qu'est-ce qu'un CoroutineContext ?
      - Comment y accéder et s'en servir ?
      - Comment définir ses propres clés ?
      - Quelles informations y sont disponibles ?
      - Comment modifier le contexte d'une coroutine
  - titre: Structured Concurrency
    points:
      - Qu'est-ce qu'un CoroutineScope ?
      - Lien avec un CoroutineContext et un Job
      - Différence entre coroutineScope, CoroutineScope et CoroutineScope()
      - Utilisation de GlobalScope
      - Propagation des erreurs et cancellation
  - titre: Gestion de la concurrence
    points:
      - Approche par confinement de Thread ou de coroutine
      - Utilisation de Mutex
      - "Utilisation de Channel : les bases"
  - titre: Les Flow
    points:
      - Comprendre la notion de cold Flow
      - Flow builders, opérations intermédiaires et terminales
      - Flow builder et suspend function, les recommandations
      - "Invariants de Flow : context preservation et exception transparency"
      - Les bases d'utilisation des buffers
  - titre: Plus loin avec les Job
    points:
      - Maîtriser le cycle de vie
      - API Job() et CompletableJob
      - Les SupervisedJob et la gestion des erreurs associée
  - titre: Plus loin avec les coroutines builders
    points:
      - Inventaire des coroutines builders et leurs différences
      - Gestion du démarrage des coroutines
  - titre: Plus loin avec les context
    points:
      - Interopérabilité avec les Threads
  - titre: Plus loin avec les Channels
    points:
      - Fan in / fan out
      - Gestion des buffers
      - Paramétrer le fonctionnement quand le buffer est plein
      - Initiation à l'utilisation du Select
  - titre: Plus loin avec les Flow
    points:
      - "Hot flows : SharedFlow"
      - "Hot flows : StateFlow"
      - Gestion du replayable cache
      - Comprendre l'implémentation du shareIn
  - titre: Les tests
    points:
      - Bien tester les coroutines
      - Gestion du temps et du delay
  - titre: Fonctionnement interne des coroutines
    points:
      - Coroutine, continuation et state machine
      - Comprendre le fonctionnement des continuation par l'exemple
      - "Les implications sur le quotidien : debug et profiling"
faq: []
referencement:
  meta_title: Formation Kotlin Coroutines présentiel ou à distance avec 4SH
  meta_description: "Maîtrisez les coroutines Kotlin en 3 jours avec 4SH : asynchrone, flows, jobs, contextes. Formation avancée en présentiel ou à distance."
  indexation: true
---
Kotlin est un langage de programmation moderne développé par JetBrains. Ce langage statiquement typé peut être exécuté sur la JVM et est complètement interopérable avec Java. Il offre une syntaxe concise et des fonctionnalités modernes qui facilitent le développement d'applications, comme une meilleure gestion de la nullité, des capacités d'extensions et une API très riche sur les collections.

La formation Kotlin Coroutines Avancé est conçue pour les personnes maîtrisant déjà le langage Kotlin, mais n'ayant que des connaissances superficielles des coroutines et souhaitant approfondir leurs compétences. Elle couvre une variété de sujets sur l'utilisation des coroutines allant de la maîtrise des concepts au coeur de l'API (CoroutineScope, CoroutineContext, Job, Dispatcher, coroutines builders, ...) jusqu'à leur fonctionnement interne et leur implémentation sous forme de continuation.

La formation s'appuie sur des éléments théoriques mais également des démonstrations et des travaux pratiques pour assurer une maîtrise complète des concepts avancés de cette API.
