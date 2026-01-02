import { useState, useEffect } from 'react';
import { FiLogOut, FiMonitor, FiTerminal, FiAlertCircle } from 'react-icons/fi';
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

type View = 'overview' | 'processes' | 'terminal';

export function Dashboard({ serverUrl, token, username, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('overview');

  const wsUrl = serverUrl.replace(/^http/, 'ws');

  const {
    systemData,
    deviceInfo,
    isConnected,
    terminalReady,
    createTerminal,
    sendTerminalInput,
    onTerminalData,
    getDeviceInfo
  } = useWebSocket(wsUrl, token);

  useEffect(() => {
    getDeviceInfo();
  }, [getDeviceInfo]);

  const navItems = [
    { id: 'overview' as View, label: 'Overview', icon: FiMonitor },
    { id: 'processes' as View, label: 'Processes & Ports', icon: FiTerminal },
    { id: 'terminal' as View, label: 'Terminal', icon: FiTerminal },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">UserLAnd Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Connected as {username}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs sm:text-sm text-slate-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 text-sm"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
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
              <p className="text-sm text-yellow-300 font-medium">Connection Lost</p>
              <p className="text-xs text-yellow-400 mt-1">
                Attempting to reconnect to the server...
              </p>
            </div>
          </div>
        )}

        {currentView === 'overview' && <SystemResources data={systemData} deviceInfo={deviceInfo} />}
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
      </main>
    </div>
  );
}
