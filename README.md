# API Monitor

A full-stack API health monitoring dashboard with real-time status tracking, response time charts, and alert management.

![API Monitor Dashboard](https://img.shields.io/badge/status-active-brightgreen)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)
![Redis](https://img.shields.io/badge/redis-7-red)

## Features

- 🟢🟡🔴 **Real-time Status Indicators** — Instantly see which APIs are healthy, degraded, or down
- 📊 **Response Time Charts** — Visualize latency trends over time with Chart.js
- ⏱️ **Configurable Intervals** — Set custom check frequencies per endpoint
- 🔔 **Alert System** — Console alerts with webhook support
- ➕ **Add/Remove Endpoints** — Easy management through the UI
- 📱 **Mobile Responsive** — Works on any device
- 🐳 **Docker Ready** — One-command deployment

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/dprrwt/api-monitor.git
cd api-monitor

# Start all services
docker-compose up -d

# Open http://localhost in your browser
```

### Manual Setup

#### Prerequisites
- Node.js 18+
- Redis server running locally

#### Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Start the server
npm start
# or for development:
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 (frontend proxies API calls to backend on port 3001)

## Configuration

### Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `DEFAULT_CHECK_INTERVAL` | `60000` | Default check interval (ms) |
| `MAX_HISTORY_POINTS` | `100` | Max data points stored per endpoint |
| `LATENCY_THRESHOLD` | `3000` | Default latency threshold in ms (responses slower than this are marked degraded) |
| `ALERT_WEBHOOK_URL` | — | Optional webhook for alerts |

### Default Endpoints

The monitor comes pre-configured with:
- **GitHub API** — `https://api.github.com`
- **JSONPlaceholder** — `https://jsonplaceholder.typicode.com/posts/1`
- **HTTPBin** — `https://httpbin.org/get`

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/endpoints` | List all endpoints with current status |
| `POST` | `/api/endpoints` | Add new endpoint |
| `PUT` | `/api/endpoints/:id` | Update endpoint |
| `DELETE` | `/api/endpoints/:id` | Remove endpoint |
| `POST` | `/api/endpoints/:id/check` | Trigger immediate check |
| `GET` | `/api/endpoints/:id/history` | Get response time history |
| `GET` | `/api/alerts` | Get recent alerts |
| `DELETE` | `/api/alerts` | Clear all alerts |
| `GET` | `/api/stats` | Get aggregate statistics |

### Add Endpoint Example

```bash
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://my-api.example.com/health",
    "interval": 30000,
    "latencyThreshold": 2000,
    "enabled": true
  }'
```

> **Latency threshold:** If an endpoint responds with 2xx but takes longer than `latencyThreshold` ms, it's marked as **degraded** instead of healthy. Default: 3000ms. Configurable per-endpoint or globally via `LATENCY_THRESHOLD` env var.

## Tech Stack

### Backend
- **Express.js** — HTTP server
- **Redis** — Data persistence
- **Axios** — HTTP client for health checks
- **node-cron** — Scheduling

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **Chart.js** — Response time graphs
- **Tailwind CSS** — Styling

### Infrastructure
- **Docker Compose** — Container orchestration
- **Nginx** — Frontend serving & API proxy

## Project Structure

```
api-monitor/
├── backend/
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── routes/
│   │   │   └── api.js       # REST endpoints
│   │   └── services/
│   │       ├── monitor.js   # Health check logic
│   │       └── redis.js     # Data storage
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js           # API client
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── Dashboard.jsx
│   │       ├── EndpointCard.jsx
│   │       ├── ResponseTimeChart.jsx
│   │       ├── AddEndpointModal.jsx
│   │       └── AlertsPanel.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## License

MIT © dprrwt

---

*just to myself*
