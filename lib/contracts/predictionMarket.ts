export const PREDICTION_MARKET_ABI = [
  // Market Creation
  "function createMarket(string question, string category, string outcomeA, string outcomeB, uint256 resolutionTime, uint256 creatorFee) returns (uint256)",

  // Betting
  "function placeBet(uint256 marketId, uint8 outcome) payable",

  // Resolution
  "function lockMarket(uint256 marketId)",
  "function resolveMarket(uint256 marketId, uint8 result, bytes32 proofHash)",
  "function cancelMarket(uint256 marketId)",

  // Claiming
  "function claimWinnings(uint256 positionId)",
  "function calculatePayout(uint256 positionId) view returns (uint256)",

  // View Functions
  "function getMarket(uint256 marketId) view returns (tuple(uint256 marketId, string question, string category, address creator, uint256 createdAt, uint256 resolutionTime, uint8 status, string outcomeA, string outcomeB, uint256 totalPoolA, uint256 totalPoolB, uint8 result, bytes32 proofHash, address resolver, uint256 resolvedAt, uint256 creatorFee, uint256 platformFee))",
  "function getPosition(uint256 positionId) view returns (tuple(uint256 marketId, address bettor, uint8 outcome, uint256 amount, uint256 timestamp, bool claimed))",
  "function getMarketPositions(uint256 marketId) view returns (uint256[])",
  "function getUserPositions(address user) view returns (uint256[])",
  "function getOdds(uint256 marketId) view returns (uint256 oddsA, uint256 oddsB)",
  "function getTotalPool(uint256 marketId) view returns (uint256)",

  // State Variables
  "function nextMarketId() view returns (uint256)",
  "function nextPositionId() view returns (uint256)",
  "function platformFeeRate() view returns (uint256)",
  "function minBetAmount() view returns (uint256)",
  "function maxBetAmount() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "function totalMarkets() view returns (uint256)",

  // Events
  "event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 resolutionTime)",
  "event BetPlaced(uint256 indexed marketId, uint256 indexed positionId, address indexed bettor, uint8 outcome, uint256 amount)",
  "event MarketResolved(uint256 indexed marketId, uint8 result, bytes32 proofHash, address resolver)",
  "event WinningsClaimed(uint256 indexed positionId, address indexed bettor, uint256 payout)",
  "event MarketCancelled(uint256 indexed marketId)",
] as const;

export const MARKET_FACTORY_ABI = [
  "function createMarket() payable returns (address)",
  "function addMarketToCategory(address marketAddress, string category)",
  "function getAllMarkets() view returns (address[])",
  "function getCreatorMarkets(address creator) view returns (address[])",
  "function getCategoryMarkets(string category) view returns (address[])",
  "function getTotalMarkets() view returns (uint256)",
  "function marketCreationFee() view returns (uint256)",
  "event MarketDeployed(address indexed marketAddress, address indexed creator, uint256 timestamp)",
] as const;

export enum MarketStatus {
  ACTIVE = 0,
  LOCKED = 1,
  RESOLVED = 2,
  CANCELLED = 3,
}

export enum Outcome {
  PENDING = 0,
  OUTCOME_A = 1,
  OUTCOME_B = 2,
  INVALID = 3,
}

export interface Market {
  marketId: bigint;
  question: string;
  category: string;
  creator: string;
  createdAt: bigint;
  resolutionTime: bigint;
  status: MarketStatus;
  outcomeA: string;
  outcomeB: string;
  totalPoolA: bigint;
  totalPoolB: bigint;
  result: Outcome;
  proofHash: string;
  resolver: string;
  resolvedAt: bigint;
  creatorFee: bigint;
  platformFee: bigint;
}

export interface Position {
  marketId: bigint;
  bettor: string;
  outcome: Outcome;
  amount: bigint;
  timestamp: bigint;
  claimed: boolean;
}
