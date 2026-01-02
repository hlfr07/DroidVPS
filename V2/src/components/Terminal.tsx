import { useEffect, useRef, useState } from 'react';
import { FiTerminal, FiX, FiMaximize2, FiMinimize2, FiHelpCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface TerminalLine {
  type: 'command' | 'output';
  content: string;
  timestamp?: number;
}

interface TerminalProps {
  onData: (handler: (data: string) => void) => void;
  sendInput: (data: string) => void;
  createTerminal: (cols: number, rows: number) => void;
  isReady: boolean;
  isConnected: boolean;
}

export function Terminal({
  onData,
  sendInput,
  createTerminal,
  isReady,
  isConnected
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPath, setCurrentPath] = useState('~');
  const [currentOutput, setCurrentOutput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [terminalMode, setTerminalMode] = useState<'basic' | 'pro'>('basic');
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected && !isReady) {
      createTerminal(80, 24);
    }
  }, [isConnected, isReady, createTerminal]);

  // Limpiar códigos ANSI
  const cleanAnsiCodes = (data: string): string => {
    return data
      .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '') // Eliminar códigos ANSI
      .replace(/\x1b\][0-9];[^\x07]*\x07/g, '') // Eliminar OSC sequences
      .replace(/\]0;[^\n]*[\n\r]/g, '') // Eliminar título de ventana
      .replace(/\[0[0-9]m/g, '') // Eliminar códigos de formato
      .replace(/bash: initialize_job_control:[^\n]*\n/g, ''); // Eliminar mensajes de job control
  };

  // Detectar cambios de directorio
  const updatePathFromCommand = (cmd: string) => {
    const cdMatch = cmd.trim().match(/^cd\s+(.+)$/);
    if (cdMatch) {
      const targetPath = cdMatch[1].trim();
      if (targetPath === '/') {
        setCurrentPath('/');
      } else if (targetPath === '~' || targetPath === '') {
        setCurrentPath('~');
      } else if (targetPath.startsWith('/')) {
        setCurrentPath(targetPath);
      } else if (targetPath === '..') {
        setCurrentPath(prev => {
          if (prev === '/') return '/';
          const parts = prev.split('/').filter(p => p);
          parts.pop();
          return '/' + parts.join('/');
        });
      } else {
        setCurrentPath(prev =>
          prev === '/' ? '/' + targetPath : prev + '/' + targetPath
        );
      }
    }
  };

  const outputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onData((data: string) => {
      const cleanData = cleanAnsiCodes(data);

      if (cleanData && cleanData.trim()) {
        // Cancelar timeout anterior si existe
        if (outputTimeoutRef.current) {
          clearTimeout(outputTimeoutRef.current);
        }

        // Agregar datos al output actual
        setCurrentOutput(prev => prev + cleanData);

        // Configurar nuevo timeout para consolidar el output
        outputTimeoutRef.current = setTimeout(() => {
          setCurrentOutput(current => {
            if (current.trim()) {
              setHistory(prev => [...prev, {
                type: 'output',
                content: current.trim(),
                timestamp: Date.now()
              }]);
            }
            return '';
          });
        }, 300); // Esperar 300ms de inactividad para consolidar
      }
    });
  }, [onData]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentOutput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isReady) {
      const command = input.trim();

      // Si hay output pendiente, agregarlo al historial
      if (currentOutput.trim()) {
        setHistory(prev => [...prev, {
          type: 'output',
          content: currentOutput.trim(),
          timestamp: Date.now()
        }]);
      }

      // Cancelar timeout si existe
      if (outputTimeoutRef.current) {
        clearTimeout(outputTimeoutRef.current);
      }

      // Agregar comando al historial
      setHistory(prev => [...prev, {
        type: 'command',
        content: `${currentPath}# ${command}`,
        timestamp: Date.now()
      }]);

      // Actualizar path si es un cd
      updatePathFromCommand(command);

      // Limpiar output actual
      setCurrentOutput('');

      // Enviar comando
      sendInput(command + '\n');
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navegación con flechas
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      sendInput(`\x1b[${e.key === 'ArrowUp' ? 'A' : 'B'}`);
      return;
    }
    
    // Tab para autocompletar
    if (e.key === 'Tab') {
      e.preventDefault();
      sendInput('\t');
      return;
    }

    // Controles especiales
    if (e.ctrlKey) {
      e.preventDefault();
      const ctrlMap: Record<string, string> = {
        'a': '\x01', // Ctrl+A (para screen)
        'c': '\x03', // Ctrl+C
        'd': '\x04', // Ctrl+D
        'z': '\x1a', // Ctrl+Z
        'l': '\x0c', // Ctrl+L (limpiar pantalla)
        'u': '\x15', // Ctrl+U (limpiar línea)
        'k': '\x0b', // Ctrl+K (eliminar hasta final de línea)
      };
      
      const char = e.key.toLowerCase();
      if (ctrlMap[char]) {
        sendInput(ctrlMap[char]);
      }
      return;
    }

    // Alt para accesos rápidos en aplicaciones
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const char = e.key.toLowerCase();
      sendInput(`\x1b${char}`); // ESC + carácter para Alt
      return;
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
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className={`text-xs font-medium ${terminalMode === 'basic' ? 'text-green-400' : 'text-slate-400'}`}>
              Basic
            </span>
            <button
              onClick={() => setTerminalMode(terminalMode === 'basic' ? 'pro' : 'basic')}
              className="p-0.5 hover:bg-slate-700/50 rounded transition-colors"
              title="Toggle mode"
            >
              {terminalMode === 'basic' ? (
                <FiToggleLeft className="w-5 h-5 text-slate-400" />
              ) : (
                <FiToggleRight className="w-5 h-5 text-blue-400" />
              )}
            </button>
            <span className={`text-xs font-medium ${terminalMode === 'pro' ? 'text-blue-400' : 'text-slate-400'}`}>
              Pro
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
            title="Keyboard shortcuts"
          >
            <FiHelpCircle className="w-4 h-4 text-slate-400" />
          </button>
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
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto bg-slate-950 p-4 font-mono text-sm text-green-400 whitespace-pre-wrap break-words relative"
      >
        {/* Modo Pro: Iframe con informe */}
        {terminalMode === 'pro' ? (
          <div className="w-full h-full">
            <iframe
              src="https://my_terminal.humanibot.online"
              className="w-full h-full border-none rounded-lg"
              title="Terminal Pro Report"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        ) : (
          <>
            {/* Modo Básico */}
            {/* Panel de ayuda */}
            {showHelp && (
              <div className="absolute inset-4 bg-slate-900/95 border border-slate-700 rounded-lg p-4 backdrop-blur-sm z-10 overflow-y-auto max-h-[calc(100%-2rem)]">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900/95 pb-2">
                  <h3 className="text-white font-semibold text-base">Keyboard Shortcuts</h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="font-semibold text-green-400">Screen/Tmux Shortcuts</div>
                    <div className="mt-1">
                      <span className="text-slate-400">Ctrl+A</span> → prefix para screen
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-blue-500 pl-3">
                    <div className="font-semibold text-blue-400">Terminal Control</div>
                    <div className="mt-1 space-y-1">
                      <div><span className="text-slate-400">Ctrl+C</span> → interrupt</div>
                      <div><span className="text-slate-400">Ctrl+D</span> → EOF (salir)</div>
                      <div><span className="text-slate-400">Ctrl+Z</span> → suspend</div>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-yellow-500 pl-3">
                    <div className="font-semibold text-yellow-400">Line Editing</div>
                    <div className="mt-1 space-y-1">
                      <div><span className="text-slate-400">Ctrl+L</span> → clear screen</div>
                      <div><span className="text-slate-400">Ctrl+U</span> → clear line</div>
                      <div><span className="text-slate-400">Ctrl+K</span> → delete to end</div>
                    </div>
                  </div>

                  <div className="border-l-2 border-purple-500 pl-3">
                    <div className="font-semibold text-purple-400">Examples</div>
                    <div className="mt-1 space-y-1 text-slate-400">
                      <div>screen -r myapi</div>
                      <div className="text-slate-500">→ reconnect to session</div>
                      <div className="mt-2">Ctrl+A, then D</div>
                      <div className="text-slate-500">→ detach from session</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isReady && (
              <div className="text-slate-500 text-center py-8">
                {isConnected ? 'Initializing terminal...' : 'Connecting to server...'}
              </div>
            )}

            {/* Renderizar historial */}
            {history.map((line, index) => (
              <div key={index} className={line.type === 'command' ? 'mb-2' : 'mb-3 text-slate-300'}>
                {line.type === 'command' ? (
                  <div className="text-green-400">
                    <span>{line.content}</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-slate-400 leading-relaxed">
                    {line.content}
                  </div>
                )}
              </div>
            ))}

            {/* Mostrar output actual si hay */}
            {currentOutput && (
              <div className="text-slate-400 whitespace-pre-wrap leading-relaxed">
                {currentOutput}
              </div>
            )}

            <div ref={outputEndRef} />
          </>
        )}
      </div>

      {terminalMode === 'basic' && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono flex-shrink-0">
              {currentPath}#
            </span>
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
      )}
    </div>
  );
}
