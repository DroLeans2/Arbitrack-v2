'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/apostas', label: 'Apostas' },
  { href: '/casas', label: 'Casas' },
  { href: '/historico', label: 'Histórico' },
  { href: '/saldos', label: 'Saldos' },
  { href: '/calculadora', label: 'Calculadora' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--text-primary)' }}>Arbi</span>
            <span style={{ color: 'var(--accent-green)' }}>Track</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {links.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent-green)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0,230,118,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ArbiTrack v2</span>
      </div>
    </nav>
  )
}
