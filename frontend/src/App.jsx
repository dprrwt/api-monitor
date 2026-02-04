import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import AddEndpointModal from './components/AddEndpointModal';
import AlertsPanel from './components/AlertsPanel';
import { fetchEndpoints, fetchAlerts, fetchStats } from './api';

function App() {
  const [endpoints, setEndpoints] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

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
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading API Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header 
        stats={stats} 
        alertCount={alerts.length}
        onAddClick={() => setShowAddModal(true)}
        onAlertsClick={() => setShowAlerts(true)}
      />
      
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      <Dashboard 
        endpoints={endpoints} 
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
