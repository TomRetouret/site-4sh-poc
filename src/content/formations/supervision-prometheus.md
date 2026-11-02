---
entete:
  titre: Supervision Prometheus
  sous_titre: Les fondamentaux
  niveau: Fondamental
  groupe: supervision-prometheus
  categorie: DevOps
  chapo: Découvrez un ensemble de techniques pour l’analyse, le contrôle et la surveillance des données d'un projet.
  image: /uploads/ancien-site/assets/img/svg/trainings/supervision-fondamental.svg
inscription:
  prix: 1400
  sessions:
    - debut: '2026-12-07'
      fin: '2026-12-08'
  programme_pdf: https://drive.google.com/file/d/1EtfFn0gsI74SabxGUPuwbdxduPY_aIN-/view
  programme_pdf_poids: 810 Ko
chiffres:
  duree_jours: 2
  duree_heures: 14
  participants_min: 1
  participants_max: 8
  depuis: janvier 2023
  theorie: 60
  avis: 0
public:
  pour_qui: Cette formation s'adresse à des administrateurs système ou des architectes techniques souhaitant se former sur la technologie Prometheus.
  prerequis:
    - Maîtriser les concepts avancés de Kubernetes
    - Maîtriser les installations avec Helm
objectifs:
  - Connaître les principes de base de la supervision de conteneurs
  - Connaître les différentes briques de la supervision avec prometheus
  - Déployer et configurer prometheus
  - Connaître les différents type de métriques
  - Connaître et utiliser le langage PromQL
  - Savoir visualiser des données
  - Savoir configurer les alertes
programme:
  - titre: Introduction au monitoring dans Kubernetes
    points:
      - Historique
      - Principes de base
      - Architecture
  - titre: Outils de monitoring
    points:
      - Prometheus
      - Les principaux composants
      - Grafana
      - kube-state-metrics
      - node-exporter
  - titre: Cibles, métriques, requêtes et alertes
    points:
      - Les cibles
      - Les types de métriques
      - Le langage PromQL
      - Les labels
      - Les alertes
  - titre: Visualisation des métriques avec Grafana
    points:
      - Les datasources
      - Les plugins
      - Les boards
  - titre: Le langage PromQL
    points:
      - 'Vecteurs et des séries temporelles : explication des concepts de vecteurs et de séries temporelles dans le contexte de PROMQL'
      - 'Fonctions de transformation : rate(), irate(), delta()'
      - 'Agrégation de données : sum(), avg(), min(), max()...'
      - Groupement et regroupement
      - '- Utilisation de by'
      - '- group_left et group_right'
      - 'Fonctions de prédicats : absent(), changes()'
      - 'Fonctions mathématiques : utilisation d''opérateurs mathématiques (+, -, *, /) et de comparaison (==, !=, >, <)'
      - 'Utilisation avancée : exploration des expressions avancées avec des fonctions telles que predict_linear(), holt_winters()'
  - titre: Les recording rules
    points:
      - Quand utiliser des recording rules
      - '- Réduire les cardinalités'
      - '- Règles pour les API'
      - '- Comment de PAS utiliser les règles'
  - titre: Gestion des alertes
    points:
      - Configuration d’une alerte
      - '- la directive for'
      - '- les labels'
      - '- Les templates'
      - Qu’est ce qu’une bonne alerte ?
  - titre: AlertManager
    points:
      - Connecter Prometheus à AlertManager
      - Pipeline de Notification
      - '- Inhibition'
      - '- Silences'
      - '- routing'
      - '- grouping'
      - '- Throttling & repetition'
      - '- notification'
      - Le fichier de configuration
      - Les receivers
  - titre: La sécurité dans Prometheus
    points:
      - Activation de TLS
      - Options TLS avancées
      - Activation de la basique auth
  - titre: Les exporters spécifiques
    points:
      - Revues des principaux exporters
      - Écrire son propre exporter
  - titre: Administration
    points:
      - Préparer une migration
      - Mise à l'échelle de Prometheus
  - titre: Performances
    points:
      - Détection d’un problème
      - Trouver une métrique ou un cible consommatrice
      - Réduire la charge
      - Sharding Horizontal
  - titre: Intégration de Thanos
    points:
      - Ajouter Thanos à Prometheus
      - Configurer Thanos pour écrire sur un bucket GCS
      - Lire des données depuis GCS
  - titre: Provisioning hardware
    points:
      - Calibrer les ressources pour Prometheus
faq:
  - question: Quels concepts fondamentaux sont abordés dans cette formation ?
    reponse: Cette formation de Prometheus Supervision couvre les principes de base de la supervision de conteneurs avec Prometheus, en explorant ses composants essentiels tels que Grafana, kube-state-metrics et node-exporter. Les participants apprendront à déployer et configurer Prometheus, à comprendre les différents types de métriques et à utiliser le langage PromQL pour interroger les données. La formation inclut également la visualisation des métriques et la configuration des alertes afin de garantir une surveillance proactive des infrastructures.
  - question: La formation Supervision Prometheus est-elle adaptée à tous les niveaux ?
    reponse: La formation Prometheus s’adresse à des professionnels ayant déjà une bonne maîtrise des concepts avancés de Kubernetes et des outils comme Helm. Les participants apprendront à configurer des systèmes complexes de supervision tout en développant des compétences pratiques sur PromQL, la gestion des alertes et la visualisation des données.
formations_liees:
  - terraform
intertitres:
  description: Description formation *Supervision Prometheus*
  programme: Programme formation *Supervision Prometheus*
  faq: Vos questions
referencement:
  meta_title: 'Formation Prometheus : développement de compétences Supervision Prometheus'
  meta_description: Confiez vos formations Supervision Prometheus à 4SH pour découvrir un ensemble de techniques pour l'analyse, le contrôle et la surveillance des données d'un projet.
  indexation: true
---
Prometheus est un pilier essentiel dans l'écosystème des outils de surveillance et d'alerte pour les infrastructures modernes. Cette formation sur Prometheus vise à doter les ingénieurs système et les administrateurs réseau des compétences nécessaires pour déployer, configurer et maintenir efficacement des systèmes de surveillance basés sur Prometheus.

La formation Prometheus, intégrée dans nos [formations DevOps](/formations/devops/), couvre les aspects fondamentaux de Prometheus, y compris la récupération de métriques, la configuration des alertes, la visualisation des données et l'intégration avec d'autres outils de surveillance et d'orchestration.

Les participants apprendront à concevoir des stratégies de surveillance robustes, à créer des tableaux de bord personnalisés et à mettre en place des alertes pertinentes pour garantir des performances optimales de leurs infrastructures. Grâce à cette formation, les participants développeront une connaissance approfondie de l'outil Prometheus, essentiel pour toute infrastructure moderne nécessitant une surveillance continue et fiable. Ils acquerront les compétences nécessaires pour configurer des systèmes de supervision avancés, garantissant ainsi une gestion optimale de leurs infrastructures.

L’utilisation de Grafana pour la visualisation des données et des métriques sera également abordée, permettant aux participants de créer des tableaux de bord personnalisés et de suivre en temps réel la santé de leurs serveurs et services. La mise en place d'alertes et l'intégration avec d'autres outils de gestion de systèmes viendront compléter cette formation, offrant une solution complète pour la gestion des performances et de la sécurité des applications en production.
