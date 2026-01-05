import { useState } from 'react';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function Login({ onLogin, isLoading, error }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
              <FiUser className="w-8 h-8 text-white" /> */}
            {/* <!-- Icono SVG --> */}
            <div className="flex flex-col items-center mb-4">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 w-28 h-28">
                <defs>
                  <linearGradient id="droidGradient" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#3DDC84" /> {/* Android Green */}
                    <stop offset="100%" stop-color="#258f56" />
                  </linearGradient>
                  <linearGradient id="serverGradient" x1="50" y1="80" x2="150" y2="150">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                  </linearGradient>
                </defs>

                {/* <!-- Antenas (Conexión) --> */}
                <path d="M65 45 L50 25" stroke="#3DDC84" stroke-width="8" stroke-linecap="round" />
                <path d="M135 45 L150 25" stroke="#3DDC84" stroke-width="8" stroke-linecap="round" />

                {/* <!-- Cabeza Droide (Mitad superior) --> */}
                <path d="M40 90 C40 45 160 45 160 90 Z" fill="url(#droidGradient)" />

                {/* <!-- Cuerpo/Servidor (Mitad inferior rectangular) --> */}
                <rect x="40" y="95" width="120" height="80" rx="10" fill="url(#serverGradient)" stroke="#3DDC84" stroke-width="2" />

                {/* <!-- Racks del servidor (Líneas horizontales) --> */}
                <line x1="55" y1="115" x2="145" y2="115" stroke="#334155" stroke-width="2" />
                <line x1="55" y1="135" x2="145" y2="135" stroke="#334155" stroke-width="2" />
                <line x1="55" y1="155" x2="145" y2="155" stroke="#334155" stroke-width="2" />

                {/* <!-- Luces de estado del servidor (Ojos/Leds) --> */}
                <circle cx="70" cy="70" r="5" fill="white" />
                <circle cx="130" cy="70" r="5" fill="white" />

                {/* <!-- Luces de actividad del rack --> */}
                <circle className="server-light" cx="135" cy="115" r="3" fill="#3DDC84" />
                <circle className="server-light" cx="135" cy="135" r="3" fill="#3DDC84" />
                <circle className="server-light" cx="135" cy="155" r="3" fill="#ef4444" /> {/* Luz roja de alerta/busy */}

              </svg>
              {/* Tipografía */}
              <div className="text-center">
                <h1 className="text-5xl tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="text-white font-bold">DROID</span><span className="text-[#3DDC84] font-black">VPS</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2 tracking-widest uppercase">Monitorea y controla tu entorno DroidVPS</p>
              </div>
            </div>
            {/* </div> */}
            {/* <h1 className="text-3xl font-bold text-white mb-2">Panel de Control DroidVPS</h1>
            <p className="text-slate-400">Monitorea y controla tu entorno DroidVPS</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre de Usuario
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Ingresa tu nombre de usuario"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Asegúrate de que el servidor esté corriendo en tu entorno DroidVPS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
