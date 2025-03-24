import { useState } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { TransactionResult } from '../../lib/types';
import TransactionStatus from '../common/TransactionStatus';
import { isLikelyAleoAddress } from '../../lib/utils';

interface Props {
  offeringId: string;
}

export default function InvestorApproval({ offeringId }: Props) {
  const { approveInvestor } = useHarbor();
  const [investorAddress, setInvestorAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorAddress.trim()) return;
    if (!isLikelyAleoAddress(investorAddress)) {
      setTxResult({ txId: '', status: 'error', message: 'Enter a valid Aleo address.' });
      return;
    }

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Approving investor...' });

    try {
      const result = await approveInvestor(investorAddress, offeringId);
      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: 'Investor approved successfully!',
      });
      setInvestorAddress('');
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Failed to approve investor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck size={20} className="text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Approve Investor</h3>
      </div>

      <form onSubmit={handleApprove} className="space-y-3">
        <input
          type="text"
          value={investorAddress}
          onChange={(e) => setInvestorAddress(e.target.value)}
          placeholder="Investor Aleo address (aleo1...)"
          className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200 font-mono text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-success btn-full"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Approving...</>
          ) : (
            <><UserCheck size={16} /> Whitelist Investor</>
          )}
        </button>
      </form>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
