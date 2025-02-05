---
title: Notion2GoogleTask
date: 2025-01-09 10:52:23
description: Microservice pour synchroniser Notion et Google Tasks
menu:
  sidebar:
    name: Notion2GoogleTask
    identifier: notion2googletask
    parent: Codelab-id
    weight: 10
hero: notion-google-task.png
---

# Automatisez la gestion de vos tâches avec Notion2GoogleTasks

En avez-vous assez de devoir jongler entre Notion et Google Tasks ? Avec le dépôt **Notion2GoogleTasks**, vous pouvez synchroniser vos tâches entre ces deux plateformes de manière transparente. Mieux encore, ce dépôt est conçu pour fonctionner selon un planning via un runner, assurant ainsi que vos listes de tâches soient toujours à jour sans intervention manuelle.

Dans cet article de blog, je vais vous guider dans la mise en place et l'utilisation de cet outil pour automatiser la synchronisation des tâches. À la fin, vous disposerez de votre propre pipeline de synchronisation programmé et opérationnel.

## Caractéristiques de Notion2GoogleTasks

- **Synchronisation bidirectionnelle** : Garantit que les tâches soient cohérentes entre Notion et Google Tasks.
- **Support de planification** : Automatise le processus grâce à un runner, comme GitHub Actions ou des tâches cron.
- **Configuration personnalisable** : Options de configuration flexibles pour répondre à vos besoins.

## Démarrage

Suivez ces étapes pour installer et programmer l'outil Notion2GoogleTasks.

### Étape 1 : Cloner le dépôt

Commencez par cloner le dépôt depuis GitHub :

```bash
git clone https://github.com/MarcChen/Notion2GoogleTasks.git -b feat/towards-2way-sync
cd Notion2GoogleTasks
```

### Étape 2 : Installer les dépendances

Assurez-vous d'avoir Python installé. Ensuite, installez les dépendances requises avec Poetry :

```bash
poetry install
```

### Étape 3 : Configurer les identifiants de l'API Google Tasks

Pour synchroniser avec Google Tasks, vous devez configurer des identifiants OAuth. Suivez ces étapes :

1. **Créer un projet Google Cloud** :
   - Rendez-vous sur le [Google Cloud Console](https://console.cloud.google.com/).
   - Créez un nouveau projet ou utilisez-en un existant.

2. **Activer l’API Google Tasks** :
   - Accédez à la bibliothèque d’API.
   - Recherchez "Google Tasks API" et activez-la.

3. **Configurer l’écran de consentement OAuth** :
   - Allez dans l’onglet "Écran de consentement OAuth".
   - Choisissez "Externe" si applicable et remplissez les détails nécessaires.

4. **Créer des identifiants OAuth** :
   - Rendez-vous dans l’onglet "Identifiants".
   - Cliquez sur "Créer des identifiants" > "ID client OAuth 2.0".
   - Sélectionnez "Application de bureau" comme type d’application.
   - Notez : `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`.

5. **Récupérer les jetons d’authentification côté serveur**

   - Rendez-vous sur le [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
   - Dans les paramètres (icône d'engrenage), définissez les options suivantes :
     - Flux OAuth : Côté serveur
     - Type d'accès : Hors ligne
     - Utiliser vos propres identifiants OAuth : Cochez cette option
     - Client ID et Client Secret : Utilisez les valeurs de l’étape 4
   - Ajoutez les portées de Google Tasks.
   - Cliquez sur "Authoriser les API". Vous serez invité à choisir votre compte Google et à confirmer l’accès.
   - Cliquez sur "Étape 2" puis sur "Échanger le code d'autorisation contre des jetons".
   - Notez : `GOOGLE_ACCESS_TOKEN` et `GOOGLE_REFRESH_TOKEN`.

6. **Authentifier** :
   - Chargez toutes les variables nécessaires :
     - `GOOGLE_ACCESS_TOKEN`
     - `GOOGLE_REFRESH_TOKEN`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
   - Exécutez le script suivant pour authentifier et générer un jeton :
     ```bash
     poetry run python GoogleTaskService/authenticate.py
     ```
   - Suivez les instructions pour finaliser le processus d'authentification. Cela créera un fichier `token.json` pour une utilisation future.

### Étape 4 : Configurer l'intégration avec Notion

Vous devrez également intégrer Notion :

1. **Obtenir le jeton d’intégration Notion** :
   - Créez une intégration dans votre compte Notion.
   - Notez le jeton d’intégration sous le nom `NOTION_API`.

2. **Partager l’accès à votre base de données Notion** :
   - Dans Notion, partagez votre base de données avec l’intégration en ajoutant une nouvelle connexion avec l’intégration nouvellement créée.
   - Pour récupérer l’ID de votre base de données Notion, ouvrez la base de données dans votre navigateur, et copiez la chaîne alphanumérique de 32 caractères qui suit directement le nom de votre espace de travail dans l’URL (exemple : `https://www.notion.so/nom-espace-de-travail/id-base-de-données?v=optionnel` contient l’ID `id-base-de-données`).
     - Enregistrez-le sous le nom `DATABASE_ID`.

3. **Mettre à jour la configuration** :
   - Modifiez le fichier `config.json` à la racine pour inclure votre jeton d’intégration Notion et votre ID de base de données.

### Étape 5 : Programmer la synchronisation

Pour automatiser la synchronisation, programmez l'exécution du script à l'aide d'un runner.

#### Option 1 : GitHub Actions

Modifiez le fichier `.github/workflows/sync_notion_to_google.yml` :

```yaml
name: Synchroniser Notion vers Google Tasks

on:
  schedule:
    - cron: '0 8,12,16,20 * * *' # Vous pouvez modifier la planification du cron ici

jobs:
  sync-notion:
    name: Synchroniser Notion vers Google Tasks
    runs-on: self-hosted # Vous pouvez choisir d'exécuter sur une machine auto-hébergée ou non

    if: github.ref == 'refs/heads/main'  # Exécuter uniquement sur la branche principale

    steps:
      - name: Cloner le dépôt 
      - name: S'assurer que Python 3.10 est dans PATH (installer si nécessaire)
      - name: S'assurer que Poetry est dans PATH (installer si nécessaire)
      - name: Valider les dépendances
      - name: Installer les dépendances
      - name: Exécuter les tests unitaires
      ### Pour plus de détails sur ces étapes, veuillez consulter le dépôt
        shell: bash
        run: |
          poetry run python3.10 services/google_task/config/config_creds.py --save_dir .
        working-directory: ${{ github.workspace }}
        env:
          GOOGLE_ACCESS_TOKEN: ${{ secrets.GOOGLE_ACCESS_TOKEN }}
          GOOGLE_REFRESH_TOKEN: ${{ secrets.GOOGLE_REFRESH_TOKEN }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}

      # 7) Synchroniser Notion vers Google Tasks
      - name: Synchroniser Notion vers Google Tasks
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

### Étape 2 : Ajouter les Secrets sur GitHub

Pour stocker en toute sécurité les identifiants et les jetons nécessaires, ajoutez-les en tant que secrets dans votre dépôt GitHub :

1. **Accédez à votre dépôt sur GitHub**.
2. **Allez dans Paramètres** > **Secrets et variables** > **Actions**.
3. **Cliquez sur "Nouveau secret de dépôt"**.
4. **Ajoutez les secrets suivants** :
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_ACCESS_TOKEN`
   - `GOOGLE_REFRESH_TOKEN`
   - `NOTION_API`
   - `DATABASE_ID`
   - `FREE_MOBILE_USER_ID` (le cas échéant)
   - `FREE_MOBILE_API_KEY` (le cas échéant)

Chaque secret doit être ajouté individuellement avec sa valeur correspondante.

#### Option 2 : Cron Job Local

1. Assurez-vous que les variables d'environnement nécessaires sont définies :

  ```bash
  export GOOGLE_ACCESS_TOKEN=your_google_access_token
  export GOOGLE_REFRESH_TOKEN=your_google_refresh_token
  export GOOGLE_CLIENT_ID=your_google_client_id
  export GOOGLE_CLIENT_SECRET=your_google_client_secret
  export NOTION_API=your_notion_api
  export DATABASE_ID=your_database_id
  ```

2. Ouvrez l'éditeur de crontab :

  ```bash
  crontab -e
  ```

3. Ajoutez une entrée pour exécuter le script principal :

  ```bash
  0 * * * * cd /path/to/Notion2GoogleTasks && poetry run python3 main.py
  ```

4. Pour authentifier, exécutez la commande suivante manuellement une fois :

  ```bash
  cd /path/to/Notion2GoogleTasks && poetry run python3 GoogleTaskService/authenticate.py
  ```

### Étape 6 : Tester la configuration

Exécutez le script manuellement pour vérifier que tout fonctionne :

```bash
poetry run python3 main.py
```

Vérifiez vos tâches sur Notion et Google Tasks pour confirmer la synchronisation.

## Conclusion

Avec l'outil **Notion2GoogleTasks**, gérer vos tâches entre Notion et Google Tasks n'est plus un casse-tête. En configurant un runner, vous assurez que vos tâches soient toujours synchronisées automatiquement, vous faisant ainsi gagner du temps et de l'effort.

N'hésitez pas à explorer le dépôt et à l'adapter à vos besoins. Vos contributions et retours sont les bienvenus ! Vous pouvez consulter le dépôt ici : [Notion2GoogleTasks GitHub Repo](https://github.com/MarcChen/Notion2GoogleTasks). Toute contribution via une PR est appréciée !

Bonne gestion de tâches !

## **Diagramme de synchronisation de Google vers Notion**

{{< mermaid align="center">}}
  graph TD

    A((Démarrer le processus de synchronisation)) --> B[Extraire les listes de tâches de Google]

    B --> C[Itérer sur les listes de tâches]
    C --> D[Traiter les tâches pour la synchronisation]
    D --> TASK1[Récupérer les tâches terminées depuis la dernière exécution]
    D --> TASK2[Récupérer les tâches créées depuis la dernière exécution]
    D --> TASK3[Récupérer les IDs des tâches actives dans Google]
    DB1[(API Github)] --> DB2[Récupérer la dernière exécution réussie du workflow]
    DB2 --> TASK1
    DB2 --> TASK2

    TASK1 --> TASK11[Marquer la page Notion comme terminée]
    TASK11 --> X{Plus de tâches ?}
    TASK2 --> TASK21[Créer une page Notion]
    TASK21 --> TASK211[Récupérer l'ID de la page créée]
    TASK211 --> TASK2111[Renommer les tâches dans Google]
    TASK2111 --> X
    TASK3 --> TASK31{Sont-elles marquées comme terminées dans Notion ?}
    TASK31 --> |Oui| TASK311[Marquer la tâche comme terminée dans Google]
    TASK31 --> |Non| TASK312[Passer et enregistrer la tâche ignorée]
    TASK311 --> X
    TASK312 --> X

    X --> |Oui| D
    X --> |Non| Y{Plus de listes de tâches ?}
    Y --> |Oui| C
    Y --> |Non| Z((Fin de la synchronisation))
{{< /mermaid >}}

## **Fonctions de synchronisation de Notion vers Google**

### **Page 1 : Synchroniser les pages Notion avec Google Tasks**
Les pages Notion n'ayant pas de tâche correspondante dans Google sont créées en tant que tâches dans Google.
- **Étapes du processus :**
  1. Extraire les pages Notion depuis la dernière exécution.
  2. Pour chaque page, vérifier si une tâche correspondante existe dans Google Tasks.
  3. Si ce n'est pas le cas, créer une nouvelle tâche dans Google Tasks avec les détails de la page.
  4. Enregistrer le succès ou les erreurs le cas échéant.

---

## **Diagramme de synchronisation de Notion vers Google**

{{< mermaid align="center">}}
graph TD

   A1[Extraire les pages Notion] --> B1{Pages récupérées ?}
   B1 -->|Non| D1[Enregistrer l'erreur et sortir]
   B1 -->|Oui| E1[Analyser les pages Notion]
   E1 --> F1[Extraire les listes de tâches Google]
   F1 --> G1[Initialiser la barre de progression]
   G1 --> H1[Itérer sur les pages analysées]

   H1 --> I1{La tâche existe-t-elle dans Google Tasks ?}
   I1 -->|Oui| J1[Enregistrer et ignorer la page]
   I1 -->|Non| K1[S'assurer que la liste de tâches existe]

   K1 --> L1{Erreur lors de la vérification de la liste ?}
   L1 -->|Oui| M1[Créer une nouvelle liste en fonction du tag de la page]
   L1 -->|Non| N1[Construire la description de la tâche]

   M1 --> N1

   N1 --> O1{Erreur lors de la construction de la description ?}
   O1 -->|Oui| P1[Enregistrer l'erreur et ignorer la page]
   newLines1[Créer la tâche dans Google Tasks]
   O1 -->|Non| newLines1

   newLines1 --> R1{Erreur lors de la création de la tâche ?}
   R1 -->|Oui| S1[Enregistrer l'erreur et passer]
   R1 -->|Non| T1[Enregistrer le succès]

   J1 --> U1[Mettre à jour la barre de progression]
   P1 --> U1
   S1 --> U1
   T1 --> U1

   U1 --> V1{Plus de pages ?}
   V1 -->|Oui| H1
   V1 -->|Non| W1[Synchronisation terminée]
{{< /mermaid >}}
