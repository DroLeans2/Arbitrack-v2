import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('casas')
    .select('*')
    .order('nome')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('casas')
    .insert([{ nome: body.nome, ativa: true, saldo_atual: body.saldo_inicial || 0 }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.saldo_inicial && body.saldo_inicial > 0) {
    await supabase.from('movimentacoes').insert([{
      casa_id: data.id,
      tipo: 'deposito',
      valor: body.saldo_inicial,
      descricao: 'Saldo inicial',
    }])
  }
  return NextResponse.json(data, { status: 201 })
}
