import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

function ResponseTimeChart({ data }) {
  const chartData = useMemo(() => {
    const labels = data.map((d) => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    });

    const responseTimes = data.map((d) => d.responseTime || 0);
    const statusColors = data.map((d) => {
      switch (d.status) {
        case 'healthy': return 'rgba(34, 197, 94, 1)';
        case 'degraded': return 'rgba(234, 179, 8, 1)';
        case 'unhealthy': return 'rgba(239, 68, 68, 1)';
        default: return 'rgba(107, 114, 128, 1)';
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Response Time (ms)',
          data: responseTimes,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: statusColors,
          pointBorderColor: statusColors,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.95)',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const point = data[context.dataIndex];
            return [
              `Response: ${context.raw}ms`,
              `Status: ${point.status}`,
              point.statusCode ? `Code: ${point.statusCode}` : '',
            ].filter(Boolean);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          maxRotation: 0,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          callback: function(value) {
            return value + 'ms';
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default ResponseTimeChart;
