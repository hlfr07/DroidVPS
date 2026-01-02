import { FiBattery } from 'react-icons/fi';
import { BatteryInfo } from '../../types/system';

interface BatteryChartProps {
  batteryInfo: BatteryInfo | null;
}

export function BatteryChart({ batteryInfo }: BatteryChartProps) {
  if (!batteryInfo || !batteryInfo.isAvailable) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm">Batería no disponible</p>
      </div>
    );
  }

  const percentage = batteryInfo.percentage;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color según el porcentaje
  const getColor = () => {
    if (percentage > 50) return { stroke: 'stroke-green-500', text: 'text-green-400', gradient: 'from-green-500 to-emerald-500' };
    if (percentage > 20) return { stroke: 'stroke-yellow-500', text: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-500' };
    return { stroke: 'stroke-red-500', text: 'text-red-400', gradient: 'from-red-500 to-orange-500' };
  };

  const colors = getColor();

  // Icono de estado
  const getStatusIcon = () => {
    if (batteryInfo.status === 'CHARGING') return '⚡';
    if (batteryInfo.status === 'FULL') return '✅';
    if (batteryInfo.status === 'DISCHARGING') return '🔋';
    return '🔌';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
          <FiBattery className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Estado de Batería</h2>
          <p className="text-sm text-slate-400">Nivel actual de carga</p>
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
            <span className="text-5xl mb-2">{getStatusIcon()}</span>
            <span className={`text-4xl font-bold ${colors.text}`}>{percentage}%</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Estado</p>
            <p className="text-sm font-semibold text-white">
              {batteryInfo.status === 'CHARGING' ? 'Cargando' :
                batteryInfo.status === 'DISCHARGING' ? 'Descargando' :
                  batteryInfo.status === 'FULL' ? 'Completa' : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Temperatura</p>
            <p className={`text-sm font-semibold ${batteryInfo.temperature >= 45 ? 'text-red-400' :
                batteryInfo.temperature >= 40 ? 'text-orange-400' :
                  batteryInfo.temperature >= 32.8 ? 'text-yellow-400' :
                    'text-green-400'
              }`}>
              {batteryInfo.temperature.toFixed(1)}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
