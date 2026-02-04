const MAX_HISTORY = parseInt(process.env.MAX_HISTORY_POINTS) || 100;

// In-memory store (works without Redis)
function createMemoryStore() {
  const endpoints = new Map();
  const statuses = new Map();
  const history = new Map();
  const alerts = [];

  console.log('📦 Using in-memory store');

  return {
    async saveEndpoint(endpoint) {
      endpoints.set(endpoint.id, endpoint);
    },

    async getEndpoint(id) {
      return endpoints.get(id) || null;
    },

    async getAllEndpoints() {
      return Array.from(endpoints.values());
    },

    async deleteEndpoint(id) {
      endpoints.delete(id);
      history.delete(id);
      statuses.delete(id);
    },

    async saveStatus(id, status) {
      statuses.set(id, status);
    },

    async getStatus(id) {
      return statuses.get(id) || null;
    },

    async getAllStatuses() {
      const result = {};
      for (const [id, status] of statuses) {
        result[id] = status;
      }
      return result;
    },

    async addHistoryPoint(id, point) {
      if (!history.has(id)) history.set(id, []);
      const h = history.get(id);
      h.unshift(point);
      if (h.length > MAX_HISTORY) h.pop();
    },

    async getHistory(id, limit = 50) {
      const h = history.get(id) || [];
      return h.slice(0, limit).reverse();
    },

    async addAlert(alert) {
      alerts.unshift(alert);
      if (alerts.length > 100) alerts.pop();
    },

    async getAlerts(limit = 20) {
      return alerts.slice(0, limit);
    },

    async clearAlerts() {
      alerts.length = 0;
    },

    async ping() {
      return 'PONG';
    },

    async close() {
      // Nothing to close
    }
  };
}

// Try Redis, fall back to memory
function createRedisStore() {
  // Check if Redis URL is explicitly set
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    // No Redis configured, use memory store directly
    return createMemoryStore();
  }

  try {
    const Redis = require('ioredis');
    
    const redis = new Redis(redisUrl, {
      retryStrategy: () => null, // Don't retry
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });

    let connected = false;
    let memoryFallback = null;

    redis.on('connect', () => {
      connected = true;
      console.log('📦 Redis connected');
    });
    
    redis.on('error', () => {
      if (!memoryFallback) {
        memoryFallback = createMemoryStore();
      }
    });

    // Return wrapper that falls back to memory
    return {
      async saveEndpoint(endpoint) {
        if (!connected || memoryFallback) {
          if (!memoryFallback) memoryFallback = createMemoryStore();
          return memoryFallback.saveEndpoint(endpoint);
        }
        await redis.hset('endpoints', endpoint.id, JSON.stringify(endpoint));
      },
      // ... (simplified - just use memory for now)
      async getEndpoint(id) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getEndpoint(id);
      },
      async getAllEndpoints() {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getAllEndpoints();
      },
      async deleteEndpoint(id) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.deleteEndpoint(id);
      },
      async saveStatus(id, status) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.saveStatus(id, status);
      },
      async getStatus(id) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getStatus(id);
      },
      async getAllStatuses() {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getAllStatuses();
      },
      async addHistoryPoint(id, point) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.addHistoryPoint(id, point);
      },
      async getHistory(id, limit = 50) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getHistory(id, limit);
      },
      async addAlert(alert) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.addAlert(alert);
      },
      async getAlerts(limit = 20) {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.getAlerts(limit);
      },
      async clearAlerts() {
        if (!memoryFallback) memoryFallback = createMemoryStore();
        return memoryFallback.clearAlerts();
      },
      async ping() {
        return 'PONG';
      },
      async close() {
        if (connected) await redis.quit();
      }
    };
  } catch (e) {
    return createMemoryStore();
  }
}

module.exports = { createRedisStore, createMemoryStore };
