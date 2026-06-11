'use client'
import { useState } from 'react'
import type { Aposta } from '@/types'
import { formatBRL, formatPercent, formatDate } from '@/lib/utils'

export default function ExportButton({ apostas }: { apostas: Aposta[] }) {
  const [open, setOpen] = useState(false)

  const exportCSV = () => {
    const headers = ['Data', 'Evento', 'Modalidade', 'Casa 1', 'Odd 1', 'Stake 1', 'Mercado 1', 'Casa 2', 'Odd 2', 'Stake 2', 'Mercado 2', 'Total', 'Lucro', 'ROI', 'Status']
    const rows = apostas.map(a => [
      formatDate(a.created_at),
      a.evento,
      a.modalidade || '',
      a.casa1?.nome || '',
      a.casa1_odd || '',
      a.casa1_stake || '',
      a.casa1_mercado || '',
      a.casa2?.nome || '',
      a.casa2_odd || '',
      a.casa2_stake || '',
      a.casa2_mercado || '',
      a.total_apostado || '',
      a.lucro ?? '',
      a.roi ?? '',
      a.status,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arbitrack_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    setOpen(false)
  }

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(16)
    doc.text('ArbiTrack — Relatório de Apostas', 14, 16)
    doc.setFontSize(10)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 23)

    autoTable(doc, {
      startY: 28,
      head: [['Data', 'Evento', 'Casa 1', 'Casa 2', 'Total', 'Lucro', 'ROI', 'Status']],
      body: apostas.map(a => [
        formatDate(a.created_at),
        a.evento,
        a.casa1?.nome || '',
        a.casa2?.nome || '',
        formatBRL(a.total_apostado),
        a.lucro != null ? formatBRL(a.lucro) : '—',
        a.roi != null ? formatPercent(a.roi) : '—',
        a.status.toUpperCase(),
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [0, 180, 100] },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    })

    doc.save(`arbitrack_${new Date().toISOString().slice(0,10)}.pdf`)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn-secondary" onClick={() => setOpen(!open)}>↓ Exportar</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 20, overflow: 'hidden', minWidth: 140 }}>
          <button onClick={exportCSV} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >📊 CSV</button>
          <button onClick={exportPDF} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >📄 PDF</button>
        </div>
      )}
    </div>
  )
}
