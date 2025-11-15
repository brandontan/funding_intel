export type Opportunity = {
  id: string;
  pair: string;
  exchange: string;
  fundingRate: number;
  netRateAfterFees: number;
  persistenceScore: number;
  volatilityScore: number;
  exchangeTrust: number;
  risk: 'A' | 'B' | 'C';
  spreadVsSpot?: number;
  capitalRequired?: number;
  updatedAt: string;
};
