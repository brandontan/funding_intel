'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FundingAnalytics } from '@/lib/getFundingAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  data: FundingAnalytics
}

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`

type TooltipPayload = {
  value: number
}

function YieldTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-xs text-slate-100 shadow-xl">
      <div className="font-semibold capitalize">{label}</div>
      <div className="text-sm text-primary">{formatPercent(payload[0]?.value ?? 0)}</div>
    </div>
  )
}

export function DeepAnalytics({ data }: Props) {
  const trend = data.pairTrends[0]

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Exchange Yield Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.exchangeAverages} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="exchange" className="text-xs text-muted-foreground" />
              <YAxis tickFormatter={formatPercent} className="text-xs text-muted-foreground" />
              <Tooltip cursor={false} content={<YieldTooltip />} />
              <Bar dataKey="avgRate" fill="url(#barGradient)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <defs>
                <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {trend ? (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Persistence Trend · {trend.pair}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.points} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="timestamp" className="text-xs text-muted-foreground" />
                <YAxis tickFormatter={formatPercent} className="text-xs text-muted-foreground" />
                <Tooltip formatter={(value: number) => formatPercent(value)} labelClassName="text-xs" />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Funding Heatmap (24h avg)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-full grid sm:grid-cols-3 gap-3">
            {data.heatmap.map((cell) => (
              <div
                key={`${cell.exchange}-${cell.pair}`}
                data-heatmap-card
                className="rounded-xl border border-border/30 p-4 flex flex-col gap-2 bg-gradient-to-br from-primary/5 to-background"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{cell.exchange}</div>
                <div className="text-sm font-semibold">{cell.pair}</div>
                <div className="text-xl font-bold">{formatPercent(cell.value)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
