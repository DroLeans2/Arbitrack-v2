'use client'
import { useEffect, useState } from 'react'
import { formatBRL, formatPercent, formatDate } from '@/lib/utils'
import type { Aposta, Casa } from '@/types'
import ExportButton from '@/components/ExportButton'

export default function HistoricoPage() {
  const [apostas, setApostas] = useState<Aposta[]>([])
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ status: 'todos', casa: 'todos', inicio: '', fim: '', busca: '' })

  const set = (k: string, v: string) => setFiltros(f => ({ ...f, [k]: v }))

  const carregar = () => {
    const p = new URLSearchParams()
    if (filtros.status !== 'todos') p.set('status', filtros.status)
    if (filtros.casa !== 'todos') p.set('casa', filtros.casa)
    if (filtros.inicio) p.set('inicio', filtros.inicio)
    if (filtros.fim) p.set('fim', filtros.fim)
    Promise.all([
      fetch(`/api/apostas?${p}`).then(r => r.json()),
      fetch('/api/casas').then(r => r.json()),
    ]).then(([a, c]) => { setApostas(Array.isArray(a) ? a : []); setCasas(Array.isArray(c) ? c : []); setLoading(false) })
  }

  useEffect(() => { carregar() }, [filtros.status, filtros.casa, filtros.inicio, filtros.fim])

  const filtradas = apostas.filter(a => !filtros.busca || a.evento.toLowerCase().includes(filtros.busca.toLowerCase()))

  const totalLucro = filtradas.filter(a => a.status !== 'pending').reduce((s, a) => s + (a.lucro || 0), 0)
  const totalApostado = filtradas.reduce((s, a) => s + (a.total_apostado || 0), 0)
  const roiGeral = totalApostado > 0 ? (totalLucro / totalApostado) * 100 : 0

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Histórico</h1>
        <ExportButton apostas={filtradas} />
      </div>

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <SumCard label="Total apostado" value={formatBRL(totalApostado)} />
        <SumCard label="Lucro/Prejuízo" value={formatBRL(totalLucro)} color={totalLucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <SumCard label="ROI geral" value={formatPercent(roiGeral)} color={roiGeral >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} />
        <SumCard label="Apostas" value={String(filtradas.length)} />
        <SumCard label="Green" value={String(filtradas.filter(a => a.status === 'green').length)} color="var(--accent-green)" />
        <SumCard label="Red" value={String(filtradas.filter(a => a.status === 'red').length)} color="var(--accent-red)" />
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ maxWidth: 200 }} placeholder="Buscar evento..." value={filtros.busca} onChange={e => set('busca', e.target.value)} />
        <select className="select" style={{ maxWidth: 150 }} value={filtros.status} onChange={e => set('status', e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pending">Pendente</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
          <option value="void">Void</option>
        </select>
        <select className="select" style={{ maxWidth: 150 }} value={filtros.casa} onChange={e => set('casa', e.target.value)}>
          <option value="todos">Todas casas</option>
          {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input className="input" type="date" style={{ maxWidth: 160 }} value={filtros.inicio} onChange={e => set('inicio', e.target.value)} />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>até</span>
        <input className="input" type="date" style={{ maxWidth: 160 }} value={filtros.fim} onChange={e => set('fim', e.target.value)} />
        <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setFiltros({ status: 'todos', casa: 'todos', inicio: '', fim: '', busca: '' })}>Limpar</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data', 'Evento', 'Modalidade', 'Casa 1', 'Odd 1', 'Casa 2', 'Odd 2', 'Total', 'Lucro', 'ROI', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map(a => (
                <tr key={a.id} className="table-row">
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(a.created_at)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, maxWidth: 200 }}>{a.evento}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{a.modalidade || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.casa1?.nome || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.casa1_odd?.toFixed(3) || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.casa2?.nome || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.casa2_odd?.toFixed(3) || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>{formatBRL(a.total_apostado)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, whiteSpace: 'nowrap', color: a.lucro != null ? (a.lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)' }}>{a.lucro != null ? formatBRL(a.lucro) : '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, whiteSpace: 'nowrap', color: a.roi != null ? 'var(--accent-green)' : 'var(--text-muted)' }}>{a.roi != null ? formatPercent(a.roi) : '—'}</td>
                  <td style={{ padding: '11px 14px' }}><span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span></td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma entrada encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SumCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card" style={{ padding: '14px 18px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 20, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
