export type ZPassNetwork = 'mainnet' | 'testnet';

export interface HarborZPassSigningInput {
  issuer: string;
  subject: string;
  jurisdiction: number;
  accredited: boolean;
  tier: number;
  credentialHash: string;
  issuedAt: number;
  expiry: number;
}

export const DEFAULT_ZPASS_NETWORK: ZPassNetwork = 'testnet';
export const DEFAULT_ZPASS_HOST = 'https://api.explorer.provable.com/v1';
export const DEFAULT_HARBOR_ZPASS_PROGRAM_ID = 'harborzpass.aleo';
export const DEFAULT_ZPASS_ISSUE_FUNCTION = 'issue';
export const DEFAULT_ZPASS_REGISTER_FUNCTION = 'register_issuer';
export const DEFAULT_ZPASS_ISSUE_FEE = 300000;

export interface HarborZPassIssueArtifacts {
  salt: string;
  privateCredentials: string;
  publicCredentials: string;
  inputs: string[];
}

export function buildHarborZPassSigningData(
  input: HarborZPassSigningInput,
): Record<string, string> {
  return {
    issuer: input.issuer,
    subject: input.subject,
    jurisdiction: `${input.jurisdiction}u8`,
    accredited: input.accredited.toString(),
    tier: `${input.tier}u8`,
    credential_hash: input.credentialHash,
    issued_at: `${input.issuedAt}u32`,
    expiry: `${input.expiry}u32`,
  };
}

function randomBigIntLiteral(suffix: 'scalar'): string {
  const random = crypto.getRandomValues(new Uint8Array(31));
  const hex = Array.from(random)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `${BigInt(`0x${hex}`)}${suffix}`;
}

function buildLeoStructLiteral(entries: Array<[string, string]>): string {
  return `{${entries.map(([key, value]) => `${key}: ${value}`).join(', ')}}`;
}

export function buildHarborZPassIssueArtifacts(
  payload: Record<string, string>,
  signature: string,
): HarborZPassIssueArtifacts {
  const salt = randomBigIntLiteral('scalar');
  const privateCredentials = buildLeoStructLiteral([
    ['jurisdiction', payload.jurisdiction],
    ['accredited', payload.accredited],
    ['tier', payload.tier],
    ['credential_hash', payload.credential_hash],
    ['issued_at', payload.issued_at],
    ['expiry', payload.expiry],
  ]);
  const publicCredentials = buildLeoStructLiteral([
    ['issuer', payload.issuer],
    ['salt', salt],
  ]);

  return {
    salt,
    privateCredentials,
    publicCredentials,
    inputs: [signature, privateCredentials, publicCredentials],
  };
}
