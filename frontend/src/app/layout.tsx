import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mavericks Tech | Best Software Company in Bangladesh',
  description: "Bangladesh's most trusted technology partner. Custom software, websites, e-commerce, cybersecurity & cloud solutions.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
