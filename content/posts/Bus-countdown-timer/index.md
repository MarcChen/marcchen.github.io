---
title: Bus Countdown Timer  
date: 2024-10-10 22:30:28  
description: IoT project focused on a bus countdown timer  
menu:  
  sidebar:  
    name: Bus Countdown Timer  
    identifier: bus-countdown-timer  
    weight: 11  
hero: devboard.jpg  
tags:
- IoT
- Public Transport
- ESP32
- API Integration
- Power Optimization
- Wi-Fi
- Smart Cities

---

## Bus Station Project: Enhancing Public Transport with IoT

The **Bus Station Project** began as a personal solution to a common problem I faced while studying at Paris-Saclay. With only buses to travel between locations, I frequently encountered situations at the Place Marguerite Pery bus station, just in front of Telecom Paris, where no ETA (estimated time of arrival) was available. To know when to leave my house, I had to check the bus schedule on my phone each time before heading out. This sparked the idea to create a system that could provide real-time bus arrival times, making my commute more predictable and efficient.

The project focused on developing an IoT system specifically for my local bus station, with the aim of offering live bus arrival information for better timing. The core challenge wasn’t API integration, as the RATP API is well-documented, but rather connecting the ESP32 microcontroller to the public Wi-Fi network in my student housing. The Wi-Fi had a portal login page, which made it tricky. I used **Wireshark** to capture the network traffic from my computer when connecting through the portal, replicating the same process on the ESP32, which successfully worked.

## Development Overview

The project entailed several components:
- **API Integration**: Initially, we simulated real-time data using the **RATP API** to retrieve bus arrival times, which could be replaced by sensor-based data from actual bus stations in the future.
- **Data Processing**: The collected data was processed to predict bus arrival times. A countdown mechanism helped reduce the frequency of API requests, optimizing power consumption.

## Key Contributions

1. **Power Optimization**: A key improvement was the implementation of a countdown to manage API requests efficiently, reducing unnecessary power usage.

## Future Potential

One future improvement would be to implement a schedule to manage power efficiency by automatically turning off the system during working hours when it is not needed. This would ensure that power is used only when the system is actively providing information.

For more details, you can follow the progress of our project:  
- [Project avaiable on Github](https://github.com/MarcChen/affichage-temps-bus-ratp)
