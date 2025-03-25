import { useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { useState } from 'react';
import { ArrowLeft, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { usePortfolio } from '../../hooks/usePortfolio';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';

export default function ClaimDistributions() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { claimDistribution } = useHarbor();
  const { positions, distributions, loading: portfolioLoading, refreshPortfolio } = usePortfolio(address || null);

  const [loading, setLoading] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const unclaimed = distributions.filter((d) => !d.claimed);

  const handleClaim = async (distId: string, offeringId: string, amountPerUnit: number) => {
    setLoading(distId);
    setTxResult({ txId: '', status: 'pending', message: 'Claiming distribution...' });

    try {
      const positionRecord = positions.find((position) => position.offeringId === offeringId)?.record;

      if (!positionRecord) throw new Error('No position record found');

      const result = await claimDistribution(
        positionRecord,
        distId,
        amountPerUnit.toString(),
      );

      await refreshPortfolio();

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: 'Distribution claimed!',
      });
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Claim failed',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/investor')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <DollarSign size={24} className="text-amber-400" />
        Claim Distributions
      </h1>

      {portfolioLoading ? (
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="skeleton-heading w-1/3 mb-2" />
                <div className="skeleton-text w-1/4 mb-1" />
                <div className="skeleton-text w-1/5" />
              </div>
              <div className="skeleton w-20 h-9 rounded-lg" />
            </div>
          ))}
        </div>
      ) : unclaimed.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <DollarSign size={40} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">No unclaimed distributions</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {unclaimed.map((dist) => (
            <div
              key={dist.id}
              className="glass-card p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">Distribution</p>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  {dist.id.slice(0, 16)}...
                </p>
                <p className="text-sm text-amber-400 mt-1">
                  {dist.amountPerUnit} per unit
                </p>
              </div>
              <button
                onClick={() => handleClaim(dist.id, dist.offeringId, dist.amountPerUnit)}
                disabled={loading !== null}
                className="btn btn-accent"
              >
                {loading === dist.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Claim
              </button>
            </div>
          ))}
        </div>
      )}

      {distributions.filter((d) => d.claimed).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Claimed</h2>
          <div className="space-y-2">
            {distributions
              .filter((d) => d.claimed)
              .map((dist) => (
                <div
                  key={dist.id}
                  className="bg-neutral-800/20 border border-neutral-700/50 rounded-lg p-4 flex items-center justify-between opacity-60"
                >
                  <div>
                    <p className="text-neutral-300 text-sm">{dist.id.slice(0, 16)}...</p>
                    <p className="text-xs text-neutral-500">{dist.amountPerUnit} per unit</p>
                  </div>
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <CheckCircle size={12} /> Claimed
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
