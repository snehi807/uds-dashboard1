import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchSheetData } from '../lib/api'
import { applyFilters, calcKPIs, ticketStatusDist, hubFailureRate, clientPerformance, callVsDelivery, ticketReasonBreakdown, generateInsights, getUniqueValues } from '../lib/analytics'

const EMPTY_FILTERS = {
  clientName: [],
  hubName: [],
  ticketStatus: [],
  orderStatus: [],
  riderName: [],
  dateFrom: '',
  dateTo: '',
}

export function useUDSData() {
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [searchAWB, setSearchAWB] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchSheetData()
      .then(data => { setAllRows(data); setError(null) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredRows = useMemo(() => applyFilters(allRows, filters), [allRows, filters])

  const tableRows = useMemo(() => {
    if (!searchAWB) return filteredRows
    const q = searchAWB.toLowerCase()
    return filteredRows.filter(r => r.awb_number?.toLowerCase().includes(q))
  }, [filteredRows, searchAWB])

  const kpis     = useMemo(() => calcKPIs(filteredRows), [filteredRows])
  const charts   = useMemo(() => ({
    ticketStatus:   ticketStatusDist(filteredRows),
    hubFailure:     hubFailureRate(filteredRows),
    clientPerf:     clientPerformance(filteredRows),
    callVsDelivery: callVsDelivery(filteredRows),
    ticketReason:   ticketReasonBreakdown(filteredRows),
  }), [filteredRows])
  const insights = useMemo(() => generateInsights(allRows, filteredRows, filters), [allRows, filteredRows, filters])

  // Dropdown options
  const options = useMemo(() => ({
    clientName:   getUniqueValues(allRows, 'client_name'),
    hubName:      getUniqueValues(allRows, 'hub_name'),
    ticketStatus: getUniqueValues(allRows, 'ticket_status'),
    orderStatus:  getUniqueValues(allRows, 'current_order_status'),
    riderName:    getUniqueValues(allRows, 'rider_name'),
  }), [allRows])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSearchAWB('')
  }, [])

  return { allRows, filteredRows, tableRows, loading, error, filters, updateFilter, resetFilters, searchAWB, setSearchAWB, kpis, charts, insights, options }
}
