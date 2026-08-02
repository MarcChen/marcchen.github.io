---
title: Dassault UAV Challenge 2024-2025
date: 2025-05-20 10:00:00
description: "Conception et construction d'un hexacoptère autonome pour le Dassault UAV Challenge avec l'équipe ENST'AIR — 3e place sur 7 écoles finalistes."
menu:
  sidebar:
    name: UAV Challenge
    identifier: uav-challenge
    parent: ensta-id
    weight: 20
hero: https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd
tags:
- UAV
- Drone
- ArduPilot
- Systèmes Autonomes
- Ingénierie Système
- OpenCV
- Raspberry Pi
- ENSTA Paris

---

![Hexacoptère d'ENST'AIR au Dassault UAV Challenge](https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd)
*Hexacoptère de l'équipe ENST'AIR sur le terrain d'essai de Dassault Aviation.*

## Mise à jour : 3e place au Dassault UAV Challenge

L'équipe **ENST'AIR** d'ENSTA Paris a terminé à la **3e place** sur les 7 écoles finalistes du Dassault UAV Challenge 2024-2025 — un beau retour de l'école dans la compétition après plusieurs années d'absence. Les finales se sont déroulées les 17 et 18 mai 2025 sur un terrain d'essai de Dassault Aviation.

## Le challenge

Le Dassault UAV Challenge, désormais dans sa 11e édition, demande à des équipes d'étudiants de concevoir, construire et faire voler un véhicule aérien sans pilote respectant des règles de sécurité strictes et démontrant des comportements autonomes avancés. Il est particulièrement symbolique pour ENSTA Paris : la compétition avait été proposée à Dassault Aviation dès 2014 par un étudiant de l'ENSTA — qui a ensuite remporté la première édition avant de devenir pilote de chasse.

Cette année, 17 équipes ont rendu un dossier de conception en décembre. Seules 6 à 7 ont été retenues pour les finales, six mois plus tard. Notre dossier en faisait partie.

## Ce que nous avons construit

Nous avons aligné un **système à deux drones** :

- Un **hexacoptère principal** (~70 cm de diamètre, à voilure tournante) pour le vol autonome, le largage de charge utile et les missions collaboratives.
- Un **DJI Tello EDU secondaire** transporté sur le drone principal, largué sur place pour réaliser sa propre courte mission en collaboration avec le drone maître.

Le drone principal a été construit autour d'un contrôleur de vol Pixhawk sous ArduPilot, d'un Raspberry Pi 4 pour le calcul embarqué, d'une Raspberry Pi Camera Module V2, d'un GPS Ublox Neo-M8N et de six moteurs T-Motor MN2212 sur des ESC Hobbywing XRotor Pro 50A — le tout volant sur une batterie Turnigy 5000mAh 4S. La station au sol tournait sous Mission Planner, et nous utilisions OpenCV sur le Raspberry Pi pour la reconnaissance d'image par motif.

## Comment nous avons conçu le système

Nous avons suivi une véritable démarche d'**Ingénierie Système** en utilisant **Capella** pour modéliser la mission, l'architecture fonctionnelle et logique, ainsi que l'architecture physique. Le dossier de conception demandé par Dassault couvrait l'ensemble du cycle de vie du drone : conception, développement, utilisation, maintenance et retrait.

C'est ce travail d'ingénierie système basée sur modèle (MBSE) qui nous a permis de passer la première phase de sélection — le dossier a été évalué comme le serait celui d'un bureau d'études professionnel, et nous avons été beaucoup aidés par Omar Hammami et Thomas Rigaut du laboratoire U2IS.

## Les missions que nous avons démontrées

### Ateliers Pass-or-Fail (obligatoires, éliminatoires en cas d'échec)

1. **Conformité DGAC/Union européenne** — le drone embarque une balise d'identification à distance Zephyr Beacon AM, est marqué, et je (Marc Chen) détiens la licence de télépilote A1/A3.
2. **Contrôle en temps réel** — la station au sol affiche la position absolue/relative du drone, mise à jour en direct lorsque le drone est déplacé.
3. **Arrêt d'urgence** — les moteurs s'arrêtent en moins d'une seconde lorsque la radiocommande est coupée.
4. **Vol piloté** — un pilote titulaire d'une licence effectue une trajectoire de base et atterrit sur une zone désignée.
5. **Prise de contrôle par le pilote** — le drone décolle de manière autonome et vole jusqu'à un waypoint GPS, puis le pilote prend le contrôle manuel en plein vol.
6. **Vol autonome** — le drone suit une trajectoire GPS (par exemple un carré) définie par le jury, stationne au-dessus des waypoints et atterrit de manière autonome (avec RTH - Retour à la Base disponible).

### Ateliers ouverts (points bonus)

- **Largage de charge utile** — le drone détecte un motif visuel au sol et largue une charge utile de 150-500 g dessus. Nous avons conçu un crochet sur mesure avec une liaison pivot : la charge utile touche le sol en premier à l'atterrissage et se décroche naturellement de la courbe du crochet. La trajectoire est adaptée à partir de la reconnaissance de motif OpenCV.
- **Mission collaborative** — le drone principal transporte et largage le DJI Tello EDU secondaire au-dessus d'une zone détectée ; le drone secondaire suit ensuite le drone maître, collecte des informations et effectue un atterrissage kamikaze.
- **RTH batterie faible** — la mission s'interrompt automatiquement et le drone retourne à la base en dessous d'un seuil de batterie.
- **RTH sur erreur** — en cas d'erreur système détectée, le drone termine automatiquement la mission.
- **RTH sur perte de signal** — la coupure de la station au sol déclenche un retour automatique à la base.

## Budget

Nous sommes restés sous le plafond de 1000 €. Nous avons optimisé en réutilisant des éléments (le châssis de l'hexacoptère était déjà disponible) et en obtenant des remises étudiant sur plusieurs composants. Le drone secondaire (DJI Tello EDU) a été choisi sur étagère parce qu'il est bon marché, léger, robuste et entièrement programmable. Le total des dépenses s'élève à environ **857 €**, dont une part importante pour les six moteurs et ESC. Dassault Aviation a financé les premiers 500 € et l'association ENST'AIR a couvert le reste.

## L'équipe

L'équipe mélangeait des étudiants de 1re et de 3e année — un bon équilibre entre regards neufs et expérience du challenge :

Antoine Canonico, Mathéo Le Moël, Marc Chen, Axel Chouraqui, Antoine Guérin, Alexis Spaeth-Lemarchand.

Ma propre contribution s'est faite du côté **avionique et systèmes** : câblage des drones, la chaîne Raspberry Pi + caméra + OpenCV pour le largage de charge utile, configuration du contrôleur de vol et essais en vol sur le campus d'ENSTA Paris.

## Quelques enseignements

- Le **dossier de conception** compte autant que le drone. Consacrer le premier semestre à une architecture Capella rigoureuse et à la traçabilité des exigences est ce qui nous a fait sélectionner (17 → 7) — et la même rigueur a rendu les finales bien moins chaotiques.
- **Tests incrémentaux** : nous avons validé chaque sous-système (propulsion, GPS, communications) avant intégration, et nous avons refait les vérifications de sécurité obligatoires après chaque modification du drone.
- **Sur étagère là où ça compte** : acheter le drone secondaire a économisé des semaines de travail et nous a permis de concentrer notre énergie sur les comportements autonomes qui marquaient réellement des points.

Ce fut une belle expérience d'ingénierie de bout en bout — depuis un tableau d'exigences jusqu'à un hexacoptère de quelques kilos en vol qui largue une charge utile sur une cible visuelle. Si vous êtes étudiant à l'ENSTA, n'hésitez pas à vous porter candidat au challenge dès la première année : l'expérience accumulée fait de vous un compétiteur redoutable en troisième année.