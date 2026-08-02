---
title: Dassault UAV Challenge 2024-2025
date: 2025-05-20 10:00:00
description: "Building an autonomous hexacopter for the Dassault UAV Challenge with team ENST'AIR — ranked 3rd out of 7 finalist schools."
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
- Autonomous Systems
- Systems Engineering
- OpenCV
- Raspberry Pi
- ENSTA Paris
---

![ENST'AIR hexacopter at the Dassault UAV Challenge](https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd)
*Team ENST'AIR's hexacopter on the Dassault Aviation test field.*

## Update: 3rd place at the Dassault UAV Challenge

The ENSTA Paris team **ENST'AIR** ranked **3rd** out of the 7 finalist schools at the Dassault UAV Challenge 2024-2025 — a strong comeback for the school after several years away from the competition. The finals took place on May 17-18, 2025 on a Dassault Aviation test field.

## The challenge

The Dassault UAV Challenge, now in its 11th edition, asks student teams to design, build and fly an unmanned aerial vehicle that meets strict safety rules and demonstrates advanced autonomous behaviours. It is particularly meaningful for ENSTA Paris: the competition was originally proposed to Dassault Aviation back in 2014 by an ENSTA student — who then won the first edition and later became a fighter pilot.

This year, 17 teams submitted a design dossier in December. Only 6 to 7 were selected for the finals, six months later. Our dossier was one of them.

## What we built

We fielded a **two-drone system**:

- A **primary hexacopter** (~70 cm diameter, rotary-wing) for autonomous flight, payload drop and collaborative missions.
- A **secondary DJI Tello EDU** carried on top of the primary drone, released on site to perform its own short mission in collaboration with the master drone.

The primary drone was built around a Pixhawk flight controller running ArduPilot, a Raspberry Pi 4 for onboard computing, a Raspberry Pi Camera Module V2, a Ublox Neo-M8N GPS and six T-Motor MN2212 motors on Hobbywing XRotor Pro 50A ESCs — all flying on a Turnigy 5000mAh 4S battery. The ground station ran Mission Planner, and we used OpenCV on the Raspberry Pi for image-based pattern recognition.

## How we designed it

We followed a real **Systems Engineering** approach using **Capella** to model the mission, the functional and logical architecture, and the physical architecture. The design dossier required by Dassault covered the full drone life cycle: conception, development, operation, maintenance and retirement.

This MBSE work is what got us through the first selection phase — the dossier was reviewed the way a professional engineering bureau's would be, and we were helped a lot by Omar Hammami and Thomas Rigaut from the U2IS lab.

## The missions we demonstrated

### Pass-or-Fail workshops (mandatory, disqualifying on failure)

1. **DGAC/EU compliance** — the drone carries a Zephyr Beacon AM remote-ID beacon, is marked, and I (Marc Chen) hold the A1/A3 remote pilot licence.
2. **Real-time control** — the ground station shows the drone's absolute/relative position, updated live as the drone is moved.
3. **Emergency kill switch** — the motors stop in under one second when the radio is cut.
4. **Manual piloted flight** — licensed pilot flies a basic trajectory and lands on a designated zone.
5. **Pilot takeover** — the drone takes off autonomously and flies to a GPS waypoint, then the pilot takes manual control mid-flight.
6. **Autonomous flight** — the drone flies a GPS trajectory (e.g. a square) defined by the jury, hovers over waypoints and lands autonomously (with RTH available).

### Open workshops (bonus points)

- **Payload drop** — the drone detects a visual pattern on the ground and drops a 150-500 g payload on it. We designed a custom hook with a pivot linkage: the payload touches the ground first on landing and naturally unhooks from the curve of the hook. Trajectory is adapted from OpenCV pattern recognition.
- **Collaborative mission** — the primary drone carries and releases the secondary DJI Tello EDU over a detected zone; the secondary drone then follows the master, gathers information, and performs a kamikaze landing.
- **Low-battery RTH** — the mission auto-aborts and returns to home below a battery threshold.
- **Error-triggered RTH** — on a detected system error, the drone automatically ends the mission.
- **Loss-of-signal RTH** — cutting the ground station triggers automatic return to home.

## Budget

We stayed under the 1000 € cap. We optimised by reusing parts (the hexacopter frame was already available) and by getting student discounts on several components. The secondary drone (DJI Tello EDU) was chosen off-the-shelf because it is cheap, light, robust and fully programmable. Total spend came to about **857 €**, a large share of it the six motors + ESCs. Dassault Aviation funded the first 500 € and the ENST'AIR association covered the rest.

## Team

The team mixed 1st-year and 3rd-year students — a good balance between fresh eyes and challenge experience:

Antoine Canonico, Mathéo Le Moël, Marc Chen, Axel Chouraqui, Antoine Guérin, Alexis Spaeth-Lemarchand.

My own contribution was on the **avionics and systems** side: drones wiring, the Raspberry Pi + camera + OpenCV payload-drop pipeline, flight controller configuration and flight tests at the ENSTA Paris campus.

## A few lessons

- The **design dossier** matters as much as the drone. Spending the first semester on a rigorous Capella architecture and requirement traceability is what got us selected (17 → 7) — and the same rigour made the finals much less chaotic.
- **Incremental testing**: we validated each subsystem (propulsion, GPS, comms) before integration, and re-ran the mandatory safety checks after every modification of the drone.
- **Off-the-shelf where it counts**: buying the secondary drone saved weeks of work and let us focus energy on the autonomous behaviour that actually scored points.

It was a great engineering experience end-to-end — from a requirements table to a flying three-pound hexacopter dropping a payload on a visual target. If you're an ENSTA student, don't hesitate to join the challenge from your first year: the accumulated experience makes you a very competitive challenger by the third year.