const express = require('express');
const router = express.Router();

// GET /api/endpoints - List all endpoints with their current status
router.get('/endpoints', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const data = await monitor.getAllStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/endpoints - Add a new endpoint
router.post('/endpoints', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const { name, url, interval, enabled } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const endpoint = await monitor.addEndpoint({ name, url, interval, enabled });
    res.status(201).json(endpoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/endpoints/:id - Update an endpoint
router.put('/endpoints/:id', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const updated = await monitor.updateEndpoint(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    if (error.message === 'Endpoint not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/endpoints/:id - Remove an endpoint
router.delete('/endpoints/:id', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    await monitor.removeEndpoint(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/endpoints/:id/check - Trigger immediate check
router.post('/endpoints/:id/check', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const status = await monitor.checkNow(req.params.id);
    res.json(status);
  } catch (error) {
    if (error.message === 'Endpoint not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/endpoints/:id/history - Get history for an endpoint
router.get('/endpoints/:id/history', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const limit = parseInt(req.query.limit) || 50;
    const history = await monitor.getHistory(req.params.id, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts - Get recent alerts
router.get('/alerts', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const limit = parseInt(req.query.limit) || 20;
    const alerts = await monitor.getAlerts(limit);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/alerts - Clear all alerts
router.delete('/alerts', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    await monitor.clearAlerts();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats - Get aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const monitor = req.app.get('monitorService');
    const endpoints = await monitor.getAllStatus();
    
    const stats = {
      total: endpoints.length,
      healthy: endpoints.filter(e => e.currentStatus?.status === 'healthy').length,
      degraded: endpoints.filter(e => e.currentStatus?.status === 'degraded').length,
      unhealthy: endpoints.filter(e => e.currentStatus?.status === 'unhealthy').length,
      unknown: endpoints.filter(e => !e.currentStatus || e.currentStatus.status === 'unknown').length,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
