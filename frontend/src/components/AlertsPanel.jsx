import { clearAlerts } from '../api';

function AlertsPanel({ alerts, onClose, onClear }) {
  const handleClear = async () => {
    try {
      await clearAlerts();
      onClear();
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-sm rounded-full">
              {alerts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-400">No alerts — everything looks good!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))
          )}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="p-4 border-t border-dark-600">
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors font-medium"
            >
              Clear All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const statusColors = {
    healthy: 'border-green-500/30 bg-green-500/5',
    degraded: 'border-yellow-500/30 bg-yellow-500/5',
    unhealthy: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[alert.status] || 'border-dark-600'}`}>
      <div className="flex items-start justify-between mb-1">
        <p className="font-medium text-white">{alert.endpointName}</p>
        <span className="text-xs text-gray-500">
          {new Date(alert.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-gray-400">{alert.message}</p>
      {alert.error && (
        <p className="text-xs text-red-400 mt-1 font-mono">{alert.error}</p>
      )}
    </div>
  );
}

export default AlertsPanel;
