'use client'
import { useState, useEffect } from 'react'
import { formatBRL } from '@/lib/utils'

interface Linha {
  id: number
  odd: string
  stake: string
  travado: boolean // D = distribuído auto, C = customizado
}

export default function CalculadoraPage() {
  const [linhas, setLinhas] = useState<Linha[]>([
    { id: 1, odd: '2.000', stake: '', travado: false },
    { id: 2, odd: '2.000', stake: '', travado: false },
  ])
  const [stakeTotal, setStakeTotal] = useState('100')

  const odds = linhas.map(l => parseFloat(l.odd) || 0)
  const totalValido = odds.every(o => o > 1)
  const margem = totalValido ? odds.reduce((s, o) => s + 1 / o, 0) : null
  const percentual = margem ? margem * 100 : null
  const temArb = margem !== null && margem < 1
  const roi = temArb ? ((1 / margem - 1) * 100) : null

  // Calcula stakes automaticamente
  useEffect(() => {
    if (!totalValido || !margem) return
    const total = parseFloat(stakeTotal) || 0
    if (total <= 0) return

    setLinhas(prev => prev.map(l => {
      if (l.travado) return l // customizado, não mexe
      const odd = parseFloat(l.odd) || 0
      if (odd <= 1) return l
      const stake = total / (odd * margem)
      return { ...l, stake: stake.toFixed(2) }
    }))
  }, [stakeTotal, linhas.map(l => l.odd).join(','), margem])

  const setOdd = (id: number, val: string) => {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, odd: val } : l))
  }

  const setStake = (id: number, val: string) => {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, stake: val, travado: true } : l))
  }

  const toggleD = (id: number) => {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, travado: false } : l))
  }

  const toggleC = (id: number) => {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, travado: true } : l))
  }

  const addLinha = () => {
    setLinhas(prev => [...prev, { id: Date.now(), odd: '2.000', stake: '', travado: false }])
  }

  const removeLinha = (id: number) => {
    if (linhas.length <= 2) return
    setLinhas(prev => prev.filter(l => l.id !== id))
  }

  const totalStakes = linhas.reduce((s, l) => s + (parseFloat(l.stake) || 0), 0)

  const lucroLinha = (l: Linha) => {
    const odd = parseFloat(l.odd) || 0
    const stake = parseFloat(l.stake) || 0
    if (!odd || !stake) return null
    return (odd * stake) - totalStakes
  }

  return (
    <div className="fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Calculadora</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
          Insira as odds de cada casa para calcular a distribuição ideal de stakes.
        </p>
      </div>

      {/* Badge de arbitragem */}
      {percentual !== null && (
        <div style={{
          marginBottom: 20,
          padding: '14px 20px',
          borderRadius: 10,
          background: temArb ? 'rgba(0,230,118,0.07)' : 'rgba(255,82,82,0.07)',
          border: `1px solid ${temArb ? 'rgba(0,230,118,0.25)' : 'rgba(255,82,82,0.25)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Percentual</div>
              <div style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: temArb ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {percentual.toFixed(2)}%
              </div>
            </div>
            {temArb && roi !== null && (
              <>
                <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>ROI Garantido</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-green)' }}>
                    +{roi.toFixed(2)}%
                  </div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Lucro em R$</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-green)' }}>
                    {formatBRL((parseFloat(stakeTotal) || 0) * roi / 100)}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: temArb ? 'var(--accent-green)' : 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {temArb ? '✓ Arbitragem válida' : '✗ Sem arbitragem'}
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 160px 48px 48px 100px 32px',
          gap: 0,
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}>
          {['Chance', 'Odd', 'Aposta', 'D', 'C', 'Lucro', ''].map((h, i) => (
            <div key={i} style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: i >= 4 ? 'right' : i === 3 || i === 4 ? 'center' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: i === 3 || i === 4 ? 'center' : i === 5 ? 'flex-end' : 'flex-start',
              gap: 4,
            }}>
              {h}
              {(h === 'D' || h === 'C') && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--border-bright)', fontSize: 9, color: 'var(--text-muted)',
                  cursor: 'help', fontWeight: 700,
                }} title={h === 'D' ? 'Distribuído automaticamente' : 'Customizado manualmente'}>?</span>
              )}
            </div>
          ))}
        </div>

        {/* Linhas */}
        {linhas.map((l, idx) => {
          const lucro = lucroLinha(l)
          return (
            <div key={l.id} className="table-row" style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 160px 48px 48px 100px 32px',
              gap: 0,
              padding: '12px 16px',
              alignItems: 'center',
            }}>
              {/* Chance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                }}>{idx + 1}</span>
              </div>

              {/* Odd */}
              <div>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  value={l.odd}
                  onChange={e => setOdd(l.id, e.target.value)}
                  style={{ fontSize: 15, fontWeight: 600, textAlign: 'left', maxWidth: 120 }}
                />
              </div>

              {/* Stake */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={l.stake}
                  onChange={e => setStake(l.id, e.target.value)}
                  style={{ fontSize: 14, maxWidth: 110 }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>BRL</span>
              </div>

              {/* D - Distribuído */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name={`mode-${l.id}`}
                  checked={!l.travado}
                  onChange={() => toggleD(l.id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
              </div>

              {/* C - Customizado */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name={`mode-${l.id}`}
                  checked={l.travado}
                  onChange={() => toggleC(l.id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                />
              </div>

              {/* Lucro */}
              <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 14, color: lucro === null ? 'var(--text-muted)' : lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {lucro === null ? '—' : lucro.toFixed(2)}
              </div>

              {/* Remover */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => removeLinha(l.id)}
                  disabled={linhas.length <= 2}
                  style={{ background: 'none', border: 'none', color: linhas.length <= 2 ? 'var(--border)' : 'var(--text-muted)', cursor: linhas.length <= 2 ? 'default' : 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}
                >×</button>
              </div>
            </div>
          )
        })}

        {/* Total */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 160px 48px 48px 100px 32px',
          gap: 0,
          padding: '12px 16px',
          borderTop: '2px solid var(--border)',
          background: 'var(--bg-elevated)',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', gridColumn: '1/3' }}>Aposta total</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="input"
              type="number"
              step="0.01"
              value={stakeTotal}
              onChange={e => setStakeTotal(e.target.value)}
              style={{ fontSize: 14, fontWeight: 700, maxWidth: 110 }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>BRL</span>
          </div>
          <div />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input type="radio" checked style={{ width: 16, height: 16, accentColor: 'var(--accent-cyan)' }} readOnly />
          </div>
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {totalStakes > 0 ? totalStakes.toFixed(2) : '—'}
          </div>
          <div />
        </div>
      </div>

      {/* Botão adicionar */}
      <button
        className="btn-secondary"
        style={{ marginTop: 14, fontSize: 13 }}
        onClick={addLinha}
      >
        + Adicionar chance
      </button>

      {/* Legenda */}
      <div style={{ marginTop: 16, display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        <span><strong style={{ color: 'var(--accent-green)' }}>D</strong> = Stake distribuído automaticamente</span>
        <span><strong style={{ color: 'var(--accent-cyan)' }}>C</strong> = Stake customizado manualmente</span>
      </div>
    </div>
  )
}
