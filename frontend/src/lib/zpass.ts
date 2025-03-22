import type { OnChainOptions, OutputJSON, VerifyOnChainOptions } from 'zpass-sdk';
import { getZPassWorker } from '../workers/AleoWorker';
import {
  DEFAULT_ZPASS_HOST,
  DEFAULT_ZPASS_NETWORK,
  type HarborZPassSigningInput,
  type ZPassNetwork,
  buildHarborZPassSigningData,
} from './zpassSchemas';
import type { ZPassConnectionConfig } from '../workers/zpass.worker';

export interface ZPassConfigInput {
  privateKey: string;
  host?: string;
  network?: ZPassNetwork;
}

export interface HarborZPassSignatureResult {
  signature: string;
  hash: string;
  data: Record<string, string>;
}

export interface ZPassVerificationSummary {
  hasExecution: boolean;
  outputs: OutputJSON[];
}

export function normalizeZPassConfig(config: ZPassConfigInput): ZPassConnectionConfig {
  const privateKey = config.privateKey.trim();

  if (!privateKey) {
    throw new Error('A zPass private key is required.');
  }

  return {
    privateKey,
    host: config.host?.trim() || DEFAULT_ZPASS_HOST,
    network: config.network ?? DEFAULT_ZPASS_NETWORK,
  };
}

export async function signHarborCredentialWithZPass(
  config: ZPassConfigInput,
  input: HarborZPassSigningInput,
): Promise<HarborZPassSignatureResult> {
  const worker = getZPassWorker();
  const data = buildHarborZPassSigningData(input);
  const result = await worker.signCredential({
    config: normalizeZPassConfig(config),
    data,
  });

  return {
    ...result,
    data,
  };
}

export async function issueZPassWithConfig(
  config: ZPassConfigInput,
  options: OnChainOptions,
): Promise<string> {
  const worker = getZPassWorker();
  return worker.issueZPass({
    config: normalizeZPassConfig(config),
    options,
  });
}

export async function executeZPassFunctionWithConfig(
  config: ZPassConfigInput,
  options: OnChainOptions,
): Promise<string> {
  return issueZPassWithConfig(config, options);
}

export async function getZPassRecordWithConfig(
  config: ZPassConfigInput,
  transactionId: string,
): Promise<string> {
  const worker = getZPassWorker();
  return worker.getZPassRecord({
    config: normalizeZPassConfig(config),
    transactionId,
  });
}

export async function verifyZPassTransaction(
  options: VerifyOnChainOptions,
): Promise<ZPassVerificationSummary> {
  const worker = getZPassWorker();
  const result = await worker.verifyOnChain(options);
  return {
    hasExecution: result.hasExecution,
    outputs: result.outputs as OutputJSON[],
  };
}

export function parseZPassInputsJson(value: string): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Inputs must be valid JSON.');
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Inputs must be a JSON array of Aleo-formatted strings.');
  }

  return parsed;
}
