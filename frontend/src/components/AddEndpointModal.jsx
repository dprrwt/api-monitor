import { useState } from 'react';
import { addEndpoint } from '../api';

function AddEndpointModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addEndpoint({ name, url, interval });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add endpoint');
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { name: 'GitHub API', url: 'https://api.github.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 modal-overlay"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Add Endpoint</h2>
            <p className="text-sm text-zinc-500 mt-1">Monitor a new API endpoint</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500 mb-2">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  setName(preset.name);
                  setUrl(preset.url);
                }}
                className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API"
              required
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
              required
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Check Interval
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 300, 600].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setInterval(value)}
                  className={`py-2 px-3 text-sm rounded-lg transition-colors ${
                    interval === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {value < 60 ? `${value}s` : `${value / 60}m`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Add Endpoint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEndpointModal;
