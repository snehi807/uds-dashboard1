import './globals.css'

export const metadata = {
  title: 'UDS Dashboard | Shadowfax Analytics',
  description: 'Undelivered Shipment Analytics Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0f1e] antialiased">{children}</body>
    </html>
  )
}
