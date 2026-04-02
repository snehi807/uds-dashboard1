import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

// ─── Filter rows based on active filters ─────────────────────────────────────
export function applyFilters(rows, filters) {
  return rows.filter(row => {
    if (filters.clientName?.length && !filters.clientName.includes(row.client_name)) return false
    if (filters.hubName?.length && !filters.hubName.includes(row.hub_name)) return false
    if (filters.ticketStatus?.length && !filters.ticketStatus.includes(row.ticket_status)) return false
    if (filters.orderStatus?.length && !filters.orderStatus.includes(row.current_order_status)) return false
    if (filters.riderName?.length && !filters.riderName.includes(row.rider_name)) return false
    if (filters.dateFrom || filters.dateTo) {
      const d = row.ist_ticket_created_date
        ? parseISO(row.ist_ticket_created_date)
        : null
      if (d) {
        if (filters.dateFrom && d < startOfDay(parseISO(filters.dateFrom))) return false
        if (filters.dateTo && d > endOfDay(parseISO(filters.dateTo))) return false
      }
    }
    return true
  })
}

// ─── KPI calculations ─────────────────────────────────────────────────────────
export function calcKPIs(rows) {
  const total = rows.length
  if (!total) return { total, tickets: 0, repeatPct: 0, deliveryRate: 0, failureRate: 0, avgCalls: 0, avgAnswerRate: 0 }

  const delivered = rows.filter(r => r.current_order_status === 'DELIVERED').length
  const failed = rows.filter(r => ['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)).length
  const repeated = rows.filter(r => Number(r.ticket_repeat_count) > 1).length
  const totalCalls = rows.reduce((s, r) => s + Number(r.total_number_of_calls_made || 0), 0)
  const totalAnswered = rows.reduce((s, r) => s + Number(r.total_number_of_answered_calls || 0), 0)

  return {
    total,
    tickets: total,
    repeatPct: ((repeated / total) * 100).toFixed(1),
    deliveryRate: ((delivered / total) * 100).toFixed(1),
    failureRate: ((failed / total) * 100).toFixed(1),
    avgCalls: (totalCalls / total).toFixed(2),
    avgAnswerRate: totalCalls > 0 ? ((totalAnswered / totalCalls) * 100).toFixed(1) : '0.0',
  }
}

// ─── Chart data generators ────────────────────────────────────────────────────
export function ticketStatusDist(rows) {
  const map = {}
  rows.forEach(r => {
    const s = r.ticket_status || 'UNKNOWN'
    map[s] = (map[s] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export function hubFailureRate(rows) {
  const hubs = {}
  rows.forEach(r => {
    const h = r.hub_name || 'Unknown'
    if (!hubs[h]) hubs[h] = { total: 0, failed: 0 }
    hubs[h].total++
    if (['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)) hubs[h].failed++
  })
  return Object.entries(hubs)
    .map(([hub, d]) => ({ hub, failureRate: +((d.failed / d.total) * 100).toFixed(1), total: d.total }))
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 10)
}

export function clientPerformance(rows) {
  const clients = {}
  rows.forEach(r => {
    const c = r.client_name || 'Unknown'
    if (!clients[c]) clients[c] = { total: 0, delivered: 0, failed: 0 }
    clients[c].total++
    if (r.current_order_status === 'DELIVERED') clients[c].delivered++
    if (['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)) clients[c].failed++
  })
  return Object.entries(clients).map(([client, d]) => ({
    client,
    deliveryRate: +((d.delivered / d.total) * 100).toFixed(1),
    failureRate: +((d.failed / d.total) * 100).toFixed(1),
    total: d.total,
  })).sort((a, b) => b.total - a.total).slice(0, 10)
}

export function callVsDelivery(rows) {
  const buckets = { '0': { total: 0, delivered: 0 }, '1': { total: 0, delivered: 0 }, '2': { total: 0, delivered: 0 }, '3': { total: 0, delivered: 0 }, '4+': { total: 0, delivered: 0 } }
  rows.forEach(r => {
    const c = Number(r.total_number_of_calls_made || 0)
    const key = c >= 4 ? '4+' : String(c)
    buckets[key].total++
    if (r.current_order_status === 'DELIVERED') buckets[key].delivered++
  })
  return Object.entries(buckets).map(([calls, d]) => ({
    calls,
    deliveryRate: d.total > 0 ? +((d.delivered / d.total) * 100).toFixed(1) : 0,
    count: d.total,
  }))
}

export function ticketReasonBreakdown(rows) {
  const map = {}
  rows.forEach(r => {
    const reason = r.ticket_reason || 'Unknown'
    map[reason] = (map[reason] || 0) + 1
  })
  return Object.entries(map)
    .map(([reason, count]) => ({ reason: reason.length > 25 ? reason.slice(0, 22) + '…' : reason, fullReason: reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

// ─── Insights engine ──────────────────────────────────────────────────────────
export function generateInsights(allRows, filteredRows, filters) {
  const insights = []
  if (!allRows.length) return insights

  // ── Global insights (from full dataset) ──────────────────────────
  const hubStats = {}
  allRows.forEach(r => {
    const h = r.hub_name || 'Unknown'
    if (!hubStats[h]) hubStats[h] = { total: 0, failed: 0 }
    hubStats[h].total++
    if (['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)) hubStats[h].failed++
  })
  const avgHubFailure = Object.values(hubStats).reduce((s, d) => s + (d.failed / d.total), 0) / Object.keys(hubStats).length
  const worstHub = Object.entries(hubStats).sort((a, b) => (b[1].failed / b[1].total) - (a[1].failed / a[1].total))[0]
  if (worstHub) {
    const rate = ((worstHub[1].failed / worstHub[1].total) * 100).toFixed(1)
    const diff = (((worstHub[1].failed / worstHub[1].total) - avgHubFailure) * 100).toFixed(1)
    insights.push({ type: 'warning', text: `Hub ${worstHub[0]} has a ${rate}% failure rate, ${diff}% above average across all hubs.` })
  }

  // Repeat ticket leaders
  const clientRepeat = {}
  allRows.forEach(r => {
    const c = r.client_name || 'Unknown'
    if (!clientRepeat[c]) clientRepeat[c] = { total: 0, repeated: 0 }
    clientRepeat[c].total++
    if (Number(r.ticket_repeat_count) > 1) clientRepeat[c].repeated++
  })
  const worstClient = Object.entries(clientRepeat).sort((a, b) => (b[1].repeated / b[1].total) - (a[1].repeated / a[1].total))[0]
  if (worstClient && worstClient[1].total >= 5) {
    const rate = ((worstClient[1].repeated / worstClient[1].total) * 100).toFixed(1)
    insights.push({ type: 'warning', text: `${worstClient[0]} has the highest repeat ticket rate at ${rate}%, indicating persistent delivery issues.` })
  }

  // Most common ticket reason
  const reasonMap = {}
  allRows.forEach(r => { const rr = r.ticket_reason || 'Unknown'; reasonMap[rr] = (reasonMap[rr] || 0) + 1 })
  const topReason = Object.entries(reasonMap).sort((a, b) => b[1] - a[1])[0]
  if (topReason) {
    const pct = ((topReason[1] / allRows.length) * 100).toFixed(1)
    insights.push({ type: 'info', text: `"${topReason[0]}" is the most common ticket reason, accounting for ${pct}% of all tickets.` })
  }

  // Low call attempts → higher failure
  const lowCallRows = allRows.filter(r => Number(r.total_number_of_calls_made || 0) <= 1)
  const highCallRows = allRows.filter(r => Number(r.total_number_of_calls_made || 0) >= 3)
  if (lowCallRows.length && highCallRows.length) {
    const lowFail = lowCallRows.filter(r => ['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)).length / lowCallRows.length
    const highFail = highCallRows.filter(r => ['RTO', 'FAILED_DELIVERY'].includes(r.current_order_status)).length / highCallRows.length
    if (lowFail > highFail * 1.2) {
      const diff = ((lowFail - highFail) * 100).toFixed(1)
      insights.push({ type: 'negative', text: `Orders with ≤1 call attempt have ${diff}% higher failure rate than orders with 3+ calls. Increasing call attempts may improve delivery success.` })
    }
  }

  // SLA breach detection
  const slaBreach = allRows.filter(r => {
    if (!r.client_promised_date || !r.shadowfax_promised_date) return false
    return r.shadowfax_promised_date > r.client_promised_date
  }).length
  if (slaBreach > 0) {
    const pct = ((slaBreach / allRows.length) * 100).toFixed(1)
    insights.push({ type: 'warning', text: `${slaBreach} orders (${pct}%) have a Shadowfax promised date exceeding the client's promised date — potential SLA breach risk.` })
  }

  // ── Filter-based insights ─────────────────────────────────────────
  const isFiltered = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))
  if (isFiltered && filteredRows.length) {
    const fKpis = calcKPIs(filteredRows)
    const gKpis = calcKPIs(allRows)
    const delivDiff = (fKpis.deliveryRate - gKpis.deliveryRate).toFixed(1)

    if (filters.clientName?.length === 1) {
      const dir = delivDiff >= 0 ? '📈 above' : '📉 below'
      insights.push({ type: delivDiff >= 0 ? 'positive' : 'negative', text: `${filters.clientName[0]} has a ${fKpis.deliveryRate}% delivery rate, ${Math.abs(delivDiff)}% ${dir} the overall average of ${gKpis.deliveryRate}%.` })
    }

    if (filters.hubName?.length === 1) {
      insights.push({ type: 'info', text: `Hub ${filters.hubName[0]} shows ${fKpis.failureRate}% failure rate with ${filteredRows.length} shipments in the selected period.` })
    }

    if (filters.riderName?.length === 1) {
      const r = filteredRows[0]
      insights.push({ type: 'info', text: `Rider ${filters.riderName[0]} has ${fKpis.deliveryRate}% delivery success on ${filteredRows.length} assigned orders.` })
    }

    // High failure anomaly
    if (Number(fKpis.failureRate) > Number(gKpis.failureRate) * 1.3) {
      insights.push({ type: 'warning', text: `⚠️ Current filter shows ${fKpis.failureRate}% failure rate — significantly above the overall ${gKpis.failureRate}% average. Investigate immediately.` })
    }
  }

  // Positive insight if delivery rate is good
  const gKpis = calcKPIs(filteredRows)
  if (Number(gKpis.deliveryRate) >= 80) {
    insights.push({ type: 'positive', text: `Delivery rate of ${gKpis.deliveryRate}% in the current view is healthy. Keep monitoring repeat tickets to maintain performance.` })
  }

  return insights
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export function downloadCSV(rows, filename = 'uds_export.csv') {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Unique values for filter dropdowns ───────────────────────────────────────
export function getUniqueValues(rows, key) {
  return [...new Set(rows.map(r => r[key]).filter(Boolean))].sort()
}
