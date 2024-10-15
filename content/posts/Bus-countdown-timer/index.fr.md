---
title: Affichage de temps de bus  
date: 2024-10-10 22:30:28  
description: Projet IoT centré l'affichage du temps de bus
menu:  
  sidebar:  
    name: Affichage de temps de bus
    identifier: bus-countdown-timer  
    weight: 11  
hero: devboard.jpg  
tags:
- IoT
- Transport Public
- ESP32
- Intégration API
- Optimisation Énergétique
- Wi-Fi
- Villes Intelligentes

---

## Projet de Station de Bus : Améliorer le Transport Public avec l’IoT

Le **Projet de Station de Bus** a débuté comme une solution personnelle à un problème que je rencontrais régulièrement en tant qu'étudiant à Paris-Saclay. Avec uniquement des bus pour voyager entre les lieux, je me retrouvais souvent à la station de bus Place Marguerite Pery, juste en face de Télécom Paris, sans ETA (temps estimé d'arrivée) disponible. Pour savoir quand partir de chez moi, je devais vérifier l’horaire du bus sur mon téléphone avant de sortir. Cela m’a donné l’idée de créer un système capable de fournir les horaires d’arrivée des bus en temps réel, rendant mes trajets plus prévisibles et efficaces.

Le projet était centré sur le développement d’un système IoT spécialement pour ma station de bus locale, afin de fournir des informations d'arrivée en temps réel pour une meilleure gestion du temps. Le principal défi n'était pas l'intégration de l'API, puisque l’API RATP est bien documentée, mais plutôt de connecter le microcontrôleur ESP32 au réseau Wi-Fi public de mon logement étudiant. Le Wi-Fi nécessitait une page de connexion, ce qui le rendait complexe. J’ai utilisé **Wireshark** pour capturer le trafic réseau depuis mon ordinateur lorsque je me connectais à la page du portail, puis j’ai reproduit ce processus sur l’ESP32, ce qui a fonctionné avec succès.

## Aperçu du Développement

Le projet a impliqué plusieurs composants :
- **Intégration de l'API** : Initialement, nous avons simulé les données en temps réel à l'aide de l'**API RATP** pour obtenir les horaires d'arrivée des bus, qui pourraient à terme être remplacées par des données provenant de stations de bus réelles.
- **Traitement des Données** : Les données collectées ont été traitées pour prédire les horaires d'arrivée des bus. Un mécanisme de compte à rebours a été mis en place pour réduire la fréquence des requêtes API, optimisant ainsi la consommation d'énergie.

## Contributions Clés

1. **Optimisation de la Consommation Énergétique** : Une amélioration clé a été l'implémentation d'un compte à rebours pour gérer efficacement les requêtes API et réduire la consommation d'énergie inutile.

## Potentiel Futur

Une amélioration future serait d'implémenter un programme permettant de gérer l'efficacité énergétique en éteignant automatiquement le système pendant les heures de travail où il ne serait pas utilisé. Cela garantirait que l'énergie est consommée uniquement lorsque le système fournit activement des informations.

Pour plus de détails, vous pouvez suivre l'évolution de notre projet :  
- [Projet disponible sur Github](https://github.com/MarcChen/affichage-temps-bus-ratp)
