---
entete:
  titre: Kafka
  sous_titre: Les fondamentaux
  niveau: Fondamental
  groupe: kafka
  categorie: Develop
  chapo: Gérez vos événements en temps réel avec cette solution open source.
  image: /uploads/ancien-site/assets/img/svg/trainings/kafka-fondamental.svg
inscription:
  prix: 1200
  sessions:
    - debut: "2026-09-30"
      fin: "2026-10-01"
  programme_pdf: https://drive.google.com/file/d/1MwCrTIsAbzEyB2ABezMcJn4dngDNT0HX/view
  programme_pdf_poids: 729 Ko
chiffres:
  duree_jours: 2
  duree_heures: 14
  participants_min: 1
  participants_max: 8
  note: 4.9
  avis: 40
  depuis: janvier 2023
  theorie: 55
public:
  pour_qui: La formation Kafka s'adresse à des développeurs d'application Web, des Tech Leads, des architectes techniques souhaitant se former sur la technologie Apache Kafka.
  prerequis:
    - Être familiarisé avec la programmation, idéalement Java
objectifs:
  - Comprendre les concepts fondamentaux de l'architecture de Kafka
  - Savoir écrire un producteur de données
  - Savoir écrire un consommateur de données
  - Savoir prendre des décisions de configuration comme les partitions, la rétention, la réplication, la confirmation, afin d'adapter kafka au cas d'usage
  - Maîtriser une stratégie de gestion de schémas de données
  - Savoir traiter des flux de données en s'appuyant sur les outils Kafka Connect, Kafka Streams et KsqlDB
programme:
  - titre: Introduction
    points: []
  - titre: Fondamentaux
    points:
      - Concept et historique
      - Composants de base (Record, Brokers, Topics/partitions/segments, Producer, Consumer)
      - Synchronisation des brokers (Zookeeper et Kraft)
      - Sérialisation/Désérialisation
      - Format des données
      - Rétention et réplication
      - Sécurité
  - titre: Produire des messages
    points:
      - Partitionnement
      - Confirmation
      - Unicité
      - Performance et latence
      - Délivrer un message
      - Transaction
      - Dimensions des messages
      - API
  - titre: Consommer des messages
    points:
      - Gestion des offsets et de leur commit
      - Groupes de consommation
      - Favoriser le débit ou la latence
      - Gestion d'erreur
      - API
  - titre: Gestion des schémas
    points:
      - Le registre de schémas
      - Compatibilité des schémas
      - Format
      - Nommage
  - titre: Kafka Connect
    points:
      - Composants d'un cluster
      - Connecteurs
      - Transformations
  - titre: REST Proxy
    points: []
  - titre: Kafka Stream
    points:
      - Utilisation de Kafka Stream
      - Streams et Tables
      - Windowing
      - Topologie
      - Operation stateless et statefull
  - titre: ksqlDB
    points:
      - Utilisation de KsqlDB
      - Requête persistante et non-persistante
      - Requête Push et requête Pull
      - Windowing
  - titre: Conclusion
    points: []
formateur:
  personne: morgan
faq:
  - question: La formation inclut-elle des bonnes pratiques pour l'utilisation de Kafka dans un environnement DevOps ?
    reponse: Oui, la formation Kafka aborde les meilleures pratiques pour intégrer Kafka dans un environnement DevOps, en mettant l'accent sur l'automatisation et la gestion de la scalabilité pour des flux de données en temps réel.
  - question: Les participants auront-ils l'occasion de travailler sur des cas concrets avec Kafka ?
    reponse: Absolument, la formation inclut des exercices pratiques basés sur des cas d'usage réels, pour permettre aux participants de comprendre et appliquer les concepts clés de Kafka dans des conditions proches de la production.
  - question: Comment se déroule la formation Kafka en termes de durée et de format ?
    reponse: La formation Kafka se déroule sur une durée de 2 jours (soit 14 heures) et combine 55 % de théorie et 45 % de pratique. Elle peut être suivie en présentiel dans vos locaux ou à distance via des sessions en ligne en visio.
referencement:
  meta_title: "Formation Kafka : formation et développement de compétences Kafka"
  meta_description: Formez-vous à la technologie Kafka avec nos experts en développement et gérez vos événements en temps réel avec cette solution open source.
  indexation: true
---
Apache Kafka est une solution open source créée pour les besoins de LinkedIn en 2011 comme réponse technique à la problématique d'ingestion des données en temps réel.

Ce système de gestion d'événements en temps réel est capable de traiter des millions de messages par seconde.

Cette formation de développement a pour objectif de permettre à des développeurs et architectes de découvrir les services, l'architecture et les APIs mises à leur disposition par Apache Kafka pour créer des applications scalables leur permettant de gérer de très grandes quantités de données. L'expérimentation sur la base de cas concrets issus d'applications en production permet d'illustrer les principes exposés.

Aujourd'hui, Apache Kafka est largement utilisé dans des domaines variés tels que le e-commerce, la finance et les réseaux sociaux pour construire des pipelines de données robustes.
