# TODO: BloodLink Backend API - Liste de contrôle opérationnelle

Cette liste de contrôle décrit les étapes nécessaires pour rendre le serveur backend de BloodLink entièrement opérationnel. Les éléments déjà accomplis sont marqués d'un `[x]`.

## 1. Configuration du Projet

*   [x] Initialisation du projet Node.js (`package.json`)
*   [x] Installation des dépendances principales (Express, Sequelize, pg, dotenv, etc.)
*   [x] Configuration du fichier `.env`
*   [x] Configuration de `src/config/config.json` pour Sequelize
*   [x] Création du point d'entrée `server.js`
*   [x] Création du `Dockerfile` pour l'application Node.js
*   [x] Création du `docker-compose.yml` pour l'orchestration de la base de données et de l'application

## 2. Modèles de Base de Données

*   [x] Définition du modèle `Medecin` (`src/models/Medecin.js`)
*   [x] Définition du modèle `Donneur` (`src/models/Donneur.js`)
*   [x] Définition du modèle `BanqueDeSang` (`src/models/BanqueDeSang.js`)
*   [x] Définition du modèle `StockSang` (`src/models/StockSang.js`)
*   [x] Définition du modèle `Demande` (`src/models/Demande.js`)
*   [x] Définition du modèle `Notification` (`src/models/Notification.js`)
*   [x] Configuration de `src/models/index.js` pour l'agrégation des modèles et les associations

## 3. Contrôleurs

*   [x] Création de `medecinController.js` avec les opérations CRUD
*   [x] Création de `donneurController.js` avec les opérations CRUD
*   [x] Création de `banqueDeSangController.js` avec les opérations CRUD
*   [x] Création de `stockSangController.js` avec les opérations CRUD
*   [x] Création de `demandeController.js` avec les opérations CRUD
*   [x] Création de `notificationController.js` avec les opérations CRUD

## 4. Routes API

*   [ ] Créer `src/routes/index.js` pour consolider toutes les routes
*   [ ] Définir les routes pour `Medecin` (par exemple, `/api/medecins`)
*   [ ] Définir les routes pour `Donneur`
*   [ ] Définir les routes pour `BanqueDeSang`
*   [ ] Définir les routes pour `StockSang`
*   [ ] Définir les routes pour `Demande`
*   [ ] Définir les routes pour `Notification`
*   [ ] Intégrer les routes dans `server.js`

## 5. Authentification et Autorisation

*   [ ] Implémenter l'enregistrement des utilisateurs (pour les Médecins)
*   [ ] Implémenter la connexion des utilisateurs (pour les Médecins)
*   [ ] Implémenter la génération et la validation de JWT
*   [ ] Implémenter un middleware pour l'authentification (par exemple, `src/middlewares/auth.js`)
*   [ ] Implémenter un middleware d'autorisation (par exemple, contrôle d'accès basé sur les rôles)
*   [ ] Intégrer l'authentification Google OAuth (en utilisant `GOOGLE_CLIENT_ID`)

## 6. Gestion des Erreurs

*   [ ] Implémenter un middleware global de gestion des erreurs

## 7. Validation

*   [ ] Implémenter la validation des entrées pour tous les points d'accès API (par exemple, en utilisant Joi ou Express-validator)

## 8. Tests

*   [ ] Écrire des tests unitaires pour les modèles
*   [ ] Écrire des tests unitaires pour les contrôleurs
*   [ ] Écrire des tests d'intégration pour les points d'accès API

## 9. Déploiement

*   [ ] Configurer les variables d'environnement de production
*   [ ] Mettre en place un pipeline CI/CD (facultatif)
