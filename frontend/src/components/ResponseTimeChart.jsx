import { useMemo } from 'react';

function ResponseTimeChart({ data, compact = false }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const times = data.map(d => d.responseTime || 0);
    const max = Math.max(...times, 100);
    const min = Math.min(...times);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

    return {
      points: data.map((d, i) => ({
        x: (i / (data.length - 1 || 1)) * 100,
        y: 100 - ((d.responseTime || 0) / max) * 100,
        value: d.responseTime,
        status: d.status,
        time: new Date(d.timestamp).toLocaleTimeString(),
      })),
      max,
      min,
      avg,
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-16' : 'h-24'} text-zinc-600 text-sm`}>
        No data
      </div>
    );
  }

  const height = compact ? 48 : 80;
  const pathD = chartData.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area fill path
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className={compact ? '' : ''}>
      {/* Stats Row */}
      {!compact && (
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-zinc-500">Avg:</span>
            <span className="text-white font-medium">{chartData.avg}ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Min:</span>
            <span className="text-green-400 font-medium">{chartData.min}ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Max:</span>
            <span className="text-yellow-400 font-medium">{chartData.max}ms</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(99, 102, 241)" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(63, 63, 70, 0.3)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(63, 63, 70, 0.3)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(63, 63, 70, 0.3)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

          {/* Area Fill */}
          <path
            d={areaD}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {!compact && chartData.points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={point.status === 'healthy' ? '#22c55e' : point.status === 'degraded' ? '#eab308' : '#ef4444'}
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Y-axis Labels */}
        {!compact && (
          <>
            <span className="absolute left-0 top-0 text-[10px] text-zinc-600 transform -translate-y-1/2">
              {chartData.max}ms
            </span>
            <span className="absolute left-0 bottom-0 text-[10px] text-zinc-600 transform translate-y-1/2">
              0ms
            </span>
          </>
        )}
      </div>

      {/* Mini stats for compact mode */}
      {compact && (
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
          <span>Avg: {chartData.avg}ms</span>
          <span>Latest: {chartData.points[chartData.points.length - 1]?.value || 0}ms</span>
        </div>
      )}
    </div>
  );
}

export default ResponseTimeChart;
