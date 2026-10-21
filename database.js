const Database = require("better-sqlite3");

const db = new Database("internships.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT '',
    type TEXT DEFAULT 'Internship',
    status TEXT DEFAULT 'Open',
    description TEXT DEFAULT '',
    applicationUrl TEXT DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;