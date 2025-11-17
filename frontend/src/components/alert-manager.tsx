'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { AlertHistoryEvent, AlertRule } from '@/types'

type Props = {
  initialAlerts: AlertRule[]
  userId?: string
  events?: AlertHistoryEvent[]
}

const CHANNEL_OPTIONS: Array<{ value: 'email' | 'telegram'; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
]

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
  paused: 'bg-amber-500/10 text-amber-200 border-amber-500/30',
}

const EVENT_STATUS_COLOR: Record<string, string> = {
  sent: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  error: 'bg-rose-500/10 text-rose-200 border-rose-500/40',
  'stubbed-email': 'bg-slate-500/10 text-slate-200 border-slate-500/30',
  'stubbed-telegram': 'bg-slate-500/10 text-slate-200 border-slate-500/30',
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return 'Never triggered'
  }
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AlertManager({ initialAlerts, userId, events = [] }: Props) {
  const [alerts, setAlerts] = useState<AlertRule[]>(initialAlerts)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setAlerts(initialAlerts)
  }, [initialAlerts])

  useEffect(() => {
    if (!success) {
      return
    }
    const timer = setTimeout(() => setSuccess(''), 2500)
    return () => clearTimeout(timer)
  }, [success])

  useEffect(() => {
    if (!error) {
      return
    }
    const timer = setTimeout(() => setError(''), 4000)
    return () => clearTimeout(timer)
  }, [error])

  const hasUser = Boolean(userId)

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)
  }, [events])

  const refreshAlerts = useCallback(async () => {
    if (!userId) {
      return
    }
    setRefreshing(true)
    try {
      const response = await fetch(`/api/alerts?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to refresh alerts')
      }
      const payload = await response.json()
      setAlerts(Array.isArray(payload.alerts) ? payload.alerts : [])
    } catch (err) {
      console.error(err)
      setError('Unable to refresh alerts right now.')
    } finally {
      setRefreshing(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    function handleAlertCreated() {
      void refreshAlerts()
    }

    window.addEventListener('fi-alert-created', handleAlertCreated as EventListener)
    return () => window.removeEventListener('fi-alert-created', handleAlertCreated as EventListener)
  }, [userId, refreshAlerts])

  function updateLocalAlert(id: number, patch: Partial<AlertRule>) {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, ...patch } : alert)))
  }

  function resetBanners() {
    setError('')
    setSuccess('')
  }

  async function persistAlert(alert: AlertRule, next: Partial<AlertRule> = {}) {
    if (!userId) {
      return
    }
    resetBanners()
    setLoadingId(alert.id)
    const payload = { ...alert, ...next }
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          alertId: alert.id,
          thresholdRate: payload.thresholdRate,
          channel: payload.channel,
          status: payload.status,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save alert')
      }
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? payload : item)))
      setSuccess('Alert updated')
    } catch (err) {
      console.error(err)
      setError('Unable to save alert right now.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!userId) {
      return
    }
    resetBanners()
    setLoadingId(id)
    try {
      const res = await fetch('/api/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, alertId: id }),
      })
      if (!res.ok) {
        throw new Error('Failed to delete alert')
      }
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      setSuccess('Alert removed')
    } catch (err) {
      console.error(err)
      setError('Unable to delete alert right now.')
    } finally {
      setLoadingId(null)
    }
  }

  if (!hasUser) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-background/80 p-4 text-sm text-muted-foreground">
        Save your trader defaults to manage alerts from here.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Saved alerts</h3>
          <p className="text-xs text-muted-foreground">Edit thresholds, pause delivery, or remove noisy signals.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refreshAlerts()} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>
      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {success}
        </div>
      )}
      {alerts.length ? (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const percent = Number((alert.thresholdRate * 100).toFixed(2))
            return (
              <li key={alert.id} className="rounded-xl border border-border/40 bg-background/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{alert.pair}</p>
                    <p className="text-xs text-muted-foreground">{alert.exchange}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_COLOR[alert.status] ?? ''}>
                    {alert.status}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Threshold (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={Number.isFinite(percent) ? percent : 0}
                      onChange={(event) => {
                        const value = Number(event.target.value)
                        if (Number.isNaN(value)) {
                          return
                        }
                        updateLocalAlert(alert.id, { thresholdRate: value / 100 })
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Channel</Label>
                    <div className="flex flex-wrap gap-2">
                      {CHANNEL_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={alert.channel === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateLocalAlert(alert.id, { channel: option.value })}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Last triggered · {formatTimestamp(alert.lastTriggeredAt)}</span>
                  <span>Created {formatTimestamp(alert.createdAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={loadingId === alert.id}
                    onClick={() =>
                      void persistAlert(alert, {
                        status: alert.status === 'active' ? 'paused' : 'active',
                      })
                    }
                  >
                    {alert.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingId === alert.id}
                    onClick={() => void persistAlert(alert)}
                  >
                    {loadingId === alert.id ? 'Saving…' : 'Save changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={loadingId === alert.id}
                    onClick={() => void handleDelete(alert.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No saved alerts yet. Use the composer to add your first rule.</p>
      )}

      <div className="rounded-xl border border-border/30 bg-background/70 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Recent alert events</h4>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Auto-syncs as rules fire</span>
        </div>
        {sortedEvents.length ? (
          <ul className="mt-3 space-y-2 text-xs">
            {sortedEvents.map((event) => (
              <li key={event.id} className="rounded-lg border border-border/30 p-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{event.pair} · {event.exchange}</span>
                  <Badge variant="outline" className={EVENT_STATUS_COLOR[event.deliveryStatus] ?? 'bg-slate-500/10 text-slate-200 border-slate-500/30'}>
                    {event.deliveryStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Threshold {Number((event.thresholdRate * 100).toFixed(2))}% · {event.channel}</span>
                  <span>{formatTimestamp(event.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">No delivery attempts yet.</p>
        )}
      </div>
    </div>
  )
}
