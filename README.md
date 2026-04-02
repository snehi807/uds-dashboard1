# UDS Dashboard — Undelivered Shipment Analytics

A production-ready analytics dashboard built with **Next.js 14**, **Recharts**, and **Tailwind CSS** for visualizing Shadowfax UDS (Undelivered Shipment) data from Google Sheets.

---

## 🚀 Quick Start (Local)

### 1. Install dependencies

```bash
cd uds-dashboard
npm install
```

### 2. Configure your API

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your Google Sheets API URL:

```env
NEXT_PUBLIC_SHEET_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> **Note:** If no URL is set, the dashboard automatically runs on **500 rows of realistic mock data** so you can explore all features immediately.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Google Sheets API Setup

The dashboard expects your Google Sheet data to be served via a **Google Apps Script Web App**. Follow these steps:

### Step 1 — Create the Apps Script

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. Paste this code:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 2 — Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web App**
3. Set **Execute as**: Me
4. Set **Who has access**: Anyone (or Anyone with link)
5. Click **Deploy** and copy the Web App URL

### Step 3 — Set the URL

Paste the URL into your `.env.local`:

```env
NEXT_PUBLIC_SHEET_API_URL=https://script.google.com/macros/s/AKfycb.../exec
```

> ⚠️ **CORS Note**: Google Apps Script Web Apps handle CORS automatically when deployed with public access.

---

## 🏗️ Project Structure

```
uds-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles + fonts
│   │   ├── layout.jsx           # Root HTML layout
│   │   └── page.jsx             # Main dashboard page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Header.jsx       # Top nav with refresh + dark mode
│   │   │   └── KPICards.jsx     # 7 animated KPI metric cards
│   │   ├── filters/
│   │   │   ├── FiltersPanel.jsx # Filter bar container
│   │   │   └── MultiSelect.jsx  # Reusable multi-select dropdown
│   │   ├── charts/
│   │   │   └── ChartsSection.jsx # All 5 Recharts visualizations
│   │   ├── insights/
│   │   │   └── InsightsSection.jsx # Auto-generated business insights
│   │   └── table/
│   │       └── DataTable.jsx    # Paginated sortable data table
│   ├── hooks/
│   │   └── useUDSData.js        # Central data + filter state hook
│   └── lib/
│       ├── api.js               # Data fetching + mock data generator
│       └── analytics.js        # KPIs, chart data, insights engine
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 📊 Features

### Filters
| Filter | Type |
|--------|------|
| Client Name | Multi-select |
| Hub Name | Multi-select |
| Ticket Status | Multi-select |
| Current Order Status | Multi-select |
| Rider Name | Multi-select |
| Date Range | Date picker (from / to) |

All filters update **KPIs, charts, insights, and the data table** in real time.

### KPI Cards
- Total Orders
- Total Tickets
- Repeat Ticket Rate (%)
- Delivery Rate (%)
- Failure Rate (%)
- Avg Call Attempts
- Avg Answer Rate (%)

### Charts
1. **Ticket Status Distribution** — Donut pie chart
2. **Hub-wise Failure Rate** — Horizontal bar (click bar → filter by hub)
3. **Client-wise Performance** — Grouped bar (delivery vs failure %, click → filter)
4. **Call Attempts vs Delivery Success** — Composed area + bar chart
5. **Ticket Reason Breakdown** — Horizontal bar with color-coded bars

### Insights Engine
Automatically generates human-readable business insights:
- 🔴 Top failing hub vs average
- 🟠 Client with highest repeat ticket rate
- 🔵 Most common ticket reason and share
- 📉 Correlation between low call attempts and failures
- ⚠️ SLA breach risk detection
- 🎯 Filter-aware context (rider/hub/client performance vs baseline)

### Data Table
- Search by AWB number
- Sort by any column
- Status badges with color coding
- Repeat ticket highlighting
- Pagination (20 / 50 / 100 rows)
- **Export filtered data as CSV**

---

## ☁️ Deploy on Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

During setup, add your environment variable when prompted:
- **Key**: `NEXT_PUBLIC_SHEET_API_URL`
- **Value**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

### Option B — Vercel Dashboard (GitHub)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SHEET_API_URL` = your Apps Script URL
5. Click **Deploy**

Your dashboard will be live at `https://your-project.vercel.app` in ~2 minutes.

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SHEET_API_URL` | Optional | Google Apps Script Web App URL that returns sheet data as JSON array |

If the variable is missing or contains `YOUR_SCRIPT_ID`, the dashboard automatically serves **500 rows of mock data**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| HTTP | Axios |
| Icons | Lucide React |
| Date utils | date-fns |
| Fonts | DM Sans + Space Mono (Google Fonts) |
| Deployment | Vercel |

---

## 🔄 Extending the Dashboard

### Add a new chart
1. Add a data transform function in `src/lib/analytics.js`
2. Include it in the `charts` object in `useUDSData.js`
3. Add a `<ChartCard>` component in `ChartsSection.jsx`

### Add a new filter
1. Add the field to `EMPTY_FILTERS` in `useUDSData.js`
2. Add its option generation in the `options` useMemo
3. Apply it in the `applyFilters` function in `analytics.js`
4. Add a `<MultiSelect>` in `FiltersPanel.jsx`

### Add a new insight rule
Add a new block inside `generateInsights()` in `src/lib/analytics.js`. Follow the pattern:
```js
insights.push({ type: 'warning' | 'positive' | 'negative' | 'info', text: '...' })
```
