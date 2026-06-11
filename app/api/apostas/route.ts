import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const casa = searchParams.get('casa')
  const inicio = searchParams.get('inicio')
  const fim = searchParams.get('fim')

  let query = supabase
    .from('apostas')
    .select('*, casa1:casas!apostas_casa1_id_fkey(id,nome), casa2:casas!apostas_casa2_id_fkey(id,nome)')
    .order('created_at', { ascending: false })

  if (status && status !== 'todos') query = query.eq('status', status)
  if (casa && casa !== 'todos') query = query.or(`casa1_id.eq.${casa},casa2_id.eq.${casa}`)
  if (inicio) query = query.gte('created_at', inicio)
  if (fim) query = query.lte('created_at', fim)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('apostas')
    .insert([body])
    .select('*, casa1:casas!apostas_casa1_id_fkey(id,nome), casa2:casas!apostas_casa2_id_fkey(id,nome)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
