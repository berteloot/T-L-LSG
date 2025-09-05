<<<<<<< HEAD
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/brand/fonts.css'
import '@/brand/theme.css'
import '@/brand/motion.css'
=======
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'T&L LSG Assessment Tool',
  description: 'Comprehensive assessment and evaluation tool for T&L LSG. Get personalized insights and actionable recommendations.',
  keywords: 'assessment, evaluation, T&L LSG, analysis, insights, recommendations',
  authors: [{ name: 'T&L LSG' }],
  creator: 'T&L LSG',
  publisher: 'T&L LSG',
  robots: 'index, follow',
  openGraph: {
    title: 'T&L LSG Assessment Tool',
    description: 'Comprehensive assessment and evaluation tool for T&L LSG.',
    url: 'https://tl-lsg.vercel.app',
    siteName: 'T&L LSG',
    images: [
      {
        url: 'https://tl-lsg.vercel.app/opengraph.png',
        width: 1200,
        height: 630,
        alt: 'T&L LSG Assessment Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'T&L LSG Assessment Tool',
    description: 'Comprehensive assessment and evaluation tool for T&L LSG.',
    images: ['https://tl-lsg.vercel.app/opengraph.png'],
    creator: '@TLLSG',
  },
<<<<<<< HEAD
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f58ad',
=======
  themeColor: '#1f58ad',
  viewport: 'width=device-width, initial-scale=1',
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
=======
      <body className={`${inter.variable} font-body antialiased`}>
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77
        {children}
      </body>
    </html>
  )
}
