export type OpportunityHistoryPoint = {
  timestamp: string;
  fundingRate: number;
};

export type OpportunityDetail = {
  pair: string;
  exchange: string;
  currentFundingRate: number;
  netRateAfterFees: number;
  persistenceScore: number;
  volatilityScore: number;
  exchangeTrust: number;
  risk: 'A' | 'B' | 'C';
  spreadVsSpot: number | null;
  capitalRequired: number | null;
  updatedAt: string;
  avgMarkPrice: number | null;
  makerFeeBps: number;
  takerFeeBps: number;
  borrowCostBps: number;
  history: OpportunityHistoryPoint[];
  nextFundingTime: string | null;
  recommendedThreshold: number;
};
