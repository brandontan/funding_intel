import { render, screen } from '@testing-library/react'
import { FundingHero } from '@/components/funding-hero'

describe('FundingHero', () => {
  it('shows funding summary details', () => {
    render(
      <FundingHero
        pair="BTC/USDT-PERP"
        exchange="Binance"
        fundingRate={0.00126}
        profitPer8h={37.8}
        capital={10000}
        lastUpdated="moments ago"
      />,
    )
    expect(screen.getByText(/BTC\/USDT-PERP · Binance/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open strategy/i })).toBeInTheDocument()
  })
})
