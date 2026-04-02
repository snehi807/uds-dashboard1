'use client'
import { Lightbulb, AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react'

const typeConfig = {
  warning:  { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', icon_color: 'text-amber-400', prefix: '⚠️' },
  negative: { icon: TrendingDown,  bg: 'bg-red-500/10',   border: 'border-red-500/30',   text: 'text-red-300',   icon_color: 'text-red-400',   prefix: '📉' },
  positive: { icon: TrendingUp,    bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-300',icon_color: 'text-emerald-400',prefix: '✅' },
  info:     { icon: Info,          bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  text: 'text-blue-300',  icon_color: 'text-blue-400',  prefix: 'ℹ️' },
}

export default function InsightsSection({ insights }) {
  if (!insights.length) return null

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-slate-200">Automated Insights</h3>
        <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{insights.length} insights</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map((ins, i) => {
          const cfg = typeConfig[ins.type] || typeConfig.info
          const Icon = cfg.icon
          return (
            <div
              key={i}
              className={`flex gap-3 rounded-lg border ${cfg.border} ${cfg.bg} p-3 animate-fade-in`}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <Icon className={`w-4 h-4 ${cfg.icon_color} flex-shrink-0 mt-0.5`} />
              <p className={`text-xs ${cfg.text} leading-relaxed`}>{ins.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
