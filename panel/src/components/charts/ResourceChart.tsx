import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartPoint } from '../../types/system';

interface ResourceChartProps {
  data: ChartPoint[];
  title: string;
  color: string;
  yAxisLabel?: string;
}

export function ResourceChart({ data, title, color, yAxisLabel = '%' }: ResourceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 h-80 flex items-center justify-center">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            interval={Math.floor(data.length / 5) || 0}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value: number) => `${value.toFixed(1)}${yAxisLabel}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
