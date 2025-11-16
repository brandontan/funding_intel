import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AlertHistoryEvent } from '@/types'

type Props = {
  events: AlertHistoryEvent[]
  contactReady: boolean
}

const STATUS_COLOR: Record<string, string> = {
  sent: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  'stubbed-email': 'bg-slate-500/10 text-slate-200 border-slate-500/30',
  'stubbed-telegram': 'bg-slate-500/10 text-slate-200 border-slate-500/30',
  error: 'bg-rose-500/10 text-rose-200 border-rose-500/40',
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`

export function AlertHistory({ events, contactReady }: Props) {
  return (
    <Card className="bg-card/70 backdrop-blur border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Alert activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          {contactReady
            ? 'Latest delivery attempts'
            : 'Add contact info in trader defaults to activate alerts'}
        </p>
      </CardHeader>
      <CardContent>
        {events.length ? (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="rounded-xl border border-border/40 bg-background/80 p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>
                    {event.pair} · {event.exchange}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(event.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatPercent(event.thresholdRate)} rule · {event.channel}
                  </span>
                  <Badge variant="outline" className={STATUS_COLOR[event.deliveryStatus] ?? 'bg-primary/10 text-primary-foreground/90 border-primary/30'}>
                    {event.deliveryStatus}
                  </Badge>
                </div>
                {event.message ? (
                  <p className="mt-2 text-xs text-muted-foreground">{event.message}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {contactReady
              ? 'No alert events yet—create a rule to see history.'
              : 'No alert history yet. Save trader defaults with contact info to start listening.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
