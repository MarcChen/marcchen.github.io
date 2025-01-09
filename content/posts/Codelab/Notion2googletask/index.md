---
title: Notion2GoogleTask
date: 2025-01-09 10:52:23
description: A powerful microservice that enables seamless synchronization between Notion and Google Tasks, ensuring your task management is always up-to-date across both platforms.
menu:
  sidebar:
    name: Notion2GoogleTask
    identifier: notion2googletask
    parent: Codelab-id
    weight: 10
hero: notion-google-task.png
mermaid: true

---

# Automate Your Task Management with Notion2GoogleTasks

Are you tired of juggling tasks between Notion and Google Tasks? With the **Notion2GoogleTasks** repository, you can synchronize tasks between the two platforms seamlessly. Even better, this repository is designed to work on a schedule using a runner, ensuring your task lists are always up to date without manual intervention.

In this blog post, I’ll guide you through setting up and using this tool to automate task synchronization. By the end, you’ll have your own scheduled task synchronization pipeline up and running.

## Features of Notion2GoogleTasks

- **Two-way synchronization**: Ensures tasks are consistent between Notion and Google Tasks.
- **Scheduling support**: Automates the process using a runner, such as GitHub Actions or cron jobs.
- **Customizable setup**: Flexible configuration options to suit your needs.

## Getting Started

Follow these steps to set up and schedule the Notion2GoogleTasks tool.

### Step 1: Clone the Repository

Start by cloning the repository from GitHub:

```bash
git clone https://github.com/MarcChen/Notion2GoogleTasks.git -b feat/towards-2way-sync
cd Notion2GoogleTasks
```

### Step 2: Install Dependencies

Ensure you have Python installed. Then, install the required dependencies using Poetry:

```bash
poetry install
```

### Step 3: Set Up Google Tasks API Credentials

To synchronize with Google Tasks, you need to set up OAuth credentials. Follow these steps:

1. **Create a Google Cloud project**:
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or use an existing one.

2. **Enable the Google Tasks API**:
   - Navigate to the API Library.
   - Search for "Google Tasks API" and enable it.

3. **Set up OAuth consent screen**:
   - Go to the "OAuth consent screen" tab.
   - Choose "External" if applicable, and fill out the necessary details.

4. **Create OAuth credentials**:
   - Navigate to the "Credentials" tab.
   - Click "Create Credentials" > "OAuth 2.0 Client IDs."
   - Select "Desktop app" as the application type.
   - Note: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

5. **Retrieve server-side authentication tokens**

  - Go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
  - In the Settings (gear icon), set the following:
    - OAuth flow: Server-side
    - Access type: Offline
    - Use your own OAuth credentials: Check this option
    - Client ID and Client Secret: Use the values from step 4
  - Add Google Task Scopes.
  - Click "Authorize APIs". You will be prompted to choose your Google account and confirm access.
  - Click "Step 2" and "Exchange authorization code for tokens".
  - Note: `GOOGLE_ACCESS_TOKEN` and `GOOGLE_REFRESH_TOKEN`.

5. **Authenticate**:
  - Source all the necessary variables:
    - `GOOGLE_ACCESS_TOKEN`
    - `GOOGLE_REFRESH_TOKEN`
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
   - Run the following script to authenticate and generate a token:
     ```bash
     poetry run python GoogleTaskService/authenticate.py
     ```
   - Follow the prompts to complete the authentication process. This will create a `token.json` file for future use.

### Step 4: Configure Notion Integration

You’ll also need to integrate with Notion:

1. **Obtain Notion integration token**:
   - Create an integration in your Notion account.
   - Note the integration token as `NOTION_API`.

2. **Share access to your Notion database**:
  - In Notion, share your desired database with the integration by adding a new connection with the newly created integration.
  - To retrieve your Notion Database ID, open the database in your browser, and copy the 32-character alphanumeric string directly following your workspace name in the URL (e.g., `https://www.notion.so/workspace-name/database-id?v=optional-view-id` has the Database ID `database-id`).
    - Save it as `DATABASE_ID`

3. **Update the configuration**:
   - Edit the `config.json` file in the root directory to include your Notion integration token and database ID.

### Step 5: Schedule the Synchronization

To automate synchronization, schedule the script using a runner.

#### Option 1: GitHub Actions

Modify the `.github/workflows/sync_notion_to_google.yml` file:

```yaml
name: Sync Notion to Google Tasks

on:
  schedule:
    - cron: '0 8,12,16,20 * * *' # You can modify the cron job here

jobs:
  sync-notion:
    name: Sync Notion to Google Tasks
    runs-on: self-hosted # You can chose wether to run on self-hosted or not

    if: github.ref == 'refs/heads/main'  # Only execute on the main branch

    steps:
      - name: Checkout Repository 
      - name: Ensure Python 3.10 in PATH (install if missing)
      - name: Ensure Poetry in PATH (install if missing
      - name: Validate Dependencies
      - name: Install Dependencies
      - name: Run Unit Tests
      ### For more details on the above jobs, please refer to the repository
        shell: bash
        run: |
          poetry run python3.10 services/google_task/config/config_creds.py --save_dir .
        working-directory: ${{ github.workspace }}
        env:
          GOOGLE_ACCESS_TOKEN: ${{ secrets.GOOGLE_ACCESS_TOKEN }}
          GOOGLE_REFRESH_TOKEN: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}

      # 7) Sync Notion to Google Tasks
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

### Step 2: Add Secrets to GitHub

To securely store the necessary credentials and tokens, add them as secrets in your GitHub repository:

1. **Navigate to your repository on GitHub**.
2. **Go to Settings** > **Secrets and variables** > **Actions**.
3. **Click on "New repository secret"**.
4. **Add the following secrets**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_ACCESS_TOKEN`
  - `GOOGLE_REFRESH_TOKEN`
  - `NOTION_API`
  - `DATABASE_ID`
  - `FREE_MOBILE_USER_ID` (if applicable)
  - `FREE_MOBILE_API_KEY` (if applicable)

Each secret should be added individually with its corresponding value.


#### Option 2: Local Cron Job

1. Ensure the necessary environment variables are set:

  ```bash
  export GOOGLE_ACCESS_TOKEN=your_google_access_token
  export GOOGLE_REFRESH_TOKEN=your_google_refresh_token
  export GOOGLE_CLIENT_ID=your_google_client_id
  export GOOGLE_CLIENT_SECRET=your_google_client_secret
  export NOTION_API=your_notion_api
  export DATABASE_ID=your_database_id
  ```

2. Open the crontab editor:

  ```bash
  crontab -e
  ```

3. Add an entry to run the main script:

  ```bash
  0 * * * * cd /path/to/Notion2GoogleTasks && poetry run python3 main.py
  ```

4. To authenticate, run the following command manually once:

  ```bash
  cd /path/to/Notion2GoogleTasks && poetry run python3 GoogleTaskService/authenticate.py
  ```

### Step 6: Test the Setup

Run the script manually to ensure everything works:

```bash
poetry run python3 main.py
```

Check your Notion and Google Tasks to confirm synchronization.

## Conclusion

With the **Notion2GoogleTasks** tool, managing tasks across Notion and Google Tasks is no longer a hassle. By setting up a runner, you can ensure your tasks are always synchronized on schedule, saving you time and effort.

Feel free to explore the repository and adapt it to your needs. Contributions and feedback are welcome! You can find the repository here: [Notion2GoogleTasks GitHub Repo](https://github.com/MarcChen/Notion2GoogleTasks). I’m happy to have contributors—feel free to open a PR!

Happy task managing!


## **Google to Notion Sync Diagram**


{{< mermaid align="center">}}
  graph TD

    A((Start Sync Process)) --> B[Retrieve Google Tasklists]

    B --> C[Iterate over Tasklists]
    C --> D[Process Tasks for Sync]
    D --> TASK1[Retrieve completed tasks since last execution]
    D --> TASK2[Retrieve created tasks since last execution]
    D --> TASK3[Retrieve IDs from Active Google Tasks]
    DB1[(Github API)] --> DB2[Retrieve last Successful Workflow run]
    DB2 --> TASK1
    DB2 --> TASK2


    TASK1 --> TASK11[Mark Notion page as Done]
    TASK11 --> X{More tasks?}
    TASK2 --> TASK21[Create Notion Page]
    TASK21 --> TASK211[Retrieve ID from created page]
    TASK211 --> TASK2111[Rename Google Tasks]
    TASK2111 --> X
    TASK3 --> TASK31{Are they marked as Done in Notion?}
    TASK31 --> |Yes| TASK311[Mark Task as completed in Google Tasks]
    TASK31 --> |No| TASK312[Skip & log skipped task]
    TASK311 --> X
    TASK312 --> X

    X --> |Yes| D
    X --> |No| Y{More task lists?}
    Y --> |Yes| C
    Y --> |No| Z((End of Sync))  
{{< /mermaid >}}

---

## **Notion to Google Sync Functions**

### **Page 1: Sync Notion Pages to Google Tasks**
Notion pages that do not have corresponding Google Tasks are created as tasks in Google.
- **Flow Steps:**
  1. Retrieve Notion pages since the last execution.
  2. For each page, check if a corresponding Google Task exists.
  3. If not, create a new task in Google Tasks using the page details.
  4. Log success or errors as appropriate.

---

## **Notion to Google Sync Diagram**


{{< mermaid align="center">}}
graph TD

   A1[Retrieve Notion Pages] --> B1{Pages Retrieved?}
   B1 -->|No| D1[Log Error & Exit]
   B1 -->|Yes| E1[Parse Notion Pages]
   E1 --> F1[Fetch Google Task Lists]
   F1 --> G1[Initialize Progress Bar]
   G1 --> H1[Iterate Over Parsed Pages]

   H1 --> I1{Task Exists in Google Tasks?}
   I1 -->|Yes| J1[Log & Skip Page]
   I1 -->|No| K1[Ensure Task List Exists]

   K1 --> L1{Error Ensuring Task List?}
   L1 -->|Yes| M1[Create a new tasklist based on page tag]
   L1 -->|No| N1[Build Task Description]

   M1 --> N1

   N1 --> O1{Error Building Description?}
   O1 -->|Yes| P1[Log Error & Skip Page]
   newLines1[Create Task in Google Tasks]
   O1 -->|No| newLines1

   newLines1 --> R1{Error Creating Task?}
   R1 -->|Yes| S1[Log Error & Skip]
   R1 -->|No| T1[Log Success]

   J1 --> U1[Update Progress Bar]
   P1 --> U1
   S1 --> U1
   T1 --> U1

   U1 --> V1{More Pages?}
   V1 -->|Yes| H1
   V1 -->|No| W1[Sync Completed]
{{< /mermaid >}}

