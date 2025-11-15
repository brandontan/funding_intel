'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Copy, Send, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Opportunity, OpportunityDetail } from '@/types'

type Props = {
  open: boolean
  opportunity: Opportunity | null
  onClose: () => void
  capital: number
  leverage: number
}

const RISK_COLOR: Record<string, string> = {
  A: 'text-emerald-400',
  B: 'text-amber-400',
  C: 'text-rose-400',
}

export function OpportunityDrawer({ open, opportunity, onClose, capital, leverage }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<OpportunityDetail | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !opportunity) {
      return
    }

    const controller = new AbortController()
    async function loadDetail() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ pair: opportunity.pair, exchange: opportunity.exchangeKey ?? opportunity.exchange.toLowerCase() })
        const response = await fetch(`/api/opportunity-detail?${params.toString()}`, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Failed to load details')
        }
        const payload = (await response.json()) as OpportunityDetail
        setDetail(payload)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        console.error(err)
        setError('Could not load drawer data. Try again.')
      } finally {
        setLoading(false)
      }
    }

    void loadDetail()

    return () => {
      controller.abort()
    }
  }, [open, opportunity])

  useEffect(() => {
    if (!open) {
      setDetail(null)
      setCopied(false)
    }
  }, [open])

  const effectiveCapital = capital * leverage

  const hedgingSteps = useMemo(() => {
    if (!opportunity) return []
    return [
      `Buy ${opportunity.pair.split('/')[0]} spot on ${opportunity.exchange} with ~$${capital.toLocaleString()}.`,
      `Short the perp on ${opportunity.exchange} with ${leverage}x hedge to lock funding differential.`,
      `Commit to monitor every 8h; exit if volatility score > ${(detail?.volatilityScore ?? opportunity.volatilityScore) * 100}% or trust dips.`,
    ]
  }, [opportunity, capital, leverage, detail?.volatilityScore])

  const sparkline = useMemo(() => {
    if (!detail?.history?.length) return null
    const points = detail.history
    const rates = points.map((point) => point.fundingRate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const range = max - min || 1
    const width = 220
    const height = 80
    const step = width / Math.max(points.length - 1, 1)
    const path = points
      .map((point, index) => {
        const normalized = (point.fundingRate - min) / range
        const x = index * step
        const y = height - normalized * height
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
    return { path, width, height, min, max }
  }, [detail])

  if (!open || !opportunity) {
    return null
  }

  function handleAlert() {
    window.dispatchEvent(
      new CustomEvent('fi-open-alert-composer', {
        detail: {
          pair: opportunity.pair,
          exchange: opportunity.exchange,
        },
      })
    )
    onClose()
  }

  async function handleCopyOrder() {
    if (!navigator?.clipboard || !opportunity) return
    const text = `Spot/perp hedge: Buy ${opportunity.pair} spot on ${opportunity.exchange}, short perp ${leverage}x. Funding ${((detail?.currentFundingRate ?? opportunity.fundingRate) * 100).toFixed(3)}% → ~$${(
      (detail?.currentFundingRate ?? opportunity.fundingRate) * effectiveCapital
    ).toFixed(2)} per 8h.`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  function handleTelegramShare() {
    if (!opportunity) return
    const text = `Funding alert: ${opportunity.pair} on ${opportunity.exchange} paying ${(opportunity.fundingRate * 100).toFixed(3)}% ≈ $${(
      opportunity.fundingRate * effectiveCapital
    ).toFixed(2)} every 8h.`
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'noopener')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background/95">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2">
              {opportunity.exchange}
            </Badge>
            <CardTitle className="text-2xl">{opportunity.pair}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {(opportunity.fundingRate * 100).toFixed(3)}% funding ·{' '}
              <span className={RISK_COLOR[opportunity.risk] ?? 'text-primary'}>
                Risk {opportunity.risk}
              </span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Persistence trend</p>
              {loading ? (
                <div className="h-20 animate-pulse rounded-md bg-muted/40" />
              ) : sparkline ? (
                <svg width={sparkline.width} height={sparkline.height} viewBox={`0 0 ${sparkline.width} ${sparkline.height}`} className="w-full">
                  <path d={sparkline.path} fill="none" stroke="url(#sparkGradient)" strokeWidth="3" />
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough history yet.</p>
              )}
              {detail && (
                <p className="text-xs text-muted-foreground mt-2">
                  Latest {(detail.currentFundingRate * 100).toFixed(3)}% · Persistence {(detail.persistenceScore * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border/50 p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk breakdown</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold">{((detail?.persistenceScore ?? opportunity.persistenceScore) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Persistence</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{((1 - (detail?.volatilityScore ?? opportunity.volatilityScore)) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Stability</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{((detail?.exchangeTrust ?? opportunity.exchangeTrust) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Trust</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Fee breakdown</h3>
              {detail ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>Maker fee</span><span>{detail.makerFeeBps.toFixed(2)} bps</span></li>
                  <li className="flex justify-between"><span>Taker fee</span><span>{detail.takerFeeBps.toFixed(2)} bps</span></li>
                  <li className="flex justify-between"><span>Borrow cost</span><span>{detail.borrowCostBps.toFixed(2)} bps</span></li>
                  <li className="flex justify-between font-semibold text-primary"><span>Net after fees</span><span>{((detail.netRateAfterFees ?? opportunity.netRateAfterFees) * 100).toFixed(3)}%</span></li>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Loading fees…</p>
              )}
            </div>
            <div className="rounded-xl border border-border/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Hedging steps</h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {hedgingSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Quick actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAlert} className="gap-2">
                <Bell className="h-4 w-4" />
                Alert this pair
              </Button>
              <Button variant="outline" onClick={handleCopyOrder} className="gap-2">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy order'}
              </Button>
              <Button variant="secondary" onClick={handleTelegramShare} className="gap-2">
                <Send className="h-4 w-4" />
                Share to Telegram
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
