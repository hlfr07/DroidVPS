import { FiList, FiWifi } from 'react-icons/fi';
import { SystemData } from '../types/system';

interface ProcessListProps {
  data: SystemData | null;
}

export function ProcessList({ data }: ProcessListProps) {
  if (!data) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <FiList className="w-5 h-5 text-slate-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Procesos Principales</h2>
            <span className="ml-auto text-xs sm:text-sm text-slate-500">{data.processes?.length || 0} procesos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">PID</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Usuario</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">CPU%</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">MEM%</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Comando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.processes?.slice(0, 15).map((process, index) => (
                <tr key={`${process.pid}-${index}`} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-2 sm:px-4 py-3 text-slate-300 font-mono text-xs sm:text-sm">{process.pid}</td>
                  <td className="px-2 sm:px-4 py-3 text-slate-300 text-xs sm:text-sm hidden sm:table-cell">{process.user}</td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    <span className={`font-semibold text-xs sm:text-sm ${parseFloat(process.cpu) > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                      {process.cpu}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    <span className={`font-semibold text-xs sm:text-sm ${parseFloat(process.mem) > 10 ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {process.mem}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-[120px] sm:max-w-md">
                    {process.command}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.ports && data.ports.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="p-3 sm:p-5 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <FiWifi className="w-5 h-5 text-slate-400" />
              <h2 className="text-base sm:text-lg font-semibold text-white">Puertos Abiertos</h2>
              <span className="ml-auto text-xs sm:text-sm text-slate-500">{data.ports?.length || 0} puertos</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Protocolo</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Puerto</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Dirección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.ports.map((port, index) => (
                  <tr key={`${port.port}-${index}`} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-2 sm:px-4 py-3 text-slate-300">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {port.protocol}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-slate-300 font-mono font-semibold text-xs sm:text-sm">{port.port}</td>
                    <td className="px-2 sm:px-4 py-3 text-slate-400 font-mono text-xs hidden sm:table-cell">{port.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
