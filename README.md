# 🎲 Dice Roll Manager — D&D 5e Character Builder

A full-stack web application for creating and managing characters for **Dungeons & Dragons 5th Edition**. Build your character step by step, save it to the database, then play by rolling dice directly from the interface.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database](#-database)
- [Running the App](#-running-the-app)
- [Project Structure](#-project-structure)
- [API](#-api)
- [Front-end](#-front-end)
- [D&D Rules Implemented](#-dd-rules-implemented)

---

## ✨ Features

### Character Creation (8 guided steps)
1. **Name** — Name your character
2. **Species** — Human, Elf, Dwarf, Halfling, Dragonborn, Half-elf (with racial bonuses)
3. **Class** — Fighter, Wizard, Rogue, Cleric, Ranger, Paladin
4. **Ability Scores** — Point Buy system (27 points, scores 8–15)
5. **Background** — Acolyte, Criminal, Sage, Soldier, Folk Hero, Noble
6. **Skills** — Class choices + automatic background proficiencies
7. **Equipment** — Weapon and armor selection based on class
8. **Final Sheet** — Full summary with automatic calculations

### Character Management
- Cloud save for characters (JWT authentication)
- Character list with calculated HP and AC
- Detailed view in a modal
- Deletion with confirmation

### Play Mode
- Ability checks (1d20 + modifier)
- Skill checks with proficiency indicator (★)
- Attack rolls with critical hit detection (natural 20)
- Damage rolls (dice doubled on critical)
- Free dice roller (d4, d6, d8, d10, d12, d20, d100)
- Custom roller (NdX)
- Persistent roll journal (localStorage)

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
│                  Database                        │
│  PostgreSQL · 13 tables · JSONB for D&D data    │
│  (racial bonuses, weapon properties, etc.)      │
└─────────────────────────────────────────────────┘
```

---

## 🛠 Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd dnd-character-builder
```

### 2. Install back-end dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Configuration](#-configuration)).

### 4. Initialize the database

```bash
psql -U <your_user> -d <your_db> -f init.sql
```

This script creates all tables and inserts D&D reference data (species, classes, backgrounds, weapons, armors, skills).

### 5. Populate the items table

```bash
psql -U <your_user> -d <your_db> -f populate_item_table.sql
```

---

## ⚙️ Configuration

Create a `.env` file at the root of the project:

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=dnd

# JWT
JWT_SECRET=your_very_long_and_random_secret
JWT_EXPIRES_IN=24h

# Logs
LOG_LEVEL=info
```

> ⚠️ Never commit your `.env` file to version control.

---

## 🗄 Database

### Main Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `dnd_species` | Playable races (with JSONB bonuses) |
| `dnd_class` | Classes with hit die, saving throws |
| `dnd_background` | Backgrounds and automatic skill proficiencies |
| `dnd_skill` | 18 D&D skills |
| `dnd_weapon` | Reference weapons |
| `dnd_armor` | Reference armors |
| `item` | Generic items (weapons + armors created on the fly) |
| `personnage` | Player characters |
| `personnage_caracteristique` | STR/DEX/CON/INT/WIS/CHA scores |
| `personnage_skill` | Mastered skills (class + background) |
| `personnage_item` | Items equipped by character |

### Default Administrator Account

Created automatically when running `init.sql`:

```
Email    : admin@dice.local
Password : Admin123!
```

---

## ▶️ Running the App

### Development

```bash
# Start the back-end server
node src/server.js

# Or with automatic reload
npx nodemon src/server.js
```

### Serving the Front-end

The front-end consists of static HTML/CSS/JS files in `front-end/`. You can serve them with any static HTTP server:

```bash
# With VS Code Live Server (recommended)
# Or with npx serve
npx serve front-end -p 8080

# Or with Python
python3 -m http.server 8080 --directory front-end
```

The application will be available at `http://localhost:8080`.

---

## 📁 Project Structure

```
.
├── front-end/                  # User interface
│   ├── index.html              # Home page (login / register)
│   ├── builder.html            # Character creation (8 steps)
│   ├── my-characters.html      # Character list
│   ├── play.html               # Play mode (dice + skills + weapons)
│   ├── app.js                  # Builder logic (Point Buy, steps)
│   ├── auth.js                 # JWT management (login, logout, session)
│   ├── characters-list.js      # Character display and deletion
│   ├── play.js                 # Dice rolls, journal, weapons
│   ├── home.js                 # Login / register forms
│   ├── dndData.js              # D&D data (races, classes, backgrounds…)
│   ├── styles-dark-gaming.css  # Main Dark Gaming theme
│   ├── play-dark-gaming.css    # Play page specific styles
│   └── play.css                # Alternative Mystic Tavern theme
│
├── src/                        # Node.js / Express back-end
│   ├── app.js                  # Express setup (CORS, routes)
│   ├── server.js               # Server entry point
│   ├── config/
│   │   ├── database.js         # PostgreSQL pool
│   │   ├── jwt.js              # JWT configuration
│   │   └── logger.js           # Winston logger
│   ├── controllers/
│   │   ├── auth.controller.js  # Register / login
│   │   ├── character.controller.js  # CRUD characters
│   │   └── play.controller.js  # Dice rolls, attack, damage
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT verification
│   ├── models/
│   │   ├── character.model.js  # Character SQL queries
│   │   └── user.model.js       # User SQL queries
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── character.routes.js
│   │   └── play.routes.js
│   ├── services/
│   │   └── armor.service.js    # Armor Class calculation
│   ├── validators/
│   │   └── ruleValidator.js    # D&D rule validation
│   └── utils/
│       ├── dice.js             # Dice roll functions
│       ├── dnd.rules.js        # Attack modifier calculations
│       └── modifiers.util.js   # Ability score modifier
│
├── init.sql                    # Table creation + reference data
├── populate_item_table.sql     # Item table population
└── README.md
```

---

## 🔌 API

All protected routes require the following header:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |

**Body for `/api/auth/login`:**
```json
{
  "email": "player@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "username": "Gandalf", "email": "...", "role": "user" }
}
```

---

### Characters

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/characters` | Create a character | ✅ |
| GET | `/api/characters` | List my characters | ✅ |
| GET | `/api/characters/:id` | Character details | ✅ |
| PUT | `/api/characters/:id` | Update a character | ✅ |
| DELETE | `/api/characters/:id` | Delete a character | ✅ |

**Body for POST `/api/characters`:**
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
  "skills": ["Athletics", "Intimidation"],
  "equipment": [
    { "name": "Longsword", "category": "weapon", "damage_dice": "1d8", "damage_type": "slashing", "properties": ["versatile"] },
    { "name": "Chain Mail", "category": "armor", "armor_class": 16, "dex_modifier_rule": "none" }
  ]
}
```

---

### Play Mode

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/play/:id` | Load a character | ✅ |
| POST | `/api/play/:id/roll/ability` | Ability check | ✅ |
| POST | `/api/play/:id/roll/attack` | Attack roll with weapon | ✅ |
| POST | `/api/play/:id/roll/damage` | Damage roll | ✅ |
| POST | `/api/play/roll` | Free roll (NdX) | ✅ |

**Example — Attack roll:**
```json
// Body
{ "weaponId": 3 }

// Response
{
  "weaponName": "Longsword",
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

The front-end has **no framework dependencies** (vanilla JS + custom CSS).

### Pages

| File | Description |
|------|-------------|
| `index.html` | Login, register, home |
| `builder.html` | 8-step creation wizard |
| `my-characters.html` | Character management |
| `play.html` | Play interface with dice roller |

### CSS Themes

Two themes are available:

- **Dark Gaming** (`styles-dark-gaming.css`) — Dark theme with electric blue tones, used across all pages.
- **Mystic Tavern** (`play.css`) — Light theme inspired by medieval taverns (saffron / violet palette).

### Client-side Authentication

The session is stored in `localStorage`:
- `authToken` — JWT token
- `currentUser` — logged-in user information

---

## ⚔️ D&D Rules Implemented

### Point Buy
- Budget of 27 points
- Scores from 8 (0 pts) to 15 (9 pts)
- Progressive costs: 8→13 = 1 pt/score, 14 = 2 pts, 15 = 2 pts

### Racial Bonuses
Automatically applied to base ability scores when displaying characters and calculating HP/AC.

### Hit Points Calculation (Level 1)
```
HP = Hit Die + Constitution Modifier
```

### Armor Class
| Situation | Formula |
|-----------|---------|
| No armor | 10 + DEX modifier |
| Light armor | Armor AC + DEX modifier (unlimited) |
| Medium armor | Armor AC + DEX modifier (max +2) |
| Heavy armor | Armor AC (DEX ignored) |
| Shield | +2 AC in all cases |

### Attack / Damage Modifier
| Weapon type | Ability used |
|-------------|--------------|
| Standard melee | Strength |
| Ranged weapon | Dexterity |
| Finesse (rapier, dagger…) | MAX(Strength, Dexterity) |

### Attack Roll
```
Total = 1d20 + ability modifier + proficiency bonus (+2 at level 1)
```
- **Natural 20** → Critical hit (damage dice doubled)
- **Natural 1** → Critical fumble

### Skill Proficiencies
```
Total bonus = ability modifier + proficiency bonus (+2)
```
Proficiencies come from two merged sources:
- **Background** — fixed skills, cannot be changed
- **Class** — player's choice during character creation

---

## 🔒 Security

- Passwords hashed with **bcrypt** (10 rounds)
- Authentication via **JWT** (configurable expiration)
- Brute-force protection via **express-rate-limit**:
  - 15 login attempts per 15 minutes
  - 20 character creations per hour
- Server-side data validation (`ruleValidator.js`)

---

## 📝 License

Project built for educational purposes. D&D 5e rules are the property of **Wizards of the Coast**.