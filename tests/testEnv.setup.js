// Ce fichier est chargé automatiquement par Jest avant chaque suite de tests
// (voir la config "jest.setupFiles" dans package.json).
//
// Pourquoi ce fichier existe :
// src/config/database.js lève une exception au chargement si DB_USER,
// DB_PASSWORD ou DB_NAME sont absents de l'environnement. Or plusieurs
// modules (ex: src/models/character.model.js) importent ce fichier en tête
// de module, même quand on ne veut tester qu'une fonction pure (ex:
// calculateArmorClass) qui ne fait aucun accès base de données.
//
// On fournit donc des valeurs factices UNIQUEMENT si elles ne sont pas déjà
// définies (ex: par un vrai fichier .env), pour ne jamais écraser une config
// réelle et ne jamais se connecter à une vraie base pendant les tests unitaires.
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';