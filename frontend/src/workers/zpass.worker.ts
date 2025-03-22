import { expose } from 'comlink';
import { HashAlgorithm, ZPassSDK, type OnChainOptions, type VerifyOnChainOptions } from 'zpass-sdk';

export interface ZPassConnectionConfig {
  privateKey: string;
  host?: string;
  network: 'mainnet' | 'testnet';
}

interface SignCredentialArgs {
  config: ZPassConnectionConfig;
  data: Record<string, string>;
}

interface IssueZPassArgs {
  config: ZPassConnectionConfig;
  options: OnChainOptions;
}

interface GetRecordArgs {
  config: ZPassConnectionConfig;
  transactionId: string;
}

const clients = new Map<string, ZPassSDK>();

function clientKey(config: ZPassConnectionConfig) {
  return `${config.network}:${config.host ?? ''}:${config.privateKey}`;
}

function getClient(config: ZPassConnectionConfig) {
  const key = clientKey(config);
  let client = clients.get(key);

  if (!client) {
    client = new ZPassSDK(config);
    clients.set(key, client);
  }

  return client;
}

const workerApi = {
  async signCredential({ config, data }: SignCredentialArgs) {
    const client = getClient(config);
    return client.signCredential({
      data,
      hashType: HashAlgorithm.POSEIDON2,
    });
  },

  async issueZPass({ config, options }: IssueZPassArgs) {
    const client = getClient(config);
    return client.issueZPass(options);
  },

  async getZPassRecord({ config, transactionId }: GetRecordArgs) {
    const client = getClient(config);
    return client.getZPassRecord(transactionId);
  },

  async verifyOnChain(options: VerifyOnChainOptions) {
    return ZPassSDK.verifyOnChain(options);
  },
};

export type ZPassWorkerApi = typeof workerApi;

expose(workerApi);
