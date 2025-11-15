import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

type HeroProps = {
  pair: string
  exchange: string
  fundingRate: number
  profitPer8h: number
  capital: number
  lastUpdated: string
}

export function FundingHero({ pair, exchange, fundingRate, profitPer8h, capital, lastUpdated }: HeroProps) {
  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/10 border-primary/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Liquid gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-cyan-500/10 animate-pulse-slow" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono bg-primary/20 border-primary/30 text-foreground">
                {pair} · {exchange}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Data {lastUpdated}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-balance bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  {(fundingRate * 100).toFixed(3)}%
                </span>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Funding Rate (8h period)
              </p>
            </div>
            <div className="pt-2">
              <p className="text-2xl font-semibold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                ${profitPer8h.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Profit per 8h on ${capital.toLocaleString()} capital
              </p>
            </div>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg shadow-primary/50 border-0">
            Open Strategy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
