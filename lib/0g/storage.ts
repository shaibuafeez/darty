/**
 * 0G Storage Wrapper
 * Simplified interface for storing AI analysis and resolution evidence
 */

import { Indexer, MemData } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";

export interface StorageConfig {
  network?: "testnet" | "mainnet";
  evmRpc?: string;
  indexerRpc?: string;
  privateKey?: string;
}

export interface UploadResult {
  rootHash: string;
  txHash: string;
  timestamp: number;
}

/**
 * 0G Storage client for decentralized evidence storage
 */
export class ZGStorage {
  private indexer: Indexer;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private config: Required<Omit<StorageConfig, "privateKey">> & {
    privateKey?: string;
  };

  constructor(config: StorageConfig = {}) {
    const network = config.network || "testnet";

    this.config = {
      network,
      evmRpc:
        config.evmRpc ||
        (network === "mainnet"
          ? "https://evmrpc.0g.ai"
          : "https://evmrpc-testnet.0g.ai"),
      indexerRpc:
        config.indexerRpc ||
        (network === "mainnet"
          ? "https://indexer-storage.0g.ai"
          : "https://indexer-storage-testnet-turbo.0g.ai"),
      privateKey: config.privateKey,
    };

    this.provider = new ethers.JsonRpcProvider(this.config.evmRpc);

    if (this.config.privateKey) {
      this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
    }

    this.indexer = new Indexer(this.config.indexerRpc);

    console.log(`[0G Storage] Initialized on ${network}`);
  }

  /**
   * Upload JSON data to 0G Storage
   * Returns root hash for verification
   */
  async uploadJSON(data: any): Promise<UploadResult> {
    if (!this.signer) {
      throw new Error("Private key required for uploads");
    }

    try {
      console.log("[0G Storage] Uploading JSON data...");

      // Convert JSON to buffer
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, "utf-8");

      // Create memory data object
      const memData = new MemData(buffer);

      // Calculate merkle tree
      const [tree, treeErr] = await memData.merkleTree();

      if (treeErr !== null || !tree) {
        throw new Error(`Failed to create merkle tree: ${treeErr}`);
      }

      const rootHash = tree.rootHash();
      if (!rootHash) {
        throw new Error("Failed to generate root hash");
      }

      console.log(`[0G Storage] Merkle root hash: ${rootHash}`);

      // Upload to 0G Storage
      const [tx, uploadErr] = await this.indexer.upload(
        memData,
        this.config.evmRpc,
        this.signer
      );

      if (uploadErr !== null || !tx) {
        throw new Error(`Upload failed: ${uploadErr}`);
      }

      const txHash = typeof tx === "string" ? tx : (tx as any).txHash || String(tx);

      console.log(`[0G Storage] Upload successful - TX: ${txHash}`);

      return {
        rootHash,
        txHash,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[0G Storage] Upload failed:", error);
      throw new Error(
        `Failed to upload to 0G Storage: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Download data from 0G Storage by root hash
   * Returns parsed JSON data
   */
  async downloadJSON(rootHash: string): Promise<any> {
    try {
      console.log(`[0G Storage] Downloading data: ${rootHash}`);

      // Create temp file path
      const tempPath = `/tmp/0g-download-${Date.now()}.json`;

      // Download from 0G Storage
      const err = await this.indexer.download(rootHash, tempPath, true);

      if (err !== null) {
        throw new Error(`Download failed: ${err}`);
      }

      // Read and parse JSON
      const fs = await import("fs");
      const jsonString = fs.readFileSync(tempPath, "utf-8");
      const data = JSON.parse(jsonString);

      // Clean up temp file
      fs.unlinkSync(tempPath);

      console.log("[0G Storage] Download successful");

      return data;
    } catch (error) {
      console.error("[0G Storage] Download failed:", error);
      throw new Error(
        `Failed to download from 0G Storage: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Upload AI analysis result to 0G Storage
   * Convenience method with structured data
   */
  async uploadAnalysis(analysis: {
    marketId: string;
    question: string;
    prediction: {
      probability: number;
      confidence: number;
      reasoning: string;
    };
    sources: string[];
    timestamp: number;
  }): Promise<UploadResult> {
    return this.uploadJSON({
      type: "ai_analysis",
      version: "1.0",
      ...analysis,
    });
  }

  /**
   * Upload resolution evidence to 0G Storage
   * Convenience method for oracle data
   */
  async uploadEvidence(evidence: {
    marketId: string;
    question: string;
    outcome: string;
    sources: Array<{
      name: string;
      url: string;
      data: any;
      timestamp: number;
    }>;
    consensus: string;
    timestamp: number;
  }): Promise<UploadResult> {
    return this.uploadJSON({
      type: "resolution_evidence",
      version: "1.0",
      ...evidence,
    });
  }
}

/**
 * Create singleton 0G Storage instance
 * Use this in API routes
 */
let storageInstance: ZGStorage | null = null;

export async function getZGStorage(): Promise<ZGStorage> {
  if (!storageInstance) {
    const privateKey = process.env.AI_AGENT_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const network =
      (process.env.NEXT_PUBLIC_ZG_CHAIN_ID === "16600" ? "mainnet" : "testnet") as
        | "testnet"
        | "mainnet";

    storageInstance = new ZGStorage({
      network,
      evmRpc: process.env.NEXT_PUBLIC_ZG_TESTNET_RPC,
      indexerRpc: process.env.NEXT_PUBLIC_ZG_STORAGE_INDEXER,
      privateKey,
    });
  }

  return storageInstance;
}
