// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from './db.js'; // Import helper functions

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Generate a tracking ID
function generateTrackingId() {
  return 'TRK-' + uuidv4().split('-')[0].toUpperCase();
}

// POST /api/create - Create new tracking entry
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff || !weight) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = readDB();
  const trackingId = generateTrackingId();

  const trackingData = {
    pickup,
    dropoff,
    weight,
    status: 'Created',
    lastUpdated: new Date().toISOString()
  };

  db[trackingId] = trackingData;
  writeDB(db);

  res.json({ trackingId });
});

// PUT /api/update/:id - Update tracking status
app.put('/api/update/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = readDB();
  if (!db[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  db[id].status = status || db[id].status;
  db[id].lastUpdated = new Date().toISOString();
  writeDB(db);

  res.json({ message: 'Tracking status updated', tracking: db[id] });
});

// GET /api/track/:id - Get tracking information
app.get('/api/track/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  if (!db[id]) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(db[id]);
});

app.listen(PORT, () => {
  console.log(`🚚 iSHIP backend is running at http://localhost:${PORT}`);
});
