'use client'
import { useState } from 'react'
import { formatBRL, formatPercent, formatDateTime } from '@/lib/utils'
import type { Aposta } from '@/types'

interface Props {
  aposta: Aposta
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string, lucro?: number, casaVencedora?: number | null) => void
}

export default function ApostaCard({ aposta: a, onDelete, onStatusChange }: Props) {
  const [resolvendo, setResolvendo] = useState(false)
  const [lucroInput, setLucroInput] = useState('')
  const [casaVencedora, setCasaVencedora] = useState<1 | 2 | null>(null)

  const isIndividual = !a.casa2_id

  const resolver = async (status: 'green' | 'red' | 'void') => {
    const lucro = status === 'green' ? parseFloat(lucroInput) || undefined : status === 'red' ? -a.total_apostado : undefined
    onStatusChange(a.id, status, lucro, status === 'green' ? casaVencedora : null)
    setResolvendo(false)
  }

  const casa1Venceu = a.status === 'green' && a.casa_vencedora === 1
  const casa2Venceu = a.status === 'green' && a.casa_vencedora === 2

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{a.evento}</span>
            {a.modalidade && <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 20 }}>{a.modalidade}</span>}
            <span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span>
            {isIndividual && <span style={{ fontSize: 11, color: '#a78bfa', background: '#7c3aed22', padding: '2px 8px', borderRadius: 20 }}>Individual</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(a.created_at)}</div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Stat label="Total" value={formatBRL(a.total_apostado)} />
          <Stat label="Lucro" value={a.lucro != null ? formatBRL(a.lucro) : '—'} color={a.lucro != null ? (a.lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') : undefined} />
          <Stat label="ROI" value={a.roi != null ? formatPercent(a.roi) : '—'} color={a.roi != null ? 'var(--accent-green)' : undefined} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isIndividual ? '1fr' : '1fr 1fr', gap: 12, marginTop: 14 }}>
        <CasaBox
          nome={a.casa1?.nome || '?'}
          mercado={a.casa1_mercado}
          selecao={a.casa1_selecao}
          odd={a.casa1_odd}
          stake={a.casa1_stake}
          color="var(--accent-cyan)"
          venceu={casa1Venceu}
          perdeu={a.status === 'green' && a.casa_vencedora === 2}
        />
        {!isIndividual && (
          <CasaBox
            nome={a.casa2?.nome || '?'}
            mercado={a.casa2_mercado}
            selecao={a.casa2_selecao}
            odd={a.casa2_odd || 0}
            stake={a.casa2_stake || 0}
            color="var(--accent-purple)"
            venceu={casa2Venceu}
            perdeu={a.status === 'green' && a.casa_vencedora === 1}
          />
        )}
      </div>

      {a.notas && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 8 }}>
          📝 {a.notas}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        {a.status === 'pending' && !resolvendo && (
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setResolvendo(true)}>
            Resolver
          </button>
        )}

        {a.status !== 'pending' && !resolvendo && (
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => {
            setLucroInput(a.lucro != null ? String(a.lucro) : '')
            setCasaVencedora(a.casa_vencedora ?? null)
            setResolvendo(true)
          }}>
            ✏️ Editar
          </button>
        )}

        {resolvendo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {!isIndividual && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Qual lado ganhou? (para Green)
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCasaVencedora(casaVencedora === 1 ? null : 1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '2px solid',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                      borderColor: casaVencedora === 1 ? '#06b6d4' : 'var(--border)',
                      background: casaVencedora === 1 ? '#06b6d422' : 'transparent',
                      color: casaVencedora === 1 ? '#06b6d4' : 'var(--text-muted)',
                    }}
                  >
                    ✅ {a.casa1?.nome || 'Casa 1'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCasaVencedora(casaVencedora === 2 ? null : 2)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '2px solid',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                      borderColor: casaVencedora === 2 ? '#a78bfa' : 'var(--border)',
                      background: casaVencedora === 2 ? '#7c3aed22' : 'transparent',
                      color: casaVencedora === 2 ? '#a78bfa' : 'var(--text-muted)',
                    }}
                  >
                    ✅ {a.casa2?.nome || 'Casa 2'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="input"
                type="number"
                placeholder="Lucro real (R$)"
                style={{ width: 150, fontSize: 13, padding: '6px 10px' }}
                value={lucroInput}
                onChange={e => setLucroInput(e.target.value)}
              />
              <button className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => resolver('green')}>✓ Green</button>
              <button className="btn-danger" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => resolver('red')}>✗ Red</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => resolver('void')}>Void</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setResolvendo(false); setCasaVencedora(null) }}>Cancelar</button>
            </div>
          </div>
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

function CasaBox({ nome, mercado, selecao, odd, stake, color, venceu, perdeu }: {
  nome: string
  mercado?: string | null
  selecao?: string | null
  odd: number
  stake: number
  color: string
  venceu?: boolean
  perdeu?: boolean
}) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 8,
      padding: 14,
      borderLeft: `3px solid ${venceu ? '#00e676' : perdeu ? '#ef444466' : color}`,
      outline: venceu ? '2px solid #00e67644' : perdeu ? '1px solid #ef444422' : 'none',
      opacity: perdeu ? 0.6 : 1,
      transition: 'all 0.2s',
      position: 'relative',
    }}>
      {venceu && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 10,
          fontSize: 11,
          fontWeight: 700,
          color: '#00e676',
          background: '#00e67622',
          padding: '2px 8px',
          borderRadius: 20,
        }}>
          ✅ GANHOU
        </div>
      )}
      {perdeu && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 10,
          fontSize: 11,
          fontWeight: 700,
          color: '#ef4444',
          background: '#ef444422',
          padding: '2px 8px',
          borderRadius: 20,
        }}>
          ❌ PERDEU
        </div>
      )}
      <div style={{ fontWeight: 700, color: venceu ? '#00e676' : perdeu ? '#ef444488' : color, marginBottom: 4, fontSize: 14 }}>{nome}</div>
      {mercado && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{mercado}</div>}
      {selecao && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>{selecao}</div>}
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