import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoltShield — Free AI Agent Security Scanner',
  description: 'Scan your AI agent code for prompt injection, sleeper triggers, wallet drains, and 17 other vulnerability categories. Free. No login required.',
  keywords: ['AI agent security', 'prompt injection', 'wallet drain', 'smart contract security', 'agent scanning'],
  openGraph: {
    title: 'MoltShield — Free AI Agent Security Scanner',
    description: 'Scan your AI agent code for security vulnerabilities. Free. No login required.',
    url: 'https://scan.moltcops.com',
    siteName: 'MoltCops',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoltShield — Free AI Agent Security Scanner',
    description: 'Scan your AI agent code for security vulnerabilities. Free. No login required.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
