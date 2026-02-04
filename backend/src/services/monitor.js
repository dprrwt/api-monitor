const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_INTERVAL = parseInt(process.env.DEFAULT_CHECK_INTERVAL) || 60000;
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK_URL;

function createMonitorService(store) {
  const schedulers = new Map();

  // Default endpoints to monitor
  const defaultEndpoints = [
    {
      id: 'github-api',
      name: 'GitHub API',
      url: 'https://api.github.com',
      interval: 60000,
      enabled: true,
    },
    {
      id: 'jsonplaceholder',
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      interval: 60000,
      enabled: true,
    },
    {
      id: 'httpbin',
      name: 'HTTPBin',
      url: 'https://httpbin.org/get',
      interval: 60000,
      enabled: true,
    },
  ];

  async function checkEndpoint(endpoint) {
    const startTime = Date.now();
    let status = {
      id: endpoint.id,
      timestamp: new Date().toISOString(),
      status: 'unknown',
      statusCode: null,
      responseTime: null,
      error: null,
    };

    try {
      const response = await axios.get(endpoint.url, {
        timeout: 30000,
        validateStatus: () => true,
      });

      const responseTime = Date.now() - startTime;
      status.statusCode = response.status;
      status.responseTime = responseTime;

      if (response.status >= 200 && response.status < 300) {
        status.status = 'healthy';
      } else if (response.status >= 400 && response.status < 500) {
        status.status = 'degraded';
      } else {
        status.status = 'unhealthy';
      }
    } catch (error) {
      status.status = 'unhealthy';
      status.responseTime = Date.now() - startTime;
      status.error = error.message;
    }

    // Save current status
    await store.saveStatus(endpoint.id, status);

    // Add to history
    await store.addHistoryPoint(endpoint.id, {
      timestamp: status.timestamp,
      status: status.status,
      statusCode: status.statusCode,
      responseTime: status.responseTime,
    });

    // Check for alerts
    const prevStatus = await store.getStatus(endpoint.id);
    if (prevStatus && prevStatus.status === 'healthy' && status.status === 'unhealthy') {
      await triggerAlert(endpoint, status);
    }

    console.log(`[${new Date().toISOString()}] ${endpoint.name}: ${status.status} (${status.responseTime}ms)`);

    return status;
  }

  async function triggerAlert(endpoint, status) {
    const alert = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      message: `${endpoint.name} is ${status.status}`,
      status: status.status,
      error: status.error,
    };

    await store.addAlert(alert);
    console.log(`🚨 ALERT: ${alert.message}`);

    // Webhook notification (if configured)
    if (ALERT_WEBHOOK) {
      try {
        await axios.post(ALERT_WEBHOOK, alert);
      } catch (err) {
        console.error('Failed to send webhook:', err.message);
      }
    }
  }

  function startScheduler(endpoint) {
    if (schedulers.has(endpoint.id)) {
      clearInterval(schedulers.get(endpoint.id));
    }

    // Immediately check once
    checkEndpoint(endpoint);

    // Then schedule recurring checks
    const intervalId = setInterval(() => {
      checkEndpoint(endpoint);
    }, endpoint.interval || DEFAULT_INTERVAL);

    schedulers.set(endpoint.id, intervalId);
  }

  function stopScheduler(id) {
    if (schedulers.has(id)) {
      clearInterval(schedulers.get(id));
      schedulers.delete(id);
    }
  }

  return {
    async initializeDefaults() {
      const existing = await store.getAllEndpoints();
      
      if (existing.length === 0) {
        console.log('Initializing default endpoints...');
        for (const ep of defaultEndpoints) {
          await store.saveEndpoint(ep);
          if (ep.enabled) {
            startScheduler(ep);
          }
        }
      } else {
        console.log(`Loading ${existing.length} endpoints...`);
        for (const ep of existing) {
          if (ep.enabled) {
            startScheduler(ep);
          }
        }
      }
    },

    async addEndpoint(data) {
      const endpoint = {
        id: data.id || uuidv4(),
        name: data.name,
        url: data.url,
        interval: data.interval || DEFAULT_INTERVAL,
        enabled: data.enabled !== false,
        createdAt: new Date().toISOString(),
      };

      await store.saveEndpoint(endpoint);
      
      if (endpoint.enabled) {
        startScheduler(endpoint);
      }

      return endpoint;
    },

    async updateEndpoint(id, data) {
      const endpoint = await store.getEndpoint(id);
      if (!endpoint) throw new Error('Endpoint not found');

      const updated = { ...endpoint, ...data, id };
      await store.saveEndpoint(updated);

      // Restart scheduler if interval changed or enabled state changed
      stopScheduler(id);
      if (updated.enabled) {
        startScheduler(updated);
      }

      return updated;
    },

    async removeEndpoint(id) {
      stopScheduler(id);
      await store.deleteEndpoint(id);
    },

    async checkNow(id) {
      const endpoint = await store.getEndpoint(id);
      if (!endpoint) throw new Error('Endpoint not found');
      return await checkEndpoint(endpoint);
    },

    async getStatus(id) {
      return await store.getStatus(id);
    },

    async getAllStatus() {
      const endpoints = await store.getAllEndpoints();
      const result = [];
      
      for (const ep of endpoints) {
        const status = await store.getStatus(ep.id);
        result.push({
          ...ep,
          currentStatus: status,
        });
      }
      
      return result;
    },

    async getHistory(id, limit) {
      return await store.getHistory(id, limit);
    },

    async getAlerts(limit) {
      return await store.getAlerts(limit);
    },

    async clearAlerts() {
      return await store.clearAlerts();
    },

    stopAll() {
      for (const [id] of schedulers) {
        stopScheduler(id);
      }
    },
  };
}

module.exports = { createMonitorService };
