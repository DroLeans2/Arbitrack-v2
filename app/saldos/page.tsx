'use client'
import { useEffect, useState } from 'react'
import { formatBRL, formatDateTime } from '@/lib/utils'
import type { Casa, Movimentacao } from '@/types'

export default function SaldosPage() {
  const [casas, setCasas] = useState<Casa[]>([])
  const [movs, setMovs] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCasa, setFiltroCasa] = useState('todos')
  const [form, setForm] = useState({ casa_id: '', tipo: 'deposito', valor: '', descricao: '' })
  const [saving, setSaving] = useState(false)

  const carregar = () => {
    const p = filtroCasa !== 'todos' ? `?casa=${filtroCasa}` : ''
    Promise.all([
      fetch('/api/casas').then(r => r.json()),
      fetch(`/api/movimentacoes${p}`).then(r => r.json()),
    ]).then(([c, m]) => { setCasas(Array.isArray(c) ? c : []); setMovs(Array.isArray(m) ? m : []); setLoading(false) })
  }

  useEffect(() => { carregar() }, [filtroCasa])

  const registrar = async () => {
    if (!form.casa_id || !form.valor) return
    setSaving(true)
    await fetch('/api/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valor: parseFloat(form.valor) }),
    })
    setForm({ casa_id: '', tipo: 'deposito', valor: '', descricao: '' })
    setSaving(false)
    carregar()
  }

  const saldoTotal = casas.reduce((s, c) => s + c.saldo_atual, 0)

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 28 }}>Saldos & Movimentações</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        {/* Painel esquerdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Nova movimentação */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Nova Movimentação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Casa</label>
                <select className="select" value={form.casa_id} onChange={e => setForm(f => ({ ...f, casa_id: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="deposito">💰 Depósito</option>
                  <option value="saque">💸 Saque</option>
                  <option value="ajuste">⚙️ Ajuste</option>
                </select>
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input className="input" type="number" placeholder="0.00" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
              </div>
              <div>
                <label className="label">Descrição</label>
                <input className="input" placeholder="Opcional..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <button className="btn-primary" onClick={registrar} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </div>

          {/* Saldo por casa */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total em todas as casas</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em', marginBottom: 18 }}>{formatBRL(saldoTotal)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {casas.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{c.nome}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: 15 }}>{formatBRL(c.saldo_atual)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Histórico de movimentações */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Histórico de Movimentações</h2>
            <select className="select" style={{ maxWidth: 160 }} value={filtroCasa} onChange={e => setFiltroCasa(e.target.value)}>
              <option value="todos">Todas as casas</option>
              {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Casa', 'Tipo', 'Valor', 'Descrição'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.id} className="table-row">
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDateTime(m.created_at)}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500 }}>{m.casa?.nome || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase' }}>{m.tipo}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: m.tipo === 'saque' ? 'var(--accent-red)' : 'var(--accent-green)', whiteSpace: 'nowrap' }}>
                      {m.tipo === 'saque' ? '-' : '+'}{formatBRL(m.valor)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{m.descricao || '—'}</td>
                  </tr>
                ))}
                {movs.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma movimentação</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
