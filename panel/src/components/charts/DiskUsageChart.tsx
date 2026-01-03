import { FiHardDrive } from 'react-icons/fi';

interface DiskUsageChartProps {
  usagePercent: number;
  used: string;
  available: string;
}

export function DiskUsageChart({ usagePercent, used, available }: DiskUsageChartProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (usagePercent / 100) * circumference;

  // Color según el porcentaje
  const getColor = () => {
    if (usagePercent < 70) return { stroke: 'stroke-blue-500', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' };
    if (usagePercent < 85) return { stroke: 'stroke-yellow-500', text: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-500' };
    return { stroke: 'stroke-red-500', text: 'text-red-400', gradient: 'from-red-500 to-orange-500' };
  };

  const colors = getColor();

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
          <FiHardDrive className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Uso de Disco</h2>
          <p className="text-sm text-slate-400">Almacenamiento actual</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        {/* Gráfico circular */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="transform -rotate-90 w-48 h-48">
            {/* Círculo de fondo */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-700"
            />
            {/* Círculo de progreso */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${colors.stroke} transition-all duration-500 ease-in-out`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Contenido central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2">💾</span>
            <span className={`text-4xl font-bold ${colors.text}`}>{usagePercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Usado</p>
            <p className="text-sm font-semibold text-white">{used}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Disponible</p>
            <p className="text-sm font-semibold text-green-400">{available}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
