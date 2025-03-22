export interface Offering {
  id: string;
  issuer: string;
  assetHash: string;
  totalSupply: number;
  pricePerUnit: number;
  settlementAsset: number;
  lockupEnd: number;
  accreditedOnly: boolean;
  minSubscription: number;
  maxInvestors: number;
  isActive: boolean;
  subscribed?: number;
  investorCount?: number;
  name?: string;
  description?: string;
  propertyType?: string;
  location?: string;
}

export interface Position {
  owner?: string;
  positionId?: string;
  offeringId: string;
  amount: number;
  subscribedAt: number;
  issuer: string;
  record?: string;
}

export interface Distribution {
  id: string;
  offeringId: string;
  amountPerUnit: number;
  claimed?: boolean;
  claimedAt?: number;
}

export interface Proposal {
  id: string;
  offeringId: string;
  proposer: string;
  descriptionHash: string;
  votingEnd: number;
  isActive: boolean;
  yesVotes?: number;
  noVotes?: number;
}

export interface ComplianceCredential {
  owner?: string;
  issuer: string;
  jurisdiction: number;
  accredited: boolean;
  tier: number;
  credentialHash: string;
  expiry: number;
  record?: string;
}

export interface TransactionResult {
  txId: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export type UserRole = 'issuer' | 'investor';
