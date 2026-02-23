# 🏗️ Architecture de l'Application — D&D 5e Character Builder

> Node.js · Express · PostgreSQL · Vanilla JS

---

## Vue d'ensemble

```mermaid
graph TB
    subgraph CLIENT["🖥️ CLIENT — Vanilla JS / HTML / CSS"]
        direction TB
        A1["📄 index.html\nhome.js\nLogin / Inscription"]
        A2["📄 builder.html\napp.js\nAssistant création 8 étapes"]
        A3["📄 my-characters.html\ncharacters-list.js\nListe & gestion des personnages"]
        A4["📄 play.html\nplay.js\nMode jeu — jets de dés"]
        A5["📦 auth.js\nGestion session JWT\nlocalStorage"]
        A6["🎨 styles-dark-gaming.css\nThème visuel global"]
    end

    subgraph API["⚙️ API — Node.js / Express"]
        direction TB
        B1["🚀 app.js + server.js\nCORS · JSON · Rate limiting"]
        B2["🛡️ auth.middleware.js\nVérification JWT Bearer token"]
        subgraph ROUTES["📡 Routes"]
            B3["POST /api/auth/register\nPOST /api/auth/login"]
            B4["GET|POST /api/characters\nGET|PUT|DELETE /api/characters/:id"]
            B5["GET /api/play/:id\nPOST /api/play/:id/roll/ability\nPOST /api/play/:id/roll/attack\nPOST /api/play/:id/roll/damage"]
        end
        subgraph CONTROLLERS["🎮 Controllers"]
            B6["auth.controller.js\nbcrypt · jwt.sign()"]
            B7["character.controller.js\nCRUD personnages"]
            B8["play.controller.js\nJets de dés & règles D&D"]
        end
        subgraph SERVICES["🔧 Services & Utilitaires"]
            B9["armor.service.js\nCalcul Classe d'Armure"]
            B10["ruleValidator.js\nValidation règles D&D"]
            B11["dice.js · modifiers.util.js\nJets de dés · Modificateurs"]
        end
    end

    subgraph DB["🗄️ DATA — PostgreSQL"]
        direction TB
        C1["📋 character.model.js\nuser.model.js"]
        subgraph TABLES["Tables"]
            C2["Tables référence D&D\ndnd_class · dnd_species\ndnd_background · dnd_skill\nitem"]
            C3["Tables utilisateurs\nusers"]
            C4["Tables personnages\npersonnage\npersonnage_caracteristique\npersonnage_skill\npersonnage_item"]
        end
    end

    A1 & A2 & A3 & A4 -->|"HTTP REST\nAuthorization: Bearer token"| B1
    A5 -.->|"session JWT"| A1 & A2 & A3 & A4
    B1 --> B2 --> ROUTES
    B3 --> B6
    B4 --> B7
    B5 --> B8
    B6 & B7 & B8 --> SERVICES
    B7 & B8 --> C1
    C1 --> TABLES
```

---

## Flux d'authentification

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Front-end (auth.js)
    participant A as API /auth
    participant DB as PostgreSQL

    U->>F: Saisit email + mot de passe
    F->>A: POST /api/auth/login
    A->>DB: SELECT * FROM users WHERE email = ?
    DB-->>A: Retourne l'utilisateur
    A->>A: bcrypt.compare(password, hash)
    A-->>F: 200 OK + JWT token (24h)
    F->>F: localStorage.setItem('authToken', token)
    F-->>U: Redirect vers builder.html
```

---

## Flux de création de personnage

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as builder.html / app.js
    participant A as API /characters
    participant DB as PostgreSQL

    U->>F: Complète les 8 étapes
    F->>A: POST /api/characters\n(Bearer token)
    A->>A: Vérifie JWT middleware
    A->>A: ruleValidator.js\n(Point Buy, niveau, nom)
    A->>DB: BEGIN TRANSACTION
    A->>DB: INSERT INTO personnage
    A->>DB: INSERT INTO personnage_caracteristique ×6
    A->>DB: INSERT INTO item (si inexistant)
    A->>DB: INSERT INTO personnage_item
    A->>DB: INSERT INTO personnage_skill
    A->>DB: COMMIT
    DB-->>A: personnage.id
    A-->>F: 201 Created + personnage
    F-->>U: Redirect vers my-characters.html
```

---

## Flux d'un jet d'attaque (Mode Jeu)

```mermaid
sequenceDiagram
    actor U as Joueur
    participant F as play.html / play.js
    participant A as API /play
    participant DB as PostgreSQL

    U->>F: Clique "Attaque" sur l'arme
    F->>A: POST /api/play/:id/roll/attack\n{ weaponId: 3 }
    A->>DB: Récupère personnage + arme + scores
    DB-->>A: Données personnage
    A->>A: Détermine modificateur\n(FOR / DEX / finesse)
    A->>A: rollDice(20) → d20
    A->>A: total = d20 + mod + proficiencyBonus
    A->>A: Détecte critique (20) ou fumble (1)
    A-->>F: { d20, total, isCritical, isFumble }
    F->>F: Affiche bannière résultat
    alt Coup critique
        F->>U: Modal coup critique animé
    end
    F->>F: Ajoute au journal (localStorage)
```

---

## Calcul de la Classe d'Armure

```mermaid
flowchart TD
    START([Personnage chargé]) --> Q1{Armure équipée ?}
    Q1 -->|Non| CA1["CA = 10 + mod DEX\nPas d'armure"]
    Q1 -->|Oui| Q2{Type d'armure ?}
    Q2 -->|Légère| CA2["CA = base_armor + mod DEX\nbonus DEX illimité"]
    Q2 -->|Moyenne| CA3["CA = base_armor + mod DEX\nmax +2 DEX"]
    Q2 -->|Lourde| CA4["CA = base_armor\nDEX ignorée"]
    CA1 & CA2 & CA3 & CA4 --> Q3{Bouclier équipé ?}
    Q3 -->|Oui| SHIELD["CA = CA + 2"]
    Q3 -->|Non| FINAL
    SHIELD --> FINAL([CA finale])
```

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Front-end** | HTML5, CSS3 (variables CSS), Vanilla JavaScript ES6+ |
| **Back-end** | Node.js, Express.js, JWT (jsonwebtoken), bcrypt, express-rate-limit |
| **Base de données** | PostgreSQL 14+, node-postgres (pg), JSONB |
| **Sécurité** | Bcrypt (10 rounds), JWT 24h, Rate limiting, Requêtes paramétrées |
| **Logs** | Winston |
| **Tests** | Postman (tests manuels API), Chrome DevTools |