export const PROGRAM_ID = 'harbor.aleo';

const API_BASE = 'https://api.explorer.provable.com/v1/testnet';

export const explorerUrl = (txId: string) =>
  `https://testnet.aleoscan.io/transaction/${txId}`;

export const programUrl = () =>
  `https://testnet.aleoscan.io/program/${PROGRAM_ID}`;

/**
 * Read a public mapping value from the Aleo testnet explorer API.
 * Returns the parsed value or null if the key doesn't exist.
 */
export async function readMapping(mappingName: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${API_BASE}/program/${PROGRAM_ID}/mapping/${mappingName}/${key}`,
    );
    if (!res.ok) return null;
    const text = await res.text();
    // API returns JSON-encoded string, strip quotes
    return text.replace(/^"|"$/g, '').trim();
  } catch {
    return null;
  }
}

/**
 * Parse an on-chain struct string into a key-value object.
 * e.g. "{ issuer: aleo1..., total_supply: 1000u64, is_active: true }" -> { issuer: "aleo1...", ... }
 */
export function parseStructValue(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  // Strip outer braces
  const inner = raw.replace(/^\{|\}$/g, '').trim();
  // Split on comma, handling addresses that contain no commas
  const pairs = inner.split(',');
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx === -1) continue;
    const key = pair.slice(0, colonIdx).trim();
    const value = pair.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

/**
 * Strip Leo type suffixes (u8, u32, u64, field, bool, etc.) from a value string.
 */
export function stripTypeSuffix(val: string): string {
  return val.replace(/(u8|u16|u32|u64|u128|i8|i16|i32|i64|i128|field|scalar|group)$/, '');
}
