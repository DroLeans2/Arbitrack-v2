'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string // datetime-local format: "2026-06-11T15:30"
  onChange: (val: string) => void
  placeholder?: string
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function DatePicker({ value, onChange, placeholder = 'Selecionar data...' }: Props) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value)
    return new Date()
  })
  const [hora, setHora] = useState(() => {
    if (value) {
      const d = new Date(value)
      return { h: String(d.getHours()).padStart(2, '0'), m: String(d.getMinutes()).padStart(2, '0') }
    }
    return { h: '12', m: '00' }
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedDate = value ? new Date(value) : null

  const ano = viewDate.getFullYear()
  const mes = viewDate.getMonth()

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const diasAnterior = new Date(ano, mes, 0).getDate()

  const cells: { day: number; current: boolean }[] = []
  for (let i = primeiroDia - 1; i >= 0; i--) cells.push({ day: diasAnterior - i, current: false })
  for (let i = 1; i <= diasNoMes; i++) cells.push({ day: i, current: true })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - diasNoMes - primeiroDia + 1, current: false })

  const selectDay = (day: number) => {
    const d = new Date(ano, mes, day, parseInt(hora.h), parseInt(hora.m))
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${hora.h}:${hora.m}`
    onChange(iso)
  }

  const updateHora = (field: 'h' | 'm', val: string) => {
    const newHora = { ...hora, [field]: val.padStart(2, '0') }
    setHora(newHora)
    if (selectedDate) {
      const d = new Date(selectedDate)
      d.setHours(parseInt(newHora.h), parseInt(newHora.m))
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${newHora.h}:${newHora.m}`
      onChange(iso)
    }
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day && selectedDate.getMonth() === mes && selectedDate.getFullYear() === ano
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === mes && today.getFullYear() === ano
  }

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2,'0')}/${String(selectedDate.getMonth()+1).padStart(2,'0')}/${selectedDate.getFullYear()} ${hora.h}:${hora.m}`
    : ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="input"
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
      >
        <span style={{ color: displayValue ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {displayValue || placeholder}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>📅</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14,
          padding: 20,
          width: 300,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Header mês/ano */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              onClick={() => setViewDate(new Date(ano, mes - 1, 1))}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >‹</button>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{MESES[mes]} {ano}</span>
            <button
              onClick={() => setViewDate(new Date(ano, mes + 1, 1))}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >›</button>
          </div>

          {/* Dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DIAS_SEMANA.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Células */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((cell, i) => {
              const sel = cell.current && isSelected(cell.day)
              const today = cell.current && isToday(cell.day)
              return (
                <button
                  key={i}
                  onClick={() => cell.current && selectDay(cell.day)}
                  style={{
                    background: sel ? 'var(--accent-green)' : today ? 'rgba(0,230,118,0.1)' : 'transparent',
                    border: today && !sel ? '1px solid var(--accent-green)' : '1px solid transparent',
                    borderRadius: 6,
                    color: sel ? '#000' : cell.current ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: sel ? 700 : today ? 600 : 400,
                    padding: '6px 0',
                    cursor: cell.current ? 'pointer' : 'default',
                    opacity: cell.current ? 1 : 0.3,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (cell.current && !sel) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                  onMouseLeave={e => { if (cell.current && !sel) e.currentTarget.style.background = 'transparent' }}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* Horário */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>Horário</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                min={0} max={23}
                value={hora.h}
                onChange={e => updateHora('h', String(Math.min(23, Math.max(0, parseInt(e.target.value) || 0))).padStart(2,'0'))}
                style={{ width: 46, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, textAlign: 'center', outline: 'none' }}
              />
              <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>:</span>
              <input
                type="number"
                min={0} max={59}
                value={hora.m}
                onChange={e => updateHora('m', String(Math.min(59, Math.max(0, parseInt(e.target.value) || 0))).padStart(2,'0'))}
                style={{ width: 46, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, textAlign: 'center', outline: 'none' }}
              />
            </div>
          </div>

          {/* Rodapé */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
            >Limpar</button>
            <button
              onClick={() => {
                const today = new Date()
                selectDay(today.getDate())
                setViewDate(today)
                setOpen(false)
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}
            >Hoje</button>
          </div>
        </div>
      )}
    </div>
  )
}
