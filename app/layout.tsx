import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'ArbiTrack',
  description: 'Controle de arbitragens esportivas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 56px)', padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
