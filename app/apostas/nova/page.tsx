'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { calcularArbitragem, formatBRL, formatPercent } from '@/lib/utils'
import type { Casa } from '@/types'

export default function NovaApostaPage() {
  const router = useRouter()
  const [casas, setCasas] = useState<Casa[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    evento: '', modalidade: '', data_evento: '',
    casa1_id: '', casa1_mercado: '', casa1_odd: '',casa1_stake: '',
    casa2_id: '', casa2_mercado: '', casa2_odd: '', casa2_stake: '',
    stakeTotal: '', notas: '', grupo_evento: '',
  })

  useEffect(() => { fetch('/api/casas').then(r => r.json()).then(setCasas) }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const odd1 = parseFloat(form.casa1_odd) || 0
  const odd2 = parseFloat(form.casa2_odd) || 0
  const stakeTotal = parseFloat(form.stakeTotal) || 0
  const calc = calcularArbitragem(odd1, odd2, stakeTotal)

  const autoFill = () => {
    if (calc.valida) {
      setForm(f => ({ ...f, casa1_stake: calc.stake1.toFixed(2), casa2_stake: calc.stake2.toFixed(2) }))
    }
  }

  const salvar = async () => {
    if (!form.evento || !form.casa1_id || !form.casa2_id) {
      alert('Preencha evento e as duas casas')
      return
    }
    setSaving(true)
    const stake1 = parseFloat(form.casa1_stake) || calc.stake1
    const stake2 = parseFloat(form.casa2_stake) || calc.stake2
    const total = stake1 + stake2

    await fetch('/api/apostas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: form.evento,
        modalidade: form.modalidade || null,
        data_evento: form.data_evento || null,
        casa1_id: form.casa1_id,
        casa1_mercado: form.casa1_mercado || null,
        casa1_odd: odd1 || null,
        casa1_stake: stake1,
        casa2_id: form.casa2_id,
        casa2_mercado: form.casa2_mercado || null,
        casa2_odd: odd2 || null,
        casa2_stake: stake2,
        total_apostado: total,
        status: 'pending',
        notas: form.notas || null,
        grupo_evento: form.grupo_evento || form.evento,
      }),
    })
    router.push('/apostas')
  }

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={() => router.back()}>← Voltar</button>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }}>Nova Arbitragem</h1>
      </div>

      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Evento */}
        <div>
          <label className="label">Evento *</label>
          <input className="input" placeholder="Ex: Flamengo vs Palmeiras" value={form.evento} onChange={e => set('evento', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Modalidade</label>
            <input className="input" placeholder="Ex: Futebol, CS2, Tênis..." value={form.modalidade} onChange={e => set('modalidade', e.target.value)} />
          </div>
          <div>
            <label className="label">Data do Evento</label>
            <input className="input" type="datetime-local" value={form.data_evento} onChange={e => set('data_evento', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Grupo / Evento Pai</label>
          <input className="input" placeholder="Para agrupar apostas do mesmo evento" value={form.grupo_evento} onChange={e => set('grupo_evento', e.target.value)} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Stake total e calculadora */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Stake Total (R$)</label>
            <input className="input" type="number" placeholder="0.00" value={form.stakeTotal} onChange={e => set('stakeTotal', e.target.value)} />
          </div>
          <button className="btn-secondary" onClick={autoFill} disabled={!calc.valida}>
            ⚡ Auto-distribuir
          </button>
        </div>

        {/* Preview calculadora */}
        {odd1 > 0 && odd2 > 0 && stakeTotal > 0 && (
          <div style={{ background: calc.valida ? 'rgba(0,230,118,0.06)' : 'rgba(255,82,82,0.06)', border: `1px solid ${calc.valida ? 'rgba(0,230,118,0.2)' : 'rgba(255,82,82,0.2)'}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <CalcStat label="Stake Casa 1" value={formatBRL(calc.stake1)} />
              <CalcStat label="Stake Casa 2" value={formatBRL(calc.stake2)} />
              <CalcStat label="Lucro Garantido" value={formatBRL(calc.lucro_garantido)} color={calc.valida ? 'var(--accent-green)' : 'var(--accent-red)'} />
              <CalcStat label="ROI" value={formatPercent(calc.roi)} color={calc.valida ? 'var(--accent-green)' : 'var(--accent-red)'} />
            </div>
            {!calc.valida && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--accent-red)' }}>⚠ Odds sem arbitragem (margem ≥ 100%)</p>}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Casa 1 */}
        <div>
          <label className="label" style={{ color: 'var(--accent-cyan)' }}>Casa 1</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Casa *</label>
              <select className="select" value={form.casa1_id} onChange={e => set('casa1_id', e.target.value)}>
                <option value="">Selecione...</option>
                {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Odd</label>
              <input className="input" type="number" step="0.001" placeholder="0.000" value={form.casa1_odd} onChange={e => set('casa1_odd', e.target.value)} />
            </div>
            <div>
              <label className="label">Stake (R$)</label>
              <input className="input" type="number" placeholder="0.00" value={form.casa1_stake} onChange={e => set('casa1_stake', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Mercado / Seleção</label>
            <input className="input" placeholder="Ex: Vencedor — Time A" value={form.casa1_mercado} onChange={e => set('casa1_mercado', e.target.value)} />
          </div>
        </div>

        {/* Casa 2 */}
        <div>
          <label className="label" style={{ color: 'var(--accent-purple)' }}>Casa 2</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Casa *</label>
              <select className="select" value={form.casa2_id} onChange={e => set('casa2_id', e.target.value)}>
                <option value="">Selecione...</option>
                {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Odd</label>
              <input className="input" type="number" step="0.001" placeholder="0.000" value={form.casa2_odd} onChange={e => set('casa2_odd', e.target.value)} />
            </div>
            <div>
              <label className="label">Stake (R$)</label>
              <input className="input" type="number" placeholder="0.00" value={form.casa2_stake} onChange={e => set('casa2_stake', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Mercado / Seleção</label>
            <input className="input" placeholder="Ex: Vencedor — Time B" value={form.casa2_mercado} onChange={e => set('casa2_mercado', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea className="input" rows={3} placeholder="Observações opcionais..." value={form.notas} onChange={e => set('notas', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" onClick={salvar} disabled={saving}>
            {saving ? 'Salvando...' : '✓ Registrar Aposta'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CalcStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
