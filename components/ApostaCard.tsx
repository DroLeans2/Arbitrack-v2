'use client'
import { useState } from 'react'
import { formatBRL, formatPercent, formatDateTime } from '@/lib/utils'
import type { Aposta } from '@/types'

interface Props {
  aposta: Aposta
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string, lucro?: number) => void
}

export default function ApostaCard({ aposta: a, onDelete, onStatusChange }: Props) {
  const [resolvendo, setResolvendo] = useState(false)
  const [lucroInput, setLucroInput] = useState('')

  const resolver = async (status: 'green' | 'red' | 'void') => {
    const lucro = status === 'green' ? parseFloat(lucroInput) || undefined : status === 'red' ? -a.total_apostado : undefined
    onStatusChange(a.id, status, lucro)
    setResolvendo(false)
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Info evento */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{a.evento}</span>
            {a.modalidade && <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 20 }}>{a.modalidade}</span>}
            <span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(a.created_at)}</div>
        </div>

        {/* Stakes resumo */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Stat label="Total" value={formatBRL(a.total_apostado)} />
          <Stat label="Lucro" value={a.lucro != null ? formatBRL(a.lucro) : '—'} color={a.lucro != null ? (a.lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') : undefined} />
          <Stat label="ROI" value={a.roi != null ? formatPercent(a.roi) : '—'} color={a.roi != null ? 'var(--accent-green)' : undefined} />
        </div>
      </div>

      {/* Casas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
        <CasaBox
          nome={a.casa1?.nome || '?'}
          mercado={a.casa1_mercado}
          odd={a.casa1_odd}
          stake={a.casa1_stake}
          color="var(--accent-cyan)"
        />
        <CasaBox
          nome={a.casa2?.nome || '?'}
          mercado={a.casa2_mercado}
          odd={a.casa2_odd}
          stake={a.casa2_stake}
          color="var(--accent-purple)"
        />
      </div>

      {a.notas && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 8 }}>
          📝 {a.notas}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        {a.status === 'pending' && !resolvendo && (
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setResolvendo(true)}>
            Resolver
          </button>
        )}

        {resolvendo && (
          <>
            <input
              className="input"
              type="number"
              placeholder="Lucro (R$)"
              style={{ width: 130, fontSize: 13, padding: '6px 10px' }}
              value={lucroInput}
              onChange={e => setLucroInput(e.target.value)}
            />
            <button className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => resolver('green')}>✓ Green</button>
            <button className="btn-danger" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => resolver('red')}>✗ Red</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => resolver('void')}>Void</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setResolvendo(false)}>Cancelar</button>
          </>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => onDelete(a.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: '4px 8px', lineHeight: 1 }}
            title="Remover"
          >×</button>
        </div>
      </div>
    </div>
  )
}

function CasaBox({ nome, mercado, odd, stake, color }: { nome: string; mercado?: string | null; odd: number; stake: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontWeight: 700, color, marginBottom: 4, fontSize: 14 }}>{nome}</div>
      {mercado && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{mercado}</div>}
      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase' }}>Odd</div>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{odd?.toFixed(3) || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase' }}>Stake</div>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{formatBRL(stake)}</div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
