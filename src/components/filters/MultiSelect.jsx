'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'

export default function MultiSelect({ label, options = [], value = [], onChange, placeholder = 'All' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = opt => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]
    onChange(next)
  }

  const clear = e => { e.stopPropagation(); onChange([]) }

  const displayText = value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} selected`

  return (
    <div ref={ref} className="relative">
      <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">{label}</div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:bg-slate-700/80 transition-all min-w-[140px]"
      >
        <span className={`truncate ${value.length === 0 ? 'text-slate-500' : ''}`}>{displayText}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value.length > 0 && (
            <X onClick={clear} className="w-3 h-3 text-slate-400 hover:text-white" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-lg border border-slate-600 bg-slate-800 shadow-xl shadow-black/50 overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-500">No options</div>
            )}
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
              >
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  value.includes(opt)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-500'
                }`}>
                  {value.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="truncate">{opt}</span>
              </button>
            ))}
          </div>
          {value.length > 0 && (
            <div className="border-t border-slate-700 p-2">
              <button onClick={clear} className="text-xs text-blue-400 hover:text-blue-300 w-full text-center">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
