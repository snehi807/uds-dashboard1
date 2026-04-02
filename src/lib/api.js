import axios from 'axios'

// ─── Mock data generator (for demo / when no API is configured) ─────────────
const HUBS = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad']
const CLIENTS = ['Flipkart', 'Amazon', 'Meesho', 'Myntra', 'Nykaa', 'Snapdeal', 'JioMart', 'Ajio']
const RIDERS = ['Ramesh K', 'Suresh P', 'Mahesh R', 'Dinesh T', 'Ganesh M', 'Rajesh S', 'Lokesh B', 'Nilesh C']
const STATUSES = ['OPEN', 'CLOSED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED']
const ORDER_STATUSES = ['DELIVERED', 'RTO', 'PENDING', 'FAILED_DELIVERY', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']
const REASONS = ['Customer Unavailable', 'Wrong Address', 'Refused Delivery', 'Bad Scan', 'Network Issue', 'Hub Hold', 'Rider No Show', 'OTP Mismatch']
const CATEGORIES = ['Premium', 'Standard', 'Express', 'Economy']
const PAYMENT_MODES = ['COD', 'Prepaid']

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
function fmt(d) { return d.toISOString().split('T')[0] }

export function generateMockData(n = 500) {
  const rows = []
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)

  for (let i = 0; i < n; i++) {
    const hub = randomFrom(HUBS)
    const client = randomFrom(CLIENTS)
    const rider = randomFrom(RIDERS)
    const ticketDate = randomDate(start, end)
    const clientDate = new Date(ticketDate); clientDate.setDate(clientDate.getDate() + randomInt(-2, 5))
    const sfxDate = new Date(ticketDate); sfxDate.setDate(sfxDate.getDate() + randomInt(-1, 4))
    const calls = randomInt(0, 6)
    const answered = randomInt(0, calls)
    const repeatCount = Math.random() < 0.25 ? randomInt(2, 5) : 1
    const orderStatus = randomFrom(ORDER_STATUSES)
    const delivered = orderStatus === 'DELIVERED'

    rows.push({
      awb_number: `SFX${String(100000 + i).padStart(9, '0')}`,
      client_name: client,
      client_category: randomFrom(CATEGORIES),
      payment_mode: randomFrom(PAYMENT_MODES),
      product_name: `Product ${randomInt(1, 200)}`,
      client_promised_date: fmt(clientDate),
      shadowfax_promised_date: fmt(sfxDate),
      ticket_id: `TKT${String(200000 + i).padStart(8, '0')}`,
      ist_ticket_creation_datetime: ticketDate.toISOString(),
      ist_ticket_created_date: fmt(ticketDate),
      tag: randomFrom(['UDS', 'FD', 'RTO']),
      ticket_source: randomFrom(['Customer', 'Hub', 'Rider App', 'IVR']),
      ticket_reason: randomFrom(REASONS),
      customer_comments_against_ticket_raised: 'N/A',
      ticket_status: randomFrom(STATUSES),
      shipment_status_at_runsheet_closure_prior_to_ticket_creation: randomFrom(['OFD', 'HUB', 'FAILED']),
      shipment_status_at_the_runsheet_closure_on_ticket_creation_date: randomFrom(['OFD', 'HUB', 'FAILED']),
      shipment_status_during_ticket_creation: randomFrom(['OFD', 'HUB', 'FAILED']),
      ist_of_status_marking_before_ticket_creation: ticketDate.toISOString(),
      hour_of_status_marking_before_ticket_creation: randomInt(6, 22),
      rider_app_version_during_the_last_status_marked: `4.${randomInt(0, 9)}.${randomInt(0, 20)}`,
      current_order_status: orderStatus,
      pu_count_of_uds_awb: randomInt(1, 4),
      ticket_repeat_count: repeatCount,
      rider_id_of_last_runsheet_before_ticket_creation: `RDR${randomInt(1000, 9999)}`,
      rider_name: rider,
      rider_dsr: randomInt(80, 100),
      total_order_assigned_to_rider: randomInt(20, 60),
      runsheet_dsr: randomInt(75, 100),
      last_runsheet_date_before_ticket_creation: fmt(ticketDate),
      hub_name: hub,
      pod: delivered ? 'YES' : 'NO',
      order_type: randomFrom(['Forward', 'RVP']),
      reseller_name: randomFrom(['N/A', 'ResA', 'ResB', 'ResC']),
      category_of_last_call_before_ticket_creation: randomFrom(['Customer Call', 'Hub Call', 'IVR']),
      hangup_details_of_call_before_ticket_creation: randomFrom(['Customer Disconnected', 'Rider Disconnected', 'No Answer']),
      category_of_last_call_riderapp_logs_based: randomFrom(['Attempted', 'Connected', 'Not Attempted']),
      summarized_category_of_call: randomFrom(['Proper', 'Improper', 'Not Attempted']),
      total_number_of_proper_call_attempt: randomInt(0, calls),
      total_number_of_improper_call_attempt: randomInt(0, 2),
      total_number_of_answered_calls: answered,
      total_number_of_calls_made: calls,
      last_rider_app_call_initiation_time: ticketDate.toISOString(),
      last_rider_app_call_end_time: ticketDate.toISOString(),
      ist_last_call_start_time: ticketDate.toISOString(),
      hub_masking_input_remarks_on_same_date_of_runsheet: 'N/A',
      hub_masking_call_category: randomFrom(['Masked', 'Not Masked']),
      bad_scan_flag_of_last_attempt_before_ticket_created: Math.random() < 0.1 ? 'Y' : 'N',
      shipment_manifest_reached_the_hub_before_ticket_created: Math.random() < 0.9 ? 'Y' : 'N',
      non_del_customer_geo_location_flag_of_last_attempt_before_ticket_created: Math.random() < 0.15 ? 'Y' : 'N',
      del_customer_geo_location_flag_of_last_attempt_before_ticket_created: delivered ? 'Y' : Math.random() < 0.5 ? 'Y' : 'N',
      x_seal_flag: Math.random() < 0.05 ? 'Y' : 'N',
    })
  }
  return rows
}

// ─── Real API fetcher ────────────────────────────────────────────────────────
export async function fetchSheetData() {
  const apiUrl = process.env.NEXT_PUBLIC_SHEET_API_URL
  if (!apiUrl || apiUrl.includes('YOUR_SCRIPT_ID')) {
    console.warn('[UDS] No API URL configured — using mock data')
    return generateMockData(500)
  }
  try {
    const { data } = await axios.get(apiUrl, { timeout: 30000 })
    // Support both array-of-objects and {data: [...]} shapes
    const rows = Array.isArray(data) ? data : data.data ?? data.rows ?? []
    return rows
  } catch (err) {
    console.error('[UDS] API fetch failed, falling back to mock data:', err.message)
    return generateMockData(500)
  }
}
