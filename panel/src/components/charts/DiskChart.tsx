import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DiskChartProps {
  used: string;
  available: string;
  usagePercent: number;
}

export function DiskChart({ used, available, usagePercent }: DiskChartProps) {
  const data = [
    { name: `Used (${used})`, value: usagePercent },
    { name: `Available (${available})`, value: 100 - usagePercent }
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Disk Usage</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
