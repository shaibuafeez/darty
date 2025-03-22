export function generateId(): string {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  let result = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    result = (result << BigInt(8)) | BigInt(bytes[i]);
  }
  return result.toString() + 'field';
}

export function hashToField(input: string): string {
  let hash = BigInt(0);
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31n + BigInt(input.charCodeAt(i))) % (2n ** 253n);
  }
  return hash.toString() + 'field';
}

export function isLikelyAleoAddress(address: string): boolean {
  return /^aleo1[0-9a-z]{58}$/.test(address.trim());
}

export function textToFieldChunks(input: string, chunkCount = 2, chunkBytes = 31): string[] {
  const bytes = new TextEncoder().encode(input.trim());
  const maxBytes = chunkCount * chunkBytes;
  if (bytes.length > maxBytes) {
    throw new Error(`Text is too long. Maximum is ${maxBytes} bytes.`);
  }

  const chunks: string[] = [];
  for (let offset = 0; offset < chunkCount; offset += 1) {
    const slice = bytes.slice(offset * chunkBytes, (offset + 1) * chunkBytes);
    let value = 0n;
    for (const byte of slice) {
      value = (value << 8n) | BigInt(byte);
    }
    chunks.push(`${value}field`);
  }

  return chunks;
}

export function fieldChunksToText(fields: Array<string | null | undefined>): string {
  const bytes: number[] = [];

  for (const field of fields) {
    if (!field) continue;
    const cleaned = field.replace(/field$/, '').trim();
    if (!cleaned || cleaned === '0') continue;

    let value = BigInt(cleaned);
    const chunk: number[] = [];
    while (value > 0n) {
      chunk.unshift(Number(value & 0xffn));
      value >>= 8n;
    }
    bytes.push(...chunk);
  }

  return new TextDecoder().decode(Uint8Array.from(bytes));
}

export function dateToI64(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString() + 'i64';
}

export function currentTimestampI64(): string {
  return dateToI64(new Date());
}

export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatCredits(microcredits: number): string {
  return (microcredits / 1_000_000).toFixed(2);
}

export function parseCreditsToMicrocredits(input: string): string {
  const value = input.trim();
  if (!value) {
    throw new Error('Enter an amount in Aleo credits.');
  }

  if (!/^\d+(\.\d{0,6})?$/.test(value)) {
    throw new Error('Aleo credit amounts can use up to 6 decimal places.');
  }

  const [whole, fraction = ''] = value.split('.');
  const paddedFraction = `${fraction}000000`.slice(0, 6);
  return `${BigInt(whole) * 1_000_000n + BigInt(paddedFraction)}`;
}

export function formatMicrocredits(amount: number): string {
  const credits = amount / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: credits % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 6,
  }).format(credits);
}

export function formatAleoCredits(amount: number): string {
  return `${formatMicrocredits(amount)} ALEO`;
}

export function formatTokenAmount(amount: number, symbol: string): string {
  return `${formatMicrocredits(amount)} ${symbol}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function isExpired(expiryTimestamp: number): boolean {
  return Math.floor(Date.now() / 1000) > expiryTimestamp;
}
