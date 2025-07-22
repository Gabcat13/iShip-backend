// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Setup db.json path
const dbPath = path.resolve('./db.json');

// Load DB
function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

// Save DB
function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate tracking ID
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
  const newEntry = {
    pickup,
    dropoff,
    weight,
    status: 'Created',
    lastUpdated: new Date().toISOString()
  };

  try {
    const db = loadDB();
    db[trackingId] = newEntry;
    saveDB(db);

    console.log(`✅ Tracking created: ${trackingId}`);
    res.json({ trackingId });
  } catch (err) {
    console.error("❌ Failed to save tracking:", err);
    res.status(500).json({ error: 'Failed to save tracking data' });
  }
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

// Server start
app.listen(PORT, () => {
  console.log(`🚚 Backend running at http://localhost:${PORT}`);
});
