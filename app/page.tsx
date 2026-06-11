'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatBRL, formatPercent, formatDate } from '@/lib/utils'
import type { Aposta, Casa } from '@/types'

export default function Dashboard() {
  const [apostas, setApostas] = useState<Aposta[]>([])
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/apostas').then(r => r.json()),
      fetch('/api/casas').then(r => r.json()),
    ]).then(([a, c]) => {
      setApostas(Array.isArray(a) ? a : [])
      setCasas(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  const finalizadas = apostas.filter(a => a.status === 'green' || a.status === 'red')
  const lucro = finalizadas.reduce((s, a) => s + (a.lucro || 0), 0)
  const totalApostado = apostas.reduce((s, a) => s + (a.total_apostado || 0), 0)
  const totalFin = finalizadas.reduce((s, a) => s + (a.total_apostado || 0), 0)
  const roi = totalFin > 0 ? (lucro / totalFin) * 100 : 0
  const saldoTotal = casas.reduce((s, c) => s + (c.saldo_atual || 0), 0)
  const greens = apostas.filter(a => a.status === 'green').length
  const reds = apostas.filter(a => a.status === 'red').length

  const lucroMes: Record<string, number> = {}
  finalizadas.forEach(a => {
    const mes = new Date(a.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    lucroMes[mes] = (lucroMes[mes] || 0) + (a.lucro || 0)
  })
  const chartData = Object.entries(lucroMes).map(([mes, lucro]) => ({ mes, lucro }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div className="spinner" /><span style={{ color: 'var(--text-secondary)' }}>Carregando...</span>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Dashboard</h1>
        <Link href="/apostas/nova"><button className="btn-primary">+ Nova Aposta</button></Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Saldo Total" value={formatBRL(saldoTotal)} sub="em todas as casas" color="var(--accent-cyan)" />
        <KpiCard label="Lucro Líquido" value={formatBRL(lucro)} sub={`${finalizadas.length} finalizadas`} color={lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <KpiCard label="ROI Médio" value={formatPercent(roi)} sub="sobre apostado" color={roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <KpiCard label="Total Apostado" value={formatBRL(totalApostado)} sub={`${apostas.length} apostas`} color="var(--text-primary)" />
        <KpiCard label="Green" value={String(greens)} sub="ganhas" color="var(--accent-green)" />
        <KpiCard label="Red" value={String(reds)} sub="perdidas" color="var(--accent-red)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Lucro por Mês</h2>
          {chartData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum dado ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} formatter={(v) => [formatBRL(Number(v)), 'Lucro']} />
                <Area type="monotone" dataKey="lucro" stroke="#00e676" fill="url(#g1)" strokeWidth={2} dot={{ fill: '#00e676', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saldo por Casa</h2>
            <Link href="/casas" style={{ fontSize: 12, color: 'var(--accent-cyan)', textDecoration: 'none' }}>ver todas →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {casas.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nome}</div>
                  <div style={{ fontSize: 11, color: c.ativa ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: 2 }}>{c.ativa ? '● ativa' : '○ inativa'}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: 15 }}>{formatBRL(c.saldo_atual)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Últimas Arbitragens</h2>
          <Link href="/apostas" style={{ fontSize: 12, color: 'var(--accent-cyan)', textDecoration: 'none' }}>ver tudo →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data', 'Evento', 'Casa 1', 'Casa 2', 'Total', 'Lucro', 'ROI', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apostas.slice(0, 8).map(a => (
                <tr key={a.id} className="table-row">
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, maxWidth: 220 }}>{a.evento}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{a.casa1?.nome || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{a.casa2?.nome || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{formatBRL(a.total_apostado)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap', color: a.lucro != null ? (a.lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)' }}>{a.lucro != null ? formatBRL(a.lucro) : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap', color: a.roi != null ? 'var(--accent-green)' : 'var(--text-muted)' }}>{a.roi != null ? formatPercent(a.roi) : '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div className="stat-value" style={{ color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}
