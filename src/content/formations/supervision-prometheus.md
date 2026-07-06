---
titre: "Supervision Prometheus"
groupe: "supervision-prometheus"
sous_titre: "- Les fondamentaux"
categorie: "DevOps"
niveau: "Fondamental"
chapo: "Découvrez un ensemble de techniques pour l'analyse, le contrôle et la surveillance des données d'un projet."
meta_title: "Formation Prometheus : développement de compétences Supervision Prometheus"
meta_description: "Confiez vos formations Supervision Prometheus à 4SH pour découvrir un ensemble de techniques pour l'analyse, le contrôle et la surveillance des données d'un projet."
prix: "1400 € HT"
duree: "<b>2 jours</b> (14h00)"
participants: "1 à 8"
depuis: "janvier 2023"
theorie: 60
pratique: 40
image: "https://www.4sh.fr/assets/img/svg/trainings/supervision-fondamental.svg"
sessions:
  - "Du 23/09/2026 au 24/09/2026"
pour_qui: "Cette formation s'adresse à des administrateurs système ou des architectes techniques souhaitant se former sur la technologie Prometheus."
prerequis:
  - "Maîtriser les concepts avancés de Kubernetes"
  - "Maîtriser les installations avec Helm"
objectifs:
  - "Connaître les principes de base de la supervision de conteneurs"
  - "Connaître les différentes briques de la supervision avec prometheus"
  - "Déployer et configurer prometheus"
  - "Connaître les différents type de métriques"
  - "Connaître et utiliser le langage PromQL"
  - "Savoir visualiser des données"
  - "Savoir configurer les alertes"
programme:
  - titre: "Introduction au monitoring dans Kubernetes"
    items: ["Historique", "Principes de base", "Architecture"]
  - titre: "Outils de monitoring"
    items: ["Prometheus", "Les principaux composants", "Grafana", "kube-state-metrics", "node-exporter"]
  - titre: "Cibles, métriques, requêtes et alertes"
    items: ["Les cibles", "Les types de métriques", "Le langage PromQL", "Les labels", "Les alertes"]
  - titre: "Visualisation des métriques avec Grafana"
    items: ["Les datasources", "Les plugins", "Les boards"]
  - titre: "Le langage PromQL"
    items: ["Vecteurs et séries temporelles", "Fonctions de transformation : rate(), irate(), delta()", "Agrégation de données : sum(), avg(), min(), max()", "Groupement et regroupement : by, group_left, group_right", "Fonctions de prédicats : absent(), changes()", "Fonctions mathématiques et opérateurs de comparaison", "Utilisation avancée : predict_linear(), holt_winters()"]
  - titre: "Les recording rules"
    items: ["Quand utiliser des recording rules", "Réduire les cardinalités", "Règles pour les API", "Comment ne PAS utiliser les règles"]
  - titre: "Gestion des alertes"
    items: ["Configuration d'une alerte : la directive for, les labels, les templates", "Qu'est ce qu'une bonne alerte ?"]
  - titre: "AlertManager"
    items: ["Connecter Prometheus à AlertManager", "Pipeline de Notification : inhibition, silences, routing, grouping, throttling & repetition, notification", "Le fichier de configuration", "Les receivers"]
  - titre: "La sécurité dans Prometheus"
    items: ["Activation de TLS", "Options TLS avancées", "Activation de la basique auth"]
  - titre: "Les exporters spécifiques"
    items: ["Revues des principaux exporters", "Écrire son propre exporter"]
  - titre: "Administration"
    items: ["Préparer une migration", "Mise à l'échelle de Prometheus"]
  - titre: "Performances"
    items: ["Détection d'un problème", "Trouver une métrique ou une cible consommatrice", "Réduire la charge", "Sharding Horizontal"]
  - titre: "Intégration de Thanos"
    items: ["Ajouter Thanos à Prometheus", "Configurer Thanos pour écrire sur un bucket GCS", "Lire des données depuis GCS"]
  - titre: "Provisioning hardware"
    items: ["Calibrer les ressources pour Prometheus"]
faq:
  - question: "Quels concepts fondamentaux sont abordés dans cette formation ?"
    reponse: "Cette formation de Prometheus Supervision couvre les principes de base de la supervision de conteneurs avec Prometheus, en explorant ses composants essentiels tels que Grafana, kube-state-metrics et node-exporter. Les participants apprendront à déployer et configurer Prometheus, à comprendre les différents types de métriques et à utiliser le langage PromQL pour interroger les données. La formation inclut également la visualisation des métriques et la configuration des alertes afin de garantir une surveillance proactive des infrastructures."
  - question: "La formation Supervision Prometheus est-elle adaptée à tous les niveaux ?"
    reponse: "La formation Prometheus s'adresse à des professionnels ayant déjà une bonne maîtrise des concepts avancés de Kubernetes et des outils comme Helm. Les participants apprendront à configurer des systèmes complexes de supervision tout en développant des compétences pratiques sur PromQL, la gestion des alertes et la visualisation des données."
---
Prometheus est un pilier essentiel dans l'écosystème des outils de surveillance et d'alerte pour les infrastructures modernes. Cette formation sur Prometheus vise à doter les ingénieurs système et les administrateurs réseau des compétences nécessaires pour déployer, configurer et maintenir efficacement des systèmes de surveillance basés sur Prometheus.

La formation Prometheus couvre les aspects fondamentaux de Prometheus, y compris la récupération de métriques, la configuration des alertes, la visualisation des données et l'intégration avec d'autres outils de surveillance et d'orchestration. Les participants apprendront à concevoir des stratégies de surveillance robustes, à créer des tableaux de bord personnalisés et à mettre en place des alertes pertinentes pour garantir des performances optimales de leurs infrastructures.

L'utilisation de Grafana pour la visualisation des données et des métriques sera également abordée, permettant aux participants de créer des tableaux de bord personnalisés et de suivre en temps réel la santé de leurs serveurs et services. La mise en place d'alertes et l'intégration avec d'autres outils de gestion de systèmes viennent compléter cette formation, offrant une solution complète pour la gestion des performances et de la sécurité des applications en production.
