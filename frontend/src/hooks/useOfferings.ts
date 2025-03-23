import { useState, useEffect, useCallback } from 'react';
import { Offering } from '../lib/types';
import { readAllOfferings } from '../lib/marketplace';

export function useOfferings() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOfferings = useCallback(async () => {
    setLoading(true);
    try {
      const next = await readAllOfferings();
      setOfferings(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOfferings();
  }, [refreshOfferings]);

  const getOffering = useCallback(
    (id: string) => offerings.find((offering) => offering.id === id),
    [offerings],
  );

  const activeOfferings = offerings.filter((offering) => offering.isActive);

  return { offerings, activeOfferings, getOffering, loading, refreshOfferings };
}
