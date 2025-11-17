import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, afterAll, vi, describe, it, expect } from 'vitest'
import { AlertManager } from '@/components/alert-manager'
import type { AlertRule } from '@/types'

const sampleAlert = (overrides?: Partial<AlertRule>): AlertRule => ({
  id: 1,
  pair: 'BTC/USDT-PERP',
  exchange: 'Binance',
  exchangeKey: 'binance',
  thresholdRate: 0.001,
  channel: 'email',
  status: 'active',
  lastTriggeredAt: null,
  createdAt: '2025-11-16T00:00:00.000Z',
  updatedAt: '2025-11-16T00:00:00.000Z',
  ...overrides,
})

describe('AlertManager', () => {
  const originalFetch = global.fetch

  beforeAll(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('shows helper message when user is missing', () => {
    render(<AlertManager initialAlerts={[]} events={[]} />)
    expect(screen.getByText(/save your trader defaults/i)).toBeInTheDocument()
  })

  it('updates alert threshold and calls API on save', async () => {
    const user = userEvent.setup()
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ alerts: [] }),
    })

    render(<AlertManager initialAlerts={[sampleAlert()]} userId="11111111-1111-1111-1111-111111111111" events={[]} />)

    const thresholdInput = screen.getByRole('spinbutton')
    await user.clear(thresholdInput)
    await user.type(thresholdInput, '0.2')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(global.fetch).toHaveBeenCalled()
    const [, init] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const payload = JSON.parse((init as RequestInit).body as string)
    expect(payload.thresholdRate).toBeCloseTo(0.002)
    expect(payload.alertId).toBe(1)
  })
})
