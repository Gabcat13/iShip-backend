const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const trackingDB = [];

// Generate random tracking ID
function generateTrackingId() {
  return 'TRK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// POST /api/create — create tracking
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff || !weight) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const trackingId = generateTrackingId();
  const newEntry = {
    trackingId,
    pickup,
    dropoff,
    weight,
    status: 'Created',
    lastUpdated: new Date().toISOString(),
  };

  trackingDB.push(newEntry);
  res.json({ trackingId });
});

// GET /api/track/:trackingId — get tracking info
app.get('/api/track/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const item = trackingDB.find(entry => entry.trackingId === trackingId);

  if (!item) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(item);
});

// PUT /api/update/:trackingId — update status
app.put('/api/update/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const { status } = req.body;

  const item = trackingDB.find(entry => entry.trackingId === trackingId);

  if (!item) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  item.status = status;
  item.lastUpdated = new Date().toISOString();
  res.json({ message: 'Status updated', item });
});

// POST /api/quote — return fake price based on weight
app.post('/api/quote', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff || !weight) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const price = 5 + weight * 2.5;
  res.json({ price });
});

// Home route
app.get('/', (req, res) => {
  res.send('iSHIP Backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚚 iSHIP backend running on http://localhost:${PORT}`);
});
