export const JURISDICTIONS: Record<number, string> = {
  1: 'United States',
  2: 'European Union',
  3: 'United Kingdom',
  4: 'Singapore',
  5: 'Hong Kong',
  6: 'Japan',
  7: 'Australia',
  8: 'Canada',
  9: 'Switzerland',
  10: 'UAE',
};

export const COMPLIANCE_TIERS: Record<number, string> = {
  1: 'Retail',
  2: 'Accredited',
  3: 'Qualified Purchaser',
  4: 'Institutional',
};

export const PROPERTY_TYPES = [
  'Commercial Office',
  'Residential Multi-Family',
  'Industrial Warehouse',
  'Retail Shopping Center',
  'Hospitality / Hotel',
  'Mixed-Use Development',
  'Data Center',
  'Healthcare Facility',
];

export const PROPERTY_TYPE_CODES: Record<string, number> = PROPERTY_TYPES.reduce(
  (acc, label, index) => {
    acc[label] = index + 1;
    return acc;
  },
  {} as Record<string, number>,
);

export const PROPERTY_TYPE_LABELS: Record<number, string> = PROPERTY_TYPES.reduce(
  (acc, label, index) => {
    acc[index + 1] = label;
    return acc;
  },
  {} as Record<number, string>,
);

export const OFFERING_STATUS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  FULLY_SUBSCRIBED: 'Fully Subscribed',
};

export const SETTLEMENT_ASSET_CODES = {
  ALEO: 1,
  USDCX: 2,
  USAD: 3,
} as const;

export const SETTLEMENT_ASSET_LABELS: Record<number, string> = {
  [SETTLEMENT_ASSET_CODES.ALEO]: 'ALEO',
  [SETTLEMENT_ASSET_CODES.USDCX]: 'USDCx',
  [SETTLEMENT_ASSET_CODES.USAD]: 'USAD',
};

export const TOKEN_REGISTRY_PROGRAM_ID = 'token_registry.aleo';
export const USDCX_TOKEN_ID = import.meta.env.VITE_USDCX_TOKEN_ID?.trim() || '';
export const USAD_TOKEN_ID = import.meta.env.VITE_USAD_TOKEN_ID?.trim() || '';

export function getSettlementAssetTokenId(assetCode: number): string {
  if (assetCode === SETTLEMENT_ASSET_CODES.USDCX) return USDCX_TOKEN_ID;
  if (assetCode === SETTLEMENT_ASSET_CODES.USAD) return USAD_TOKEN_ID;
  return '';
}
