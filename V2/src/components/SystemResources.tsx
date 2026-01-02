import { FiActivity, FiCpu, FiServer, FiTrendingUp, FiZap, FiSmartphone, FiBattery } from 'react-icons/fi';
import { SystemData, DeviceInfo, BatteryInfo } from '../types/system';
import { CPUInfoCard } from './charts/CPUInfoCard';
import { DiskChart } from './charts/DiskChart';
import { ResourceChart } from './charts/ResourceChart';

interface SystemResourcesProps {
  data: SystemData | null;
  deviceInfo?: DeviceInfo | null;
  batteryInfo?: BatteryInfo | null;
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

export function SystemResources({ data, deviceInfo, batteryInfo }: SystemResourcesProps) {
  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <FiServer className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">System Overview</h2>
        </div>

        {/* Distribución y Kernel */}
        {data.distro && (
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Distribution</p>
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
          <StatMetric icon={FiServer} label="Hostname" value={data.info?.hostname || 'N/A'} color="cyan" />
          <StatMetric icon={FiCpu} label="Cores" value={data.info?.cpus || 0} color="blue" />
          <StatMetric icon={FiActivity} label="Uptime" value={data.info?.uptime ? formatUptime(data.info.uptime) : 'N/A'} color="green" />
          <StatMetric icon={FiTrendingUp} label="Load 1m" value={data.load?.load1 || '0.00'} color="blue" />
          <StatMetric icon={FiZap} label="Load 5m" value={data.load?.load5 || '0.00'} color="blue" />
        </div>
      </div>

      {/* Device Info Section */}
      {deviceInfo?.isTermux && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Device Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Manufacturer</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.manufacturer}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Model</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.model}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Android Version</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.androidVersion}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">CPU Architecture</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.cpuArchitecture}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Termux Version</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.termuxVersion}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Kernel</p>
              <p className="text-sm font-mono text-white truncate">{deviceInfo.kernelVersion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Battery Info Section */}
      {batteryInfo?.isAvailable && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FiBattery className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Battery Status</h2>
          </div>

          {/* Battery Percentage Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Battery Level</span>
              <span className={`text-2xl font-bold ${
                batteryInfo.percentage > 50 ? 'text-green-400' : 
                batteryInfo.percentage > 20 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {batteryInfo.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600/30">
              <div
                className={`h-full transition-all ${
                  batteryInfo.percentage > 50 ? 'bg-green-500' : 
                  batteryInfo.percentage > 20 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${batteryInfo.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Status</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.status === 'CHARGING' ? '🔌 Charging' :
                 batteryInfo.status === 'DISCHARGING' ? '🔋 Discharging' :
                 batteryInfo.status === 'FULL' ? '✅ Full' :
                 batteryInfo.status === 'NOT_CHARGING' ? '⏸️ Not Charging' :
                 batteryInfo.status}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Plugged</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.plugged === 'UNPLUGGED' ? '🔌 Unplugged' :
                 batteryInfo.plugged === 'PLUGGED_AC' ? '🔌 AC' :
                 batteryInfo.plugged === 'PLUGGED_USB' ? '🔌 USB' :
                 batteryInfo.plugged === 'PLUGGED_WIRELESS' ? '📱 Wireless' :
                 batteryInfo.plugged}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Health</p>
              <p className="text-lg font-semibold text-white">{batteryInfo.health}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Temperature</p>
              <p className={`text-lg font-semibold ${
                batteryInfo.temperature > 40 ? 'text-red-400' :
                batteryInfo.temperature > 35 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {batteryInfo.temperature.toFixed(1)}°C
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current</p>
              <p className="text-lg font-semibold text-white">
                {batteryInfo.current < 0 ? 
                  `${Math.abs(batteryInfo.current / 1000).toFixed(0)}mA ↓` : 
                  `${(batteryInfo.current / 1000).toFixed(0)}mA ↑`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ResourceChart
            data={data.cpuHistory || []}
            title="CPU Usage Over Time"
            color="#3b82f6"
          />
        </div>
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 sm:p-6 hover:border-blue-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FiCpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-300">Current CPU</h3>
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
            title="Memory Usage Over Time"
            color="#10b981"
          />
        </div>
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 sm:p-6 hover:border-green-500/30 transition-all h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FiActivity className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-slate-300">Current RAM</h3>
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
            title="Disk Usage Over Time"
            color="#f59e0b"
          />
        </div>
      </div>

      {data.swap?.total > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <FiActivity className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-300">Swap Memory</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Usage</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{data.swap.usagePercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Used</p>
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

      <CPUInfoCard data={data} />
    </div>
  );
}
