import { Package, Ticket, RefreshCw, TrendingUp, TrendingDown, Phone, PhoneCall } from 'lucide-react'

const cards = [
  { key: 'total',        label: 'Total Orders',     icon: Package,     color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400', suffix: '' },
  { key: 'tickets',      label: 'Total Tickets',    icon: Ticket,      color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/30', text: 'text-violet-400', suffix: '' },
  { key: 'repeatPct',    label: 'Repeat Tickets',   icon: RefreshCw,   color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400', suffix: '%' },
  { key: 'deliveryRate', label: 'Delivery Rate',    icon: TrendingUp,  color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400', suffix: '%' },
  { key: 'failureRate',  label: 'Failure Rate',     icon: TrendingDown,color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400', suffix: '%' },
  { key: 'avgCalls',     label: 'Avg Call Attempts',icon: Phone,       color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', text: 'text-cyan-400', suffix: '' },
  { key: 'avgAnswerRate',label: 'Avg Answer Rate',  icon: PhoneCall,   color: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/30', text: 'text-teal-400', suffix: '%' },
]

export default function KPICards({ kpis }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {cards.map(({ key, label, icon: Icon, color, border, text, suffix }, i) => (
        <div
          key={key}
          className={`relative overflow-hidden rounded-xl border ${border} bg-gradient-to-br ${color} p-4 backdrop-blur-sm animate-slide-up`}
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
        >
          {/* Glow dot */}
          <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${text.replace('text', 'bg')} opacity-70 animate-pulse-slow`} />
          <Icon className={`w-4 h-4 ${text} mb-2 opacity-80`} />
          <div className={`text-2xl font-bold tracking-tight ${text}`}>
            {kpis[key] !== undefined ? `${kpis[key]}${suffix}` : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1 leading-tight">{label}</div>
        </div>
      ))}
    </div>
  )
}
