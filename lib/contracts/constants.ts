// 0G Network Configuration
export const ZG_TESTNET_RPC = process.env.NEXT_PUBLIC_ZG_TESTNET_RPC || "https://evmrpc-testnet.0g.ai";
export const ZG_MAINNET_RPC = process.env.NEXT_PUBLIC_ZG_MAINNET_RPC || "https://evmrpc.0g.ai";
export const ZG_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ZG_CHAIN_ID) || 16602;

// Contract Addresses (Update after deployment)
export const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || "";
export const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || "";

// 0G Storage Configuration
export const ZG_STORAGE_INDEXER = process.env.NEXT_PUBLIC_ZG_STORAGE_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai";

// 0G Compute Configuration
export const ZG_COMPUTE_ENDPOINT = process.env.NEXT_PUBLIC_ZG_COMPUTE_ENDPOINT || "";

// Market Categories
export const MARKET_CATEGORIES = [
  "Crypto",
  "Politics",
  "Sports",
  "Technology",
  "Gaming",
  "NFTs",
  "AI",
  "Other",
] as const;

export type MarketCategory = typeof MARKET_CATEGORIES[number];
