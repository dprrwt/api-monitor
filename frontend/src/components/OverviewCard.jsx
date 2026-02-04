function OverviewCard({ stats }) {
  const overallStatus = stats.unhealthy > 0 
    ? 'critical' 
    : stats.degraded > 0 
      ? 'degraded' 
      : 'operational';

  const statusConfig = {
    operational: {
      label: 'All Systems Operational',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      glow: 'glow-success',
      icon: '●'
    },
    degraded: {
      label: 'Partial Outage',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      glow: 'glow-warning',
      icon: '◐'
    },
    critical: {
      label: 'Major Outage',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'glow-danger',
      icon: '○'
    }
  };

  const config = statusConfig[overallStatus];

  return (
    <div className={`glass-card h-full p-6 ${config.glow}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-zinc-500 text-sm mb-1">System Status</p>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${config.color}`}>{config.icon}</span>
            <h2 className={`text-2xl font-semibold ${config.color}`}>
              {config.label}
            </h2>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${config.bg} ${config.border} border`}>
          <span className={`text-sm font-medium ${config.color}`}>
            {stats.healthy}/{stats.total} healthy
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
          {stats.healthy > 0 && (
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(stats.healthy / stats.total) * 100}%` }}
            />
          )}
          {stats.degraded > 0 && (
            <div 
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${(stats.degraded / stats.total) * 100}%` }}
            />
          )}
          {stats.unhealthy > 0 && (
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${(stats.unhealthy / stats.total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatusStat 
          label="Healthy" 
          value={stats.healthy} 
          color="text-green-400" 
          dotColor="bg-green-500"
        />
        <StatusStat 
          label="Degraded" 
          value={stats.degraded} 
          color="text-yellow-400"
          dotColor="bg-yellow-500"
        />
        <StatusStat 
          label="Down" 
          value={stats.unhealthy} 
          color="text-red-400"
          dotColor="bg-red-500"
        />
      </div>
    </div>
  );
}

function StatusStat({ label, value, color, dotColor }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-zinc-500 text-sm">{label}</span>
      </div>
      <p className={`text-3xl font-bold number-animate ${color}`}>{value}</p>
    </div>
  );
}

export default OverviewCard;
