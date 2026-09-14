import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QR Studio — Precision QR Code Generator',
  description:
    'Design high-precision, scannable custom QR codes with designer color palettes, error correction controls, and instant retina export.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-900`}>
        {children}
      </body>
    </html>
  )
}
