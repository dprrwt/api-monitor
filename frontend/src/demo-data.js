// Demo data for GitHub Pages static deployment
// Simulates a live API Monitor dashboard with realistic data

const now = Date.now();

// Generate realistic response time history
function generateHistory(baseMs, variance, points = 50) {
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - i) * 60000).toISOString(),
    responseTime: Math.max(10, baseMs + (Math.random() - 0.5) * variance),
    status: Math.random() > 0.05 ? 200 : 500,
  }));
}

export const DEMO_ENDPOINTS = [
  {
    id: 'gh-api',
    name: 'GitHub API',
    url: 'https://api.github.com',
    interval: 60000,
    enabled: true,
    status: 'healthy',
    lastCheck: new Date(now - 15000).toISOString(),
    lastResponseTime: 142,
    uptime: 99.8,
    history: generateHistory(140, 60),
  },
  {
    id: 'jsonplaceholder',
    name: 'JSONPlaceholder',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    interval: 60000,
    enabled: true,
    status: 'healthy',
    lastCheck: new Date(now - 8000).toISOString(),
    lastResponseTime: 89,
    uptime: 100,
    history: generateHistory(85, 30),
  },
  {
    id: 'httpbin',
    name: 'HTTPBin',
    url: 'https://httpbin.org/get',
    interval: 30000,
    enabled: true,
    status: 'degraded',
    lastCheck: new Date(now - 3000).toISOString(),
    lastResponseTime: 892,
    uptime: 97.2,
    history: generateHistory(500, 400),
  },
  {
    id: 'stripe-api',
    name: 'Stripe API',
    url: 'https://api.stripe.com/v1/health',
    interval: 60000,
    enabled: true,
    status: 'healthy',
    lastCheck: new Date(now - 22000).toISOString(),
    lastResponseTime: 67,
    uptime: 99.99,
    history: generateHistory(65, 20),
  },
  {
    id: 'custom-api',
    name: 'My Production API',
    url: 'https://api.example.com/health',
    interval: 30000,
    enabled: true,
    status: 'down',
    lastCheck: new Date(now - 45000).toISOString(),
    lastResponseTime: null,
    uptime: 94.5,
    history: generateHistory(200, 100).map((h, i) => 
      i > 45 ? { ...h, status: 500, responseTime: null } : h
    ),
  },
];

export const DEMO_ALERTS = [
  {
    id: 'a1',
    endpointId: 'custom-api',
    endpointName: 'My Production API',
    type: 'down',
    message: 'Endpoint is DOWN — connection refused',
    timestamp: new Date(now - 120000).toISOString(),
  },
  {
    id: 'a2',
    endpointId: 'httpbin',
    endpointName: 'HTTPBin',
    type: 'degraded',
    message: 'Response time exceeded 500ms threshold (892ms)',
    timestamp: new Date(now - 180000).toISOString(),
  },
  {
    id: 'a3',
    endpointId: 'custom-api',
    endpointName: 'My Production API',
    type: 'degraded',
    message: 'Response time exceeded 500ms threshold (1240ms)',
    timestamp: new Date(now - 600000).toISOString(),
  },
];

export const DEMO_STATS = {
  totalEndpoints: 5,
  healthyCount: 3,
  degradedCount: 1,
  downCount: 1,
  avgResponseTime: 198,
  overallUptime: 98.3,
  totalChecks: 4820,
  lastUpdated: new Date(now).toISOString(),
};
