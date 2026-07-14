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
- [Tests](#-tests)
- [Sécurité](#-sécurité)

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
│  HTML/CSS/JS vanilla                             │
│  auth.js · app.js · characters-list.js · play.js│
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────┐
│               Back-end (Node.js)                 │
│  Express · JWT · bcrypt · express-rate-limit     │
│  Routes: /api/auth · /api/characters · /api/play │
└──────────┬──────────────────────────┬────────────┘
           │ pg (node-postgres)       │ redis
┌──────────▼────────────────┐  ┌──────▼─────────────┐
│   Base de données (SQL)   │  │  Cache NoSQL         │
│   PostgreSQL · 9 tables   │  │  Redis (Docker)      │
│   JSONB pour les données  │  │  Journal des lancers │
│   D&D, rôle applicatif    │  │  (clé-valeur)         │
│   restreint (dice_app)    │  │                       │
└────────────────────────────┘  └───────────────────────┘
```

PostgreSQL est installé nativement en local ; seul le service Redis, ajouté spécifiquement pour le journal des lancers, est conteneurisé via Docker Compose (voir [Installation](#-installation)).

---

## 🛠 Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |
| Docker | 24+ (pour le service Redis) |

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/HerissonK/Dice_Role_Manager.git
cd Dice_Role_Manager
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
chmod +x scripts/*.sh
./scripts/init-db.sh
```

Ce script crée les 9 tables de l'application, insère les données D&D de référence (espèces, classes, historiques), et crée un rôle PostgreSQL applicatif restreint (`dice_app`, sans droit de création/suppression de tables — voir [Base de données](#-base-de-données)).

### 5. Peupler la table des items (armes, armures, boucliers)

```bash
psql -U <votre_superuser> -d dnd -f Documentation/populate_item_table.sql
```

### 6. Démarrer le service Redis (conteneurisé)

```bash
docker compose up -d
```

Redis héberge le journal des lancers de dés (composant NoSQL). Vérifiez qu'il tourne avec `docker ps` (statut `healthy`).

---

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données PostgreSQL (rôle applicatif restreint, créé par init-db.sh)
DB_HOST=localhost
DB_PORT=5432
DB_USER=dice_app
DB_PASSWORD=votre_mot_de_passe
DB_NAME=dnd

# Redis (journal des lancers, composant NoSQL)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=votre_secret_très_long_et_aléatoire
JWT_EXPIRES_IN=24h

# Logs
LOG_LEVEL=info
```

> ⚠️ Ne committez jamais votre fichier `.env` en production. `DB_USER` doit correspondre au rôle applicatif restreint `dice_app` (voir [Base de données](#-base-de-données)), pas au superuser PostgreSQL utilisé pour les migrations.

---

## 🗄 Base de données

La base repose sur **9 tables**, réparties en trois groupes fonctionnels : les tables de référence D&D (statiques), la table utilisateur, et les tables de personnage (dynamiques).

### Schéma principal

| Table | Rôle | Groupe |
|-------|------|--------|
| `users` | Comptes utilisateurs | Compte |
| `dnd_species` | Races jouables (bonus raciaux en JSONB) | Référence D&D |
| `dnd_class` | Classes (dé de vie, jets de sauvegarde, compétences en JSONB) | Référence D&D |
| `dnd_background` | Historiques et compétences automatiques | Référence D&D |
| `item` | Armes, armures et boucliers (générique) | Référence D&D |
| `personnage` | Personnages des joueurs | Personnage |
| `personnage_caracteristique` | Scores STR/DEX/CON/INT/WIS/CHA (une ligne par score) | Personnage |
| `personnage_skill` | Compétences maîtrisées (classe + historique) | Personnage |
| `personnage_item` | Items équipés par personnage | Personnage |

Les tables de référence D&D sont peuplées automatiquement par `init.sql` (espèces, classes, historiques) et `populate_item_table.sql` (items). Elles ne sont jamais modifiées par l'utilisateur.

### Rôle applicatif restreint

L'application se connecte via un rôle PostgreSQL dédié (`dice_app`), créé par `Documentation/create-roles.sql` avec des droits strictement limités aux opérations CRUD (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) — aucun droit de création, modification ou suppression de tables. Le compte superuser (`postgres`) n'est utilisé que pour les migrations (`init-db.sh`), jamais par l'application au quotidien.

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

Le front-end est composé de fichiers HTML/CSS/JS statiques. Vous pouvez les servir avec n'importe quel serveur HTTP statique :

```bash
npx serve front-end -p 8080
# ou
python3 -m http.server 8080 --directory front-end
```

L'application sera accessible sur `http://localhost:8080`.

---

## 📁 Structure du projet

```
.
├── front-end/                  # Interface utilisateur (vanilla JS, aucun framework)
│   ├── assets/
│   │   ├── class-icons/        # Icônes SVG des classes D&D (13 fichiers)
│   │   ├── dice/                # Icônes SVG des dés et avantage/désavantage
│   │   └── nav/                 # Icônes de navigation
│   ├── builder/
│   │   ├── builder.html         # Assistant de création en 8 étapes
│   │   └── builder.js           # Logique du builder (Point Buy, étapes)
│   ├── home/
│   │   ├── index.html           # Point d'entrée (connexion / inscription)
│   │   ├── home.html            # Page d'accueil après connexion
│   │   └── home.js               # Logique des formulaires connexion / inscription
│   ├── player/
│   │   ├── my-characters.html   # Liste des personnages
│   │   ├── characters-list.js   # Affichage et suppression des personnages
│   │   ├── play.html            # Mode de jeu (dés + compétences + armes)
│   │   └── play.js               # Lancers de dés, journal, armes
│   ├── styles/
│   │   ├── styles-sauge-or.css  # Thème principal (sauge et or)
│   │   ├── play-sauge-or.css    # Styles spécifiques à la page de jeu
│   │   └── character-card.css   # Styles des cartes personnage
│   └── support/
│       ├── auth.js              # Gestion JWT (login, logout, session)
│       ├── dndData.js           # Données D&D (races, classes, historiques…)
│       └── ui.js                 # Alertes personnalisées, API_BASE_URL
│
├── src/                        # Back-end Node.js / Express
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js             # Connexion Redis (composant NoSQL)
│   │   ├── jwt.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── character.controller.js
│   │   └── play.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── character.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── character.routes.js
│   │   └── play.routes.js
│   ├── services/
│   │   └── rollJournal.service.js  # Composant NoSQL : journal des lancers (Redis)
│   ├── validators/
│   │   └── ruleValidator.js
│   └── utils/
│       ├── dice.js
│       └── modifiers.util.js
│
├── tests/                      # Tests automatisés (Jest — 102 tests)
│   ├── character.model.test.js
│   ├── character.model.findById.test.js
│   ├── character.model.write.test.js
│   ├── rollJournal.service.test.js
│   ├── diceutils.test.js
│   ├── pointbuy.test.js
│   ├── rulevalidator.test.js
│   └── testEnv.setup.js
│
├── scripts/                    # Scripts de déploiement et d'administration
│   ├── init-db.sh               # Initialise le schéma, le rôle applicatif et les données
│   ├── backup-db.sh             # Sauvegarde horodatée (pg_dump)
│   └── restore-db.sh            # Restauration depuis une sauvegarde
│
├── Documentation/
│   ├── init.sql                 # Création des tables + données de référence
│   ├── create-roles.sql         # Création du rôle applicatif restreint (dice_app)
│   └── populate_item_table.sql  # Population de la table item
│
├── docker-compose.yml           # Service Redis conteneurisé
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
| POST | `/api/play/:id/roll/resolve-attack` | Jet d'attaque **et** dégâts résolus en un seul appel serveur | ✅ |
| POST | `/api/play/:id/roll/damage` | Jet de dégâts isolé (hors combat, jamais critique) | ✅ |
| POST | `/api/play/roll` | Lancer libre (NdX) | ✅ |
| GET | `/api/play/:id/journal` | Journal des lancers récents (Redis, composant NoSQL) | ✅ |

**Exemple — Jet d'attaque résolu :**
```json
// Corps
{ "weaponId": 3 }

// Réponse
{
  "weaponName": "Épée longue",
  "attack": {
    "d20": 20,
    "attackModifier": 3,
    "proficiencyBonus": 2,
    "total": 25,
    "isCritical": true,
    "isFumble": false
  },
  "damage": {
    "damageType": "slashing",
    "dice": "2d8",
    "rolls": [6, 7],
    "diceTotal": 13,
    "damageModifier": 3,
    "total": 16
  }
}
```

> ⚠️ `isCritical` est déterminé et exploité **uniquement côté serveur**, dans ce même appel. La route `/roll/damage` isolée n'accepte plus de valeur `isCritical` transmise par le client — elle ne renvoie que des dégâts non critiques, afin qu'aucun chemin de contournement ne subsiste (voir section 15 du dossier RNCP pour le détail de la faille corrigée).

---

## 🎨 Front-end

Le front-end ne dépend d'**aucun framework** (JS vanilla + CSS custom).

### Pages

| Fichier | Description |
|---------|-------------|
| `home/index.html` | Connexion / inscription (point d'entrée) |
| `home/home.html` | Accueil après connexion |
| `builder/builder.html` | Assistant de création en 8 étapes |
| `player/my-characters.html` | Gestion de vos personnages |
| `player/play.html` | Interface de jeu avec lanceur de dés |

### Thème visuel

**Sauge et or** (`styles-sauge-or.css`) — fond vert sauge foncé, typographie et accents dorés, sobre et sans framework CSS externe. Un fichier `play-sauge-or.css` complète le thème avec des styles spécifiques à la page de jeu, et `character-card.css` gère l'affichage des cartes personnage sur la page `my-characters.html`.

### Authentification côté client

La session est stockée dans `localStorage` :
- `authToken` — token JWT
- `currentUser` — informations de l'utilisateur connecté

---

## ⚔️ Règles D&D implémentées

### Point Buy
- Budget de 27 points
- Scores de 8 (0 pt) à 15 (9 pts)
- Coûts progressifs : 8→13 = 1 pt par palier, 13→14 = 2 pts, 14→15 = 2 pts

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
| Bouclier | +2 CA dans tous les cas (sauf bonus explicite différent) |

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

## 🧪 Tests

Le projet inclut une suite de tests automatisés avec **Jest** — 102 tests répartis en 7 suites :

```bash
npm test
```

| Fichier | Couverture |
|---------|-----------|
| `rulevalidator.test.js` | Validation des règles métier (nom, niveau, caractéristiques, Point Buy) |
| `character.model.test.js` | Calcul de la Classe d'Armure (`calculateArmorClass`) |
| `diceutils.test.js` | Lancers de dés et calcul de modificateurs |
| `pointbuy.test.js` | Logique Point Buy côté front-end |
| `character.model.findById.test.js` | Accès aux données SQL — lecture (`findById`, `getEquippedItems`, `findAllByUser`) |
| `character.model.write.test.js` | Accès aux données SQL — écriture (`create`, `updateById`, `updateName`, `deleteById`) |
| `rollJournal.service.test.js` | Accès aux données **NoSQL** (Redis) — journal des lancers, isolation entre personnages |

Les composants d'accès aux données (SQL et NoSQL) sont couverts par des tests dédiés qui vérifient à la fois leur comportement fonctionnel et leur sécurité : requêtes SQL systématiquement paramétrées, chaque opération filtrée par `user_id`, et journaux Redis isolés par personnage.

---

## 🔒 Sécurité

- Mots de passe hachés avec **bcrypt** (10 rounds)
- Authentification par **JWT** (expiration configurable)
- Protection contre les attaques par force brute via **express-rate-limit** :
  - 15 tentatives de connexion par 15 minutes
  - 20 créations de personnages par heure
- Requêtes SQL paramétrées (protection contre l'injection SQL)
- Validation des données côté serveur (`ruleValidator.js`), indépendante du front-end
- Principe du moindre privilège en base de données : rôle applicatif `dice_app` restreint aux opérations CRUD, distinct du superuser utilisé pour les migrations
- Jet critique aux dégâts (`isCritical`) déterminé et exploité exclusivement côté serveur (`resolveAttack`), jamais transmis par le client entre deux appels

---

## 📝 Licence

Projet réalisé à des fins éducatives, dans le cadre du Titre Professionnel Développeur Web et Web Mobile (TP-01280). Les règles de D&D 5e sont la propriété de **Wizards of the Coast**.