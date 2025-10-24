# API Backend BloodLink

## Description

Ceci est l'API backend pour l'application BloodLink, construite avec Node.js, Express et Sequelize. Elle gère les données relatives aux médecins, aux donneurs, aux banques de sang, aux stocks de sang, aux demandes de sang et aux notifications.

## Fonctionnalités

L'API fournit des opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) complètes pour les ressources suivantes :

*   **Médecins :** Gérer les comptes des médecins.
*   **Donneurs :** Gérer les comptes des donneurs, y compris le groupe sanguin et la localisation.
*   **Banques de Sang :** Gérer les informations sur les banques de sang, leur localisation et leurs coordonnées.
*   **Stock de Sang :** Suivre les stocks de sang disponibles dans les différentes banques de sang.
*   **Demandes :** Gérer les demandes de sang des médecins, y compris le groupe sanguin, la quantité, l'urgence et le statut.
*   **Notifications :** Gérer les notifications envoyées aux donneurs concernant les demandes de sang.

## Technologies Utilisées

*   **Node.js :** Environnement d'exécution JavaScript.
*   **Express.js :** Framework d'application web pour Node.js.
*   **Sequelize :** ORM (Object-Relational Mapper) pour Node.js et PostgreSQL.
*   **PostgreSQL :** Base de données relationnelle.
*   **Docker & Docker Compose :** Pour la conteneurisation et l'orchestration.
*   **bcryptjs :** Pour le hachage des mots de passe.
*   **jsonwebtoken :** Pour la gestion des JWT (JSON Web Tokens).
*   **dotenv :** Pour la gestion des variables d'environnement.
*   **cors :** Pour l'activation du partage de ressources entre origines (Cross-Origin Resource Sharing).
*   **jest & supertest :** Pour les tests.

## Configuration et Installation

### Prérequis

*   Node.js (v18 ou supérieur)
*   npm (Node Package Manager)
*   Docker et Docker Compose (recommandé pour le développement)

### Configuration Locale (sans Docker)

1.  **Cloner le dépôt :**
    ```bash
    git clone -b dev https://github.com/JordanFotso/BloodLink.git
    cd bloodLink-backend-api
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` à la racine du répertoire `bloodLink-backend-api` avec le contenu suivant :
    ```
    PORT=3000
    DB_HOST=localhost
    DB_USER=user
    DB_PASSWORD=password
    DB_NAME=bloodlink_db
    DB_PORT=5432
    JWT_SECRET=superAlias
    JWT_REFRESH_SECRET=superAlias2
    GOOGLE_CLIENT_ID="421952563327-06q30tkcndfq9nm2gd8r6qfpkqeu4b9b.apps.googleusercontent.com"
    ```
    *Note : Ajustez `DB_HOST` et `DB_PORT` si votre instance PostgreSQL s'exécute ailleurs.*

4.  **Configurer la base de données PostgreSQL :**
    Assurez-vous d'avoir une base de données PostgreSQL en cours d'exécution et accessible avec les identifiants fournis dans votre fichier `.env`.

5.  **Exécuter les migrations de base de données (si présentes) et les seeders :**
    *(En supposant que `sequelize-cli` est configuré. Les commandes seront ajoutées ici une fois les migrations définies.)*

6.  **Démarrer le serveur :**
    ```bash
    npm start
    ```
    L'API sera accessible à l'adresse `http://localhost:3000` (ou votre PORT spécifié).

### Configuration avec Docker Compose (Recommandé)

1.  **Cloner le dépôt :**
    ```bash
    git clone -b dev https://github.com/JordanFotso/BloodLink.git
    cd bloodLink-backend-api
    ```

2.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` à la racine du répertoire `bloodLink-backend-api` avec le contenu suivant :
    ```
    PORT=3000
    DB_HOST=db
    DB_USER=user
    DB_PASSWORD=password
    DB_NAME=bloodlink_db
    DB_PORT=5432
    JWT_SECRET=superAlias
    JWT_REFRESH_SECRET=superAlias2
    GOOGLE_CLIENT_ID="421952563327-06q30tkcndfq9nm2gd8r6qfpkqeu4b9b.apps.googleusercontent.com"
    ```
    *Note : `DB_HOST` est défini sur `db` car il fait référence au nom du service de base de données au sein du réseau Docker.*

3.  **Construire et exécuter les services :**
    ```bash
    docker-compose up --build
    ```
    Cela construira l'image de l'application Node.js, démarrera le conteneur PostgreSQL et exécutera le serveur API. L'API sera accessible à l'adresse `http://localhost:3000`.

### Commandes Docker utiles

*   **Démarrer les services en arrière-plan :**
    ```bash
    docker-compose up -d
    ```

*   **Voir les logs de l'application en temps réel :**
    ```bash
    docker-compose logs -f app
    ```

*   **Arrêter les services :**
    ```bash
    docker-compose down
    ```

*   **Accéder à la base de données :**
    Aucune interface web pour la base de données n'est fournie par défaut. Vous pouvez vous connecter à la base de données PostgreSQL en utilisant un outil graphique comme DBeaver, pgAdmin, ou via la ligne de commande.
    *   **Hôte :** `localhost`
    *   **Port :** `5433`
    *   **Base de données :** `bloodlink_db`
    *   **Utilisateur :** `user`
    *   **Mot de passe :** `password`

## Points d'Accès API (Endpoints)

*(Note : Les routes ne sont pas encore définies dans `src/routes/`. Cette section sera mise à jour une fois les routes implémentées.)*

Chaque ressource (Medecin, Donneur, BanqueDeSang, StockSang, Demande, Notification) exposera généralement les points d'accès CRUD suivants :

### Médecins
*   `POST /api/medecins` - Créer un nouveau médecin
*   `GET /api/medecins` - Obtenir tous les médecins
*   `GET /api/medecins/:id` - Obtenir un médecin par ID
*   `PUT /api/medecins/:id` - Mettre à jour un médecin par ID
*   `DELETE /api/medecins/:id` - Supprimer un médecin par ID

### Donneurs
*   `POST /api/donneurs` - Créer un nouveau donneur
*   `GET /api/donneurs` - Obtenir tous les donneurs
*   `GET /api/donneurs/:id` - Obtenir un donneur par ID
*   `PUT /api/donneurs/:id` - Mettre à jour un donneur par ID
*   `DELETE /api/donneurs/:id` - Supprimer un donneur par ID

### Banques de Sang
*   `POST /api/banquesdesang` - Créer une nouvelle banque de sang
*   `GET /api/banquesdesang` - Obtenir toutes les banques de sang
*   `GET /api/banquesdesang/:id` - Obtenir une banque de sang par ID
*   `PUT /api/banquesdesang/:id` - Mettre à jour une banque de sang par ID
*   `DELETE /api/banquesdesang/:id` - Supprimer une banque de sang par ID

### Stock de Sang
*   `POST /api/stocksang` - Créer une nouvelle entrée de stock de sang
*   `GET /api/stocksang` - Obtenir toutes les entrées de stock de sang
*   `GET /api/stocksang/:id` - Obtenir une entrée de stock de sang par ID
*   `PUT /api/stocksang/:id` - Mettre à jour une entrée de stock de sang par ID
*   `DELETE /api/stocksang/:id` - Supprimer une entrée de stock de sang par ID

### Demandes
*   `POST /api/demandes` - Créer une nouvelle demande de sang
*   `GET /api/demandes` - Obtenir toutes les demandes de sang
*   `GET /api/demandes/:id` - Obtenir une demande de sang par ID
*   `PUT /api/demandes/:id` - Mettre à jour une demande de sang par ID
*   `DELETE /api/demandes/:id` - Supprimer une demande de sang par ID

### Notifications
*   `POST /api/notifications` - Créer une nouvelle notification
*   `GET /api/notifications` - Obtenir toutes les notifications
*   `GET /api/notifications/:id` - Obtenir une notification par ID
*   `PUT /api/notifications/:id` - Mettre à jour une notification par ID
*   `DELETE /api/notifications/:id` - Supprimer une notification par ID

## Variables d'Environnement

L'application utilise les variables d'environnement suivantes, généralement définies dans un fichier `.env` :

*   `PORT` : Le port sur lequel le serveur Express s'exécutera (par défaut : `3000`).
*   `DB_HOST` : L'hôte de la base de données (par exemple, `localhost` pour une configuration locale, `db` pour Docker Compose).
*   `DB_USER` : Le nom d'utilisateur de la base de données.
*   `DB_PASSWORD` : Le mot de passe de la base de données.
*   `DB_NAME` : Le nom de la base de données.
*   `DB_PORT` : Le port de la base de données (par défaut : `5432` pour PostgreSQL).
*   `JWT_SECRET` : Clé secrète pour la signature des JWT.
*   `JWT_REFRESH_SECRET` : Clé secrète pour la signature des jetons de rafraîchissement JWT.
*   `GOOGLE_CLIENT_ID` : ID client Google OAuth pour l'authentification.

## Utilisation du fichier TODO

Le fichier `TODO.md` à la racine de ce répertoire contient une liste détaillée des tâches restantes pour rendre l'API backend entièrement opérationnelle. Il est structuré par catégories et chaque tâche est marquée avec :

*   `[x]` si la tâche est **accomplie**.
*   `[ ]` si la tâche est **en attente** ou **non commencée**.

Ce fichier est destiné à aider les collaborateurs à :
*   Comprendre l'état d'avancement du projet.
*   Identifier les prochaines étapes et les priorités.
*   Choisir une tâche à réaliser.

Veuillez consulter ce fichier régulièrement pour vous tenir informé des progrès et des besoins du projet.

## Scripts

*   `npm start` : Exécute l'application en mode développement.
*   `npm test` : Exécute les tests unitaires.
*   `npm run test:integration` : Exécute les tests d'intégration.
