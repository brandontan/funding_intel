type FeeConfig = {
  makerBps: number;
  takerBps: number;
  borrowBps: number;
};

const DEFAULT_FEES: FeeConfig = {
  makerBps: 1,
  takerBps: 4,
  borrowBps: 2,
};

const EXCHANGE_FEES: Record<string, FeeConfig> = {
  binance: { makerBps: 1, takerBps: 3, borrowBps: 2 },
  bybit: { makerBps: 1, takerBps: 3.5, borrowBps: 2.5 },
  okx: { makerBps: 1, takerBps: 3.6, borrowBps: 1.8 },
};

export function getFeeBreakdown(exchange: string): FeeConfig {
  return EXCHANGE_FEES[exchange] ?? DEFAULT_FEES;
}
