import { render, screen } from '@testing-library/react'
import { AlertHistory } from '@/components/alert-history'
import type { AlertHistoryEvent } from '@/types'

const sampleEvent = (overrides?: Partial<AlertHistoryEvent>): AlertHistoryEvent => ({
  id: 1,
  alertId: 10,
  pair: 'BTC/USDT-PERP',
  exchange: 'Binance',
  channel: 'email',
  deliveryStatus: 'sent',
  thresholdRate: 0.001,
  createdAt: '2025-11-16T00:00:00.000Z',
  message: 'Funding alert fired',
  ...overrides,
})

describe('AlertHistory', () => {
  it('shows empty state when there are no events', () => {
    render(<AlertHistory events={[]} contactReady={false} />)
    expect(screen.getByText(/no alert history yet/i)).toBeInTheDocument()
  })

  it('renders recent events with status badges', () => {
    render(
      <AlertHistory
        contactReady
        events={[
          sampleEvent(),
          sampleEvent({ id: 2, deliveryStatus: 'error', channel: 'telegram', pair: 'ETH/USDT' }),
        ]}
      />,
    )

    expect(screen.getByText(/BTC\/USDT-PERP/i)).toBeInTheDocument()
    expect(screen.getByText(/ETH\/USDT/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Funding alert fired/i)).toHaveLength(2)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
