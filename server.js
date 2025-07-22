// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join('./db.json');

app.use(cors());
app.use(bodyParser.json());

// Load DB or initialize empty one
let trackingDB = {};
if (fs.existsSync(DB_PATH)) {
  const raw = fs.readFileSync(DB_PATH);
  trackingDB = JSON.parse(raw || '{}');
}

// Helper to persist to db.json
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(trackingDB, null, 2));
}

// Generate tracking ID
function generateTrackingId() {
  return `TRK-${uuidv4().split('-')[0].toUpperCase()}`;
}

// Create new tracking
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff || !weight) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trackingId = generateTrackingId();
  trackingDB[trackingId] = {
    pickup,
    dropoff,
    weight,
    status: 'Created',
    lastUpdated: new Date().toISOString()
  };

  saveDB(); // Persist to file
  res.json({ trackingId });
});

// Update tracking status
app.put('/api/update/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!trackingDB[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  trackingDB[id].status = status || trackingDB[id].status;
  trackingDB[id].lastUpdated = new Date().toISOString();

  saveDB();
  res.json({ message: 'Tracking status updated', tracking: trackingDB[id] });
});

// Get tracking info
app.get('/api/track/:id', (req, res) => {
  const { id } = req.params;

  if (!trackingDB[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(trackingDB[id]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚚 iSHIP backend running on http://localhost:${PORT}`);
});
