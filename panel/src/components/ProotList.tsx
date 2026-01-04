import { useEffect, useState } from 'react';
import { SkeletonCard } from './LoadingSpinner';

interface ProotEntry {
    nombreCompleto: string;
    nombre: string;
    puerto: string;
}

interface ProotListProps {
    serverUrl: string;
    token: string;
}

export default function ProotList({ serverUrl, token }: ProotListProps) {

    const [items, setItems] = useState<ProotEntry[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<ProotEntry | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [copied, setCopied] = useState<Record<string, boolean>>({});
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchList = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${serverUrl}/api/proot/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || `Error ${res.status}`);
            }

            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al obtener la lista');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (name: string) => {
        // Abrir modal de confirmación en lugar de usar confirm()
        setDeleteTarget(name);
        setDeleteModalOpen(true);
    };

    const performDelete = async (name?: string | null) => {
        if (!name) return;

        setActionMessage(null);
        setActionError(null);
        setDeleting((d) => ({ ...d, [name]: true }));
        setDeleteModalOpen(false);

        try {
            const res = await fetch(`${serverUrl}/api/proot/delete/${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || `Error ${res.status}`);
            }

            setActionMessage(`Instancia "${name}" eliminada correctamente.`);
            // refrescar lista
            await fetchList();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al eliminar';
            setActionError(msg);
        } finally {
            setDeleting((d) => ({ ...d, [name]: false }));
            setTimeout(() => {
                setActionMessage(null);
                setActionError(null);
            }, 3500);
            setDeleteTarget(null);
            setDeleteModalOpen(false);
        }
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Instancias proot existentes</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchList}
                        disabled={loading}
                        className={`px-3 py-1 ${loading ? 'bg-slate-600/60 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'} text-slate-200 rounded-md text-sm flex items-center gap-2`}
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                        Refrescar
                    </button>
                </div>
            </div>

            {actionMessage && (
                <div className="mb-3 p-3 rounded-md bg-emerald-600/10 border border-emerald-600/30 text-emerald-200 text-sm">{actionMessage}</div>
            )}

            {actionError && (
                <div className="mb-3 p-3 rounded-md bg-red-600/10 border border-red-600/30 text-red-200 text-sm">{actionError}</div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items && items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.nombreCompleto} className="p-3 bg-slate-900/40 border border-slate-700 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-300 font-semibold">{item.nombreCompleto}</p>
                                        <p className="text-xs text-slate-400">{item.nombre}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-slate-200 bg-slate-700/40 px-2 py-1 rounded-md">:{item.puerto}</div>
                                        <button
                                            onClick={() => { setModalItem(item); setModalOpen(true); }}
                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md"
                                        >
                                            Instrucciones
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.nombreCompleto)}
                                            disabled={!!deleting[item.nombreCompleto]}
                                            className={`px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded-md flex items-center gap-2 ${deleting[item.nombreCompleto] ? 'opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            {deleting[item.nombreCompleto] ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                                {/* modal is handled globally below */}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 col-span-full">No se encontraron instancias.</p>
                    )}
                </div>
            )}
            {modalOpen && (
                <InstructionsModal
                    item={modalItem}
                    onClose={() => { setModalOpen(false); setModalItem(null); }}
                    onCopy={copyText}
                    copied={copied}
                />
            )}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} />
                    <div className="relative bg-slate-900/95 border border-slate-700 rounded-lg p-4 w-full max-w-md mx-4">
                        <h4 className="text-lg font-semibold text-white mb-2">¿Eliminar instancia?</h4>
                        <p className="text-sm text-slate-300 mb-4">Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar <span className="font-semibold">{deleteTarget}</span>?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => performDelete(deleteTarget)}
                                disabled={!!(deleteTarget && deleting[deleteTarget])}
                                className={`px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm flex items-center gap-2 ${deleteTarget && deleting[deleteTarget] ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {deleteTarget && deleting[deleteTarget] ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function copyText(key: string, txt: string) {
        console.log('Copying text:', txt);
        if (!navigator?.clipboard) return;
        navigator.clipboard.writeText(txt).then(() => {
            setCopied((s) => ({ ...s, [key]: true }));
            setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1800);
        }).catch(() => {
            // ignore
        });
    }
}

function CommandRow({ label, cmd, onCopy, copied, id }: { label: string; cmd: string; onCopy: (k: string, t: string) => void; copied?: boolean; id: string }) {
    return (
        <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
                <p className="text-xs text-slate-300 font-medium">{label}</p>
                <div className="relative mt-1">
                    <div className="bg-black text-green-300 text-xs p-3 rounded-md font-mono overflow-x-auto border border-green-800/30">{cmd}</div>
                    <button
                        onClick={() => onCopy(id, cmd)}
                        aria-label="Copiar comando"
                        className="absolute top-1 right-1 p-1 text-slate-600 hover:text-slate-400 rounded-md text-xs"
                    >
                        {copied ? (
                            <span className="text-xs">✓</span>
                        ) : (

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal component (rendered inside the file to keep changes local)
function InstructionsModal({ item, onClose, onCopy, copied }: { item: ProotEntry | null; onClose: () => void; onCopy: (k: string, t: string) => void; copied: Record<string, boolean> }) {
    const VITE_TERMINAL = (import.meta as any).env?.VITE_TERMINAL || `http://${window.location.hostname}:7681`;

    if (!item) return null;

    const combined = `screen -x ${item.nombreCompleto} || screen -S ${item.nombreCompleto} proot-distro login ${item.nombreCompleto}`;
    const cloneCmd = `git clone <tu_repo> && cd <tu_repo> # usa puerto ${item.puerto} si aplica`;

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto py-6">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative max-w-full sm:max-w-4xl lg:max-w-6xl w-full mx-3 sm:mx-6 bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-slate-700 rounded-lg p-3 sm:p-4 shadow-xl transform transition-all duration-200 scale-100 my-6 max-h-[calc(100vh-4rem)] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-base font-semibold text-white">Guía rápida — {item.nombreCompleto}</h4>
                        <p className="text-xs text-slate-400">Comandos listos para copiar y pegar en tu terminal</p>
                    </div>
                    <button onClick={onClose} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm">Cerrar</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    <div className="space-y-4 pr-2 overflow-y-auto max-h-[40vh] sm:max-h-[40vh] lg:max-h-[70vh] lg:col-span-1">
                        <div>
                            <CommandRow id={`${item.nombreCompleto}-combined`} label="Entrar / crear sesión y login" cmd={combined} onCopy={onCopy} copied={copied[`${item.nombreCompleto}-combined`]} />
                        </div>

                        <div>
                            <div className="mb-1 text-xs text-slate-400">Dentro deberías ver:</div>
                            <div className="bg-black text-green-200 p-2 rounded-md font-mono text-sm">root@localhost:~#</div>
                        </div>

                        <div>
                            <CommandRow id={`${item.nombreCompleto}-clone`} label="Clonar tu proyecto (ejemplo)" cmd={cloneCmd} onCopy={onCopy} copied={copied[`${item.nombreCompleto}-clone`]} />
                        </div>

                        <div>
                            <div className="text-sm font-medium text-slate-200 mb-2">Manejo de sesiones screen</div>
                            <div className="space-y-2">
                                <CommandRow id={`${item.nombreCompleto}-detach`} label="Desconectar (detach) — salir de la pantalla sin cerrar lo que corre dentro" cmd={'Ctrl + a, d'} onCopy={onCopy} copied={copied[`${item.nombreCompleto}-detach`]} />
                                <p className="text-xs text-slate-400">Descripción: presiona <span className="font-semibold">Ctrl + a</span> seguido de <span className="font-semibold">d</span> para 'detachear' la sesión. La sesión queda en segundo plano y tus procesos siguen corriendo.</p>

                                <CommandRow id={`${item.nombreCompleto}-resume`} label="Reanudar pantalla" cmd={`screen -r ${item.nombreCompleto}`} onCopy={onCopy} copied={copied[`${item.nombreCompleto}-resume`]} />
                                <p className="text-xs text-slate-400">Descripción: vuelve a adjuntar la sesión y recuperas la consola donde quedaron los procesos.</p>

                                <CommandRow id={`${item.nombreCompleto}-kill`} label="Matar la sesión (cerrar)" cmd={`screen -r ${item.nombreCompleto} -X quit`} onCopy={onCopy} copied={copied[`${item.nombreCompleto}-kill`]} />
                                <p className="text-xs text-slate-400">Descripción: fuerza el cierre de la sesión screen. Úsalo si quieres terminar todo lo que corre dentro.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pl-0 lg:pl-2 lg:col-span-2 flex items-stretch">
                        <div className="w-full h-[30vh] sm:h-[40vh] lg:h-[76vh] bg-slate-900/30 rounded-md border border-slate-700 overflow-auto">
                            <iframe
                                src={VITE_TERMINAL}
                                className="w-full h-full border-none"
                                title="Terminal Pro Report"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
