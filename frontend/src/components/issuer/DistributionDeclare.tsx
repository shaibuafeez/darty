import { useEffect, useState } from 'react';
import { DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { generateId } from '../../lib/utils';
import { TransactionResult, Distribution } from '../../lib/types';
import TransactionStatus from '../common/TransactionStatus';
import { readAllDistributions } from '../../lib/marketplace';

interface Props {
  offeringId: string;
}

export default function DistributionDeclare({ offeringId }: Props) {
  const { declareDistribution } = useHarbor();
  const [amountPerUnit, setAmountPerUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);
  const [declared, setDeclared] = useState<Distribution[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const all = await readAllDistributions();
      if (!cancelled) {
        setDeclared(all.filter((distribution) => distribution.offeringId === offeringId));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [offeringId]);

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPerUnit) return;

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Declaring distribution...' });

    try {
      const distributionId = generateId();
      const result = await declareDistribution(offeringId, distributionId, amountPerUnit);

      const all = await readAllDistributions();
      setDeclared(all.filter((distribution) => distribution.offeringId === offeringId));

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: `Distribution declared: ${amountPerUnit} per unit (ID: ${distributionId.slice(0, 12)}...)`,
      });
      setAmountPerUnit('');
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Failed to declare distribution',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Declare Distribution</h3>
        </div>

        <form onSubmit={handleDeclare} className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Amount Per Unit</label>
            <input
              type="number"
              value={amountPerUnit}
              onChange={(e) => setAmountPerUnit(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent btn-full"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Declaring...</>
            ) : (
              <><DollarSign size={16} /> Declare Distribution</>
            )}
          </button>
        </form>

        <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
      </div>

      {declared.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Declared Distributions</h4>
          <div className="space-y-2">
            {declared.map((distribution) => (
              <div
                key={distribution.id}
                className="flex items-center justify-between bg-neutral-900/50 rounded-lg p-3"
              >
                <div>
                  <p className="text-xs text-neutral-400 font-mono">
                    {distribution.id.slice(0, 20)}...
                  </p>
                  <p className="text-sm text-white">{distribution.amountPerUnit} per unit</p>
                </div>
                <CheckCircle size={16} className="text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
