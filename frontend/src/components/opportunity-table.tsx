import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const opportunities = [
  {
    pair: 'BTC/USDT-PERP',
    exchange: 'Binance',
    fundingRate: '0.126%',
    spread: '+0.012%',
    capitalRequired: '$5,000',
    risk: 'Low',
    riskVariant: 'secondary' as const,
  },
  {
    pair: 'SOL/USDT-PERP',
    exchange: 'OKX',
    fundingRate: '0.215%',
    spread: '+0.028%',
    capitalRequired: '$3,000',
    risk: 'Medium',
    riskVariant: 'default' as const,
  },
  {
    pair: 'ETH/USDT-PERP',
    exchange: 'Bybit',
    fundingRate: '0.089%',
    spread: '+0.008%',
    capitalRequired: '$7,500',
    risk: 'Low',
    riskVariant: 'secondary' as const,
  },
  {
    pair: 'AVAX/USDT-PERP',
    exchange: 'Binance',
    fundingRate: '0.182%',
    spread: '+0.019%',
    capitalRequired: '$2,500',
    risk: 'Medium',
    riskVariant: 'default' as const,
  },
  {
    pair: 'MATIC/USDT-PERP',
    exchange: 'Bybit',
    fundingRate: '0.156%',
    spread: '+0.015%',
    capitalRequired: '$4,000',
    risk: 'Medium',
    riskVariant: 'default' as const,
  },
]

export function OpportunityTable() {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Top Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-primary/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead>Pair</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead className="text-right">Funding Rate</TableHead>
                <TableHead className="text-right">Spread vs Spot</TableHead>
                <TableHead className="text-right">Capital Required</TableHead>
                <TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp, index) => (
                <TableRow 
                  key={index} 
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-300 border-b border-border/30"
                >
                  <TableCell className="font-medium font-mono">{opp.pair}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                      {opp.exchange}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {opp.fundingRate}
                  </TableCell>
                  <TableCell className="text-right bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent font-semibold">
                    {opp.spread}
                  </TableCell>
                  <TableCell className="text-right">{opp.capitalRequired}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={opp.riskVariant} className="text-xs bg-primary/20 border-primary/30">
                      {opp.risk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
