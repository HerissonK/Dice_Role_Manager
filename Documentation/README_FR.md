# 🎲 Dice Roll Manager — D&D 5e Character Builder

Application web full-stack de création et gestion de personnages pour **Donjons & Dragons 5ème édition**. Créez votre personnage étape par étape, sauvegardez-le en base de données, puis jouez en lançant des dés directement depuis l'interface.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Base de données](#-base-de-données)
- [Lancement](#-lancement)
- [Structure du projet](#-structure-du-projet)
- [API](#-api)
- [Front-end](#-front-end)
- [Règles D&D implémentées](#-règles-dd-implémentées)

---

## ✨ Fonctionnalités

### Création de personnage (8 étapes guidées)
1. **Nom** — Nommez votre personnage
2. **Espèce** — Humain, Elfe, Nain, Halfelin, Drakéide, Demi-elfe (avec bonus raciaux)
3. **Classe** — Guerrier, Magicien, Roublard, Clerc, Rôdeur, Paladin
4. **Caractéristiques** — Système Point Buy (27 points, scores 8–15)
5. **Historique** — Acolyte, Criminel, Érudit, Soldat, Héros du peuple, Noble
6. **Compétences** — Choix de classe + maîtrises d'historique automatiques
7. **Équipement** — Sélection d'armes et d'armures selon la classe
8. **Fiche finale** — Récapitulatif complet avec calculs automatiques

### Gestion des personnages
- Sauvegarde cloud des personnages (authentification JWT)
- Liste de vos personnages avec PV et CA calculés
- Visualisation détaillée dans un modal
- Suppression avec confirmation

### Mode de jeu
- Jet de caractéristiques (1d20 + modificateur)
- Jet de compétences avec indication de maîtrise (★)
- Jet d'attaque avec détection des coups critiques (20 naturel)
- Jet de dégâts (avec dés doublés sur critique)
- Lanceur libre (d4, d6, d8, d10, d12, d20, d100)
- Lanceur personnalisé (NdX)
- Journal des lancers persistant (localStorage)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Front-end                       │
│  HTML/CSS/JS vanilla · Dark Gaming Theme        │
│  auth.js · app.js · characters-list.js · play.js│
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────┐
│               Back-end (Node.js)                 │
│  Express · JWT · bcrypt · express-rate-limit     │
│  Routes: /api/auth · /api/characters · /api/play │
└────────────────────┬────────────────────────────┘
                     │ pg (node-postgres)
┌────────────────────▼────────────────────────────┐
│              Base de données                     │
│  PostgreSQL · 13 tables · JSONB pour les données │
│  D&D (bonus raciaux, propriétés d'armes, etc.)  │
└─────────────────────────────────────────────────┘
```

---

## 🛠 Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd dnd-character-builder
```

### 2. Installer les dépendances back-end

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` avec vos valeurs (voir [Configuration](#-configuration)).

### 4. Initialiser la base de données

```bash
psql -U <votre_user> -d <votre_db> -f init.sql
```

Ce script crée toutes les tables et insère les données D&D de référence (espèces, classes, historiques, armes, armures, compétences).

### 5. Peupler la table des items

```bash
psql -U <votre_user> -d <votre_db> -f populate_item_table.sql
```

---

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=votre_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=dnd

# JWT
JWT_SECRET=votre_secret_très_long_et_aléatoire
JWT_EXPIRES_IN=24h

# Logs
LOG_LEVEL=info
```

> ⚠️ Ne committez jamais votre fichier `.env` en production.

---

## 🗄 Base de données

### Schéma principal

| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs |
| `dnd_species` | Races jouables (avec bonus JSONB) |
| `dnd_class` | Classes avec dé de vie, jets de sauvegarde |
| `dnd_background` | Historiques et compétences automatiques |
| `dnd_skill` | 18 compétences D&D |
| `dnd_weapon` | Armes de référence |
| `dnd_armor` | Armures de référence |
| `item` | Items génériques (armes + armures créées à la volée) |
| `personnage` | Personnages des joueurs |
| `personnage_caracteristique` | Scores STR/DEX/CON/INT/WIS/CHA |
| `personnage_skill` | Compétences maîtrisées (classe + historique) |
| `personnage_item` | Items équipés par personnage |

### Compte administrateur par défaut

Créé automatiquement lors de l'exécution de `init.sql` :

```
Email    : admin@dice.local
Password : Admin123!
```

---

## ▶️ Lancement

### Développement

```bash
# Démarrer le serveur back-end
node src/server.js

# Ou avec rechargement automatique
npx nodemon src/server.js
```

### Servir le front-end

Le front-end est composé de fichiers HTML/CSS/JS statiques dans `front-end/`. Vous pouvez les servir avec n'importe quel serveur HTTP statique :

```bash
# Avec VS Code Live Server (recommandé)
# Ou avec npx serve
npx serve front-end -p 8080

# Ou avec Python
python3 -m http.server 8080 --directory front-end
```

L'application sera accessible sur `http://localhost:8080`.

---

## 📁 Structure du projet

```
.
├── front-end/                  # Interface utilisateur
│   ├── index.html              # Page d'accueil (connexion / inscription)
│   ├── builder.html            # Création de personnage (8 étapes)
│   ├── my-characters.html      # Liste des personnages
│   ├── play.html               # Mode de jeu (dés + compétences + armes)
│   ├── app.js                  # Logique du builder (Point Buy, étapes)
│   ├── auth.js                 # Gestion JWT (login, logout, session)
│   ├── characters-list.js      # Affichage et suppression des personnages
│   ├── play.js                 # Lancers de dés, journal, armes
│   ├── home.js                 # Formulaires de connexion / inscription
│   ├── dndData.js              # Données D&D (races, classes, historiques…)
│   ├── styles-dark-gaming.css  # Thème principal Dark Gaming
│   ├── play-dark-gaming.css    # Styles spécifiques à la page de jeu
│   └── play.css                # Thème alternatif Taverne Mystique
│
├── src/                        # Back-end Node.js / Express
│   ├── app.js                  # Configuration Express (CORS, routes)
│   ├── server.js               # Point d'entrée du serveur
│   ├── config/
│   │   ├── database.js         # Pool PostgreSQL
│   │   ├── jwt.js              # Configuration JWT
│   │   └── logger.js           # Logger Winston
│   ├── controllers/
│   │   ├── auth.controller.js  # Inscription / connexion
│   │   ├── character.controller.js  # CRUD personnages
│   │   └── play.controller.js  # Jets de dés, attaque, dégâts
│   ├── middlewares/
│   │   └── auth.middleware.js  # Vérification JWT
│   ├── models/
│   │   ├── character.model.js  # Requêtes SQL personnage
│   │   └── user.model.js       # Requêtes SQL utilisateur
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── character.routes.js
│   │   └── play.routes.js
│   ├── services/
│   │   └── armor.service.js    # Calcul de la Classe d'Armure
│   ├── validators/
│   │   └── ruleValidator.js    # Validation des règles D&D
│   └── utils/
│       ├── dice.js             # Fonctions de lancer de dés
│       ├── dnd.rules.js        # Calcul modificateurs d'attaque
│       └── modifiers.util.js   # Modificateur de caractéristique
│
├── init.sql                    # Création des tables + données de référence
├── populate_item_table.sql     # Population de la table item
└── README.md
```

---

## 🔌 API

Toutes les routes protégées nécessitent un header :
```
Authorization: Bearer <token_jwt>
```

### Authentification

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Créer un compte | Non |
| POST | `/api/auth/login` | Se connecter | Non |

**Corps de `/api/auth/login` :**
```json
{
  "email": "joueur@exemple.com",
  "password": "MotDePasse123!"
}
```

**Réponse :**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "username": "Gandalf", "email": "...", "role": "user" }
}
```

---

### Personnages

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/characters` | Créer un personnage | ✅ |
| GET | `/api/characters` | Lister mes personnages | ✅ |
| GET | `/api/characters/:id` | Détail d'un personnage | ✅ |
| PUT | `/api/characters/:id` | Modifier un personnage | ✅ |
| DELETE | `/api/characters/:id` | Supprimer un personnage | ✅ |

**Corps de POST `/api/characters` :**
```json
{
  "name": "Aragorn",
  "level": 1,
  "classId": 1,
  "speciesId": 1,
  "backgroundId": 4,
  "abilities": {
    "str": 15, "dex": 13, "con": 14,
    "int": 10, "wis": 12, "cha": 8
  },
  "skills": ["Athlétisme", "Intimidation"],
  "equipment": [
    { "name": "Épée longue", "category": "weapon", "damage_dice": "1d8", "damage_type": "slashing", "properties": ["versatile"] },
    { "name": "Cotte de mailles", "category": "armor", "armor_class": 16, "dex_modifier_rule": "none" }
  ]
}
```

---

### Mode de jeu

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/play/:id` | Charger un personnage | ✅ |
| POST | `/api/play/:id/roll/ability` | Jet de caractéristique | ✅ |
| POST | `/api/play/:id/roll/attack` | Jet d'attaque avec arme | ✅ |
| POST | `/api/play/:id/roll/damage` | Jet de dégâts | ✅ |
| POST | `/api/play/roll` | Lancer libre (NdX) | ✅ |

**Exemple — Jet d'attaque :**
```json
// Corps
{ "weaponId": 3 }

// Réponse
{
  "weaponName": "Épée longue",
  "d20": 18,
  "attackModifier": 3,
  "proficiencyBonus": 2,
  "total": 23,
  "isCritical": false,
  "isFumble": false
}
```

---

## 🎨 Front-end

Le front-end ne dépend d'**aucun framework** (JS vanilla + CSS custom).

### Pages

| Fichier | Description |
|---------|-------------|
| `index.html` | Connexion, inscription, accueil |
| `builder.html` | Assistant de création en 8 étapes |
| `my-characters.html` | Gestion de vos personnages |
| `play.html` | Interface de jeu avec lanceur de dés |

### Thèmes CSS

Deux thèmes sont disponibles :

- **Dark Gaming** (`styles-dark-gaming.css`) — Thème sombre aux teintes bleues électriques, utilisé sur toutes les pages.
- **Taverne Mystique** (`play.css`) — Thème clair inspiré des tavernes médiévales (palette safran / violet).

### Authentification côté client

La session est stockée dans `localStorage` :
- `authToken` — token JWT
- `currentUser` — informations de l'utilisateur connecté

---

## ⚔️ Règles D&D implémentées

### Point Buy
- Budget de 27 points
- Scores de 8 (0 pt) à 15 (9 pts)
- Coûts progressifs : 8→13 = 1 pt/score, 14 = 2 pts, 15 = 2 pts

### Bonus raciaux
Appliqués automatiquement aux caractéristiques de base lors de l'affichage et des calculs de PV/CA.

### Calcul des Points de Vie (niveau 1)
```
PV = Dé de vie + Modificateur de Constitution
```

### Classe d'Armure
| Situation | Formule |
|-----------|---------|
| Sans armure | 10 + mod. DEX |
| Armure légère | CA armure + mod. DEX (illimité) |
| Armure intermédiaire | CA armure + mod. DEX (max +2) |
| Armure lourde | CA armure (DEX ignorée) |
| Bouclier | +2 CA dans tous les cas |

### Modificateur d'attaque / dégâts
| Type d'arme | Caractéristique utilisée |
|-------------|--------------------------|
| Mêlée classique | Force |
| Arme à distance | Dextérité |
| Finesse (rapière, dague…) | MAX(Force, Dextérité) |

### Jet d'attaque
```
Total = 1d20 + modificateur de caractéristique + bonus de maîtrise (+2 au niveau 1)
```
- **20 naturel** → Coup critique (dés de dégâts doublés)
- **1 naturel** → Échec critique

### Compétences maîtrisées
```
Bonus total = modificateur de caractéristique + bonus de maîtrise (+2)
```
Les maîtrises proviennent de deux sources fusionnées :
- **Historique** — compétences fixes, non modifiables
- **Classe** — choix du joueur lors de la création

---

## 🔒 Sécurité

- Mots de passe hachés avec **bcrypt** (10 rounds)
- Authentification par **JWT** (expiration configurable)
- Protection contre les attaques par force brute via **express-rate-limit** :
  - 15 tentatives de connexion par 15 minutes
  - 20 créations de personnages par heure
- Validation des données côté serveur (`ruleValidator.js`)

---

## 📝 Licence

Projet réalisé à des fins éducatives. Les règles de D&D 5e sont la propriété de **Wizards of the Coast**.