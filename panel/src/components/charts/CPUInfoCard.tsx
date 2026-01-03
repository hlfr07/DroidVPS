import { FiCpu, FiZap, FiClock, FiActivity } from 'react-icons/fi';
import { SystemData } from '../../types/system';

interface CPUInfoCardProps {
  data: SystemData | null;
}

export function CPUInfoCard({ data }: CPUInfoCardProps) {
  if (!data || !data.cpuDetails) return null;

  const details = data.cpuDetails;
  const info = data.info;

  const specs = [
    { label: 'Architecture', value: details.architecture, icon: FiCpu },
    { label: 'CPU Count', value: details.cpuCount, icon: FiZap },
    { label: 'Max Speed', value: details.cpuMaxMhz + ' MHz', icon: FiClock },
    { label: 'Min Speed', value: details.cpuMinMhz + ' MHz', icon: FiClock },
    { label: 'Cores/Socket', value: details.coresPerSocket, icon: FiCpu },
    { label: 'Threads/Core', value: details.threadsPerCore, icon: FiZap },
  ];

  return (
    <div className="space-y-4">
      {/* Main CPU Info */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/30 transition-all">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <FiCpu className="w-4 h-4" />
          CPU Information
        </h3>
        <div className="space-y-3">
          {details.vendorId !== 'N/A' && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <span className="text-slate-500 text-sm">Vendor</span>
              <span className="text-white font-medium">{details.vendorId}</span>
            </div>
          )}
          {details.modelName !== 'N/A' && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <span className="text-slate-500 text-sm">Model</span>
              <span className="text-white font-medium text-right truncate max-w-[200px]">{details.modelName}</span>
            </div>
          )}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <span className="text-slate-500 text-sm">Byte Order</span>
            <span className="text-white font-medium">{details.byteOrder}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">CPU Modes</span>
            <span className="text-white font-medium">{details.cpuOpModes}</span>
          </div>
        </div>
      </div>

      {/* CPU Specs Grid */}
      <div className="grid grid-cols-2 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start gap-3 mb-2">
                <Icon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-500">{spec.label}</span>
              </div>
              <p className="text-sm font-semibold text-white">{spec.value}</p>
            </div>
          );
        })}
      </div>

      {/* MHz Scaling Details - Nueva sección */}
      {details.mhzDetails && details.mhzDetails.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/30 transition-all">
          <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiZap className="w-4 h-4 text-purple-400" />
            CPU Frequency Scaling
          </h4>
          <div className="space-y-3">
            {details.mhzDetails.map((mhz, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-3 border-b border-slate-700/30 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <FiActivity className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{mhz.key}</span>
                </div>
                <span className="text-sm font-mono font-medium text-white bg-purple-500/10 px-3 py-1 rounded-md">
                  {mhz.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info Details */}
      {info && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">System Details</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Hostname</span>
              <span className="text-white font-medium">{info.hostname}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Platform</span>
              <span className="text-white font-medium">{info.platform}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Architecture</span>
              <span className="text-white font-medium">{info.arch}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CPUs</span>
              <span className="text-white font-medium">{info.cpus}</span>
            </div>
            {info.kernel && (
              <div className="col-span-2">
                <span className="text-slate-500 block">Kernel</span>
                <span className="text-white font-mono text-[10px] break-all">{info.kernel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CPU Flags */}
      {details.flags !== 'N/A' && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">CPU Flags</h4>
          <div className="flex flex-wrap gap-2">
            {details.flags.split(/\s+/).slice(0, 12).map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
              >
                {flag}
              </span>
            ))}
            {details.flags.split(/\s+/).length > 12 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-slate-500">
                +{details.flags.split(/\s+/).length - 12} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
