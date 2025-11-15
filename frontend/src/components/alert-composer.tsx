'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Opportunity } from '@/types'

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
]

type Props = {
  opportunities: Opportunity[]
  defaultChannel?: 'email' | 'telegram'
}

export function AlertComposer({ opportunities, defaultChannel = 'email' }: Props) {
  const [open, setOpen] = useState(false)
  const [pair, setPair] = useState(opportunities[0]?.pair ?? 'BTC/USDT-PERP')
  const [exchange, setExchange] = useState(opportunities[0]?.exchange ?? 'Binance')
  const [threshold, setThreshold] = useState(0.1)
  const [channel, setChannel] = useState(defaultChannel)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    setChannel(defaultChannel)
  }, [defaultChannel])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair, exchange, thresholdRate: threshold / 100, channel }),
      })
      if (!res.ok) {
        throw new Error('Failed to save alert')
      }
      setStatus('success')
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
      }, 1200)
    } catch (err) {
      console.error(err)
      setError('Could not create alert. Try again later.')
      setStatus('error')
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10" onClick={() => setOpen(true)}>
        Create Alert
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Create alert</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label>Pair</Label>
                  <select className="w-full rounded-md border bg-background px-3 py-2" value={pair} onChange={(e) => setPair(e.target.value)}>
                    {opportunities.map((opp) => (
                      <option key={opp.id} value={opp.pair}>
                        {opp.pair}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Exchange</Label>
                  <select className="w-full rounded-md border bg-background px-3 py-2" value={exchange} onChange={(e) => setExchange(e.target.value)}>
                    {[...new Set(opportunities.map((opp) => opp.exchange))].map((ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Threshold (%)</Label>
                  <Input type="number" step="0.01" min="0" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHANNELS.map((ch) => (
                      <Button
                        key={ch.value}
                        type="button"
                        variant={channel === ch.value ? 'default' : 'outline'}
                        onClick={() => setChannel(ch.value)}
                      >
                        {ch.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={status === 'saving'}>
                    {status === 'saving' ? 'Saving...' : status === 'success' ? 'Saved!' : 'Create alert'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
