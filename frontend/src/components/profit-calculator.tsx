'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

type Props = {
  fundingRate: number // decimal (e.g., 0.00126)
}

export function ProfitCalculator({ fundingRate }: Props) {
  const [capital, setCapital] = useState(10000)
  const [leverage, setLeverage] = useState(1)

  const periodsPerDay = 3 // 8h periods
  const effectiveCapital = capital * leverage
  const profitPer8h = effectiveCapital * fundingRate
  const dailyProfit = profitPer8h * periodsPerDay
  const monthlyProfit = dailyProfit * 30
  const annualProfit = dailyProfit * 365
  const apr = ((annualProfit / capital) * 100)

  return (
    <Card className="shadow-2xl shadow-primary/20 bg-gradient-to-br from-card via-card to-primary/10 backdrop-blur-xl border-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-cyan-500/10 animate-pulse-slow" />
      <CardHeader className="relative z-10">
        <CardTitle className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Profit Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-2">
          <Label htmlFor="capital">Capital (USD)</Label>
          <Input
            id="capital"
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="text-lg font-semibold"
          />
        </div>
        <div className="space-y-2">
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
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>10x</span>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10 backdrop-blur-sm border border-primary/20 p-4 space-y-3">
          <h4 className="font-semibold text-sm">Estimated Profits</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Per 8h</span>
              <span className="text-lg font-bold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                ${profitPer8h.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Daily</span>
              <span className="text-lg font-bold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                ${dailyProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Monthly</span>
              <span className="text-lg font-bold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                ${monthlyProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Annual</span>
              <span className="text-lg font-bold bg-gradient-to-r from-success to-cyan-400 bg-clip-text text-transparent">
                ${annualProfit.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-border/50">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold">APR</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {apr.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          * Estimates based on current funding rate of {(fundingRate * 100).toFixed(3)}%. Actual profits may vary.
        </p>
      </CardContent>
    </Card>
  )
}
