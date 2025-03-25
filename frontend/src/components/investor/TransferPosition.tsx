import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { ArrowLeft, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { usePortfolio } from '../../hooks/usePortfolio';
import { isLikelyAleoAddress } from '../../lib/utils';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';

export default function TransferPosition() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { transferPosition } = useHarbor();
  const { positions, loading: portfolioLoading, refreshPortfolio } = usePortfolio(address || null);

  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [buyer, setBuyer] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx < 0 || !buyer) return;
    if (!isLikelyAleoAddress(buyer)) {
      setTxResult({ txId: '', status: 'error', message: 'Enter a valid Aleo address.' });
      return;
    }

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Transferring position...' });

    try {
      const position = positions[selectedIdx];
      const record = position?.record;

      if (!record) throw new Error('Position record not found in wallet');

      const result = await transferPosition(
        record,
        buyer,
      );

      await refreshPortfolio();

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: 'Position transferred successfully!',
      });
      setBuyer('');
      setSelectedIdx(-1);
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Transfer failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate('/investor')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-neutral-900/50 rounded-lg shadow-lg shadow-neutral-900/20">
            <ArrowRightLeft size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Transfer Position</h2>
            <p className="text-sm text-neutral-400">Transfer your position to another investor</p>
          </div>
        </div>

        {portfolioLoading ? (
          <p className="text-neutral-400 text-center py-8">Loading wallet positions...</p>
        ) : positions.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No positions to transfer</p>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Select Position
              </label>
              <select
                value={selectedIdx}
                onChange={(e) => setSelectedIdx(parseInt(e.target.value))}
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              >
                <option value={-1}>Choose a position...</option>
                {positions.map((pos, i) => (
                  <option key={i} value={i}>
                    {pos.offeringId.slice(0, 12)}... — {pos.amount} units
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Buyer Address
              </label>
              <input
                type="text"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                placeholder="aleo1..."
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200 font-mono text-sm"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Buyer must be whitelisted for this offering. Lockup period must have expired.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || selectedIdx < 0}
              className="btn btn-primary btn-full btn-lg"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Transferring...</>
              ) : (
                <><ArrowRightLeft size={18} /> Transfer Position</>
              )}
            </button>
          </form>
        )}
      </div>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
