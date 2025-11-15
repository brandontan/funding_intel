import { cookies } from 'next/headers'
import { FundingHero } from '@/components/funding-hero'
import { AssetCards } from '@/components/asset-cards'
import { OpportunityTable } from '@/components/opportunity-table'
import { ProfitCalculator } from '@/components/profit-calculator'
import { AlertComposer } from '@/components/alert-composer'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { getOpportunities } from '@/lib/getOpportunities'
import { getUserSettings } from '@/lib/getUserSettings'
import { DEFAULT_EXCHANGE_VALUES } from '@/lib/exchanges'
import { prioritizeOpportunities } from '@/lib/prioritizeOpportunities'

export default async function Page() {
  const cookieStore = cookies()
  const storedUserId = cookieStore.get('fi_user_id')?.value
  const onboardingComplete = cookieStore.get('fi_onboarding_complete')?.value === 'true'
  const userSettings = storedUserId ? await getUserSettings(storedUserId) : null
  const showOnboarding = !onboardingComplete || !userSettings

  const capital = userSettings?.capitalDefault ?? 10000
  const leverage = userSettings?.leverage ?? 1
  const preferredExchanges = userSettings?.preferredExchanges ?? DEFAULT_EXCHANGE_VALUES

  const opportunities = await getOpportunities()
  const prioritized = prioritizeOpportunities(opportunities, preferredExchanges)
  const hero = prioritized[0]
  const effectiveCapital = capital * leverage
  const heroData = hero
    ? {
        pair: hero.pair,
        exchange: hero.exchange,
        fundingRate: hero.fundingRate,
        profitPer8h: hero.fundingRate * effectiveCapital,
        capital,
        leverage,
        lastUpdated: new Date(hero.updatedAt).toLocaleTimeString(),
      }
    : {
        pair: 'BTC/USDT-PERP',
        exchange: 'Binance',
        fundingRate: 0.00126,
        profitPer8h: 0.00126 * effectiveCapital,
        capital,
        leverage,
        lastUpdated: 'moments ago',
      }
  const assetItems = prioritized.slice(0, 3)
  return (
    <div className="min-h-screen bg-background dark">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Updated logo with gradient effect */}
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-primary-foreground font-bold text-sm">FI</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Funding Intelligence
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <OnboardingFlow initialSettings={userSettings} defaultOpen={showOnboarding} />
            <AlertComposer
              opportunities={opportunities}
              defaultChannel={userSettings?.alertChannel ?? 'email'}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FundingHero {...heroData} />
            <AssetCards items={assetItems} capital={capital} leverage={leverage} />
            <OpportunityTable data={opportunities} capital={capital} leverage={leverage} />
          </div>

          {/* Right Column - Sticky Calculator */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <ProfitCalculator
                fundingRate={heroData.fundingRate}
                initialCapital={capital}
                initialLeverage={leverage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
