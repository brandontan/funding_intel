import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EXCHANGE_VALUES, normalizeExchange } from '@/lib/exchanges'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = url && serviceRole ? createClient(url, serviceRole, { auth: { persistSession: false } }) : null

const ALLOWED_CHANNELS = ['email', 'telegram'] as const

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase misconfigured' }, { status: 500 })
  }

  const body = await request.json()
  const capital = clamp(Number(body.capitalDefault ?? 10000), 100, 10000000)
  const leverage = clamp(Number(body.leverage ?? 1), 1, 10)
  const providedExchanges: string[] = Array.isArray(body.preferredExchanges) ? body.preferredExchanges : DEFAULT_EXCHANGE_VALUES
  const preferredExchanges = providedExchanges
    .map((value) => normalizeExchange(value))
    .filter((value) => DEFAULT_EXCHANGE_VALUES.includes(value))
  const finalExchanges = preferredExchanges.length ? preferredExchanges : DEFAULT_EXCHANGE_VALUES
  const skipAlerts = Boolean(body.skipAlerts)
  const requestedChannel = typeof body.alertChannel === 'string' ? body.alertChannel.toLowerCase() : 'email'
  const alertChannel = skipAlerts
    ? null
    : (ALLOWED_CHANNELS.includes(requestedChannel as (typeof ALLOWED_CHANNELS)[number])
        ? (requestedChannel as (typeof ALLOWED_CHANNELS)[number])
        : 'email')
  const alertChannels = alertChannel ? [alertChannel] : []

  const payload = {
    capital_default: capital,
    leverage,
    preferred_exchanges: finalExchanges,
    alert_channels: alertChannels,
  }

  const userId = body.userId
  const query = userId
    ? supabase.from('user_settings').upsert([{ user_id: userId, ...payload }], { onConflict: 'user_id' }).select('user_id').single()
    : supabase.from('user_settings').insert(payload).select('user_id').single()

  const { data, error } = await query
  if (error || !data) {
    console.error('Failed to persist user settings', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  const response = NextResponse.json({
    userId: data.user_id,
    settings: {
      capitalDefault: capital,
      leverage,
      preferredExchanges: finalExchanges,
      alertChannel: alertChannel ?? 'email',
      alertOptedOut: skipAlerts,
    },
  })

  response.cookies.set('fi_user_id', data.user_id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  response.cookies.set('fi_onboarding_complete', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}
