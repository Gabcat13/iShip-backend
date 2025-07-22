const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigin = 'https://firstchoiceshipping.netlify.app';
 optionsSuccessStatus: 200

app.use(cors({
  origin: allowedOrigin
}));
app.use(express.json());

// Load tracking data
function loadTrackingData() {
  try {
    const data = fs.readFileSync('db.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If file does not exist or is empty, return empty array
    return [];
  }
}

// Save tracking data
function saveTrackingData(data) {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
}

// Issue new tracking number
app.post('/api/create', (req, res) => {
  const { pickup, dropoff, weight } = req.body;
  if (!pickup || !dropoff || !weight) {
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

// Get package status
app.get('/api/track/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const data = loadTrackingData();
  const pkg = data.find(item => item.trackingId === trackingId);

  if (!pkg) {
    return res.status(404).json({ error: 'Tracking ID not found' });
  }

  res.json(pkg);
});

// Update package status
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

// Root route
app.get('/', (req, res) => {
  res.send('Courier Tracking API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
