import { FundingHero } from '@/components/funding-hero'
import { AssetCards } from '@/components/asset-cards'
import { OpportunityTable } from '@/components/opportunity-table'
import { ProfitCalculator } from '@/components/profit-calculator'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { fetchOpportunities } from '@/lib/data'

export default async function Page() {
  const opportunities = await fetchOpportunities()
  return (
    <div className="min-h-screen bg-background dark">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Updated logo with gradient effect */}
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-primary-foreground font-bold text-sm">FI</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Funding Intelligence
            </h1>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FundingHero />
            <AssetCards />
            <OpportunityTable data={opportunities} />
          </div>

          {/* Right Column - Sticky Calculator */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <ProfitCalculator />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
