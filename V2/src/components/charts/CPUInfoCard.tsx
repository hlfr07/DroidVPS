import { Cpu, Zap, Clock } from 'lucide-react';
import { SystemData } from '../../types/system';

interface CPUInfoCardProps {
  data: SystemData | null;
}

export function CPUInfoCard({ data }: CPUInfoCardProps) {
  if (!data || !data.cpuDetails) return null;

  const details = data.cpuDetails;

  const specs = [
    { label: 'Architecture', value: details.architecture, icon: Cpu },
    { label: 'CPU Count', value: details.cpuCount, icon: Zap },
    { label: 'Max Speed', value: details.cpuMaxMhz + ' MHz', icon: Clock },
    { label: 'Min Speed', value: details.cpuMinMhz + ' MHz', icon: Clock },
    { label: 'Cores/Socket', value: details.coresPerSocket, icon: Cpu },
    { label: 'Threads/Core', value: details.threadsPerCore, icon: Zap },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/30 transition-all">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">CPU Information</h3>
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
              <span className="text-white font-medium truncate">{details.modelName}</span>
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
