// Drop-in replacement for api.js — serves mock data for static demo
import { DEMO_ENDPOINTS, DEMO_ALERTS, DEMO_STATS } from './demo-data';

export const IS_DEMO = true;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Transform demo data to match backend API format (currentStatus object)
function jitterEndpoints() {
  return DEMO_ENDPOINTS.map((ep) => {
    const rt = ep.lastResponseTime
      ? Math.max(10, ep.lastResponseTime + Math.round((Math.random() - 0.5) * 30))
      : null;
    return {
      ...ep,
      currentStatus: {
        status: ep.status,
        responseTime: rt,
        statusCode: ep.status === 'unhealthy' ? 500 : ep.status === 'degraded' ? 200 : 200,
        timestamp: new Date().toISOString(),
      },
    };
  });
}

export const fetchEndpoints = async () => {
  await delay(200);
  return jitterEndpoints();
};

export const addEndpoint = async (endpoint) => {
  await delay(300);
  return { id: 'demo-' + Date.now(), ...endpoint, status: 'healthy', lastResponseTime: 120, uptime: 100, history: [] };
};

export const updateEndpoint = async (id, updates) => {
  await delay(200);
  return { id, ...updates };
};

export const deleteEndpoint = async (id) => {
  await delay(200);
};

export const checkEndpoint = async (id) => {
  await delay(500);
  return { status: 'healthy', responseTime: Math.round(50 + Math.random() * 200) };
};

export const fetchHistory = async (id, limit = 50) => {
  await delay(200);
  const ep = DEMO_ENDPOINTS.find((e) => e.id === id);
  return ep ? ep.history.slice(-limit) : [];
};

export const fetchAlerts = async (limit = 20) => {
  await delay(150);
  return DEMO_ALERTS.slice(0, limit);
};

export const clearAlerts = async () => {
  await delay(200);
};

export const fetchStats = async () => {
  await delay(150);
  return {
    ...DEMO_STATS,
    avgResponseTime: DEMO_STATS.avgResponseTime + Math.round((Math.random() - 0.5) * 20),
    lastUpdated: new Date().toISOString(),
  };
};
