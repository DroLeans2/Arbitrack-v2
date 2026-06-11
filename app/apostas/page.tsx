'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatBRL, formatPercent, formatDate } from '@/lib/utils'
import type { Aposta, Casa } from '@/types'
import ApostaCard from '@/components/ApostaCard'
import ExportButton from '@/components/ExportButton'

export default function ApostasPage() {
  const [apostas, setApostas] = useState<Aposta[]>([])
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCasa, setFiltroCasa] = useState('todos')
  const [busca, setBusca] = useState('')
  const [agrupar, setAgrupar] = useState(true)

  const carregar = () => {
    const params = new URLSearchParams()
    if (filtroStatus !== 'todos') params.set('status', filtroStatus)
    if (filtroCasa !== 'todos') params.set('casa', filtroCasa)
    Promise.all([
      fetch(`/api/apostas?${params}`).then(r => r.json()),
      fetch('/api/casas').then(r => r.json()),
    ]).then(([a, c]) => {
      setApostas(Array.isArray(a) ? a : [])
      setCasas(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }

  useEffect(() => { carregar() }, [filtroStatus, filtroCasa])

  const filtradas = apostas.filter(a =>
    !busca || a.evento.toLowerCase().includes(busca.toLowerCase())
  )

  const grupos: Record<string, Aposta[]> = {}
  filtradas.forEach(a => {
    const key = agrupar ? (a.grupo_evento || a.evento) : a.id
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(a)
  })

  const deletar = async (id: string) => {
    if (!confirm('Remover esta aposta?')) return
    await fetch(`/api/apostas/${id}`, { method: 'DELETE' })
    carregar()
  }

  const atualizarStatus = async (id: string, status: string, lucro?: number) => {
    const roi = lucro != null ? (lucro / (apostas.find(a => a.id === id)?.total_apostado || 1)) * 100 : null
    await fetch(`/api/apostas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, lucro: lucro ?? null, roi: roi ?? null }),
    })
    carregar()
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Apostas</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <ExportButton apostas={filtradas} />
          <Link href="/apostas/nova"><button className="btn-primary">+ Nova Aposta</button></Link>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="Buscar evento..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select className="select" style={{ maxWidth: 160 }} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
          <option value="void">Void</option>
        </select>
        <select className="select" style={{ maxWidth: 160 }} value={filtroCasa} onChange={e => setFiltroCasa(e.target.value)}>
          <option value="todos">Todas as casas</option>
          {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <button
          className={agrupar ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 14px', fontSize: 13 }}
          onClick={() => setAgrupar(!agrupar)}
        >
          {agrupar ? '⊞ Agrupado' : '☰ Individual'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtradas.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Nenhuma aposta encontrada</div>
          <Link href="/apostas/nova"><button className="btn-primary" style={{ marginTop: 8 }}>+ Nova Aposta</button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(grupos).map(([grupo, items]) => (
            <div key={grupo}>
              {agrupar && items.length > 1 && (
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 4 }}>
                  {grupo} <span style={{ color: 'var(--border-bright)' }}>({items.length} apostas)</span>
                </div>
              )}
              {items.map(a => (
                <ApostaCard key={a.id} aposta={a} onDelete={deletar} onStatusChange={atualizarStatus} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
