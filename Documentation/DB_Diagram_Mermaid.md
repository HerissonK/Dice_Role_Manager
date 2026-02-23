# 🗄️ Schéma de Base de Données — D&D 5e Character Builder

> PostgreSQL · 13 tables · Diagramme entité-relation

```mermaid
erDiagram
    users {
        serial id PK
        varchar username
        varchar email
        text password_hash
        varchar role
        timestamp created_at
        timestamp updated_at
    }

    dnd_species {
        integer id PK
        varchar name
        text description
        jsonb ability_bonuses
        jsonb traits
        integer speed
        jsonb languages
    }

    dnd_class {
        integer id PK
        varchar name
        text description
        integer hit_die
        varchar primary_ability
        jsonb saving_throws
        jsonb armor_proficiencies
        jsonb weapon_proficiencies
        jsonb skills
        integer skill_choices
        jsonb equipment_choices
    }

    dnd_background {
        integer id PK
        varchar name
        jsonb skill_proficiencies
        jsonb tool_proficiencies
        integer languages
        text feature
        jsonb equipment
    }

    dnd_skill {
        integer id PK
        varchar name
        varchar ability
    }

    item {
        serial id PK
        varchar name
        varchar category
        integer armor_class
        varchar dex_modifier_rule
        varchar damage_dice
        varchar damage_type
        jsonb properties
    }

    personnage {
        serial id PK
        varchar name
        integer level
        integer class_id FK
        integer species_id FK
        integer background_id FK
        integer user_id FK
        timestamp created_at
    }

    personnage_caracteristique {
        integer personnage_id FK
        varchar caracteristique
        integer valeur
    }

    personnage_skill {
        integer personnage_id FK
        varchar skill_name
        varchar source
    }

    personnage_item {
        integer personnage_id FK
        integer item_id FK
        boolean equipped
        integer quantity
    }

    users ||--o{ personnage : "possède"
    dnd_class ||--o{ personnage : "définit"
    dnd_species ||--o{ personnage : "est"
    dnd_background ||--o{ personnage : "a pour background"
    personnage ||--o{ personnage_caracteristique : "a"
    personnage ||--o{ personnage_skill : "maîtrise"
    personnage ||--o{ personnage_item : "possède"
    item ||--o{ personnage_item : "est utilisé dans"
```

---

## 📌 Notes sur le schéma

### Clés primaires composites
Les tables de liaison utilisent des clés primaires composites :
- `personnage_caracteristique` : `(personnage_id, caracteristique)`
- `personnage_skill` : `(personnage_id, skill_name)`
- `personnage_item` : `(personnage_id, item_id)`

### Colonnes JSONB
Le type `JSONB` de PostgreSQL est utilisé pour stocker des structures flexibles propres à D&D 5e :

| Table | Colonne | Contenu |
|-------|---------|---------|
| `dnd_species` | `ability_bonuses` | `{"str": 1, "con": 2}` |
| `dnd_species` | `traits` | `["Darkvision", "Fey Ancestry"]` |
| `dnd_class` | `saving_throws` | `["str", "con"]` |
| `dnd_class` | `skills` | `["Athletics", "Intimidation", ...]` |
| `item` | `properties` | `["versatile", "finesse"]` |

### Contraintes CHECK
- `personnage_caracteristique.caracteristique` : valeur parmi `str, dex, con, int, wis, cha`
- `personnage_caracteristique.valeur` : entre 1 et 30
- `personnage.level` : entre 1 et 20

### Transactions SQL
La création d'un personnage est une **opération atomique** : si une étape échoue (insertion des scores, compétences ou équipement), toute la transaction est annulée (`ROLLBACK`).

```sql
BEGIN;
  INSERT INTO personnage ...
  INSERT INTO personnage_caracteristique ...  (×6)
  INSERT INTO personnage_skill ...            (×N)
  INSERT INTO item ...                        (si inexistant)
  INSERT INTO personnage_item ...             (×N)
COMMIT;
```