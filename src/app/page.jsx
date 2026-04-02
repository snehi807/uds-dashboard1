'use client'
import { useCallback } from 'react'
import { useUDSData } from '../hooks/useUDSData'
import Header from '../components/ui/Header'
import KPICards from '../components/ui/KPICards'
import FiltersPanel from '../components/filters/FiltersPanel'
import ChartsSection from '../components/charts/ChartsSection'
import InsightsSection from '../components/insights/InsightsSection'
import DataTable from '../components/table/DataTable'
import { Loader2, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const {
    allRows, filteredRows, tableRows,
    loading, error,
    filters, updateFilter, resetFilters,
    searchAWB, setSearchAWB,
    kpis, charts, insights, options,
  } = useUDSData()

  // Drill-down: click hub/client on chart → set filter
  const handleHubClick = useCallback(hub => {
    if (!hub) return
    updateFilter('hubName', filters.hubName.includes(hub) ? filters.hubName.filter(h => h !== hub) : [...filters.hubName, hub])
  }, [filters.hubName, updateFilter])

  const handleClientClick = useCallback(client => {
    if (!client) return
    updateFilter('clientName', filters.clientName.includes(client) ? filters.clientName.filter(c => c !== client) : [...filters.clientName, client])
  }, [filters.clientName, updateFilter])

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <Header onRefresh={() => window.location.reload()} loading={loading} />

      <main className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
            </div>
            <p className="text-slate-500 text-sm">Loading shipment data…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Failed to load data</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error} — showing mock data</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Filters */}
            <FiltersPanel
              filters={filters}
              options={options}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              filteredCount={filteredRows.length}
              totalCount={allRows.length}
            />

            {/* KPIs */}
            <KPICards kpis={kpis} />

            {/* Insights */}
            {insights.length > 0 && <InsightsSection insights={insights} />}

            {/* Charts */}
            <ChartsSection
              charts={charts}
              onHubClick={handleHubClick}
              onClientClick={handleClientClick}
            />

            {/* Data Table */}
            <DataTable
              rows={tableRows}
              filteredRows={filteredRows}
              searchAWB={searchAWB}
              setSearchAWB={setSearchAWB}
            />
          </>
        )}
      </main>

      <footer className="relative text-center py-6 text-xs text-slate-700 border-t border-slate-800/60 mt-6">
        UDS Dashboard · Built with Next.js + Recharts · Shadowfax Analytics
      </footer>
    </div>
  )
}
