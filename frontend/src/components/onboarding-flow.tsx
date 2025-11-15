'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { EXCHANGE_OPTIONS, DEFAULT_EXCHANGE_VALUES } from '@/lib/exchanges'
import type { UserSettings } from '@/types'

type Props = {
  initialSettings?: UserSettings | null
  defaultOpen?: boolean
}

const ALERT_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
]

export function OnboardingFlow({ initialSettings, defaultOpen = false }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [capital, setCapital] = useState(initialSettings?.capitalDefault ?? 10000)
  const [leverage, setLeverage] = useState(initialSettings?.leverage ?? 1)
  const [exchangePrefs, setExchangePrefs] = useState<string[]>(
    initialSettings?.preferredExchanges ?? DEFAULT_EXCHANGE_VALUES
  )
  const [alertChannel, setAlertChannel] = useState(initialSettings?.alertChannel ?? 'email')
  const [skipAlerts, setSkipAlerts] = useState(initialSettings?.alertOptedOut ?? false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true)
    }
  }, [defaultOpen])

  useEffect(() => {
    if (!initialSettings) {
      return
    }

    setCapital(initialSettings.capitalDefault)
    setLeverage(initialSettings.leverage)
    setExchangePrefs(initialSettings.preferredExchanges)
    setAlertChannel(initialSettings.alertChannel)
    setSkipAlerts(initialSettings.alertOptedOut)
  }, [initialSettings])

  function toggleExchange(value: string) {
    setExchangePrefs((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) {
          return prev
        }
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }

  async function persistSettings(payload: { skipAlerts?: boolean }) {
    const nextSkipAlerts = payload.skipAlerts ?? skipAlerts
    setSkipAlerts(nextSkipAlerts)
    setStatus('saving')
    setError('')
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capitalDefault: capital,
          leverage,
          preferredExchanges: exchangePrefs,
          alertChannel,
          skipAlerts: nextSkipAlerts,
          userId: initialSettings?.userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setStatus('success')
      router.refresh()
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
      }, 600)
    } catch (err) {
      console.error(err)
      setError('Could not save preferences. Try again.')
      setStatus('error')
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void persistSettings({})
  }

  function handleSkipAlerts() {
    setSkipAlerts(true)
  }

  function handleEnableAlerts() {
    setSkipAlerts(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-primary/30 hover:bg-primary/10"
        onClick={() => setOpen(true)}
      >
        Trader defaults
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                Personalize your funding view
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capital">Capital (USD)</Label>
                    <Input
                      id="capital"
                      type="number"
                      value={capital}
                      min={100}
                      step={100}
                      onChange={(event) => setCapital(Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="leverage">Leverage</Label>
                      <span className="text-sm font-semibold">{leverage}x</span>
                    </div>
                    <Slider
                      id="leverage"
                      min={1}
                      max={10}
                      step={1}
                      value={[leverage]}
                      onValueChange={(value) => setLeverage(value[0])}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1x</span>
                      <span>10x</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred exchanges</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXCHANGE_OPTIONS.map((option) => {
                      const selected = exchangePrefs.includes(option.value)
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          onClick={() => toggleExchange(option.value)}
                        >
                          {option.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Alert channel</Label>
                    {skipAlerts ? (
                      <Badge variant="outline" className="text-xs border-dashed">
                        Alerts skipped
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALERT_CHANNELS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={skipAlerts ? 'outline' : alertChannel === option.value ? 'default' : 'outline'}
                        disabled={skipAlerts}
                        onClick={() => setAlertChannel(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {skipAlerts ? (
                      <Button type="button" variant="link" className="px-0" onClick={handleEnableAlerts}>
                        Enable alerts again
                      </Button>
                    ) : (
                      <Button type="button" variant="link" className="px-0" onClick={handleSkipAlerts}>
                        Skip alerts for now
                      </Button>
                    )}
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => persistSettings({ skipAlerts: true })}
                      disabled={status === 'saving'}
                    >
                      Save without alerts
                    </Button>
                    <Button type="submit" disabled={status === 'saving'}>
                      {status === 'saving' ? 'Saving...' : 'Save defaults'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
