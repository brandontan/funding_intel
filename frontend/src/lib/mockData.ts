export type Opportunity = {
  id: string;
  pair: string;
  exchange: 'Binance' | 'Bybit' | 'OKX';
  exchangeKey: 'binance' | 'bybit' | 'okx';
  fundingRate: number;
  profitPer8h: number;
  apy: number;
  risk: 'A' | 'B' | 'C';
  spreadBps: number;
  capitalRequired: number;
  persistenceHours: number;
};

export type OverviewTile = {
  pair: string;
  exchange: string;
  fundingRate: number;
  profitPer8h: number;
  risk: 'A' | 'B' | 'C';
};

export const heroOpportunity = {
  pair: 'BTC/USDT',
  exchange: 'Binance',
  fundingRate: 0.00126,
  profitPer8h: 37.8,
  apy: 0.84,
  timestamp: 'Data 32s ago',
};

export const overviewTiles: OverviewTile[] = [
  {
    pair: 'BTC/USDT',
    exchange: 'Binance',
    fundingRate: 0.00126,
    profitPer8h: 37.8,
    risk: 'A',
  },
  {
    pair: 'ETH/USDT',
    exchange: 'Bybit',
    fundingRate: 0.0009,
    profitPer8h: 27.0,
    risk: 'B',
  },
  {
    pair: 'SOL/USDT',
    exchange: 'OKX',
    fundingRate: 0.0015,
    profitPer8h: 45.0,
    risk: 'B',
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'btc-binance',
    pair: 'BTC/USDT',
    exchange: 'Binance',
    exchangeKey: 'binance',
    fundingRate: 0.00126,
    profitPer8h: 37.8,
    apy: 0.84,
    risk: 'A',
    spreadBps: 12,
    capitalRequired: 10000,
    persistenceHours: 18,
  },
  {
    id: 'eth-bybit',
    pair: 'ETH/USDT',
    exchange: 'Bybit',
    exchangeKey: 'bybit',
    fundingRate: 0.0009,
    profitPer8h: 27.0,
    apy: 0.62,
    risk: 'B',
    spreadBps: 20,
    capitalRequired: 8000,
    persistenceHours: 12,
  },
  {
    id: 'sol-okx',
    pair: 'SOL/USDT',
    exchange: 'OKX',
    exchangeKey: 'okx',
    fundingRate: 0.0015,
    profitPer8h: 45.0,
    apy: 0.97,
    risk: 'B',
    spreadBps: 32,
    capitalRequired: 6000,
    persistenceHours: 9,
  },
];
