import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeExchange } from '@/lib/exchanges'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = url && serviceRole ? createClient(url, serviceRole, { auth: { persistSession: false } }) : null
const CHANNELS = new Set(['email', 'telegram'])

function isUuid(value: unknown) {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const body = await request.json()
  const userId = body.userId
  if (!isUuid(userId)) {
    return NextResponse.json({ error: 'Missing user context' }, { status: 400 })
  }

  const thresholdRate = Number(body.thresholdRate ?? 0)
  const normalizedExchange = normalizeExchange(body.exchange ?? '')
  const pair = typeof body.pair === 'string' ? body.pair : ''
  if (!pair || !normalizedExchange) {
    return NextResponse.json({ error: 'Pair and exchange required' }, { status: 400 })
  }
  const requestedChannel = typeof body.channel === 'string' ? body.channel.toLowerCase() : 'email'
  const channel = CHANNELS.has(requestedChannel) ? requestedChannel : 'email'

  const payload = {
    user_id: userId,
    pair,
    exchange: normalizedExchange,
    threshold_rate: thresholdRate,
    channel,
    status: 'active',
  }

  const { error, data } = await supabase.from('alerts').insert(payload).select('id').single()
  if (error || !data) {
    console.error('Failed to create alert', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, alertId: data.id })
}
