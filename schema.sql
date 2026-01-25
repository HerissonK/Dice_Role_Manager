BEGIN;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'player',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- CLASSES
-- =========================
CREATE TABLE IF NOT EXISTS classe (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- =========================
-- ESPECES
-- =========================
CREATE TABLE IF NOT EXISTS espece (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- =========================
-- BACKGROUNDS
-- =========================
CREATE TABLE IF NOT EXISTS background (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- =========================
-- PERSONNAGES
-- =========================
CREATE TABLE IF NOT EXISTS personnage (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  class_id INTEGER NOT NULL REFERENCES classe(id),
  species_id INTEGER NOT NULL REFERENCES espece(id),
  background_id INTEGER NOT NULL REFERENCES background(id),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- CARACTERISTIQUES
-- =========================
CREATE TABLE IF NOT EXISTS personnage_caracteristique (
  id SERIAL PRIMARY KEY,
  personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
  caracteristique TEXT NOT NULL,
  valeur INTEGER NOT NULL
);

COMMIT;
