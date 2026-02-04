require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createMonitorService } = require('./services/monitor');
const { createRedisStore } = require('./services/redis');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const redisStore = createRedisStore();
const monitorService = createMonitorService(redisStore);

// Make services available to routes
app.set('monitorService', monitorService);
app.set('redisStore', redisStore);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Monitor backend running on port ${PORT}`);
  
  // Initialize with default endpoints
  await monitorService.initializeDefaults();
  
  console.log('✅ Monitor service initialized');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await monitorService.stopAll();
  process.exit(0);
});
