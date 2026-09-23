'use client'
import { useEffect, useState } from 'react'
import { formatBRL, formatPercent } from '@/lib/utils'
import type { Casa } from '@/types'

export default function CasasPage() {
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'nova' | 'editar' | null>(null)
  const [editando, setEditando] = useState<Casa | null>(null)
  const [form, setForm] = useState({ nome: '', saldo_inicial: '' })

  const carregar = () => fetch('/api/casas').then(r => r.json()).then(d => { setCasas(d); setLoading(false) })
  useEffect(() => { carregar() }, [])

  const abrirEditar = (c: Casa) => { setEditando(c); setForm({ nome: c.nome, saldo_inicial: '' }); setModal('editar') }
  const abrirNova = () => { setEditando(null); setForm({ nome: '', saldo_inicial: '' }); setModal('nova') }

  const salvar = async () => {
    if (!form.nome.trim()) return
    if (modal === 'nova') {
      await fetch('/api/casas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: form.nome, saldo_inicial: parseFloat(form.saldo_inicial) || 0 }) })
    } else if (editando) {
      await fetch(`/api/casas/${editando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: form.nome, ativa: editando.ativa }) })
    }
    setModal(null)
    carregar()
  }

  const toggleAtiva = async (c: Casa) => {
    await fetch(`/api/casas/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: c.nome, ativa: !c.ativa }) })
    carregar()
  }

  const deletar = async (id: string) => {
    if (!confirm('Remover esta casa?')) return
    await fetch(`/api/casas/${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Casas de Apostas</h1>
        <button className="btn-primary" onClick={abrirNova}>+ Cadastrar Casa</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {casas.map(c => (
            <div key={c.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{c.nome}</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: c.ativa ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {c.ativa ? '● ATIVA' : '○ INATIVA'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Saldo Atual</div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-cyan)' }}>{formatBRL(c.saldo_atual)}</div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', flex: 1 }} onClick={() => abrirEditar(c)}>✎ Editar</button>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', flex: 1 }} onClick={() => toggleAtiva(c)}>
                  {c.ativa ? '⏸ Desativar' : '▶ Ativar'}
                </button>
                <button className="btn-danger" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => deletar(c.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal fade-in" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{modal === 'nova' ? 'Nova Casa' : 'Editar Casa'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Bet365" />
              </div>
              {modal === 'nova' && (
                <div>
                  <label className="label">Saldo Inicial (R$)</label>
                  <input className="input" type="number" value={form.saldo_inicial} onChange={e => setForm(f => ({ ...f, saldo_inicial: e.target.value }))} placeholder="0.00" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                <button className="btn-primary" onClick={salvar}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
