---
title: 公交倒计时器  
date: 2024-10-10 22:30:28  
description: 专注于公交倒计时器的物联网项目  
menu:  
  sidebar:  
    name: 公交倒计时器  
    identifier: bus-countdown-timer  
    weight: 10  
hero: devboard.jpg  
---

## 公交车站项目：通过物联网改善公共交通

**公交车站项目**最初是我在巴黎-萨克雷大学学习时为解决个人问题而设计的。当时，校园中只有公交车能在各个地点之间往返，而我经常在玛格丽特·佩里广场（Place Marguerite Pery）的公交车站（位于巴黎电信学院前）等车，却无法得知公交车的预计到达时间（ETA）。为了知道什么时候离开家前往车站，我每次都得先在手机上查一下公交车时刻表。这促使我产生了设计一个能够提供实时公交车到达时间的系统的想法，使我的出行更加可预测和高效。

该项目专注于为我本地的公交车站开发一个物联网系统，旨在提供实时公交车到达信息，帮助更好地规划出行。主要的挑战并不是API的集成，因为RATP的API文档非常完善，而是如何将ESP32微控制器连接到我学生宿舍的公共Wi-Fi网络。该Wi-Fi网络有一个门户页面登录步骤，这使得连接变得复杂。我使用**Wireshark**来捕捉电脑连接到门户页面时的网络通信数据，并在ESP32上复制了相同的过程，成功连接了Wi-Fi。

## 开发概览

该项目包括多个组件：
- **API集成**：最初，我们通过**RATP API**模拟了实时数据来获取公交车到达时间，未来可以替换为来自真实公交车站的传感器数据。
- **数据处理**：收集的数据经过处理，用于预测公交车的到达时间。我们还设计了一个倒计时机制，以减少API请求的频率，从而优化电量消耗。

## 主要贡献

1. **电量优化**：一项关键的改进是实施了一个倒计时机制来有效管理API请求，减少不必要的电量消耗。

## 未来潜力

未来的一个改进方向是实现一个时间表，自动在工作时间关闭系统，因为此时系统不会被使用。这样可以确保电力只在系统实际提供信息时消耗。

如需更多详细信息，您可以关注我们项目的进展：  
- [项目在Github上提供](https://github.com/MarcChen/affichage-temps-bus-ratp)