import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = url && serviceRole ? createClient(url, serviceRole, { auth: { persistSession: false } }) : null

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const body = await request.json()
  const thresholdRate = Number(body.thresholdRate ?? 0)
  const payload = {
    user_id: null,
    pair: body.pair,
    exchange: body.exchange?.toLowerCase(),
    threshold_rate: thresholdRate,
    channel: body.channel,
    status: 'active',
  }

  const { error } = await supabase.from('alerts').insert(payload)
  if (error) {
    console.error('Failed to create alert', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
