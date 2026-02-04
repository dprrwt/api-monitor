import { useState, useEffect } from 'react';
import ResponseTimeChart from './ResponseTimeChart';
import { fetchHistory, checkEndpoint, deleteEndpoint, updateEndpoint } from '../api';

function EndpointCard({ endpoint, onUpdate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const status = endpoint.currentStatus?.status || 'unknown';
  const responseTime = endpoint.currentStatus?.responseTime;
  const statusCode = endpoint.currentStatus?.statusCode;
  const lastCheck = endpoint.currentStatus?.timestamp;

  useEffect(() => {
    if (expanded) {
      loadHistory();
    }
  }, [expanded, endpoint.id]);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory(endpoint.id, 30);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleCheck = async () => {
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
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/30',
      pulse: 'pulse-healthy',
      icon: '🟢',
    },
    degraded: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      pulse: '',
      icon: '🟡',
    },
    unhealthy: {
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/30',
      pulse: 'pulse-unhealthy',
      icon: '🔴',
    },
    unknown: {
      bg: 'bg-gray-500',
      text: 'text-gray-400',
      border: 'border-gray-500/30',
      pulse: '',
      icon: '⚪',
    },
  };

  const style = statusStyles[status];

  return (
    <div className={`bg-dark-800 rounded-xl border ${style.border} overflow-hidden transition-all hover:border-opacity-60`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${style.bg} ${style.pulse}`}></div>
            <div>
              <h3 className="font-semibold text-white">{endpoint.name}</h3>
              <p className="text-sm text-gray-500 font-mono truncate max-w-[200px]">{endpoint.url}</p>
            </div>
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-10">
                <button
                  onClick={handleToggle}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-dark-600 transition-colors"
                >
                  {endpoint.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-dark-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className={`text-sm font-medium ${style.text}`}>
              {statusCode || '—'}
            </p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Latency</p>
            <p className="text-sm font-medium text-white">
              {responseTime ? `${responseTime}ms` : '—'}
            </p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">State</p>
            <p className={`text-sm font-medium ${endpoint.enabled ? 'text-green-400' : 'text-gray-500'}`}>
              {endpoint.enabled ? 'Active' : 'Paused'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Check Now
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Chart */}
      {expanded && (
        <div className="border-t border-dark-600 p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Response Time History</h4>
          {history.length > 0 ? (
            <ResponseTimeChart data={history} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No history data yet</p>
          )}
          {lastCheck && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Last checked: {new Date(lastCheck).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EndpointCard;
