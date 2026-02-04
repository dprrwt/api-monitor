import { useMemo } from 'react';
import EndpointCard from './EndpointCard';
import StatsCard from './StatsCard';
import OverviewCard from './OverviewCard';

function Dashboard({ endpoints, stats, onRefresh }) {
  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const healthy = endpoints.filter(e => e.currentStatus?.status === 'healthy').length;
    const degraded = endpoints.filter(e => e.currentStatus?.status === 'degraded').length;
    const unhealthy = endpoints.filter(e => e.currentStatus?.status === 'unhealthy').length;
    const avgLatency = endpoints.reduce((sum, e) => {
      return sum + (e.currentStatus?.responseTime || 0);
    }, 0) / (endpoints.length || 1);
    
    return { healthy, degraded, unhealthy, avgLatency: Math.round(avgLatency), total: endpoints.length };
  }, [endpoints]);

  if (endpoints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 glass-card flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No endpoints yet</h3>
          <p className="text-zinc-500 max-w-sm">Add your first API endpoint to start monitoring its health and performance.</p>
        </div>
      </div>
    );
  }

  // Sort endpoints: unhealthy first, then degraded, then healthy
  const sortedEndpoints = [...endpoints].sort((a, b) => {
    const statusOrder = { unhealthy: 0, degraded: 1, healthy: 2, unknown: 3 };
    const statusA = a.currentStatus?.status || 'unknown';
    const statusB = b.currentStatus?.status || 'unknown';
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Bento Grid */}
      <div className="bento-grid">
        {/* Overview Card - Large */}
        <div className="bento-lg">
          <OverviewCard stats={aggregateStats} />
        </div>

        {/* Stats Cards */}
        <div className="bento-sm">
          <StatsCard
            title="Healthy"
            value={aggregateStats.healthy}
            icon="✓"
            color="success"
            subtitle={`${Math.round((aggregateStats.healthy / aggregateStats.total) * 100) || 0}% uptime`}
          />
        </div>
        <div className="bento-sm">
          <StatsCard
            title="Avg Latency"
            value={`${aggregateStats.avgLatency}`}
            suffix="ms"
            icon="⚡"
            color="default"
            subtitle="across all endpoints"
          />
        </div>

        {/* Endpoint Cards */}
        {sortedEndpoints.map((endpoint, index) => {
          const status = endpoint.currentStatus?.status || 'unknown';
          // Unhealthy endpoints get larger cards
          const size = status === 'unhealthy' ? 'bento-md' : 'bento-sm';
          
          return (
            <div key={endpoint.id} className={size}>
              <EndpointCard
                endpoint={endpoint}
                onUpdate={onRefresh}
                compact={status !== 'unhealthy'}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default Dashboard;
