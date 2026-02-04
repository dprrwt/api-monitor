function StatsCard({ title, value, suffix = '', icon, color = 'default', subtitle }) {
  const colorStyles = {
    success: {
      icon: 'text-green-400 bg-green-500/10',
      value: 'text-green-400',
    },
    warning: {
      icon: 'text-yellow-400 bg-yellow-500/10',
      value: 'text-yellow-400',
    },
    danger: {
      icon: 'text-red-400 bg-red-500/10',
      value: 'text-red-400',
    },
    default: {
      icon: 'text-blue-400 bg-blue-500/10',
      value: 'text-white',
    },
  };

  const styles = colorStyles[color];

  return (
    <div className="glass-card h-full p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <span className="text-zinc-500 text-sm font-medium">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold number-animate ${styles.value}`}>
            {value}
          </span>
          {suffix && (
            <span className="text-zinc-500 text-lg">{suffix}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-zinc-600 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
