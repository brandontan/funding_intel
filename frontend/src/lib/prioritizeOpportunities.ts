import type { Opportunity } from '@/types'
import { DEFAULT_EXCHANGE_VALUES, normalizeExchange } from '@/lib/exchanges'

export function prioritizeOpportunities(
  opportunities: Opportunity[],
  preferredExchanges: string[] | undefined
) {
  if (!opportunities.length) {
    return []
  }

  const normalizedPrefs = (preferredExchanges?.length ? preferredExchanges : DEFAULT_EXCHANGE_VALUES).map(
    (exchange) => normalizeExchange(exchange)
  )

  const matches = opportunities.filter((opportunity) =>
    normalizedPrefs.includes(opportunity.exchangeKey ?? normalizeExchange(opportunity.exchange))
  )

  return matches.length ? matches : opportunities
}
