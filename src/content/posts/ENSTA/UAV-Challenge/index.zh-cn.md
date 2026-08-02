---
title: Dassault UAV Challenge 2024-2025
date: 2025-05-20 10:00:00
description: "与 ENST'AIR 团队为达索无人机挑战赛设计并制造自主六旋翼无人机——在 7 所决赛高校中位列第 3 名。"
menu:
  sidebar:
    name: UAV Challenge
    identifier: uav-challenge
    parent: ensta-id
    weight: 20
hero: https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd
tags:
- UAV
- 无人机
- ArduPilot
- 自主系统
- 系统工程
- OpenCV
- Raspberry Pi
- ENSTA Paris

---

![ENST'AIR 团队在达索无人机挑战赛上的六旋翼无人机](https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd)
*ENST'AIR 团队的六旋翼无人机停放在达索航空试验场上。*

## 更新：达索无人机挑战赛第 3 名

ENSTA Paris 的 **ENST'AIR** 团队在 2024-2025 达索无人机挑战赛的 7 所决赛高校中获得 **第 3 名** —— 这是学校阔别该赛事数年后的强势回归。决赛于 2025 年 5 月 17-18 日在达索航空的试验场举行。

## 比赛简介

已进入第 11 届的达索无人机挑战赛要求学生团队设计、制造并飞出一款满足严格安全规范、具备先进自主行为能力的无人驾驶航空器。它对 ENSTA Paris 意义非凡：这项赛事最早在 2014 年由一名 ENSTA 学生向达索航空提议发起——该学生随后赢下首届比赛，并后来成为了一名战斗机飞行员。

今年有 17 支队伍在 12 月提交了设计方案书，最终只有 6 至 7 支获选进入六个月后的决赛。我们的方案书就是其中之一。

## 我们造了什么

我们派上了一套**双机系统**：

- 一架**主六旋翼无人机**（直径约 70 厘米，旋翼式），用于自主飞行、载荷投放与协同任务。
- 一架**副机 DJI Tello EDU**，搭载在主机上方，到达现场后释放，与主机协同完成一段简短的独立任务。

主机以运行 ArduPilot 的 Pixhawk 飞行控制器为核心，搭载 Raspberry Pi 4 进行机载计算、Raspberry Pi Camera Module V2、Ublox Neo-M8N GPS，以及六台配 Hobbywing XRotor Pro 50A 电调 (ESC) 的 T-Motor MN2212 电机——整套系统由一块 Turnigy 5000mAh 4S 电池供电。地面站使用 Mission Planner，我们在 Raspberry Pi 上用 OpenCV 进行基于图像的模式识别。

## 我们如何设计

我们采用真正的**系统工程**方法，使用 **Capella** 对任务、功能与逻辑架构以及物理架构进行建模。达索要求的方案书覆盖了无人机的完整生命周期：概念、研制、运行、维护与退役。

正是这种基于模型的系统工程 (MBSE) 工作让我们通过了第一轮筛选——方案书是按照专业工程公司的标准评审的，我们得到了 U2IS 实验室的 Omar Hammami 和 Thomas Rigaut 的大力帮助。

## 我们演示的任务

### Pass-or-Fail 必过环节（强制，一项失败即淘汰）

1. **符合 DGAC/欧盟法规** —— 无人机搭载 Zephyr Beacon AM 远程识别信标、器身有标识，并且我 (Marc Chen) 持有 A1/A3 类远程飞行员执照。
2. **实时监控** —— 地面站显示无人机的绝对/相对位置，并随无人机移动实时更新。
3. **紧急熄火开关** —— 切断遥控器后电机在 1 秒内停转。
4. **手动飞行** —— 持证飞行员完成一条基础轨迹并降落在指定区域。
5. **飞行员接管** —— 无人机自主起飞并飞往一个 GPS 航点，随后飞行员在飞行途中接管手动控制。
6. **自主飞行** —— 无人机沿评委给定的 GPS 轨迹（例如正方形）飞行，在航点上空悬停并自主降落（支持 RTH - Return To Home 自主返航）。

### 开放环节 (Open Workshops，加分项)

- **载荷投放** —— 无人机识别地面视觉图案，并向其投放 150-500 g 的载荷。我们设计了一款带枢轴联动的挂载钩：着陆时载荷先触地，沿钩的曲线自然脱钩。轨迹通过 OpenCV 的模式识别进行自适应调整。
- **协同任务** —— 主机在探测到的区域上方搭载并释放副机 DJI Tello EDU；副机随后跟随主机，采集信息并执行一次自杀式着陆。
- **低电量 RTH** —— 电量低于阈值时任务自动中止并自主返航。
- **故障触发 RTH** —— 检测到系统错误时无人机自动结束任务。
- **失联触发 RTH** —— 切断地面站即触发自动返航。

## 预算

我们将预算控制在 1000 欧元上限内。通过复用零件（六旋翼机架已有现成）以及对多个元器件拿到学生折扣进行优化。副机 (DJI Tello EDU) 选择货架产品，因为它便宜、轻巧、坚固且完全可编程。总花费约为 **857 欧元**，其中六台电机加电调占了相当一部分。达索航空资助了首批 500 欧元，ENST'AIR 协会承担了余下部分。

## 团队

团队成员横跨大一与大三学生——既有新视角，也具备赛事经验，是一个不错的平衡：

Antoine Canonico、Mathéo Le Moël、Marc Chen、Axel Chouraqui、Antoine Guérin、Alexis Spaeth-Lemarchand。

我自己承担的是**航电子系统与系统方面**的工作：无人机的布线、Raspberry Pi 加摄像头加 OpenCV 的载荷投放流程、飞行控制器配置，以及在 ENSTA Paris 校园的飞行测试。

## 几点经验

- **设计方案书**与无人机同等重要。第一学期投入在严谨的 Capella 架构与需求可追溯性上，是我们从 17 支队伍中脱颖而出的关键（筛选至 7 支），而同样的严谨性让决赛阶段顺畅许多。
- **增量测试**：每个子系统（推进、GPS、通信）在集成前都单独验证；无人机每改动一次，我们都会重新跑一遍强制安全检查。
- **关键环节用货架产品**：直接购买副机节省了数周工作量，让我们把精力集中在真正能拿分的自主行为上。

这是一次从需求清单到一架几公斤重、能在空中把载荷投到视觉目标上的六旋翼无人机的完整工程体验。如果你是 ENSTA 的学生，别犹豫，从大一就报名参加这项挑战：累积的经验会让你在大三成为一名非常有竞争力的选手。