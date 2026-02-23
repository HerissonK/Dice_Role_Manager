# 📋 Plan de Sprints — D&D 5e Character Builder

## Vue d'ensemble du projet

| | |
|---|---|
| **Projet** | Dice Roll Manager — D&D 5e Character Builder |
| **Équipe** | 1 développeur (solo) |
| **Durée de sprint** | 1 semaine |
| **Nombre de sprints** | 4 |
| **Méthodologie** | Agile / Scrum adapté solo |
| **Outils de suivi** | Trello (kanban), Postman (tests API) |

---

## Priorisation MoSCoW

| Priorité | Fonctionnalités |
|----------|----------------|
| **Must Have** | Authentification JWT, Création de personnage (8 étapes), Système Point Buy, Sauvegarde en BDD, Liste des personnages |
| **Should Have** | Mode jeu (jets de dés), Jets de compétences, Jets d'attaque et dégâts, Journal de jets |
| **Could Have** | Modal coup critique animé, Lanceur de dés libre, Export JSON du personnage, Application des bonus raciaux |
| **Won't Have** | Sessions multijoueurs, Gestion des sorts, Système de montée en niveau, Application mobile |

---

## Sprint 1 — Foundation & Authentification
**Semaine 1** | **Objectif :** Back-end fonctionnel avec base de données et authentification sécurisée

### Tâches

| ID | Tâche | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| S1-01 | Initialiser le projet Node.js/Express | Must | ✅ Terminé | Architecture `src/` |
| S1-02 | Configurer le pool de connexion PostgreSQL | Must | ✅ Terminé | `config/database.js` |
| S1-03 | Écrire `init.sql` — création des 13 tables | Must | ✅ Terminé | Contraintes et index inclus |
| S1-04 | Insérer les données D&D de référence (races, classes, backgrounds, armes, armures, compétences) | Must | ✅ Terminé | Blocs INSERT dans `init.sql` |
| S1-05 | Implémenter `POST /api/auth/register` | Must | ✅ Terminé | Hash bcrypt, validation |
| S1-06 | Implémenter `POST /api/auth/login` | Must | ✅ Terminé | Token JWT signé |
| S1-07 | Créer le middleware JWT (`auth.middleware.js`) | Must | ✅ Terminé | Vérification Bearer token |
| S1-08 | Ajouter le rate limiting (express-rate-limit) | Should | ✅ Terminé | 15/15min login, 20/h création |
| S1-09 | Configurer le logger Winston | Could | ✅ Terminé | `config/logger.js` |
| S1-10 | Créer le modèle `users` (findByEmail, findById, create) | Must | ✅ Terminé | |

**Vélocité Sprint 1 :** 10/10 tâches — 100% ✅

---

## Sprint 2 — CRUD Personnages & Modèle de données
**Semaine 2** | **Objectif :** Création, lecture, mise à jour et suppression de personnages avec les règles D&D 5e

### Tâches

| ID | Tâche | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| S2-01 | Implémenter `character.model.js` — `create()` avec transaction SQL | Must | ✅ Terminé | BEGIN/COMMIT/ROLLBACK |
| S2-02 | Sauvegarder les scores en BDD (`personnage_caracteristique`) | Must | ✅ Terminé | |
| S2-03 | Sauvegarder les compétences (`personnage_skill`) avec source | Must | ✅ Terminé | classe ou background |
| S2-04 | Sauvegarder l'équipement (`personnage_item`) avec insertion à la volée | Must | ✅ Terminé | Lookup par nom |
| S2-05 | Implémenter `findAllByUser()` avec bonus raciaux JSONB | Must | ✅ Terminé | |
| S2-06 | Implémenter `findById()` — fusion compétences background + classe | Must | ✅ Terminé | |
| S2-07 | Calculer la Classe d'Armure — règles légère/moyenne/lourde/bouclier | Must | ✅ Terminé | `armor.service.js` |
| S2-08 | Implémenter `deleteById()` avec nettoyage en cascade | Must | ✅ Terminé | |
| S2-09 | Écrire `ruleValidator.js` — validation niveau, scores, nom | Must | ✅ Terminé | |
| S2-10 | Routes `GET /api/characters` et `GET /api/characters/:id` | Must | ✅ Terminé | |
| S2-11 | Routes `POST /api/characters` et `DELETE /api/characters/:id` | Must | ✅ Terminé | |
| S2-12 | Peupler la table `item` (`populate_item_table.sql`) | Must | ✅ Terminé | armes + armures |

**Vélocité Sprint 2 :** 12/12 tâches — 100% ✅

---

## Sprint 3 — Interface utilisateur & Assistant de création
**Semaine 3** | **Objectif :** Construire l'interface front-end complète en Vanilla JS

### Tâches

| ID | Tâche | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| S3-01 | Concevoir le thème Dark Gaming (`styles-dark-gaming.css`) | Must | ✅ Terminé | Variables CSS, palette sombre |
| S3-02 | Construire `index.html` — formulaires login/inscription | Must | ✅ Terminé | Bascule entre les formulaires |
| S3-03 | Écrire `auth.js` — gestion de session JWT (localStorage) | Must | ✅ Terminé | `requireAuth()`, `authenticatedFetch()` |
| S3-04 | Composant indicateur d'étapes (8 étapes) | Must | ✅ Terminé | `renderStepIndicator()` |
| S3-05 | Étape 0 : Nom du personnage | Must | ✅ Terminé | |
| S3-06 | Étape 1 : Sélection de la race (6 races avec bonus) | Must | ✅ Terminé | |
| S3-07 | Étape 2 : Sélection de la classe (6 classes) | Must | ✅ Terminé | |
| S3-08 | Étape 3 : Système Point Buy (27 pts, scores 8-15) | Must | ✅ Terminé | `calculatePointsUsed()` |
| S3-09 | Étape 4 : Sélection du background (affichage des compétences) | Must | ✅ Terminé | |
| S3-10 | Étape 5 : Compétences (choix classe + background verrouillé) | Must | ✅ Terminé | `renderSkillSelection()` |
| S3-11 | Étape 6 : Équipement (options par classe) | Must | ✅ Terminé | `renderEquipmentSelection()` |
| S3-12 | Étape 7 : Fiche de personnage (CA, PV, jets de sauvegarde) | Must | ✅ Terminé | `renderCharacterSheet()` |
| S3-13 | Bouton sauvegarder — intégration `POST /api/characters` | Must | ✅ Terminé | `handleSave()` |
| S3-14 | Modals custom (remplacement des dialogs natifs) | Should | ✅ Terminé | `customAlert()`, `customConfirm()` |
| S3-15 | Construire `my-characters.html` — grille de personnages | Must | ✅ Terminé | |
| S3-16 | Modal de détail avec attributs et armes | Should | ✅ Terminé | `showCharacterModal()` |
| S3-17 | Suppression avec confirmation stylisée | Should | ✅ Terminé | |
| S3-18 | `dndData.js` — toutes les données D&D de référence | Must | ✅ Terminé | armes, armures, propriétés |

**Vélocité Sprint 3 :** 18/18 tâches — 100% ✅

---

## Sprint 4 — Mode Jeu, Tests & Finalisation
**Semaine 4** | **Objectif :** Mode jeu complet, correction des bugs, QA et documentation finale

### Tâches

| ID | Tâche | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| S4-01 | Construire la mise en page `play.html` (2 colonnes) | Must | ✅ Terminé | CSS Grid, journal sticky |
| S4-02 | `GET /api/play/:id` — chargement du personnage avec items | Must | ✅ Terminé | |
| S4-03 | Cartes de caractéristiques cliquables | Must | ✅ Terminé | |
| S4-04 | Grille de compétences avec badges de maîtrise | Must | ✅ Terminé | Badge ★ |
| S4-05 | Cartes d'armes avec boutons Attaque / Dégâts | Must | ✅ Terminé | |
| S4-06 | `POST /api/play/:id/roll/ability` — jet de caractéristique | Must | ✅ Terminé | 1d20 + modificateur |
| S4-07 | `POST /api/play/:id/roll/attack` — jet d'attaque + détection critique | Must | ✅ Terminé | Nat 20/1 |
| S4-08 | `POST /api/play/:id/roll/damage` — dégâts + doublement critique | Must | ✅ Terminé | |
| S4-09 | `POST /api/play/roll` — lanceur de dés libre (NdX) | Must | ✅ Terminé | |
| S4-10 | Bannière de résultat (animation slide-in) | Should | ✅ Terminé | Disparaît après 10s |
| S4-11 | Modal coup critique (animé, confirmer les dégâts) | Could | ✅ Terminé | `showCriticalModal()` |
| S4-12 | Journal de jets (persistance localStorage) | Should | ✅ Terminé | Limite 100 entrées |
| S4-13 | Corriger le modificateur d'attaque (distance=DEX, finesse=MAX, mêlée=FOR) | Must | ✅ Terminé | `getWeaponAttackMod()` |
| S4-14 | Appliquer les bonus raciaux dans `findById()` et `findAllByUser()` | Must | ✅ Terminé | Parsing JSONB |
| S4-15 | Corriger le calcul de Classe d'Armure | Must | ✅ Terminé | |
| S4-16 | Lanceur de dés personnalisé (nombre + faces) | Could | ✅ Terminé | |
| S4-17 | Export JSON du personnage | Could | ✅ Terminé | `handleExport()` |
| S4-18 | Tests manuels API (Postman) | Must | ✅ Terminé | Voir Testing Evidence |
| S4-19 | Tests cross-navigateur (Chrome, Firefox, Safari) | Should | ✅ Terminé | |
| S4-20 | Nettoyage du code, commentaires, README | Must | ✅ Terminé | |

**Vélocité Sprint 4 :** 20/20 tâches — 100% ✅

---

## Bilan global

| Sprint | Tâches | Terminées | Vélocité |
|--------|--------|-----------|----------|
| Sprint 1 — Foundation | 10 | 10 | 100% |
| Sprint 2 — CRUD | 12 | 12 | 100% |
| Sprint 3 — Front-end | 18 | 18 | 100% |
| Sprint 4 — Jeu & QA | 20 | 20 | 100% |
| **TOTAL** | **60** | **60** | **100%** |

---

## Suivi des bugs

| ID | Description | Sprint détecté | Sévérité | Résolution |
|----|-------------|---------------|----------|------------|
| BUG-01 | Bonus raciaux non appliqués au calcul CA / PV | S4 | Haute | Parsing JSONB `ability_bonuses` dans `character.model.js` |
| BUG-02 | Compétences de background sélectionnables / désélectionnables | S3 | Moyenne | Verrouillage dans `renderSkillSelection()` |
| BUG-03 | Armes à distance utilisent FOR au lieu de DEX | S4 | Haute | Ajout vérification `category === 'ranged'` dans `getWeaponAttackMod()` |
| BUG-04 | Journal de jets non persistant entre rechargements | S4 | Moyenne | Implémentation localStorage avec clé par personnage |
| BUG-05 | Items non trouvés en BDD (divergence de noms) | S4 | Haute | Insertion à la volée + matching `LOWER(TRIM())` |
| BUG-06 | `canGoNext()` retourne `true` sur la dernière étape | S3 | Faible | Ajout `default: return false` dans le switch |
| BUG-07 | Modal détail affiche `armorClass: undefined` | S4 | Moyenne | Correction du champ récupéré depuis la réponse API |