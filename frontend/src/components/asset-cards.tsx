'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Opportunity } from '@/types/opportunity'

const RISK_LABEL: Record<string, string> = {
  A: 'Low',
  B: 'Medium',
  C: 'High',
}

type Props = {
  items: Opportunity[]
}

export function AssetCards({ items }: Props) {
  if (!items.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((asset) => (
        <Card 
          key={asset.id} 
          className={`hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-xl border-primary/20 relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-cyan-500/10 transition-all duration-500" />
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{asset.pair.split('/')[0]}</CardTitle>
                <p className="text-sm text-muted-foreground">{asset.pair}</p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                {asset.exchange}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {(asset.fundingRate * 100).toFixed(3)}%
              </p>
              <p className="text-xs text-muted-foreground">Funding Rate</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                  ${((asset.fundingRate * 3) * 10000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Daily profit</p>
              </div>
              <Badge variant={asset.risk === 'A' ? 'secondary' : 'default'} className="bg-primary/20 border-primary/30">
                {RISK_LABEL[asset.risk] ?? asset.risk}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
