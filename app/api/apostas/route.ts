import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const casa = searchParams.get('casa')
  const inicio = searchParams.get('inicio')
  const fim = searchParams.get('fim')

  let query = supabase
    .from('apostas')
    .select(`
      *,
      casa1:casas!apostas_casa1_id_fkey(id, nome),
      casa2:casas!apostas_casa2_id_fkey(id, nome)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'todos') {
    query = query.eq('status', status)
  }
  if (casa) {
    query = query.or(`casa1_id.eq.${casa},casa2_id.eq.${casa}`)
  }
  if (inicio) {
    query = query.gte('created_at', inicio)
  }
  if (fim) {
    query = query.lte('created_at', fim)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    evento,
    data_jogo,
    casa1_id,
    casa1_mercado,
    casa1_selecao,
    casa1_odd,
    casa1_stake,
    casa2_id,
    casa2_mercado,
    casa2_selecao,
    casa2_odd,
    casa2_stake,
    total_apostado,
    lucro,
    roi,
    status,
    observacao,
    tipo,
  } = body

  const { data, error } = await supabase
    .from('apostas')
    .insert({
      evento,
      data_jogo,
      casa1_id,
      casa1_mercado,
      casa1_selecao,
      casa1_odd,
      casa1_stake,
      casa2_id: casa2_id || null,
      casa2_mercado: casa2_mercado || null,
      casa2_selecao: casa2_selecao || null,
      casa2_odd: casa2_odd || null,
      casa2_stake: casa2_stake || null,
      total_apostado,
      lucro: lucro || 0,
      roi: roi || 0,
      status: status || 'pendente',
      observacao,
      tipo: tipo || 'arbitragem',
    })
    .select(`
      *,
      casa1:casas!apostas_casa1_id_fkey(id, nome),
      casa2:casas!apostas_casa2_id_fkey(id, nome)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
