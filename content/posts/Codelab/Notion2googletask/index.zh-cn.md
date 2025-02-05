---
title: Notion2GoogleTask
date: 2025-01-09 10:52:23
description: 用于同步 Notion 与 Google 任务的微服务
menu:
  sidebar:
    name: Notion2GoogleTask
    identifier: notion2googletask
    parent: Codelab-id
    weight: 10
hero: notion-google-task.png
---

# 使用 Notion2GoogleTasks 自动管理您的任务

您是否厌倦了在 Notion 和 Google 任务之间反复切换？借助 **Notion2GoogleTasks** 仓库，您可以在这两个平台之间无缝同步任务。更棒的是，该仓库设计为定时运行，通过 runner 自动确保您的任务列表始终保持最新，无需手动干预。

在本篇博文中，我将引导您设置并使用此工具来实现任务自动同步。最终，您将拥有自己的定时任务同步管道。

## Notion2GoogleTasks 的功能

- **双向同步**：确保 Notion 与 Google 任务之间的数据一致。
- **调度支持**：通过 runner（如 GitHub Actions 或 cron 任务）自动化同步过程。
- **自定义设置**：提供灵活的配置选项以满足您的需求。

## 快速上手

### 步骤 1：克隆仓库

首先，从 GitHub 克隆仓库：

```bash
git clone https://github.com/MarcChen/Notion2GoogleTasks.git -b feat/towards-2way-sync
cd Notion2GoogleTasks
```

### 步骤 2：安装依赖项

确保您已安装 Python。接着使用 Poetry 安装所需依赖项：

```bash
poetry install
```

### 步骤 3：设置 Google Tasks API 凭证

为了与 Google 任务进行同步，您需要设置 OAuth 凭证。请按照以下步骤操作：

1. **创建 Google Cloud 项目**：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)。
   - 创建新项目或使用现有项目。

2. **启用 Google Tasks API**：
   - 进入 API 库。
   - 搜索 “Google Tasks API” 并启用它。

3. **设置 OAuth 同意屏幕**：
   - 转到 “OAuth 同意屏幕” 标签页。
   - 如适用，请选择 “外部”，并填写必要的详细信息。

4. **创建 OAuth 凭证**：
   - 转到 “凭证” 标签页。
   - 点击 “创建凭证” > “OAuth 2.0 客户端 ID”。
   - 选择 “桌面应用” 作为应用类型。
   - 注意：`GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`。

5. **获取服务器端认证令牌**：
   - 访问 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)。
   - 在设置（齿轮图标）中，进行如下设置：
     - OAuth 流程：服务器端
     - 访问类型：离线
     - 使用您自己的 OAuth 凭证：选中此项
     - 客户端 ID 和客户端密钥：填写步骤 4 中获取的值
   - 添加 Google Task 的相关 Scopes。
   - 点击 “授权 APIs”，系统将提示您选择 Google 账户并确认访问权限。
   - 点击 “步骤 2”并 “交换授权码以获取令牌”。
   - 注意：此步骤会产生 `GOOGLE_ACCESS_TOKEN` 和 `GOOGLE_REFRESH_TOKEN`。

6. **认证**：
   - 设置所有必要的变量：
     - `GOOGLE_ACCESS_TOKEN`
     - `GOOGLE_REFRESH_TOKEN`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
   - 运行以下脚本以进行认证并生成令牌：
     ```bash
     poetry run python GoogleTaskService/authenticate.py
     ```
   - 按提示完成认证过程，此操作会生成供后续使用的 `token.json` 文件。

### 步骤 4：配置 Notion 集成

您还需要配置 Notion 集成：

1. **获取 Notion 集成令牌**：
   - 在您的 Notion 账户中创建一个集成。
   - 记下集成令牌，存储为 `NOTION_API`。

2. **共享 Notion 数据库访问权限**：
   - 在 Notion 中，将目标数据库与该集成共享，通过添加新连接实现共享。
   - 要获取您的 Notion 数据库 ID，请在浏览器中打开该数据库，并复制工作区名称后面的 32 位字母数字字符串（例如，URL `https://www.notion.so/workspace-name/database-id?v=optional-view-id` 中，`database-id` 即为数据库 ID）。
   - 将其保存为 `DATABASE_ID`。

3. **更新配置**：
   - 编辑根目录下的 `config.json` 文件，填写您的 Notion 集成令牌和数据库 ID。

### 步骤 5：调度同步

要实现任务的自动同步，请使用 runner 调度脚本。

#### 选项 1：GitHub Actions

修改 `.github/workflows/sync_notion_to_google.yml` 文件：

```yaml
name: Sync Notion to Google Tasks

on:
  schedule:
    - cron: '0 8,12,16,20 * * *' # 您可以修改此 cron 表达式

jobs:
  sync-notion:
    name: Sync Notion to Google Tasks
    runs-on: self-hosted # 您可以选择使用自托管或其他环境

    if: github.ref == 'refs/heads/main'  # 仅在 main 分支上执行

    steps:
      - name: Checkout Repository 
      - name: Ensure Python 3.10 in PATH (install if missing)
      - name: Ensure Poetry in PATH (install if missing)
      - name: Validate Dependencies
      - name: Install Dependencies
      - name: Run Unit Tests
        shell: bash
        run: |
          poetry run python3.10 services/google_task/config/config_creds.py --save_dir .
        working-directory: ${{ github.workspace }}
        env:
          GOOGLE_ACCESS_TOKEN: ${{ secrets.GOOGLE_ACCESS_TOKEN }}
          GOOGLE_REFRESH_TOKEN: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}

      # 7) 同步 Notion 到 Google Tasks
      - name: Sync Notion to Google Tasks
        shell: bash
        run: |
          export TOKEN_PATH="${{ github.workspace }}/token.json"
          poetry run python3.10 main.py
        working-directory: ${{ github.workspace }}
        env:
          NOTION_API: ${{ secrets.NOTION_API }}
          DATABASE_ID: ${{ secrets.DATABASE_ID }}
          PROJECT_ROOT: ${{ github.workspace }}
          FREE_MOBILE_USER_ID: ${{ secrets.FREE_MOBILE_USER_ID }}
          FREE_MOBILE_API_KEY: ${{ secrets.FREE_MOBILE_API_KEY }}
```

### 第 2 步：将 Secrets 添加至 GitHub

为了安全存储必要的凭证和令牌，请在您的 GitHub 仓库中添加如下秘钥：

1. **进入您的 GitHub 仓库**。
2. **点击 Settings** > **Secrets and variables** > **Actions**。
3. **点击 “New repository secret”**。
4. **逐一添加以下 Secrets**：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_ACCESS_TOKEN`
   - `GOOGLE_REFRESH_TOKEN`
   - `NOTION_API`
   - `DATABASE_ID`
   - `FREE_MOBILE_USER_ID`（如适用）
   - `FREE_MOBILE_API_KEY`（如适用）

每个秘钥都应单独添加，并填写对应的值。

#### 选项 2：本地 Cron 任务

1. 确保已设置以下环境变量：

  ```bash
  export GOOGLE_ACCESS_TOKEN=your_google_access_token
  export GOOGLE_REFRESH_TOKEN=your_google_refresh_token
  export GOOGLE_CLIENT_ID=your_google_client_id
  export GOOGLE_CLIENT_SECRET=your_google_client_secret
  export NOTION_API=your_notion_api
  export DATABASE_ID=your_database_id
  ```

2. 打开 crontab 编辑器：

  ```bash
  crontab -e
  ```

3. 添加如下条目以执行主脚本：

  ```bash
  0 * * * * cd /path/to/Notion2GoogleTasks && poetry run python3 main.py
  ```

4. 为进行认证，请先手动执行一次：

  ```bash
  cd /path/to/Notion2GoogleTasks && poetry run python3 GoogleTaskService/authenticate.py
  ```

### 步骤 6：测试设置

手动运行脚本以确保一切正常：

```bash
poetry run python3 main.py
```

检查您的 Notion 和 Google Tasks 以确认同步效果。

## 结论

借助 **Notion2GoogleTasks** 工具，同时管理 Notion 与 Google 任务再也不是难事。通过设置 runner，您可以确保任务定时同步，从而节省时间和精力。

欢迎探索此仓库，并根据您的需求进行自定义。如果有任何建议或贡献，欢迎提交 Pull Request！

祝您任务管理愉快！

## **Google 到 Notion 同步流程图**

{{< mermaid align="center">}}
  graph TD

    A((开始同步流程)) --> B[获取 Google 任务列表]

    B --> C[遍历任务列表]
    C --> D[处理任务同步]
    D --> TASK1[获取上次执行以来已完成的任务]
    D --> TASK2[获取上次执行以来创建的任务]
    D --> TASK3[获取活跃 Google 任务的 ID]
    DB1[(Github API)] --> DB2[获取上一次成功的工作流程运行]
    DB2 --> TASK1
    DB2 --> TASK2

    TASK1 --> TASK11[将 Notion 页面标记为已完成]
    TASK11 --> X{还有更多任务吗？}
    TASK2 --> TASK21[创建 Notion 页面]
    TASK21 --> TASK211[获取创建页面的 ID]
    TASK211 --> TASK2111[重命名 Google 任务]
    TASK2111 --> X
    TASK3 --> TASK31{是否在 Notion 中标记为已完成？}
    TASK31 --> |Yes| TASK311[在 Google Tasks 中标记任务为已完成]
    TASK31 --> |No| TASK312[跳过并记录被跳过的任务]
    TASK311 --> X
    TASK312 --> X

    X --> |Yes| D
    X --> |No| Y{还有更多任务列表吗？}
    Y --> |Yes| C
    Y --> |No| Z((同步结束))  
{{< /mermaid >}}

## **Notion 到 Google 同步功能**

### **页面 1：将 Notion 页面同步至 Google 任务**

Notion 页面如果没有对应的 Google 任务，会在 Google 中创建相应任务。
- **流程步骤：**
  1. 检索上次执行以来的 Notion 页面。
  2. 对于每个页面，检查是否已有对应的 Google 任务。
  3. 如果没有，则使用页面详情在 Google 任务中创建新任务。
  4. 根据需要记录成功或错误信息。

---

## **Notion 到 Google 同步流程图**

{{< mermaid align="center">}}
graph TD

   A1[获取 Notion 页面] --> B1{是否获取到页面？}
   B1 -->|No| D1[记录错误并退出]
   B1 -->|Yes| E1[解析 Notion 页面]
   E1 --> F1[获取 Google 任务列表]
   F1 --> G1[初始化进度条]
   G1 --> H1[遍历解析后的页面]

   H1 --> I1{Google Tasks 中是否存在该任务？}
   I1 -->|Yes| J1[记录并跳过页面]
   I1 -->|No| K1[确保任务列表存在]

   K1 --> L1{确保任务列表时是否出错？}
   L1 -->|Yes| M1[根据页面标签创建新的任务列表]
   L1 -->|No| N1[构建任务描述]

   M1 --> N1

   N1 --> O1{构建描述时是否出错？}
   O1 -->|Yes| P1[记录错误并跳过页面]
   O1 -->|No| newLines1[在 Google Tasks 中创建任务]

   newLines1 --> R1{创建任务时是否出错？}
   R1 -->|Yes| S1[记录错误并跳过]
   R1 -->|No| T1[记录成功]

   J1 --> U1[更新进度条]
   P1 --> U1
   S1 --> U1
   T1 --> U1

   U1 --> V1{还有更多页面？}
   V1 -->|Yes| H1
   V1 -->|No| W1[同步完成]
{{< /mermaid >}}
