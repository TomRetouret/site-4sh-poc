---
entete:
  titre: Kubernetes
  sous_titre: Avancé
  niveau: Avancé
  groupe: kubernetes
  categorie: DevOps
  chapo: Découvrez l’orchestration de conteneurs pour vos acteurs cloud.
  image: /uploads/ancien-site/assets/img/svg/trainings/kubernetes-avance.svg
inscription:
  prix: 1500
  sessions:
    - debut: '2026-11-25'
      fin: '2026-11-26'
    - debut: '2027-01-04'
      fin: '2027-01-05'
  programme_pdf: https://drive.google.com/file/d/1INdxvy02rJMrytb-jDe9KdEcf6Nq43Yk/view
  programme_pdf_poids: 756 Ko
chiffres:
  duree_jours: 2
  duree_heures: 14
  participants_min: 1
  participants_max: 8
  note: 4.5
  avis: 21
  depuis: janvier 2023
  theorie: 60
public:
  pour_qui: |-
    Cette formation Kubernetes Avancé s’adresse à des développeurs ou ingénieurs cloud disposant déjà des connaissances fondamentales sur Kubernetes et qui désirent les approfondir et renforcer ainsi un profil DevOps.

    Découvrez aussi notre formation Kubernetes : les fondamentaux.
  prerequis:
    - Savoir utiliser les commandes de base d’un linux.
    - Maîtriser l’utilisation des conteneurs.
    - Maîtriser les fondamentaux Kubernetes.
objectifs:
  - Maîtriser l’architecture de Kubernetes
  - Comprendre l’admission des ressources Kubernetes
  - Maîtriser l’outillage pour assurer une activité de support
  - Savoir contrôler le cycle de vie d’un Pod
  - Maîtriser des ressources avancées
  - Savoir contrôler le scheduler
  - Maîtriser un service mesh
programme:
  - titre: Introduction
    points: []
  - titre: Approfondissement de l’architecture K8S
    points:
      - Le “control plane“ et les noeuds de travail
      - La boucle de réconciliation des contrôleurs
      - Déclaration des ressources
      - Fonctionnement de l’ “api-server”
      - Étendre l'API Kubernetes avec des Custom resources definitions
      - Maîtriser son cluster avec l’Admission Control
      - Gestion du réseau virtuel
  - titre: Plus loin avec kubectl
    points: []
  - titre: Les autres outils
    points: []
  - titre: Contrôler le cycle de vie d’un pod
    points:
      - Vérifier l'état des Pods avec les sondes
      - Contrôler le redémarrage avec les RestartPolicy
      - Contrôler le démarrage du Pod avec un ‘init-container’
      - Contrôler l’arrêt d’un pod avec preStop
      - Les sidecar au service de conteneur principal
  - titre: Plus loin avec les Pods
    points:
      - Utiliser les Job et les CronJob
      - Utiliser les DaemonSets
      - Utiliser Horizontal Pod Autoscaler
  - titre: Contrôler le Scheduler
    points:
      - Choisir un noeud ou groupe de noeud
      - Contrôler la planification des pods avec les affinités
      - Contrôler la planification des pods avec les “taints” et les “tolerations”
      - Planifier pour la maintenance
      - Assurer les opérations de maintenance avec PodDisruptionBudget
      - Rappel sur le contrôle des ressources avec Limits et Requests
  - titre: Introduction aux pratiques gitOps
    points:
      - Kustomize
      - Helm
      - ArgoCD
  - titre: Introduction aux services Mesh
    points:
      - Linkerd
  - titre: Conclusion
    points: []
formateur:
  personne: cyril
  fonction: Architecte logiciel et Tech Lead
  presentation: |-
    Cyril fait partie de l’équipe 4SH depuis 2009. Fort de plus de quinze ans d’expérience, il s’est imposé comme expert en conception technique, en architecture logicielle et en pilotage d’équipes de développement.

    Il a notamment assuré le rôle d’architecte sur une solution de gestion d’agréments dans le secteur de l’assurance, et endossé la fonction de Tech Lead lors de la refonte d’une plateforme de fret utilisée quotidiennement par plus de 1000 utilisateurs.

    Cyril a également conduit avec succès une migration d’un système legacy vers une nouvelle solution, réalisée sans aucune interruption de service, démontrant sa rigueur et sa maîtrise technique.

    Cyril dispense également la formation Spring - Fondamentaux et la formation Angular - Avancé.
faq:
  - question: Cette formation couvre-t-elle les aspects avancés de Kubernetes ?
    reponse: Oui, cette formation est spécialement conçue pour couvrir les aspects avancés de Kubernetes, incluant des pratiques de déploiement, de gestion de clusters et des techniques avancées de sécurité et de scalabilité.
  - question: Quels sont les prérequis pour cette formation ?
    reponse: Pour suivre cette formation Devops, il est recommandé d'avoir une connaissance de base de Kubernetes et une expérience pratique avec Docker. La maîtrise des commandes de base d'un système Linux est également nécessaire.
formations_liees:
  - kubernetes-administrator
intertitres:
  description: Description formation *Kubernetes* Avancé
  programme: Programme formation *Kubernetes* Avancé
  formateur: Formateur Formation *Kubernetes* Avancé
  faq: Vos questions
referencement:
  meta_title: Formation Kubernetes avancé - 4SH
  meta_description: Découvrez la formation de niveau avancé de Kubernetes avec l'agence 4SH pour mieux maîtriser l'orchestration de conteneurs pour vos acteurs cloud. Formation Avancé, 2 jours, certifiée Qualiopi.
  indexation: true
---
Kubernetes est la solution d'orchestration de conteneurs qui a réussi à s'imposer sur le marché, supportée par tous les acteurs cloud (Amazon, Google, Microsoft, OVH,...).

Cette formation Kubernetes Avancé a pour objectif d’approfondir les connaissances afin de permettre à des développeurs d'applications ou des ingénieurs système de configurer et maintenir des applications dans Kubernetes.

Les compétences acquises seront notamment essentielles pour dimensionner, déployer et maintenir des architectures adaptées aux besoins des organisations : haute disponibilité, auto- scalabilité, maintenance, approche microservices...

L'expérimentation complète la théorie générale applicable pour tout cluster Kubernetes. La formation Kubertnes Avancé s'appuie sur des retours d'expérience concrets et fournit également des conseils d'outillage à utiliser.

En explorant des scénarios avancés, les participants apprendront à gérer des déploiements complexes à travers la compréhension de l'architecture de Kubernetes, y compris le “control plane“ et les nœuds de travail. Les participants maîtriseront l'utilisation avancée de kubectl et d'autres outils tels que k9s, popeye et kubent pour identifier, corriger et maintenir les ressources. La gestion avancée des Pods et des services mesh avec Linkerd sera également couverte, ainsi que la planification de la maintenance et le contrôle de la planification des pods.

[En savoir plus sur Kubernetes](/formations/kubernetes/)
