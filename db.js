const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

function loadTrackingData() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '[]');
  }
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
}

function saveTrackingData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { loadTrackingData, saveTrackingData };
