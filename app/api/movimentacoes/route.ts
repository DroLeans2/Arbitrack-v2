import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const casa = searchParams.get('casa')

  let query = supabase
    .from('movimentacoes')
    .select('*, casa:casas(id,nome)')
    .order('created_at', { ascending: false })

  if (casa && casa !== 'todos') query = query.eq('casa_id', casa)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('movimentacoes')
    .insert([{ casa_id: body.casa_id, tipo: body.tipo, valor: body.valor, descricao: body.descricao }])
    .select('*, casa:casas(id,nome)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
