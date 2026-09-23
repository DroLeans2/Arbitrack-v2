import type { ResultadoCalc } from '@/types'

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcularArbitragem(
  odd1: number,
  odd2: number,
  stakeTotal: number
): ResultadoCalc {
  if (!odd1 || !odd2 || !stakeTotal || odd1 <= 1 || odd2 <= 1) {
    return { stake1: 0, stake2: 0, lucro_garantido: 0, roi: 0, valida: false }
  }

  const margem = 1 / odd1 + 1 / odd2
  const valida = margem < 1

  const stake1 = stakeTotal / (odd1 * margem)
  const stake2 = stakeTotal / (odd2 * margem)

  const retorno1 = stake1 * odd1
  const retorno2 = stake2 * odd2
  const lucro_garantido = Math.min(retorno1, retorno2) - stakeTotal
  const roi = (lucro_garantido / stakeTotal) * 100

  return {
    stake1: Math.round(stake1 * 100) / 100,
    stake2: Math.round(stake2 * 100) / 100,
    lucro_garantido: Math.round(lucro_garantido * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    valida,
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    green: 'Green',
    red: 'Red',
    void: 'Void',
  }
  return map[status] || status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    green: 'text-green-400 bg-green-400/10 border-green-400/30',
    red: 'text-red-400 bg-red-400/10 border-red-400/30',
    void: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  }
  return map[status] || ''
}
