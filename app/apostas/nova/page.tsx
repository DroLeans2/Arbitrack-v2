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
    evento: '',
    modalidade: '',
    data_evento: '',
    casa1_id: '',
    casa1_mercado: '',
    casa1_odd: '2.500',
    casa1_stake: '100.00',
    casa2_id: '',
    casa2_mercado: '',
    casa2_odd: '2.500',
    casa2_stake: '100.00',
    notas: '',
    grupo_evento: '',
  })

  useEffect(() => { fetch('/api/casas').then(r => r.json()).then(setCasas) }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const odd1 = parseFloat(form.casa1_odd) || 0
  const odd2 = parseFloat(form.casa2_odd) || 0
  const stake1 = parseFloat(form.casa1_stake) || 0
  const stake2 = parseFloat(form.casa2_stake) || 0
  const stakeTotal = stake1 + stake2
  const calc = calcularArbitragem(odd1, odd2, stakeTotal)

  const autoDistribuir = () => {
    if (!stakeTotal || odd1 <= 1 || odd2 <= 1) return
    const c = calcularArbitragem(odd1, odd2, stakeTotal)
    if (c.valida) {
      set('casa1_stake', c.stake1.toFixed(2))
      set('casa2_stake', c.stake2.toFixed(2))
    }
  }

  const salvar = async () => {
    if (!form.evento || !form.casa1_id || !form.casa2_id) {
      alert('Preencha jogo e as duas casas')
      return
    }
    setSaving(true)
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
        total_apostado: stakeTotal,
        status: 'pending',
        notas: form.notas || null,
        grupo_evento: form.grupo_evento || form.evento,
      }),
    })
    router.push('/apostas')
  }

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <button className="btn-secondary" style={{ marginBottom: 20 }} onClick={() => router.back()}>← Voltar</button>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-green)', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Arbitragem
        </button>
        <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: 500, fontSize: 14, cursor: 'not-allowed' }}>
          Aposta Individual
        </button>
      </div>

      <div className="card" style={{ padding: 28 }}>
        {/* Título */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
          Registrar Nova Arbitragem
        </div>

        {/* Linha 1: Jogo, Esporte, Data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 16, marginBottom: 20 }}>
          <div>
            <label className="label">Jogo *</label>
            <input className="input" placeholder="Ex: Flamengo vs Palmeiras" value={form.evento} onChange={e => set('evento', e.target.value)} />
          </div>
          <div>
            <label className="label">Esporte</label>
            <input className="input" placeholder="Ex: Futebol, Tennis..." value={form.modalidade} onChange={e => set('modalidade', e.target.value)} />
          </div>
          <div>
            <label className="label">Data do Jogo *</label>
            <input className="input" type="datetime-local" value={form.data_evento} onChange={e => set('data_evento', e.target.value)} />
          </div>
        </div>

        {/* Casas lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Casa 1 */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Casa 1</div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">Casa *</label>
              <select className="select" value={form.casa1_id} onChange={e => set('casa1_id', e.target.value)}>
                <option value="">Selecione...</option>
                {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">Mercado / Seleção *</label>
              <input className="input" placeholder="Ex: Over 2.5..." value={form.casa1_mercado} onChange={e => set('casa1_mercado', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Odd *</label>
                <input className="input" type="number" step="0.001" value={form.casa1_odd} onChange={e => set('casa1_odd', e.target.value)} style={{ fontWeight: 700, fontSize: 16 }} />
              </div>
              <div>
                <label className="label">Valor (R$) *</label>
                <input className="input" type="number" step="0.01" value={form.casa1_stake} onChange={e => set('casa1_stake', e.target.value)} style={{ fontWeight: 700, fontSize: 16 }} />
              </div>
            </div>
          </div>

          {/* Casa 2 */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Casa 2</div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">Casa *</label>
              <select className="select" value={form.casa2_id} onChange={e => set('casa2_id', e.target.value)}>
                <option value="">Selecione...</option>
                {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">Mercado / Seleção *</label>
              <input className="input" placeholder="Ex: Under 2.5..." value={form.casa2_mercado} onChange={e => set('casa2_mercado', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Odd *</label>
                <input className="input" type="number" step="0.001" value={form.casa2_odd} onChange={e => set('casa2_odd', e.target.value)} style={{ fontWeight: 700, fontSize: 16 }} />
              </div>
              <div>
                <label className="label">Valor (R$) *</label>
                <input className="input" type="number" step="0.01" value={form.casa2_stake} onChange={e => set('casa2_stake', e.target.value)} style={{ fontWeight: 700, fontSize: 16 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Preview arbitragem */}
        {odd1 > 1 && odd2 > 1 && stakeTotal > 0 && (
          <div style={{
            marginBottom: 20,
            padding: '14px 18px',
            borderRadius: 10,
            background: calc.valida ? 'rgba(0,230,118,0.06)' : 'rgba(255,82,82,0.06)',
            border: `1px solid ${calc.valida ? 'rgba(0,230,118,0.2)' : 'rgba(255,82,82,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <PreviewStat label="Total" value={formatBRL(stakeTotal)} />
              <PreviewStat label="Lucro Garantido" value={calc.valida ? formatBRL(calc.lucro_garantido) : '—'} color={calc.valida ? 'var(--accent-green)' : undefined} />
              <PreviewStat label="ROI" value={calc.valida ? formatPercent(calc.roi) : '—'} color={calc.valida ? 'var(--accent-green)' : undefined} />
              <PreviewStat label="Margem" value={calc.valida ? `${((1/odd1 + 1/odd2)*100).toFixed(2)}%` : '—'} color={calc.valida ? 'var(--accent-green)' : 'var(--accent-red)'} />
            </div>
            {calc.valida && (
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={autoDistribuir}>
                ⚡ Auto-distribuir
              </button>
            )}
          </div>
        )}

        {/* Observação */}
        <div style={{ marginBottom: 24 }}>
          <label className="label">Observação</label>
          <textarea className="input" rows={3} placeholder="Notas opcionais..." value={form.notas} onChange={e => set('notas', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={salvar} disabled={saving} style={{ padding: '10px 28px', fontSize: 15 }}>
            {saving ? 'Salvando...' : '💾 Salvar'}
          </button>
          <button className="btn-secondary" onClick={() => router.back()} style={{ padding: '10px 20px', fontSize: 15 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
