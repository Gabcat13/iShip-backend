const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { loadTrackingData, saveTrackingData } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://firstchoiceshipping.netlify.app'], // your frontend domain
  optionsSuccessStatus: 200
}));
app.use(express.json());

// ✅ Create Tracking
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;

  if (!pickup || !dropoff) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trackingId = uuidv4().slice(0, 8).toUpperCase();
  const newEntry = {
    trackingId,
    pickup,
    dropoff,
    weight,
    status: 'Order Received',
    lastUpdated: new Date().toISOString()
  };

  const data = loadTrackingData();
  data.push(newEntry);
  saveTrackingData(data);

  res.json({ message: 'Tracking number created', trackingId });
});

// ✅ Track Package
app.get('/api/track/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const data = loadTrackingData();

  const packageData = data.find(item => item.trackingId === trackingId);
  if (!packageData) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(packageData);
});

// ✅ Update Status
app.put('/api/update/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const { status } = req.body;

  const data = loadTrackingData();
  const index = data.findIndex(item => item.trackingId === trackingId);

  if (index === -1) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  data[index].status = status || data[index].status;
  data[index].lastUpdated = new Date().toISOString();
  saveTrackingData(data);

  res.json({ message: 'Status updated', trackingId });
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('Courier Tracking API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
