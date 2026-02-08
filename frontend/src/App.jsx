import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import AddEndpointModal from './components/AddEndpointModal';
import AlertsPanel from './components/AlertsPanel';
import { fetchEndpoints, fetchAlerts, fetchStats, IS_DEMO } from './api';

function DemoBanner({ onDismiss }) {
  return (
    <div className="relative bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-center py-2.5 px-4 text-sm font-medium shadow-lg z-50">
      <span className="mr-1">⚠️</span> This is a <strong>demo</strong> with mock data — not a live monitor.
      <a href="https://github.com/dprrwt/api-monitor" target="_blank" rel="noopener noreferrer" className="underline ml-2 hover:text-white/80">View source & self-host →</a>
      <button onClick={onDismiss} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white/70 text-white/90 text-lg leading-none" aria-label="Dismiss">✕</button>
    </div>
  );
}

function App() {
  const [endpoints, setEndpoints] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(IS_DEMO);

  const loadData = useCallback(async () => {
    try {
      const [endpointsData, alertsData, statsData] = await Promise.all([
        fetchEndpoints(),
        fetchAlerts(),
        fetchStats(),
      ]);
      setEndpoints(endpointsData);
      setAlerts(alertsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to connect to API. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-zinc-400">Loading API Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {showDemoBanner && <DemoBanner onDismiss={() => setShowDemoBanner(false)} />}
      <Header 
        stats={stats} 
        alertCount={alerts.length}
        onAddClick={() => setShowAddModal(true)}
        onAlertsClick={() => setShowAlerts(true)}
      />
      
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="glass-card border-red-500/30 p-4">
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}

      <Dashboard 
        endpoints={endpoints}
        stats={stats}
        onRefresh={loadData}
      />

      {showAddModal && (
        <AddEndpointModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {showAlerts && (
        <AlertsPanel
          alerts={alerts}
          onClose={() => setShowAlerts(false)}
          onClear={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default App;
