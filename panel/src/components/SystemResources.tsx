import { FiActivity, FiCpu, FiServer, FiTrendingUp, FiZap, FiSmartphone, FiBattery, FiThermometer } from 'react-icons/fi';
import { SystemData, DeviceInfo, BatteryInfo, TemperatureInfo } from '../types/system';
import { CPUInfoCard } from './charts/CPUInfoCard';
import { DiskChart } from './charts/DiskChart';
import { ResourceChart } from './charts/ResourceChart';
import { CPUFrequencyCard } from './charts/CPUFrequencyCard';
import { BatteryChart } from './charts/BatteryChart';
import { DiskUsageChart } from './charts/DiskUsageChart';
import { LoadingSpinner } from './LoadingSpinner';

interface SystemResourcesProps {
  data: SystemData | null;
  deviceInfo?: DeviceInfo | null;
  batteryInfo?: BatteryInfo | null;
  temperatureInfo?: TemperatureInfo | null;
}
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
}

function StatMetric({ icon: Icon, label, value, unit, color }: { icon: typeof FiCpu; label: string; value: string | number; unit?: string; color: string }) {
  const colorClass = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
  }[color] || 'text-blue-400';

  return (
    <div className="flex items-start gap-3">
      <div className={`p-2.5 bg-slate-700/50 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">
          {value}
          {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function SystemResources({ data, deviceInfo, batteryInfo, temperatureInfo }: SystemResourcesProps) {
  // Mostrar loader si falta algún dato crítico
  const isLoading = !data || !deviceInfo || !batteryInfo;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* 1. RESUMEN DEL SISTEMA - Prioridad máxima */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <FiServer className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Resumen del Sistema</h2>
        </div>

        {/* Distribución y Kernel */}
        {data.distro && (
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Distribución</p>
                <p className="text-sm font-semibold text-white">{data.distro.description}</p>
              </div>
              {data.info?.kernel && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Kernel</p>
                  <p className="text-sm font-mono text-white">{data.info.kernel}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <StatMetric icon={FiServer} label="Nombre de Host" value={data.info?.hostname || 'N/A'} color="cyan" />
          <StatMetric icon={FiCpu} label="Núcleos" value={data.info?.cpus || 0} color="blue" />
          <StatMetric icon={FiActivity} label="Tiempo de Actividad" value={data.info?.uptime ? formatUptime(data.info.uptime) : 'N/A'} color="green" />
          <StatMetric icon={FiTrendingUp} label="Carga 1m" value={data.load?.load1 || '0.00'} color="blue" />
          <StatMetric icon={FiZap} label="Carga 5m" value={data.load?.load5 || '0.00'} color="blue" />
        </div>
      </div>

      {/* 2. CPU FREQUENCY, DISK USAGE & BATTERY - Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU Frequency - ocupa 1 columna */}
        {data.cpuDetails?.mhzDetails && data.cpuDetails.mhzDetails.length > 0 && (
          <div className="lg:col-span-1">
            <CPUFrequencyCard mhzDetails={data.cpuDetails.mhzDetails} />
          </div>
        )}

        {/* Disk Usage Chart - ocupa 1 columna */}
        <div className="lg:col-span-1">
          <DiskUsageChart
            usagePercent={data.disk?.usagePercent || 0}
            used={data.disk?.used || 'N/A'}
            available={data.disk?.available || 'N/A'}
          />
        </div>

        {/* Battery Chart - ocupa 1 columna */}
        <div className="lg:col-span-1">
          <BatteryChart batteryInfo={batteryInfo || null} />
        </div>
      </div>

      {/* 3. GRÁFICOS DE RECURSOS - CPU, Memoria, Disco */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ResourceChart
            data={data.cpuHistory || []}
            title="Uso de CPU a lo Largo del Tiempo"
            color="#3b82f6"
          />
        </div>
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 sm:p-6 hover:border-blue-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FiCpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-300">CPU Actual</h3>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">{data.cpu?.toFixed(1) || 0}%</div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.cpu)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ResourceChart
            data={data.memoryHistory || []}
            title="Uso de Memoria a lo Largo del Tiempo"
            color="#10b981"
          />
        </div>
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 sm:p-6 hover:border-green-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FiActivity className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-slate-300">RAM Actual</h3>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">{data.memory?.usagePercent?.toFixed(1) || 0}%</div>
            <p className="text-xs text-slate-400 mb-3">{formatBytes(data.memory?.used || 0)} / {formatBytes(data.memory?.total || 0)}</p>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.memory.usagePercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="order-1">
          <DiskChart
            used={data.disk?.used || 'N/A'}
            available={data.disk?.available || 'N/A'}
            usagePercent={data.disk?.usagePercent || 0}
          />
        </div>
        <div className="lg:col-span-2 order-2">
          <ResourceChart
            data={data.diskHistory || []}
            title="Uso de Disco a lo Largo del Tiempo"
            color="#f59e0b"
          />
        </div>
      </div>

      {data.swap?.total > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <FiActivity className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-300">Memoria Swap</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Uso</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{data.swap.usagePercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Usado</p>
              <p className="text-sm font-semibold text-white">{formatBytes(data.swap.used)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Total</p>
              <p className="text-sm font-semibold text-white">{formatBytes(data.swap.total)}</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, data.swap.usagePercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. SENSORES - Dispositivo, Batería, Temperatura */}
      {/* Device Info Section */}
      {deviceInfo && deviceInfo.isTermux && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Información del Dispositivo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Fabricante</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.manufacturer}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Modelo</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.model}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Versión de Android</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.androidVersion}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Arquitectura CPU</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.cpuArchitecture}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Versión de Termux</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.termuxVersion}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Kernel</p>
              <p className="text-sm font-mono text-white truncate">{deviceInfo.kernelVersion}</p>
            </div>
          </div>
        </div>
      )}
      {deviceInfo && !deviceInfo.isTermux && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Device Information</h2>
          </div>
          <p className="text-slate-400">Not running in Termux environment</p>
        </div>
      )}

      {/* Battery Info Section */}
      {batteryInfo && batteryInfo.isAvailable && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiBattery className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Estado de la Batería</h2>
          </div>

          {/* Temperature Warning */}
          {batteryInfo.temperature >= 45 && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-semibold text-red-300">¡ALERTA SERIA!</p>
                <p className="text-sm text-red-200 mt-1">
                  La temperatura de la batería es crítica ({batteryInfo.temperature.toFixed(1)}°C). Apaga el dispositivo para evitar daños.
                </p>
              </div>
            </div>
          )}
          {batteryInfo.temperature >= 40 && batteryInfo.temperature < 45 && (
            <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-orange-300">¡PELIGRO!</p>
                <p className="text-sm text-orange-200 mt-1">
                  La temperatura es muy alta ({batteryInfo.temperature.toFixed(1)}°C). Considera usar el dispositivo en un lugar más fresco.
                </p>
              </div>
            </div>
          )}
          {batteryInfo.temperature >= 32.8 && batteryInfo.temperature < 40 && (
            <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-semibold text-yellow-300">Temperatura Elevada</p>
                <p className="text-sm text-yellow-200 mt-1">
                  La batería está a una temperatura moderadamente alta ({batteryInfo.temperature.toFixed(1)}°C). Monitorea su comportamiento.
                </p>
              </div>
            </div>
          )}

          {/* Battery Percentage Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Nivel de Batería</span>
              <span className={`text-2xl font-bold ${batteryInfo.percentage > 50 ? 'text-green-400' :
                batteryInfo.percentage > 20 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                {batteryInfo.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600/30">
              <div
                className={`h-full transition-all ${batteryInfo.percentage > 50 ? 'bg-green-500' :
                  batteryInfo.percentage > 20 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                style={{ width: `${batteryInfo.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Estado</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.status === 'CHARGING' ? '🔌 Cargando' :
                  batteryInfo.status === 'DISCHARGING' ? '🔋 Usando Batería' :
                    batteryInfo.status === 'FULL' ? '✅ Completamente Cargada' :
                      batteryInfo.status === 'NOT_CHARGING' ? '⏸️ No está Cargando' :
                        batteryInfo.status}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Conectada</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.plugged === 'UNPLUGGED' ? '🔌 Desconectada' :
                  batteryInfo.plugged === 'PLUGGED_AC' ? '🔌 Corriente AC' :
                    batteryInfo.plugged === 'PLUGGED_USB' ? '🔌 USB' :
                      batteryInfo.plugged === 'PLUGGED_WIRELESS' ? '📱 Wireless' :
                        batteryInfo.plugged}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Salud</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.health === 'GOOD' ? '✨ Buena' :
                  batteryInfo.health === 'COLD' ? '❄️ Fría' :
                    batteryInfo.health === 'OVERHEAT' ? '🔥 Sobrecalentada' :
                      batteryInfo.health === 'DEAD' ? '💀 Muerta' :
                        batteryInfo.health === 'OVER_VOLTAGE' ? '⚡ Sobrevoltaje' :
                          batteryInfo.health === 'UNKNOWN' ? '❓ Desconocida' :
                            batteryInfo.health}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">🌡️ Temperatura</p>
              <p className={`text-lg font-semibold ${batteryInfo.temperature >= 45 ? 'text-red-400' :
                batteryInfo.temperature >= 40 ? 'text-orange-400' :
                  batteryInfo.temperature >= 32.8 ? 'text-yellow-400' :
                    'text-green-400'
                }`}>
                {batteryInfo.temperature.toFixed(1)}°C
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Consumo Actual</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.current < 0 ?
                  `${Math.abs(batteryInfo.current / 1000).toFixed(0)}mA ↓` :
                  `${(batteryInfo.current / 1000).toFixed(0)}mA ↑`}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">⏱️ Tiempo Restante</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.status === 'DISCHARGING' && batteryInfo.current < 0
                  ? (() => {
                    // Calcular horas restantes
                    // current está en microamperios (µA), porcentaje en %
                    // Asumimos batería típica de ~3000-5000 mAh
                    const batteryCapacity = 4000; // mAh (estimado promedio)
                    const currentmA = Math.abs(batteryInfo.current) / 1000; // convertir a mA
                    const remainingmAh = (batteryInfo.percentage / 100) * batteryCapacity;
                    const hoursRemaining = currentmA > 0 ? remainingmAh / currentmA : 0;

                    if (hoursRemaining < 0.016) {
                      return '< 1 min';
                    } else if (hoursRemaining < 1) {
                      return `${Math.round(hoursRemaining * 60)} min`;
                    } else if (hoursRemaining < 24) {
                      return `${hoursRemaining.toFixed(1)}h`;
                    } else {
                      return `${(hoursRemaining / 24).toFixed(1)}d`;
                    }
                  })()
                  : batteryInfo.status === 'CHARGING'
                    ? '⚡ Cargando'
                    : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
      {batteryInfo && !batteryInfo.isAvailable && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiBattery className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Estado de la Batería</h2>
          </div>
          <p className="text-slate-400">La información de batería no está disponible en este sistema</p>
        </div>
      )}

      {/* Temperature Info Section */}
      {temperatureInfo && temperatureInfo.isAvailable && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <FiThermometer className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Temperatura de Sensores</h2>
            <div className="ml-auto flex gap-4 text-sm">
              <div className="bg-slate-700/30 rounded px-3 py-2">
                <p className="text-xs text-slate-500 uppercase">Promedio</p>
                <p className="text-lg font-bold text-white">{temperatureInfo.averageTemp}°C</p>
              </div>
              <div className="bg-slate-700/30 rounded px-3 py-2">
                <p className="text-xs text-slate-500 uppercase">Máximo</p>
                <p className="text-lg font-bold text-red-400">{temperatureInfo.maxTemp}°C</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Sensors */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiCpu className="w-4 h-4 text-blue-400" />
                CPU
              </h3>
              <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-800/50 border-b border-slate-700/30">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-400 font-semibold">Sensor</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-semibold">Temp</th>
                      <th className="px-3 py-2 text-center text-slate-400 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {temperatureInfo.sensors
                      .filter((s) => s.type === 'CPU')
                      .map((sensor, index) => (
                        <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 py-2 text-slate-300 font-mono text-xs">
                            {sensor.name}
                          </td>
                          <td className={`px-3 py-2 text-right font-bold ${sensor.status === 'critical' ? 'text-red-400' :
                            sensor.status === 'warning' ? 'text-orange-400' :
                              sensor.status === 'moderate' ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            {sensor.temperature.toFixed(1)}°C
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${sensor.status === 'critical' ? 'bg-red-500/20 text-red-300' :
                              sensor.status === 'warning' ? 'bg-orange-500/20 text-orange-300' :
                                sensor.status === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                              }`}>
                              {sensor.status === 'critical' ? '🔴' :
                                sensor.status === 'warning' ? '🟠' :
                                  sensor.status === 'moderate' ? '🟡' :
                                    '🟢'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GPU Sensors */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiZap className="w-4 h-4 text-purple-400" />
                GPU
              </h3>
              <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-800/50 border-b border-slate-700/30">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-400 font-semibold">Sensor</th>
                      <th className="px-3 py-2 text-right text-slate-400 font-semibold">Temp</th>
                      <th className="px-3 py-2 text-center text-slate-400 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {temperatureInfo.sensors
                      .filter((s) => s.type === 'GPU')
                      .map((sensor, index) => (
                        <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 py-2 text-slate-300 font-mono text-xs">
                            {sensor.name}
                          </td>
                          <td className={`px-3 py-2 text-right font-bold ${sensor.status === 'critical' ? 'text-red-400' :
                            sensor.status === 'warning' ? 'text-orange-400' :
                              sensor.status === 'moderate' ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            {sensor.temperature.toFixed(1)}°C
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${sensor.status === 'critical' ? 'bg-red-500/20 text-red-300' :
                              sensor.status === 'warning' ? 'bg-orange-500/20 text-orange-300' :
                                sensor.status === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                              }`}>
                              {sensor.status === 'critical' ? '🔴' :
                                sensor.status === 'warning' ? '🟠' :
                                  sensor.status === 'moderate' ? '🟡' :
                                    '🟢'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {temperatureInfo && !temperatureInfo.isAvailable && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiThermometer className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Temperatura de Sensores</h2>
          </div>
          <p className="text-slate-400">La información de temperatura no está disponible en este sistema</p>
        </div>
      )}

      {deviceInfo && !deviceInfo.isTermux && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Información del Dispositivo</h2>
          </div>
          <p className="text-slate-400">No se está ejecutando en un entorno Termux</p>
        </div>
      )}

      <CPUInfoCard data={data} />
    </div>
  );
}
