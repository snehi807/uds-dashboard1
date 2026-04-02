'use client'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import MultiSelect from './MultiSelect'

export default function FiltersPanel({ filters, options, updateFilter, resetFilters, filteredCount, totalCount }) {
  const isFiltered = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== ''))

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">Filters</span>
          {isFiltered && (
            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
              {filteredCount} / {totalCount} rows
            </span>
          )}
        </div>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MultiSelect
          label="Client Name"
          options={options.clientName}
          value={filters.clientName}
          onChange={v => updateFilter('clientName', v)}
        />
        <MultiSelect
          label="Hub Name"
          options={options.hubName}
          value={filters.hubName}
          onChange={v => updateFilter('hubName', v)}
        />
        <MultiSelect
          label="Ticket Status"
          options={options.ticketStatus}
          value={filters.ticketStatus}
          onChange={v => updateFilter('ticketStatus', v)}
        />
        <MultiSelect
          label="Order Status"
          options={options.orderStatus}
          value={filters.orderStatus}
          onChange={v => updateFilter('orderStatus', v)}
        />
        <MultiSelect
          label="Rider Name"
          options={options.riderName}
          value={filters.riderName}
          onChange={v => updateFilter('riderName', v)}
        />

        {/* Date range */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1">
          <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Date Range</div>
          <div className="flex gap-1">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => updateFilter('dateFrom', e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/80 px-2 py-2 text-xs text-slate-200 hover:border-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => updateFilter('dateTo', e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/80 px-2 py-2 text-xs text-slate-200 hover:border-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
