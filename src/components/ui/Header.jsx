'use client'
import { Activity, RefreshCw, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header({ onRefresh, loading }) {
  const [dark, setDark] = useState(true)
  const [now, setNow] = useState('')

  useEffect(() => {
    setNow(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))
    const id = setInterval(() => setNow(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md px-6 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">UDS Dashboard</h1>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">LIVE</span>
            </div>
            <p className="text-xs text-slate-500">Undelivered Shipment Analytics · Shadowfax</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">{now}</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block">Refresh</span>
          </button>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-all"
            title="Toggle theme"
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
