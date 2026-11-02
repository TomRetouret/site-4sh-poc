---
entete:
  titre: Docker
  sous_titre: Les fondamentaux
  niveau: Fondamental
  groupe: docker
  categorie: DevOps
  chapo: Packagez et organisez vos applications et leurs dépendances au sein de conteneurs.
  image: /uploads/ancien-site/assets/img/svg/trainings/docker-fondamental.svg
inscription:
  prix: 1200
  sessions:
    - debut: '2026-11-24'
      fin: '2026-11-25'
  programme_pdf: https://drive.google.com/file/d/1SgRH0xLDOQmnBWU8Pev1ht6wcf6FLGb-/view
  programme_pdf_poids: 698 Ko
chiffres:
  duree_jours: 2
  duree_heures: 14
  participants_min: 1
  participants_max: 8
  theorie: 60
  avis: 0
  depuis: janvier 2023
public:
  pour_qui: Cette formation s’adresse aux développeurs d’application qui souhaitent utiliser docker au quotidien pour simplifier leur environnement de travail, ainsi qu’aux ingénieurs système souhaitant déployer leur production dans un orchestrateur de conteneur.
  prerequis:
    - Savoir utiliser les lignes de commandes linux.
objectifs:
  - Comprendre l'intérêt et le fonctionnement d’un conteneur
  - Comprendre docker et son écosystème
  - Savoir manipuler les conteneurs Docker
  - Savoir créer des images Docker
  - Savoir partager des images Docker
  - Maîtriser l’utilisation de données persistantes avec Docker
  - Maîtriser la configuration des échanges réseaux avec les conteneurs
  - Savoir exécuter plusieurs conteneurs ensemble
programme:
  - titre: Introduction
    points: []
  - titre: Fondamentaux sur les conteneurs
    points:
      - Pourquoi utiliser les conteneurs ?
      - Vulgarisation d’un conteneur et d’une image
      - Les dessous d’un conteneur (LXC)
      - Les avantages des conteneurs
  - titre: Introduction à Docker
    points:
      - Architecture de docker
      - L’écosystème de docker
      - Installation de docker
  - titre: Manipuler des conteneurs
    points:
      - Cycle de vie d’un conteneur
      - Exécuter et gérer des conteneurs
      - Limitations Mac/Windows
  - titre: Construire des images Docker
    points:
      - Ecrire un Dockerfile
      - '- FROM, WORKDIR, RUN, COPY, ADD, USER'
      - '- ARG, ENV, LABEL'
      - '- CMD, ENTRYPOINT'
      - Layers et mise en cache
      - Construction “Multi-stage” pour des images optimisées
      - Manipuler des images
  - titre: Partager des images Docker
    points:
      - Docker hub
      - Utiliser une registry
  - titre: Utiliser des données persistantes
    points:
      - La persistance dans docker
      - 'Les différents montages : volume, bind mounts et tmpfs mounts'
  - titre: Les réseaux Docker
    points:
      - Exposer des ports
      - Gérer des réseaux avec “docker network”
      - Travailler avec son localhost
      - Les drivers réseaux
      - Un DNS intégré
  - titre: Docker Compose
    points:
      - Introduction et installation
      - Fichier de configuration
      - Utiliser les volumes
      - Utiliser les variables d’environnement
      - Utiliser les réseaux
      - Les dépendances de conteneurs
  - titre: Conclusion
    points: []
formateur:
  personne: frederic
  presentation: |-
    Frédéric, notre formateur pour la formation Docker - Fondamentaux, possède plus de 20 ans d'expérience en développement logiciel, avec un focus particulier en tant que Tech Lead. Ses projets variés dans le secteur de la logistique lui ont permis d'acquérir une expertise solide et diversifiée. Frédéric maîtrise de nombreuses technologies, notamment JavaScript, TypeScript, Git, et Maven.

    En dehors de ses projets, il est un contributeur actif à la communauté des développeurs, participant à des projets open source comme Voxxrin, et partageant ses connaissances lors de conférences et meetups. Il a été président du Bordeaux Java User Group pendant 3 ans et est le créateur de BDX I/O.

    Frédéric a également donné des conférences sur TypeScript à Devoxx et BordeauxJS.

    Frédéric est un formateur passionné, dispensant, en plus de la formation Angular : la formation Java - Avancé, la formations Javascript/Typescript, la formation Git - Fondamentaux, la formation Angular - Fondamentaux.
formations_liees:
  - kubernetes-fondamental
intertitres:
  description: Description formation *Docker*
  programme: Programme formation *Docker*
  formateur: Formateur formation *Docker* - Fondamentaux
referencement:
  meta_title: 'Formation Docker : les fondamentaux - 4SH'
  meta_description: Allez plus loin dans la formation de Docker avec 4SH pour progresser dans le package et l'organisation de vos applications et leurs dépendances au sein de conteneurs. Formation Fondamental, 2 jours, certifiée Qualiopi.
  indexation: true
---
Docker est l’outil incontournable pour travailler avec des conteneurs, qui permettent d'exécuter des applications dans des environnements isolés et reproductibles.

Cette formation, destinée à des développeurs ou à des ingénieurs système, a pour objectif de transmettre les compétences nécessaires pour construire, déployer et maintenir des conteneurs, en s’appuyant sur l’outillage Docker.

Les concepts fondamentaux seront traités, mais également les bonnes pratiques pour produire des images légères et sécurisées, puis les exécuter dans des conteneurs avec des volumes persistants et des configurations réseaux adaptés, en s'appuyant sur Docker Compose.

L'expérimentation complète la théorie générale au travers de travaux pratiques. La formation s'appuie sur des retours d'expérience concrets et fournit également des conseils sur les bonnes pratiques et les outils à utiliser.

Pour les débutants, découvrez également notre [formation Docker Essentiel](/formations/docker-essentiel/), une introduction complète à la conteneurisation.
