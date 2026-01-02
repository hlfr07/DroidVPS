import { useEffect, useRef, useState } from 'react';
import { FiTerminal, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

interface TerminalProps {
  onData: (handler: (data: string) => void) => void;
  sendInput: (data: string) => void;
  createTerminal: (cols: number, rows: number) => void;
  resizeTerminal: (cols: number, rows: number) => void;
  isReady: boolean;
  isConnected: boolean;
}

export function Terminal({
  onData,
  sendInput,
  createTerminal,
  resizeTerminal,
  isReady,
  isConnected
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected && !isReady) {
      createTerminal(80, 24);
    }
  }, [isConnected, isReady, createTerminal]);

  useEffect(() => {
    onData((data: string) => {
      // Limpiar códigos ANSI y escape sequences
      const cleanData = data
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '') // Eliminar códigos ANSI de color
        .replace(/\x1b\][0-9];[^\x07]*\x07/g, '') // Eliminar OSC sequences
        .replace(/\]0;[^\n]*[\n\r]/g, '') // Eliminar título de ventana
        .replace(/\[0[0-9]m/g, '') // Eliminar códigos de formato
        .replace(/\[0[0-9];[0-9][0-9]m/g, '') // Eliminar códigos de color combinados
        .replace(/bash: initialize_job_control:[^\n]*\n/g, '') // Eliminar mensajes de error de job control
        .trim();
      
      if (cleanData) {
        setOutput(prev => [...prev, cleanData]);
      }
    });
  }, [onData]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isReady) {
      sendInput(input + '\n');
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      sendInput(`\x1b[${e.key === 'ArrowUp' ? 'A' : 'B'}`);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      sendInput('\t');
    }
  };

  return (
    <div className={`bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-2 sm:inset-4 z-50' : 'h-[400px] sm:h-[500px] lg:h-[600px]'}`}>
      <div className="p-3 sm:p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <FiTerminal className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Terminal</h2>
          {isReady && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-4 h-4 text-slate-400" />
            ) : (
              <FiMaximize2 className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
              title="Close"
            >
              <FiX className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto bg-slate-950 p-4 font-mono text-sm text-green-400"
      >
        {!isReady && (
          <div className="text-slate-500 text-center py-8">
            {isConnected ? 'Initializing terminal...' : 'Connecting to server...'}
          </div>
        )}

        {output.map((line, index) => (
          <div
            key={index}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\n/g, '<br/>')
                .replace(/ /g, '&nbsp;')
            }}
          />
        ))}
        <div ref={outputEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isReady}
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            placeholder={isReady ? "Enter command..." : "Waiting for terminal..."}
            autoComplete="off"
          />
        </div>
      </form>
    </div>
  );
}
