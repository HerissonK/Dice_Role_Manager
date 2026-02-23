# 📊 Sprint Reviews & Rétrospectives — D&D 5e Character Builder

> **Projet :** Dice Roll Manager — D&D 5e Character Builder  
> **Développeur :** Solo  
> **Méthodologie :** Agile / Scrum adapté (solo)

---

## Sprint 1 — Foundation & Authentification

**Période :** Semaine 1  
**Objectif :** Mettre en place la base du projet : structure back-end, base de données, et authentification sécurisée.

### ✅ Review — Ce qui a été livré

Toute la fondation technique du projet a été posée pendant ce sprint. La structure du projet Node.js/Express a été mise en place avec une organisation claire en `controllers/`, `routes/`, `models/`, `services/` et `validators/`. La base de données PostgreSQL a été configurée avec les 13 tables nécessaires via le fichier `init.sql`, incluant toutes les données de référence D&D 5e (races, classes, backgrounds, armes, armures, compétences). L'authentification complète a été implémentée : inscription avec hachage `bcrypt` (10 rounds), connexion avec génération de token `JWT`, et middleware de protection des routes. La limitation de taux (`express-rate-limit`) a été ajoutée dès le départ pour sécuriser les endpoints sensibles.

| Fonctionnalité | Statut |
|---|---|
| Structure Node.js/Express | ✅ |
| init.sql (13 tables + données D&D) | ✅ |
| POST /api/auth/register | ✅ |
| POST /api/auth/login | ✅ |
| JWT middleware | ✅ |
| Rate limiting | ✅ |
| Logger Winston | ✅ |
| Pool PostgreSQL | ✅ |

**Vélocité :** 10/10 tâches — 100%

---

### 🪞 Rétrospective Sprint 1

**Ce qui a bien fonctionné**

La mise en place de la structure dès le départ avec une séparation claire des responsabilités (routes → controllers → models) a évité beaucoup de refactorisation par la suite. Partir sur une approche "sécurité d'abord" avec bcrypt et JWT dès le Sprint 1 était le bon choix.

**Ce qui a été difficile**

La configuration initiale de PostgreSQL et la gestion des variables d'environnement a pris plus de temps que prévu. La définition du schéma de base de données, notamment le choix d'utiliser JSONB pour certaines colonnes (bonus raciaux, propriétés d'armes), a nécessité plusieurs itérations.

**Ce qui aurait pu être mieux**

Il aurait été utile de tester les endpoints d'authentification avec Postman plus tôt dans le sprint plutôt qu'à la fin.

**Actions pour le prochain sprint**

Tester chaque endpoint immédiatement après l'implémentation. Documenter les décisions de design au fur et à mesure dans des commentaires de code.

---

## Sprint 2 — CRUD Personnages & Modèle de données

**Période :** Semaine 2  
**Objectif :** Implémenter la création, la lecture, la mise à jour et la suppression de personnages avec toutes les règles D&D 5e associées.

### ✅ Review — Ce qui a été livré

Le cœur du système de gestion de personnages a été implémenté. La création d'un personnage est une opération atomique grâce aux transactions SQL (`BEGIN/COMMIT/ROLLBACK`) : les scores de caractéristiques sont insérés dans `personnage_caracteristique`, les maîtrises de compétences dans `personnage_skill` avec leur source (classe ou background), et l'équipement dans `personnage_item` avec insertion à la volée dans la table `item` si l'équipement n'existe pas encore. Le calcul de la Classe d'Armure selon les règles D&D 5e (armure légère/moyenne/lourde/bouclier) a été externalisé dans `armor.service.js`. Le validateur de règles (`ruleValidator.js`) assure la cohérence des données côté serveur. Les bonus raciaux stockés en JSONB sont correctement appliqués lors de la récupération des personnages.

| Fonctionnalité | Statut |
|---|---|
| Character.create() avec transaction | ✅ |
| Scores en BDD (personnage_caracteristique) | ✅ |
| Compétences en BDD (personnage_skill) | ✅ |
| Équipement en BDD (personnage_item + item) | ✅ |
| findAllByUser() avec bonus raciaux | ✅ |
| findById() avec fusion compétences | ✅ |
| calculateArmorClass() toutes règles | ✅ |
| deleteById() avec nettoyage | ✅ |
| populate_item_table.sql | ✅ |

**Vélocité :** 12/12 tâches — 100%

---

### 🪞 Rétrospective Sprint 2

**Ce qui a bien fonctionné**

L'utilisation des transactions SQL a été une excellente décision : elle garantit qu'un personnage est toujours dans un état cohérent en base de données, même en cas d'erreur partielle. La séparation du calcul de CA dans un service dédié (`armor.service.js`) a facilité les tests et la réutilisation.

**Ce qui a été difficile**

La gestion de l'insertion à la volée des items (armes/armures) a posé un problème de doublons. Si un item du même nom existait déjà, l'insertion échouait. Ce problème a été résolu avec une logique "cherche d'abord, insère si absent" (`INSERT ... ON CONFLICT DO NOTHING`).

**Un bug critique résolu**

Les bonus raciaux (stockés en JSONB) n'étaient pas correctement parsés lors de la récupération, ce qui donnait des valeurs `undefined` pour les bonus. Le problème venait du fait que `pg` retourne les colonnes JSONB sous forme de chaîne, nécessitant un `JSON.parse()` explicite.

**Actions pour le prochain sprint**

Commencer le front-end en gardant en tête le format exact des réponses API construites pendant ce sprint pour éviter les désalignements.

---

## Sprint 3 — Interface utilisateur & Assistant de création

**Période :** Semaine 3  
**Objectif :** Construire l'intégralité de l'interface front-end en Vanilla JS, du login à la fiche de personnage complète.

### ✅ Review — Ce qui a été livré

L'interface utilisateur complète a été construite en HTML/CSS/JS pur, sans framework. Le thème visuel "Dark Gaming" a été défini avec des variables CSS cohérentes sur toutes les pages. L'assistant de création de personnage en 8 étapes guide l'utilisateur de A à Z : nom, race, classe, scores (système de Point Buy avec budget de 27 points), background, compétences, équipement, et fiche finale. La gestion des sessions JWT côté client est centralisée dans `auth.js` avec des fonctions réutilisables (`requireAuth()`, `authenticatedFetch()`). Les alertes et confirmations natives du navigateur ont été remplacées par des modals stylisés cohérents avec le thème. La page `my-characters.html` affiche les personnages sauvegardés avec leur CA, PV et équipement calculés.

| Fonctionnalité | Statut |
|---|---|
| Thème Dark Gaming (CSS variables) | ✅ |
| index.html — Login/Register | ✅ |
| auth.js — JWT localStorage | ✅ |
| Builder 8 étapes — navigation | ✅ |
| Système Point Buy (27 pts, 8-15) | ✅ |
| Cartes Race/Classe/Background | ✅ |
| Sélection compétences (classe + BG verrouillé) | ✅ |
| Sélection équipement (par classe) | ✅ |
| Fiche personnage (CA, PV, saves) | ✅ |
| my-characters.html — grille + modal | ✅ |
| Modals custom (alert/confirm) | ✅ |
| dndData.js — données D&D complètes | ✅ |

**Vélocité :** 18/18 tâches — 100%

---

### 🪞 Rétrospective Sprint 3

**Ce qui a bien fonctionné**

Le fait de centraliser toutes les données D&D de référence dans un seul fichier `dndData.js` a rendu le builder très facile à faire évoluer. Ajouter une nouvelle race ou classe ne nécessite qu'une modification dans ce fichier. Le système de Point Buy avec affichage en temps réel du budget restant offre une très bonne expérience utilisateur.

**Ce qui a été difficile**

La gestion des compétences dans l'étape 5 était la plus complexe : il fallait fusionner les compétences de background (automatiques, non modifiables) avec les choix de classe (sélection libre jusqu'à N compétences), afficher un état "verrouillé" pour les compétences de background, et empêcher de dépasser le quota de l'étape classe. Plusieurs itérations ont été nécessaires pour arriver à un résultat propre.

**Un bug corrigé**

Les compétences de background étaient initialement sélectionnables et désélectionnables par l'utilisateur, ce qui n'est pas conforme aux règles D&D. Le correctif a consisté à les pré-sélectionner et à les afficher avec un style "verrouillé" non cliquable.

**Actions pour le prochain sprint**

Tester le flux complet de création → sauvegarde → liste avant de commencer le mode jeu pour s'assurer que les données circulent correctement end-to-end.

---

## Sprint 4 — Mode Jeu, Tests & Finalisation

**Période :** Semaine 4  
**Objectif :** Implémenter le mode jeu complet, corriger les bugs restants, tester l'application et finaliser la documentation.

### ✅ Review — Ce qui a été livré

Le mode jeu `play.html` offre une expérience de jeu complète directement dans le navigateur. Les jets de caractéristiques, de compétences, d'attaque et de dégâts sont tous gérés côté serveur pour garantir l'application correcte des règles D&D. Les coups critiques (20 naturel) déclenchent un modal animé et doublent automatiquement les dés de dégâts. Les fumbles (1 naturel) sont signalés visuellement. Le journal de jets persiste entre les sessions grâce au `localStorage`. Un lanceur de dés libre (d4 à d100) et un lanceur personnalisé (NdX) complètent l'interface. La correction du calcul du modificateur d'attaque (Force pour le corps-à-corps, Dextérité pour les armes à distance, MAX(For,Dex) pour les armes de finesse) a été une priorité de ce sprint. La documentation (README, commentaires de code) a été finalisée.

| Fonctionnalité | Statut |
|---|---|
| play.html — mise en page 2 colonnes | ✅ |
| GET /api/play/:id | ✅ |
| Cartes caractéristiques cliquables | ✅ |
| Grille compétences avec badges ★ | ✅ |
| Cartes armes — Attaque + Dégâts | ✅ |
| Roll ability/attack/damage (back-end) | ✅ |
| Bannière résultat (slide-in) | ✅ |
| Modal coup critique (animé) | ✅ |
| Journal de jets (localStorage) | ✅ |
| Lanceur libre (d4→d100) | ✅ |
| Lanceur personnalisé (NdX) | ✅ |
| Export JSON du personnage | ✅ |
| Tests Postman complets | ✅ |
| README finalisé | ✅ |

**Vélocité :** 20/20 tâches — 100%

---

### 🪞 Rétrospective Sprint 4

**Ce qui a bien fonctionné**

Le fait de faire tous les calculs de jets côté serveur (plutôt que côté client) s'est révélé être le bon choix : cela centralise la logique de règles D&D dans un seul endroit, facilite les tests, et garantit l'intégrité des résultats. Le journal de jets avec persistance `localStorage` était un "nice to have" qui s'est révélé très utile en pratique.

**Ce qui a été difficile**

La gestion des modificateurs d'attaque selon le type d'arme (corps-à-corps vs distance vs finesse) a nécessité d'analyser en détail les propriétés des armes stockées en JSONB. Le bug principal était que toutes les armes utilisaient Force comme modificateur, ignorant Dextérité pour les armes à distance et la règle de finesse (MAX de For et Dex).

**Ce qui aurait pu être mieux**

Des tests automatisés (Jest + Supertest) auraient permis de détecter les bugs de calcul plus tôt dans le cycle de développement. Pour une V2, une suite de tests unitaires sur les utilitaires de calcul serait une priorité.

**Bilan général du projet**

Le projet est fonctionnel, stable, et couvre l'ensemble des fonctionnalités définies dans les User Stories initiales. Le code est structuré, commenté, et suit des conventions cohérentes. La documentation est complète. Les principales décisions techniques (PostgreSQL, JWT, Vanilla JS, JSONB pour les données D&D) se sont toutes justifiées en pratique.

---

## Résumé global

| Sprint | Objectif | Tâches | Vélocité | Bugs résolus |
|--------|----------|--------|----------|--------------|
| Sprint 1 | Foundation & Auth | 10/10 | 100% | 0 |
| Sprint 2 | CRUD & DB | 12/12 | 100% | 2 |
| Sprint 3 | Front-end | 18/18 | 100% | 2 |
| Sprint 4 | Play Mode & QA | 20/20 | 100% | 3 |
| **Total** | | **60/60** | **100%** | **7** |