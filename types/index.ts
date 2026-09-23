export type StatusAposta = 'pending' | 'green' | 'red' | 'void'

export interface Casa {
  id: string
  nome: string
  ativa: boolean
  saldo_atual: number
  created_at: string
  updated_at: string
}

export interface Aposta {
  id: string
  evento: string
  modalidade: string | null
  data_evento: string | null
  casa1_id: string
  casa1_mercado: string | null
  casa1_selecao: string | null
  casa1_odd: number
  casa1_stake: number
  casa2_id: string | null
  casa2_mercado: string | null
  casa2_selecao: string | null
  casa2_odd: number | null
  casa2_stake: number | null
  total_apostado: number
  lucro: number | null
  roi: number | null
  status: StatusAposta
  casa_vencedora: 1 | 2 | null
  notas: string | null
  grupo_evento: string | null
  created_at: string
  updated_at: string
  casa1?: Casa
  casa2?: Casa
}

export interface Movimentacao {
  id: string
  casa_id: string
  tipo: 'deposito' | 'saque' | 'ajuste'
  valor: number
  descricao: string | null
  created_at: string
  casa?: Casa
}

export interface DashboardStats {
  saldo_total: number
  lucro_liquido: number
  roi_medio: number
  total_apostado: number
  total_green: number
  total_red: number
  total_pending: number
}

export interface ResultadoCalc {
  stake1: number
  stake2: number
  lucro_garantido: number
  roi: number
  valida: boolean
}