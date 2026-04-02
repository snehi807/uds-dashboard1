'use client'
import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { downloadCSV } from '../../lib/analytics'

const STATUS_COLORS = {
  DELIVERED:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  RTO:              'bg-red-500/20 text-red-300 border-red-500/30',
  FAILED_DELIVERY:  'bg-red-500/20 text-red-300 border-red-500/30',
  PENDING:          'bg-amber-500/20 text-amber-300 border-amber-500/30',
  IN_TRANSIT:       'bg-blue-500/20 text-blue-300 border-blue-500/30',
  OUT_FOR_DELIVERY: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
}

const TICKET_STATUS_COLORS = {
  OPEN:        'bg-amber-500/20 text-amber-300',
  CLOSED:      'bg-slate-500/20 text-slate-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  ESCALATED:   'bg-red-500/20 text-red-300',
  RESOLVED:    'bg-emerald-500/20 text-emerald-300',
}

const COLS = [
  { key: 'awb_number',             label: 'AWB Number',      sortable: true },
  { key: 'client_name',            label: 'Client',          sortable: true },
  { key: 'hub_name',               label: 'Hub',             sortable: true },
  { key: 'ticket_status',          label: 'Ticket Status',   sortable: true },
  { key: 'current_order_status',   label: 'Order Status',    sortable: true },
  { key: 'rider_name',             label: 'Rider',           sortable: true },
  { key: 'total_number_of_calls_made', label: 'Calls Made', sortable: true },
  { key: 'ticket_repeat_count',    label: 'Repeats',         sortable: true },
]

const PAGE_SIZES = [20, 50, 100]

export default function DataTable({ rows, searchAWB, setSearchAWB, filteredRows }) {
  const [sortKey, setSortKey] = useState('awb_number')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? ''
      const cmp = isNaN(av) ? String(av).localeCompare(String(bv)) : Number(av) - Number(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-slate-600" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      {/* Table header controls */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">Shipment Records</h3>
          <span className="text-xs text-slate-500">{rows.length} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchAWB}
              onChange={e => { setSearchAWB(e.target.value); setPage(1) }}
              placeholder="Search AWB..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 w-44 transition-all"
            />
          </div>
          <button
            onClick={() => downloadCSV(filteredRows)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/40">
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-slate-200 select-none' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-4 py-10 text-center text-slate-600 text-sm">
                  No records found
                </td>
              </tr>
            )}
            {paged.map((row, i) => (
              <tr
                key={row.awb_number + i}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-blue-400 whitespace-nowrap">{row.awb_number}</td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.client_name}</td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.hub_name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TICKET_STATUS_COLORS[row.ticket_status] || 'bg-slate-700 text-slate-400'}`}>
                    {row.ticket_status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[row.current_order_status] || 'bg-slate-700/40 text-slate-400 border-slate-600'}`}>
                    {row.current_order_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.rider_name}</td>
                <td className="px-4 py-3 text-center text-slate-300">{row.total_number_of_calls_made ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={Number(row.ticket_repeat_count) > 1 ? 'text-orange-400 font-medium' : 'text-slate-500'}>
                    {row.ticket_repeat_count ?? '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-300 focus:outline-none"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-2">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(7, pageCount) }, (_, i) => {
            let p
            if (pageCount <= 7) p = i + 1
            else if (page <= 4) p = i + 1
            else if (page >= pageCount - 3) p = pageCount - 6 + i
            else p = page - 3 + i
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded transition-all ${page === p ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
