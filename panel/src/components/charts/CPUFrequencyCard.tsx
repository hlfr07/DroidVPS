import { FiZap } from 'react-icons/fi';

interface MHzDetail {
    key: string;
    value: string;
}

interface CPUFrequencyCardProps {
    mhzDetails: MHzDetail[];
}

function CircularProgress({ percentage, label, color }: { percentage: number; label: string; color: string }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        blue: { stroke: 'stroke-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
        purple: { stroke: 'stroke-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
        cyan: { stroke: 'stroke-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        green: { stroke: 'stroke-green-500', text: 'text-green-400', bg: 'bg-green-500/10' },
    }[color] || { stroke: 'stroke-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' };

    return (
        <div className={`flex flex-col items-center p-4 rounded-lg ${colorClasses.bg} border border-slate-700/50`}>
            <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-700"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${colorClasses.stroke} transition-all duration-500 ease-in-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${colorClasses.text}`}>{percentage}%</span>
                </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 text-center">{label}</p>
        </div>
    );
}

export function CPUFrequencyCard({ mhzDetails }: CPUFrequencyCardProps) {
    if (!mhzDetails || mhzDetails.length === 0) {
        return null;
    }

    // Agrupar los datos por CPU
    const cpuGroups: Array<{
        scaling: number;
        maxMhz: string;
        minMhz: string;
    }> = [];

    for (let i = 0; i < mhzDetails.length; i++) {
        const detail = mhzDetails[i];

        if (detail.key === "CPU(s) scaling MHz") {
            const scaling = parseInt(detail.value);
            const maxMhz = mhzDetails[i + 1]?.value || 'N/A';
            const minMhz = mhzDetails[i + 2]?.value || 'N/A';

            cpuGroups.push({
                scaling,
                maxMhz,
                minMhz,
            });

            i += 2; // Saltar los siguientes dos elementos ya procesados
        }
    }

    const colors = ['blue', 'purple', 'cyan', 'green'];

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <FiZap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Frecuencia del CPU</h2>
                    <p className="text-sm text-slate-400">Estado actual de aceleración</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {cpuGroups.map((group, index) => (
                    <div key={index} className="space-y-3">
                        <CircularProgress
                            percentage={group.scaling}
                            label={`CPU ${index + 1}`}
                            color={colors[index % colors.length]}
                        />
                        <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Max:</span>
                                <span className="text-sm font-mono text-green-400">
                                    {parseFloat(group.maxMhz).toFixed(0)} MHz
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Min:</span>
                                <span className="text-sm font-mono text-blue-400">
                                    {parseFloat(group.minMhz).toFixed(0)} MHz
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
