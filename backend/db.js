const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'postmortem.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incidentId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    method TEXT,
    endpoint TEXT,
    statusCode INTEGER,
    responseTimeMs INTEGER,
    message TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incidentId TEXT NOT NULL,
    summary TEXT,
    rootCause TEXT,
    impact TEXT,
    recommendation TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Database ready: postmortem.db');
module.exports = db;
