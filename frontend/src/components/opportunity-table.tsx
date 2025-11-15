'use client'

import { useState } from 'react'
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
import type { Opportunity } from '@/types'
import { OpportunityDrawer } from '@/components/opportunity-drawer'

const RISK_LABEL: Record<string, string> = {
  A: 'Low',
  B: 'Medium',
  C: 'High',
}

type Props = {
  data: Opportunity[]
  capital: number
  leverage: number
}

export function OpportunityTable({ data, capital, leverage }: Props) {
  const [selected, setSelected] = useState<Opportunity | null>(null)

  return (
    <>
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
                  <TableHead className="text-right">Net Rate</TableHead>
                  <TableHead className="text-right">Capital</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((opp) => (
                  <TableRow
                    key={opp.id}
                    onClick={() => setSelected(opp)}
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-300 border-b border-border/30"
                  >
                    <TableCell className="font-medium font-mono">{opp.pair}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                        {opp.exchange}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(opp.fundingRate * 100).toFixed(3)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      {(opp.netRateAfterFees * 100).toFixed(3)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {opp.capitalRequired ? `$${opp.capitalRequired.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={opp.risk === 'A' ? 'secondary' : 'default'} className="text-xs bg-primary/20 border-primary/30">
                        {RISK_LABEL[opp.risk] ?? opp.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <OpportunityDrawer
        open={Boolean(selected)}
        opportunity={selected}
        onClose={() => setSelected(null)}
        capital={capital}
        leverage={leverage}
      />
    </>
  )
}
