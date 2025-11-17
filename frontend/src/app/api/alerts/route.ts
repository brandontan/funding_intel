import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeExchange, toExchangeLabel } from '@/lib/exchanges'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = url && serviceRole ? createClient(url, serviceRole, { auth: { persistSession: false } }) : null
const CHANNELS = new Set(['email', 'telegram'])
const STATUSES = new Set(['active', 'paused'])

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

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!isUuid(userId)) {
    return NextResponse.json({ error: 'Missing user context' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('id, pair, exchange, threshold_rate, channel, status, last_triggered_at, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Failed to load alerts', error)
    return NextResponse.json({ error: 'Failed to load alerts' }, { status: 500 })
  }

  return NextResponse.json({ alerts: data.map(mapAlertRow) })
}

export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const body = await request.json()
  const userId = body.userId
  const alertId = Number(body.alertId)
  if (!isUuid(userId) || !Number.isInteger(alertId)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.thresholdRate === 'number' && !Number.isNaN(body.thresholdRate)) {
    updates.threshold_rate = body.thresholdRate
  }
  if (typeof body.channel === 'string') {
    const normalized = body.channel.toLowerCase()
    if (CHANNELS.has(normalized)) {
      updates.channel = normalized
    }
  }
  if (typeof body.status === 'string') {
    const normalized = body.status.toLowerCase()
    if (STATUSES.has(normalized)) {
      updates.status = normalized
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('alerts')
    .update(updates)
    .eq('id', alertId)
    .eq('user_id', userId)
    .select('id')
    .single()

  if (error || !data) {
    console.error('Failed to update alert', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const body = await request.json()
  const userId = body.userId
  const alertId = Number(body.alertId)
  if (!isUuid(userId) || !Number.isInteger(alertId)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabase.from('alerts').delete().eq('id', alertId).eq('user_id', userId)
  if (error) {
    console.error('Failed to delete alert', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function mapAlertRow(row: { id: number; pair: string | null; exchange: string | null; threshold_rate: number | null; channel: string; status: string; last_triggered_at?: string | null; created_at: string; updated_at: string }) {
  const exchangeKey = normalizeExchange(row.exchange ?? '')
  return {
    id: row.id,
    pair: row.pair ?? 'Unknown pair',
    exchange: toExchangeLabel(exchangeKey),
    exchangeKey,
    thresholdRate: Number(row.threshold_rate ?? 0),
    channel: row.channel,
    status: row.status,
    lastTriggeredAt: row.last_triggered_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
