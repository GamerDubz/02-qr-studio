import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'QR Studio — Advanced QR Code Generator',
  description: 'Create custom QR codes with colors, logos, styles, and different error correction levels. Download as PNG or SVG.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={`${inter.className} antialiased`}>{children}</body></html>)
}
