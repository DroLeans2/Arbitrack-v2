'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DatePicker from '@/components/DatePicker'

interface Casa {
  id: string
  nome: string
  saldo_atual: number
  ativa: boolean
}

type TabType = 'arbitragem' | 'individual'
export default function NovaApostaPage() {
  const router = useRouter()
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<TabType>('arbitragem')

  const [casa1Id, setCasa1Id] = useState('')
  const [casa1Mercado, setCasa1Mercado] = useState('')
  const [casa1Selecao, setCasa1Selecao] = useState('')
  const [casa1Odd, setCasa1Odd] = useState('')
  const [casa1Stake, setCasa1Stake] = useState('')
  const [casa2Id, setCasa2Id] = useState('')
  const [casa2Mercado, setCasa2Mercado] = useState('')
  const [casa2Selecao, setCasa2Selecao] = useState('')
  const [casa2Odd, setCasa2Odd] = useState('')
  const [casa2Stake, setCasa2Stake] = useState('')
  const [stakeTotal, setStakeTotal] = useState('')

  const [indCasaId, setIndCasaId] = useState('')
  const [indMercado, setIndMercado] = useState('')
  const [indSelecao, setIndSelecao] = useState('')
  const [indOdd, setIndOdd] = useState('')
  const [indStake, setIndStake] = useState('')
  const [indResultado, setIndResultado] = useState<'pendente' | 'green' | 'red' | 'void'>('pendente')
  const [indLucro, setIndLucro] = useState('')

  const [evento, setEvento] = useState('')
  const [dataJogo, setDataJogo] = useState<Date | null>(null)
  const [observacao, setObservacao] = useState('')
  const odd1 = parseFloat(casa1Odd) || 0
  const odd2 = parseFloat(casa2Odd) || 0
  const stake1 = parseFloat(casa1Stake) || 0
  const stake2 = parseFloat(casa2Stake) || 0
  const total = stake1 + stake2
  const margem = odd1 > 0 && odd2 > 0 ? (1 / odd1 + 1 / odd2) : 0
  const isArb = margem > 0 && margem < 1
  const retorno1 = stake1 * odd1
  const retorno2 = stake2 * odd2
  const lucroGarantido = isArb && retorno1 > 0 && retorno2 > 0
    ? Math.min(retorno1, retorno2) - total
    : 0
  const roi = total > 0 && lucroGarantido !== 0 ? (lucroGarantido / total) * 100 : 0

  const indOddNum = parseFloat(indOdd) || 0
  const indStakeNum = parseFloat(indStake) || 0
  const indRetorno = indOddNum > 0 ? indStakeNum * indOddNum : 0
  const indLucroCalc = indRetorno - indStakeNum

  useEffect(() => {
    fetch('/api/casas').then(r => r.json()).then(d => setCasas(d.filter((c: Casa) => c.ativa)))
  }, [])

  function autoDistribuir() {
    if (odd1 <= 0 || odd2 <= 0) return
    const total = parseFloat(stakeTotal) || 0
    if (total <= 0) return
    const s1 = (total / odd1) / (1 / odd1 + 1 / odd2)
    const s2 = total - s1
    setCasa1Stake(s1.toFixed(2))
    setCasa2Stake(s2.toFixed(2))
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'arbitragem') {
        const body = {
          evento,
          data_jogo: dataJogo?.toISOString() || null,
          casa1_id: casa1Id,
          casa1_mercado: casa1Mercado,
          casa1_selecao: casa1Selecao,
          casa1_odd: odd1,
          casa1_stake: stake1,
          casa2_id: casa2Id,
          casa2_mercado: casa2Mercado,
          casa2_selecao: casa2Selecao,
          casa2_odd: odd2,
          casa2_stake: stake2,
          total_apostado: total,
          lucro: 0,
          roi: 0,
          status: 'pendente',
          observacao,
          tipo: 'arbitragem',
        }
        await fetch('/api/apostas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        const lucroFinal = indResultado === 'green'
          ? (parseFloat(indLucro) || indLucroCalc)
          : indResultado === 'red' ? -indStakeNum
          : indResultado === 'void' ? 0 : 0
        const roiFinal = indStakeNum > 0 ? (lucroFinal / indStakeNum) * 100 : 0
        const body = {
          evento,
          data_jogo: dataJogo?.toISOString() || null,
          casa1_id: indCasaId,
          casa1_mercado: indMercado,
          casa1_selecao: indSelecao,
          casa1_odd: indOddNum,
          casa1_stake: indStakeNum,
          casa2_id: null,
          casa2_mercado: null,
          casa2_selecao: null,
          casa2_odd: null,
          casa2_stake: null,
          total_apostado: indStakeNum,
          lucro: lucroFinal,
          roi: roiFinal,
          status: indResultado,
          observacao,
          tipo: 'individual',
        }
        await fetch('/api/apostas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      router.push('/apostas')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/apostas" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>
          ← Voltar
        </Link>
        <h1 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700 }}>Nova Aposta</h1>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', borderRadius: 10, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        <button type="button" onClick={() => setTab('arbitragem')} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === 'arbitragem' ? 'var(--accent-green)' : 'transparent', color: tab === 'arbitragem' ? '#000' : 'var(--text-muted)', transition: 'all 0.15s' }}>
          ⚡ Arbitragem
        </button>
        <button type="button" onClick={() => setTab('individual')} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === 'individual' ? '#7c3aed' : 'transparent', color: tab === 'individual' ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
          🎯 Aposta Individual
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Evento / Jogo</label>
            <input style={inputStyle} value={evento} onChange={e => setEvento(e.target.value)} placeholder="Ex: Flamengo vs Vasco" />
          </div>
          <div>
            <label style={labelStyle}>Data do Jogo</label>
            <DatePicker value={dataJogo} onChange={setDataJogo} />
          </div>
        </div>

        {tab === 'arbitragem' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #06b6d433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }} />
                  <span style={{ fontWeight: 700, color: '#06b6d4' }}>Casa 1</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Casa de Apostas</label>
                    <select style={inputStyle} value={casa1Id} onChange={e => setCasa1Id(e.target.value)} required>
                      <option value="">Selecionar...</option>
                      {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mercado</label>
                    <input style={inputStyle} value={casa1Mercado} onChange={e => setCasa1Mercado(e.target.value)} placeholder="Ex: Resultado Final" />
                  </div>
                  <div>
                    <label style={labelStyle}>Seleção</label>
                    <input style={inputStyle} value={casa1Selecao} onChange={e => setCasa1Selecao(e.target.value)} placeholder="Ex: Time A" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Odd</label>
                      <input style={inputStyle} type="number" step="0.01" value={casa1Odd} onChange={e => setCasa1Odd(e.target.value)} placeholder="2.10" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor (R$)</label>
                      <input style={inputStyle} type="number" step="0.01" value={casa1Stake} onChange={e => setCasa1Stake(e.target.value)} placeholder="100.00" required />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #7c3aed33', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }} />
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>Casa 2</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Casa de Apostas</label>
                    <select style={inputStyle} value={casa2Id} onChange={e => setCasa2Id(e.target.value)} required>
                      <option value="">Selecionar...</option>
                      {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mercado</label>
                    <input style={inputStyle} value={casa2Mercado} onChange={e => setCasa2Mercado(e.target.value)} placeholder="Ex: Resultado Final" />
                  </div>
                  <div>
                    <label style={labelStyle}>Seleção</label>
                    <input style={inputStyle} value={casa2Selecao} onChange={e => setCasa2Selecao(e.target.value)} placeholder="Ex: Empate / Time B" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Odd</label>
                      <input style={inputStyle} type="number" step="0.01" value={casa2Odd} onChange={e => setCasa2Odd(e.target.value)} placeholder="1.95" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor (R$)</label>
                      <input style={inputStyle} type="number" step="0.01" value={casa2Stake} onChange={e => setCasa2Stake(e.target.value)} placeholder="100.00" required />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Total Apostado</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>R$ {total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Lucro Garantido</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: isArb ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {isArb ? `R$ ${lucroGarantido.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>ROI</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: isArb ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {isArb ? `${roi.toFixed(2)}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Margem</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: isArb ? 'var(--accent-green)' : '#ef4444' }}>
                      {margem > 0 ? `${(margem * 100).toFixed(2)}%` : '—'}
                      {isArb && <span style={{ fontSize: 11, marginLeft: 6, background: '#00e67622', color: 'var(--accent-green)', borderRadius: 4, padding: '2px 6px' }}>ARB</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input style={{ ...inputStyle, width: 120 }} type="number" step="0.01" value={stakeTotal} onChange={e => setStakeTotal(e.target.value)} placeholder="Total R$" />
                  <button type="button" onClick={autoDistribuir} style={{ padding: '10px 16px', background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 }}>
                    Auto-distribuir
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {tab === 'individual' && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #7c3aed44', borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }} />
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>Detalhes da Aposta</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Casa de Apostas</label>
                  <select style={inputStyle} value={indCasaId} onChange={e => setIndCasaId(e.target.value)} required>
                    <option value="">Selecionar...</option>
                    {casas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Mercado</label>
                    <input style={inputStyle} value={indMercado} onChange={e => setIndMercado(e.target.value)} placeholder="Ex: Resultado Final" />
                  </div>
                  <div>
                    <label style={labelStyle}>Seleção</label>
                    <input style={inputStyle} value={indSelecao} onChange={e => setIndSelecao(e.target.value)} placeholder="Ex: Time A vence" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Odd</label>
                    <input style={inputStyle} type="number" step="0.01" value={indOdd} onChange={e => setIndOdd(e.target.value)} placeholder="2.50" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Valor Apostado (R$)</label>
                    <input style={inputStyle} type="number" step="0.01" value={indStake} onChange={e => setIndStake(e.target.value)} placeholder="100.00" required />
                  </div>
                </div>
                {indOddNum > 0 && indStakeNum > 0 && (
                  <div style={{ display: 'flex', gap: 24, padding: '14px 18px', background: '#7c3aed11', borderRadius: 8, border: '1px solid #7c3aed33' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Retorno Potencial</div>
                      <div style={{ fontWeight: 700, color: '#a78bfa' }}>R$ {indRetorno.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Lucro Potencial</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>R$ {indLucroCalc.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Resultado (opcional — pode preencher depois)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['pendente', 'green', 'red', 'void'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setIndResultado(r)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13, borderColor: indResultado === r ? r === 'green' ? 'var(--accent-green)' : r === 'red' ? '#ef4444' : r === 'void' ? '#f59e0b' : 'var(--border)' : 'var(--border)', background: indResultado === r ? r === 'green' ? '#00e67622' : r === 'red' ? '#ef444422' : r === 'void' ? '#f59e0b22' : '#ffffff11' : 'transparent', color: indResultado === r ? r === 'green' ? 'var(--accent-green)' : r === 'red' ? '#ef4444' : r === 'void' ? '#f59e0b' : 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {r === 'pendente' ? '⏳ Pendente' : r === 'green' ? '✅ Green' : r === 'red' ? '❌ Red' : '↩️ Void'}
                      </button>
                    ))}
                  </div>
                </div>
                {indResultado === 'green' && (
                  <div>
                    <label style={labelStyle}>Lucro Real (R$) — deixe vazio para usar o calculado</label>
                    <input style={inputStyle} type="number" step="0.01" value={indLucro} onChange={e => setIndLucro(e.target.value)} placeholder={indLucroCalc.toFixed(2)} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Observação</label>
          <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Notas adicionais..." />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} style={{ padding: '12px 32px', background: tab === 'individual' ? '#7c3aed' : 'var(--accent-green)', color: tab === 'individual' ? '#fff' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Salvando...' : 'Salvar Aposta'}
          </button>
          <Link href="/apostas" style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}