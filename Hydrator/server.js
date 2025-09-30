const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const path = require('path');
const HydrationService = require('./Services/HydrationService');

const app = express();
const PORT = process.env.PORT || 3001;
const HYDRATION_FILE = path.join(__dirname, 'hydration.json');

app.use(cors());
app.use(express.json());
app.use(express.static('frontend/dist'));

// Store WebSocket connections for real-time updates
let wsConnections = [];

// File watcher for hydration.json
const watcher = chokidar.watch(HYDRATION_FILE);
let hydrationData = null;

// Load initial hydration data
async function loadHydrationData() {
  try {
    const data = await fs.readFile(HYDRATION_FILE, 'utf8');
    hydrationData = JSON.parse(data);
    console.log('Hydration data loaded');
  } catch (error) {
    console.error('Error loading hydration data:', error);
  }
}

// Save hydration data
async function saveHydrationData(data) {
  try {
    await fs.writeFile(HYDRATION_FILE, JSON.stringify(data, null, 2));
    hydrationData = data;
    console.log('Hydration data saved');
  } catch (error) {
    console.error('Error saving hydration data:', error);
    throw error;
  }
}

// Watch for file changes
watcher.on('change', async () => {
  console.log('Hydration file changed, reloading...');
  await loadHydrationData();
  // Broadcast changes to all connected clients
  broadcastToClients({ type: 'hydrationUpdated', data: hydrationData });
});

// Broadcast function for real-time updates
function broadcastToClients(message) {
  wsConnections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  });
}

// API Routes

// Get current hydration data
app.get('/api/hydration', (req, res) => {
  res.json(hydrationData);
});

// Update hydration data
app.put('/api/hydration', async (req, res) => {
  try {
    await saveHydrationData(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute single call
app.post('/api/execute/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const call = hydrationData.calls.find(c => c.id === callId);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const result = await HydrationService.executeCall(call, hydrationData.bearerToken, hydrationData.baseUrl);

    // Update the call with result
    call.result = result.data;
    call.statusCode = result.statusCode;

    await saveHydrationData(hydrationData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error executing call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute all calls
app.post('/api/execute', async (req, res) => {
  try {
    const results = await HydrationService.executeAllCalls(hydrationData);
    await saveHydrationData(hydrationData);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error executing calls:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all results
app.post('/api/clear', async (req, res) => {
  try {
    hydrationData.calls.forEach(call => {
      call.result = null;
      call.statusCode = null;
    });
    await saveHydrationData(hydrationData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new call
app.post('/api/calls', async (req, res) => {
  try {
    const newCall = {
      id: `call-${Date.now()}`,
      name: req.body.name || 'New Call',
      method: req.body.method || 'GET',
      url: req.body.url || '/api/',
      headers: req.body.headers || {},
      body: req.body.body || null,
      result: null,
      statusCode: null
    };

    hydrationData.calls.push(newCall);
    await saveHydrationData(hydrationData);
    res.json({ success: true, call: newCall });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket setup for real-time updates
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  wsConnections.push(ws);

  // Send current data to new client
  ws.send(JSON.stringify({ type: 'hydrationUpdated', data: hydrationData }));

  ws.on('close', () => {
    console.log('Client disconnected');
    wsConnections = wsConnections.filter(conn => conn !== ws);
  });
});

// Initialize and start server
async function startServer() {
  await loadHydrationData();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);