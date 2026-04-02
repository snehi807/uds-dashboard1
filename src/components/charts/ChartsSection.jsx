'use client'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ComposedChart, Area
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

const ChartCard = ({ title, children }) => (
  <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm p-4">
    <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
    {children}
  </div>
)

const customTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
}

export default function ChartsSection({ charts, onHubClick, onClientClick }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

      {/* Ticket Status Pie */}
      <ChartCard title="Ticket Status Distribution">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={charts.ticketStatus}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={45}
              paddingAngle={3}
            >
              {charts.ticketStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              iconSize={8}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Hub Failure Rate Bar */}
      <ChartCard title="Hub-wise Failure Rate (%) — click to filter">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts.hubFailure} onClick={d => d?.activePayload && onHubClick?.(d.activePayload[0]?.payload?.hub)} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="hub" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
            <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v}%`, 'Failure Rate']} cursor={{ fill: '#334155' }} />
            <Bar dataKey="failureRate" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Client Performance */}
      <ChartCard title="Client-wise Performance — click to filter">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts.clientPerf} onClick={d => d?.activePayload && onClientClick?.(d.activePayload[0]?.payload?.client)} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="client" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v}%`]} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconSize={8} />
            <Bar dataKey="deliveryRate" name="Delivery %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="failureRate"  name="Failure %"  fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Call Attempts vs Delivery */}
      <ChartCard title="Call Attempts vs Delivery Success Rate">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={charts.callVsDelivery} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="calls" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Call Attempts', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="rate" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <YAxis yAxisId="count" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={customTooltipStyle} formatter={(v, name) => name === 'Count' ? [v, name] : [`${v}%`, name]} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconSize={8} />
            <Area yAxisId="rate" type="monotone" dataKey="deliveryRate" name="Delivery %" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            <Bar yAxisId="count" dataKey="count" name="Count" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={30} opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ticket Reason Breakdown */}
      <ChartCard title="Ticket Reason Breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts.ticketReason} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="reason" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
            <Tooltip contentStyle={customTooltipStyle} labelFormatter={(l, p) => p?.[0]?.payload?.fullReason || l} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {charts.ticketReason.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}
