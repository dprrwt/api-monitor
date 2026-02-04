const Redis = require('ioredis');

const MAX_HISTORY = parseInt(process.env.MAX_HISTORY_POINTS) || 100;

function createRedisStore() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  });

  redis.on('connect', () => console.log('📦 Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err.message));

  return {
    // Endpoint management
    async saveEndpoint(endpoint) {
      await redis.hset('endpoints', endpoint.id, JSON.stringify(endpoint));
    },

    async getEndpoint(id) {
      const data = await redis.hget('endpoints', id);
      return data ? JSON.parse(data) : null;
    },

    async getAllEndpoints() {
      const data = await redis.hgetall('endpoints');
      return Object.values(data).map(JSON.parse);
    },

    async deleteEndpoint(id) {
      await redis.hdel('endpoints', id);
      await redis.del(`history:${id}`);
      await redis.del(`status:${id}`);
    },

    // Status management
    async saveStatus(id, status) {
      await redis.set(`status:${id}`, JSON.stringify(status));
    },

    async getStatus(id) {
      const data = await redis.get(`status:${id}`);
      return data ? JSON.parse(data) : null;
    },

    async getAllStatuses() {
      const endpoints = await this.getAllEndpoints();
      const statuses = {};
      for (const ep of endpoints) {
        statuses[ep.id] = await this.getStatus(ep.id);
      }
      return statuses;
    },

    // History management
    async addHistoryPoint(id, point) {
      const key = `history:${id}`;
      await redis.lpush(key, JSON.stringify(point));
      await redis.ltrim(key, 0, MAX_HISTORY - 1);
    },

    async getHistory(id, limit = 50) {
      const key = `history:${id}`;
      const data = await redis.lrange(key, 0, limit - 1);
      return data.map(JSON.parse).reverse();
    },

    // Alert management
    async addAlert(alert) {
      const key = 'alerts';
      await redis.lpush(key, JSON.stringify(alert));
      await redis.ltrim(key, 0, 99); // Keep last 100 alerts
    },

    async getAlerts(limit = 20) {
      const data = await redis.lrange('alerts', 0, limit - 1);
      return data.map(JSON.parse);
    },

    async clearAlerts() {
      await redis.del('alerts');
    },

    // Connection
    async ping() {
      return await redis.ping();
    },

    async close() {
      await redis.quit();
    }
  };
}

module.exports = { createRedisStore };
