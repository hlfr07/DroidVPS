import { useState, useEffect, FormEvent } from 'react';
import { FiLogOut, FiMonitor, FiTerminal, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';
import { SystemResources } from './SystemResources';
import { ProcessList } from './ProcessList';
import { Terminal } from './Terminal';
import { useWebSocket } from '../hooks/useWebSocket';

interface DashboardProps {
  serverUrl: string;
  token: string;
  username: string;
  onLogout: () => void;
}

type View = 'overview' | 'processes' | 'terminal' | 'proot';

export function Dashboard({ serverUrl, token, username, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [distroName, setDistroName] = useState('');
  const [distroPort, setDistroPort] = useState('8022');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const wsUrl = serverUrl.replace(/^http/, 'ws');

  const {
    systemData,
    deviceInfo,
    batteryInfo,
    temperatureInfo,
    isConnected,
    terminalReady,
    createTerminal,
    sendTerminalInput,
    onTerminalData,
    getDeviceInfo,
    getBatteryInfo,
    getTemperatureInfo
  } = useWebSocket(wsUrl, token);

  useEffect(() => {
    // Llamar inmediatamente cuando el componente se monta
    if (isConnected) {
      getDeviceInfo();
      getBatteryInfo();
      getTemperatureInfo();

      // Actualizar cada 30 segundos
      const deviceBatteryInterval = setInterval(() => {
        getDeviceInfo();
        getBatteryInfo();
        getTemperatureInfo();
      }, 30000);

      return () => clearInterval(deviceBatteryInterval);
    }
  }, [isConnected, getDeviceInfo, getBatteryInfo, getTemperatureInfo]);

  const navItems = [
    { id: 'overview' as View, label: 'Resumen', icon: FiMonitor },
    { id: 'processes' as View, label: 'Procesos y Puertos', icon: FiTerminal },
    { id: 'terminal' as View, label: 'Terminal', icon: FiTerminal },
    { id: 'proot' as View, label: 'Crear instancia', icon: FiPlusCircle },
  ];

  const handleCreateInstance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!distroName.trim() || !distroPort.trim()) {
      setCreateError('Completa nombre y puerto');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${serverUrl}/api/proot/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: distroName.trim(),
          port: Number(distroPort)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo crear la instancia');
      }

      setCreateSuccess(`Instancia creada: ${data?.name || distroName} en puerto ${data?.port || distroPort}`);
      setDistroName('');
      setDistroPort('8022');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error inesperado al crear la instancia';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Panel de Control UserLAnd</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Conectado como {username}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs sm:text-sm text-slate-400">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 text-sm"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          <nav className="mt-4 sm:mt-6 flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  currentView === item.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-300 font-medium">Conexión Perdida</p>
              <p className="text-xs text-yellow-400 mt-1">
                Intentando reconectarse al servidor...
              </p>
            </div>
          </div>
        )}

        {currentView === 'overview' && <SystemResources data={systemData} deviceInfo={deviceInfo} batteryInfo={batteryInfo} temperatureInfo={temperatureInfo} />}
        {currentView === 'processes' && <ProcessList data={systemData} />}
        {currentView === 'terminal' && (
          <Terminal
            onData={onTerminalData}
            sendInput={sendTerminalInput}
            createTerminal={createTerminal}
            isReady={terminalReady}
            isConnected={isConnected}
          />
        )}
        {currentView === 'proot' && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Crear nueva instancia proot</h2>
              <p className="text-sm text-slate-400 mt-1">Define un nombre y puerto para lanzar la distro.</p>
            </div>

            <form onSubmit={handleCreateInstance} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">Nombre de la instancia</label>
                <input
                  value={distroName}
                  onChange={(e) => setDistroName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ej: ubuntu-proot"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">Puerto</label>
                <input
                  value={distroPort}
                  onChange={(e) => setDistroPort(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="8022"
                  inputMode="numeric"
                />
              </div>

              <div className="flex gap-2 md:justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creando...' : 'Crear instancia'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDistroName('');
                    setDistroPort('8022');
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  className="flex-1 md:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-md transition"
                >
                  Limpiar
                </button>
              </div>
            </form>

            {createSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm">
                <span className="font-semibold">Éxito:</span> {createSuccess}
              </div>
            )}

            {createError && (
              <div className="flex items-start gap-2 p-3 rounded-md border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                <span className="font-semibold">Error:</span> {createError}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
