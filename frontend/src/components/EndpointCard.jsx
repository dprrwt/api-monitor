import { useState, useEffect } from 'react';
import ResponseTimeChart from './ResponseTimeChart';
import { fetchHistory, checkEndpoint, deleteEndpoint, updateEndpoint } from '../api';

function EndpointCard({ endpoint, onUpdate, compact = false }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const status = endpoint.currentStatus?.status || 'unknown';
  const responseTime = endpoint.currentStatus?.responseTime;
  const statusCode = endpoint.currentStatus?.statusCode;
  const lastCheck = endpoint.currentStatus?.timestamp;

  useEffect(() => {
    if (expanded || !compact) {
      loadHistory();
    }
  }, [expanded, endpoint.id, compact]);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory(endpoint.id, 20);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleCheck = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await checkEndpoint(endpoint.id);
      onUpdate();
    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${endpoint.name}?`)) {
      try {
        await deleteEndpoint(endpoint.id);
        onUpdate();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
    setShowMenu(false);
  };

  const handleToggle = async () => {
    try {
      await updateEndpoint(endpoint.id, { enabled: !endpoint.enabled });
      onUpdate();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
    setShowMenu(false);
  };

  const statusStyles = {
    healthy: {
      dot: 'status-dot status-healthy',
      text: 'text-green-400',
      bg: 'bg-green-500/5',
      border: 'hover:border-green-500/30',
      glow: '',
    },
    degraded: {
      dot: 'status-dot status-degraded',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/5',
      border: 'hover:border-yellow-500/30',
      glow: '',
    },
    unhealthy: {
      dot: 'status-dot status-unhealthy',
      text: 'text-red-400',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20 hover:border-red-500/40',
      glow: 'glow-danger',
    },
    unknown: {
      dot: 'status-dot bg-zinc-500',
      text: 'text-zinc-400',
      bg: 'bg-zinc-500/5',
      border: 'hover:border-zinc-500/30',
      glow: '',
    },
  };

  const style = statusStyles[status];

  // Compact card for healthy endpoints
  if (compact) {
    return (
      <div 
        className={`glass-card h-full p-4 cursor-pointer ${style.border} ${style.glow}`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={style.dot} />
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{endpoint.name}</h3>
              <p className="text-xs text-zinc-500 font-mono truncate">{endpoint.url}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Check now"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-zinc-600 text-xs">Status</span>
            <p className={`text-sm font-semibold ${style.text}`}>{statusCode || '—'}</p>
          </div>
          <div>
            <span className="text-zinc-600 text-xs">Latency</span>
            <p className="text-sm font-semibold text-white">{responseTime ? `${responseTime}ms` : '—'}</p>
          </div>
          {!endpoint.enabled && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Paused</span>
          )}
        </div>

        {/* Expanded Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs text-zinc-500 font-medium">Response Time</h4>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  {endpoint.enabled ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            {history.length > 0 ? (
              <ResponseTimeChart data={history} compact />
            ) : (
              <p className="text-xs text-zinc-600 text-center py-4">No history yet</p>
            )}
            {lastCheck && (
              <p className="text-xs text-zinc-600 mt-2 text-center">
                Last: {new Date(lastCheck).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full card for unhealthy/degraded endpoints
  return (
    <div className={`glass-card h-full p-5 ${style.border} ${style.glow}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={style.dot} />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-lg">{endpoint.name}</h3>
            <p className="text-sm text-zinc-500 font-mono truncate">{endpoint.url}</p>
          </div>
        </div>
        
        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 glass-card border border-zinc-700 rounded-xl shadow-xl z-10 overflow-hidden">
              <button
                onClick={handleToggle}
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 transition-colors"
              >
                {endpoint.enabled ? 'Pause Monitoring' : 'Resume Monitoring'}
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
              >
                Delete Endpoint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {status === 'unhealthy' && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-400 font-medium">Endpoint is down</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Status</p>
          <p className={`text-lg font-bold ${style.text}`}>{statusCode || '—'}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Latency</p>
          <p className="text-lg font-bold text-white">{responseTime ? `${responseTime}ms` : '—'}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">State</p>
          <p className={`text-lg font-bold ${endpoint.enabled ? 'text-green-400' : 'text-zinc-500'}`}>
            {endpoint.enabled ? 'Active' : 'Paused'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <h4 className="text-xs text-zinc-500 font-medium mb-2">Response Time History</h4>
        {history.length > 0 ? (
          <div className="chart-container">
            <ResponseTimeChart data={history} />
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-zinc-600 text-sm">
            Collecting data...
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Check Now
        </button>
      </div>

      {/* Last Check */}
      {lastCheck && (
        <p className="text-xs text-zinc-600 mt-3 text-center">
          Last checked: {new Date(lastCheck).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default EndpointCard;
