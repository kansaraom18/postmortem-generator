const fs = require('fs');
const path = require('path');
const db = require('./db');

const incidentId = 'INC-' + Date.now();
const rawLogs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'sample_logs.json'), 'utf-8'));

// Step 1: Sort logs chronologically
const sortedLogs = rawLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

// Step 2: Filter to only error-relevant events (status >= 500) plus recovery point
const errorLogs = sortedLogs.filter(log => log.statusCode >= 500);
const recoveryLog = sortedLogs.find(log => log.statusCode === 200 && sortedLogs.indexOf(log) > sortedLogs.indexOf(errorLogs[errorLogs.length - 1]));

// Step 3: Insert into database
const insert = db.prepare(`
  INSERT INTO logs (incidentId, timestamp, method, endpoint, statusCode, responseTimeMs, message)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

sortedLogs.forEach(log => {
  insert.run(incidentId, log.timestamp, log.method, log.endpoint, log.statusCode, log.responseTimeMs, log.message);
});

// Step 4: Print the structured timeline
console.log('\n=== INCIDENT TIMELINE ===');
console.log('Incident ID:', incidentId);
console.log('-------------------------------');
sortedLogs.forEach(log => {
  const marker = log.statusCode >= 500 ? '🔴' : '🟢';
  console.log(`${marker} ${log.timestamp} | ${log.method} ${log.endpoint} | ${log.statusCode} | ${log.responseTimeMs}ms | ${log.message}`);
});
console.log('-------------------------------');
console.log(`Total events: ${sortedLogs.length} | Errors: ${errorLogs.length}`);
if (recoveryLog) {
  console.log(`Recovery detected at: ${recoveryLog.timestamp}`);
}
console.log('=========================\n');
