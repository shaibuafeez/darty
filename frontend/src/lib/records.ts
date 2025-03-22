import { ComplianceCredential, Position } from './types';
import { stripTypeSuffix } from './aleo';

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getRecordData(record: unknown): UnknownRecord | null {
  if (!isObject(record)) return null;

  if (isObject(record.data)) return record.data;

  if (isObject(record.plaintext)) {
    const plaintext = record.plaintext;
    if (isObject(plaintext.data)) return plaintext.data;
    return plaintext;
  }

  return record;
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function toNumberValue(value: unknown): number {
  const raw = stripTypeSuffix(toStringValue(value));
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBooleanValue(value: unknown): boolean {
  return toStringValue(value) === 'true';
}

export function isUnspentRecord(record: unknown): boolean {
  return !isObject(record) || record.spent !== true;
}

export function stringifyRecord(record: unknown): string {
  return JSON.stringify(record);
}

export function parseComplianceCredentialRecord(record: unknown): ComplianceCredential | null {
  if (!isUnspentRecord(record)) return null;

  const data = getRecordData(record);
  if (!data) return null;

  if (!('credential_hash' in data) || !('expiry' in data) || !('jurisdiction' in data)) {
    return null;
  }

  return {
    owner: toStringValue(data.owner),
    issuer: toStringValue(data.issuer),
    jurisdiction: toNumberValue(data.jurisdiction),
    accredited: toBooleanValue(data.accredited),
    tier: toNumberValue(data.tier),
    credentialHash: toStringValue(data.credential_hash),
    expiry: toNumberValue(data.expiry),
    record: stringifyRecord(record),
  };
}

export function parsePositionRecord(record: unknown): Position | null {
  if (!isUnspentRecord(record)) return null;

  const data = getRecordData(record);
  if (!data) return null;

  if (!('position_id' in data) || !('offering_id' in data) || !('amount' in data)) {
    return null;
  }

  return {
    owner: toStringValue(data.owner),
    positionId: toStringValue(data.position_id),
    offeringId: toStringValue(data.offering_id),
    amount: toNumberValue(data.amount),
    subscribedAt: 0,
    issuer: toStringValue(data.issuer),
    record: stringifyRecord(record),
  };
}

export function parseDistributionReceiptRecord(record: unknown): {
  distributionId: string;
  offeringId: string;
} | null {
  if (!isUnspentRecord(record)) return null;

  const data = getRecordData(record);
  if (!data) return null;

  if (!('distribution_id' in data) || !('offering_id' in data)) {
    return null;
  }

  return {
    distributionId: toStringValue(data.distribution_id),
    offeringId: toStringValue(data.offering_id),
  };
}
