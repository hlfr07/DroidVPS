export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="relative w-32 h-32">
        {/* Spinner exterior */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-700/30 border-t-blue-500 border-r-blue-500 animate-spin"></div>
        
        {/* Spinner intermedio */}
        <div className="absolute inset-2 rounded-full border-4 border-slate-700/20 border-b-cyan-500 border-l-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Spinner interior */}
        <div className="absolute inset-4 rounded-full border-4 border-slate-700/10 border-t-purple-500 border-r-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>

        {/* Centro con icono */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
              <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Texto */}
      <div className="absolute bottom-20 text-center">
        <p className="text-xl font-bold text-white mb-2">Cargando Dashboard</p>
        <div className="flex gap-1 justify-center">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-slate-700/50 rounded-lg w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700/50 rounded w-full"></div>
          <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
          <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}
