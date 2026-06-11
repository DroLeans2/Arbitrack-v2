'use client'
import { useState } from 'react'
import { calcularArbitragem, formatBRL, formatPercent } from '@/lib/utils'

export default function CalculadoraPage() {
  const [odd1, setOdd1] = useState('')
  const [odd2, setOdd2] = useState('')
  const [stake, setStake] = useState('')
  const [roiMin, setRoiMin] = useState('1')

  const o1 = parseFloat(odd1) || 0
  const o2 = parseFloat(odd2) || 0
  const s = parseFloat(stake) || 0
  const calc = calcularArbitragem(o1, o2, s)

  const margem = o1 > 0 && o2 > 0 ? (1 / o1 + 1 / o2) * 100 : null
  const roiMinNum = parseFloat(roiMin) || 0

  // Para stake mínimo para atingir ROI alvo
  const stakeParaRoi = (roi: number) => {
    if (!calc.valida) return null
    return s > 0 ? s : null
  }

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>Calculadora de Arbitragem</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>Insira as odds e o stake total para calcular a distribuição ideal.</p>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <label className="label" style={{ color: 'var(--accent-cyan)' }}>Odd — Casa 1</label>
            <input className="input" type="number" step="0.001" placeholder="Ex: 1.850" value={odd1} onChange={e => setOdd1(e.target.value)} style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }} />
          </div>
          <div>
            <label className="label" style={{ color: 'var(--accent-purple)' }}>Odd — Casa 2</label>
            <input className="input" type="number" step="0.001" placeholder="Ex: 2.100" value={odd2} onChange={e => setOdd2(e.target.value)} style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }} />
          </div>
        </div>

        {margem !== null && (
          <div style={{ marginBottom: 20, padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Margem total das odds:</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: margem < 100 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {margem.toFixed(2)}% {margem < 100 ? '✓ Arbitragem possível' : '✗ Sem arbitragem'}
            </span>
          </div>
        )}

        <div>
          <label className="label">Stake Total (R$)</label>
          <input className="input" type="number" placeholder="Ex: 200.00" value={stake} onChange={e => setStake(e.target.value)} style={{ fontSize: 18, fontWeight: 600 }} />
        </div>
      </div>

      {/* Resultado */}
      {s > 0 && o1 > 0 && o2 > 0 && (
        <div className={`card fade-in`} style={{ padding: 28, marginBottom: 20, borderColor: calc.valida ? 'rgba(0,230,118,0.3)' : 'rgba(255,82,82,0.3)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: calc.valida ? 'var(--accent-green)' : 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
            {calc.valida ? '✓ Arbitragem válida' : '✗ Sem lucro garantido'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <ResultBox
              label="Stake Casa 1"
              value={formatBRL(calc.stake1)}
              pct={`${((calc.stake1 / s) * 100).toFixed(1)}% do total`}
              color="var(--accent-cyan)"
            />
            <ResultBox
              label="Stake Casa 2"
              value={formatBRL(calc.stake2)}
              pct={`${((calc.stake2 / s) * 100).toFixed(1)}% do total`}
              color="var(--accent-purple)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <ResultBox label="Lucro Garantido" value={formatBRL(calc.lucro_garantido)} color={calc.valida ? 'var(--accent-green)' : 'var(--accent-red)'} />
            <ResultBox label="ROI" value={formatPercent(calc.roi)} color={calc.valida ? 'var(--accent-green)' : 'var(--accent-red)'} />
            <ResultBox label="Retorno Total" value={formatBRL(s + calc.lucro_garantido)} color="var(--text-primary)" />
          </div>

          {calc.valida && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(0,230,118,0.06)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Como apostar:</strong><br />
              → Aposte <strong>{formatBRL(calc.stake1)}</strong> na seleção da <strong>Casa 1</strong> (odd {o1.toFixed(3)})<br />
              → Aposte <strong>{formatBRL(calc.stake2)}</strong> na seleção da <strong>Casa 2</strong> (odd {o2.toFixed(3)})<br />
              → Independente do resultado, você lucra <strong style={{ color: 'var(--accent-green)' }}>{formatBRL(calc.lucro_garantido)}</strong>
            </div>
          )}
        </div>
      )}

      {/* Tabela de sensibilidade */}
      {calc.valida && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Sensibilidade por Stake</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Stake Total', 'Stake Casa 1', 'Stake Casa 2', 'Lucro', 'ROI'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0.5, 1, 1.5, 2, 3, 5].map(mult => {
                const st = s * mult
                const c = calcularArbitragem(o1, o2, st)
                const isBase = mult === 1
                return (
                  <tr key={mult} className="table-row" style={{ background: isBase ? 'rgba(0,230,118,0.04)' : undefined }}>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: isBase ? 700 : 400 }}>{formatBRL(st)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-cyan)' }}>{formatBRL(c.stake1)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-purple)' }}>{formatBRL(c.stake2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-green)', fontWeight: 600 }}>{formatBRL(c.lucro_garantido)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-green)' }}>{formatPercent(c.roi)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ResultBox({ label, value, pct, color }: { label: string; value: string; pct?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      {pct && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pct}</div>}
    </div>
  )
}
