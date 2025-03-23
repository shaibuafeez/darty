import { useState, useEffect, useCallback } from 'react';
import { Distribution, Position } from '../lib/types';
import { useHarbor } from './useHarbor';
import {
  parseDistributionReceiptRecord,
  parsePositionRecord,
} from '../lib/records';
import { readAllDistributions, readPositionCreatedAt } from '../lib/marketplace';

export function usePortfolio(walletAddress: string | null) {
  const { getRecords } = useHarbor();
  const [positions, setPositions] = useState<Position[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setPositions([]);
      setDistributions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const records = await getRecords();

      const nextPositions = (records || [])
        .map((record) => parsePositionRecord(record))
        .filter((position): position is Position => Boolean(position));

      const positionsWithTimestamps = await Promise.all(
        nextPositions.map(async (position) => ({
          ...position,
          subscribedAt: position.positionId
            ? await readPositionCreatedAt(position.positionId)
            : 0,
        })),
      );

      const claimedReceipts = (records || [])
        .map((record) => parseDistributionReceiptRecord(record))
        .filter(
          (receipt): receipt is { distributionId: string; offeringId: string } =>
            Boolean(receipt),
        );

      const claimedSet = new Set(
        claimedReceipts.map((receipt) => receipt.distributionId),
      );
      const offeringIds = new Set(positionsWithTimestamps.map((position) => position.offeringId));

      const allDistributions = await readAllDistributions();
      const relevantDistributions = allDistributions
        .filter((distribution) => offeringIds.has(distribution.offeringId))
        .map((distribution) => ({
          ...distribution,
          claimed: claimedSet.has(distribution.id),
        }));

      setPositions(positionsWithTimestamps);
      setDistributions(relevantDistributions);
    } finally {
      setLoading(false);
    }
  }, [getRecords, walletAddress]);

  useEffect(() => {
    void refreshPortfolio();
  }, [refreshPortfolio]);

  return { positions, distributions, loading, refreshPortfolio };
}
