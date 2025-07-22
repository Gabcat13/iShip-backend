// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Resolve db.json path
const dbFilePath = path.resolve('./db.json');

// Load tracking data from file
function loadDB() {
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify({}), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
}

// Save tracking data to file
function saveDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate a tracking ID
function generateTrackingId() {
  return `TRK-${uuidv4().split('-')[0].toUpperCase()}`;
}

// Create tracking entry
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff || !weight) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trackingId = generateTrackingId();
  const trackingData = {
    pickup,
    dropoff,
    weight,
    status: 'Created',
    lastUpdated: new Date().toISOString()
  };

  const db = loadDB();
  db[trackingId] = trackingData;
  saveDB(db);

  console.log(`✅ Created tracking: ${trackingId}`);
  res.json({ trackingId });
});

// Get tracking info
app.get('/api/track/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  if (!db[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(db[id]);
});

// Update tracking info
app.put('/api/update/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();

  if (!db[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  db[id].status = status || db[id].status;
  db[id].lastUpdated = new Date().toISOString();

  saveDB(db);
  res.json({ message: 'Tracking updated', tracking: db[id] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚚 Backend running on http://localhost:${PORT}`);
});
