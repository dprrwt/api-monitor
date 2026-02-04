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
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 modal-overlay"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md h-full glass-card rounded-none border-l border-zinc-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
            <p className="text-xs text-zinc-500">{alerts.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/5 rounded-lg"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">All clear</h3>
              <p className="text-sm text-zinc-500">No alerts at the moment</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {alerts.map((alert, index) => (
                <AlertItem key={index} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const typeStyles = {
    unhealthy: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-400',
      iconBg: 'bg-red-500/20',
    },
    degraded: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      icon: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
    },
    recovered: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      icon: 'text-green-400',
      iconBg: 'bg-green-500/20',
    },
  };

  const style = typeStyles[alert.type] || typeStyles.unhealthy;

  return (
    <div className={`p-4 rounded-xl ${style.bg} border ${style.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
          {alert.type === 'recovered' ? (
            <svg className={`w-4 h-4 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className={`w-4 h-4 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-white truncate">{alert.endpoint}</h4>
            <span className="text-xs text-zinc-500 flex-shrink-0">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-zinc-400">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}

export default AlertsPanel;
