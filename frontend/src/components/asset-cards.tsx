'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const assets = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    exchange: 'Binance',
    fundingRate: '0.126%',
    dailyProfit: '$113.40',
    risk: 'Low',
    riskVariant: 'secondary' as const,
    gradient: 'from-primary/20 to-cyan-500/20',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    exchange: 'Bybit',
    fundingRate: '0.089%',
    dailyProfit: '$80.10',
    risk: 'Low',
    riskVariant: 'secondary' as const,
    gradient: 'from-primary/20 to-purple-500/20',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    exchange: 'OKX',
    fundingRate: '0.215%',
    dailyProfit: '$193.50',
    risk: 'Medium',
    riskVariant: 'default' as const,
    gradient: 'from-cyan-500/20 to-primary/20',
  },
]

export function AssetCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <Card 
          key={asset.symbol} 
          className={`hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 bg-gradient-to-br ${asset.gradient} backdrop-blur-xl border-primary/20 relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-cyan-500/10 transition-all duration-500" />
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{asset.symbol}</CardTitle>
                <p className="text-sm text-muted-foreground">{asset.name}</p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                {asset.exchange}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {asset.fundingRate}
              </p>
              <p className="text-xs text-muted-foreground">Funding Rate</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                  {asset.dailyProfit}
                </p>
                <p className="text-xs text-muted-foreground">Daily profit</p>
              </div>
              <Badge variant={asset.riskVariant} className="bg-primary/20 border-primary/30">
                {asset.risk}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
