import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { ArrowLeft, Vote, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { usePortfolio } from '../../hooks/usePortfolio';
import { readAllProposals } from '../../lib/marketplace';
import TransactionStatus from '../common/TransactionStatus';
import { Proposal, TransactionResult } from '../../lib/types';

export default function GovernanceVoting() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { castVote } = useHarbor();
  const { positions, loading: portfolioLoading } = usePortfolio(address || null);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalId, setProposalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingProposals(true);
      try {
        const next = await readAllProposals();
        if (!cancelled) setProposals(next);
      } finally {
        if (!cancelled) setLoadingProposals(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const positionByOffering = useMemo(
    () => new Map(positions.map((position) => [position.offeringId, position])),
    [positions],
  );

  const availableProposals = useMemo(
    () => proposals.filter((proposal) => positionByOffering.has(proposal.offeringId)),
    [positionByOffering, proposals],
  );

  const selectedProposal = availableProposals.find((proposal) => proposal.id === proposalId);

  const handleVote = async (vote: boolean) => {
    if (!proposalId || !address) return;

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: `Casting ${vote ? 'yes' : 'no'} vote...` });

    try {
      const positionRecord = selectedProposal
        ? positionByOffering.get(selectedProposal.offeringId)?.record
        : undefined;

      if (!positionRecord) throw new Error('No position record found. You need a position to vote.');

      const result = await castVote(
        positionRecord,
        proposalId,
        vote,
      );

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: `Vote cast: ${vote ? 'YES' : 'NO'}`,
      });
      setProposalId('');
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Vote failed',
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
            <Vote size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Governance Voting</h2>
            <p className="text-sm text-neutral-400">Vote on proposals with your position weight</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Proposal
            </label>
            <select
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200 font-mono text-sm"
            >
              <option value="">
                {loadingProposals || portfolioLoading
                  ? 'Loading eligible proposals...'
                  : 'Choose a proposal...'}
              </option>
              {availableProposals.map((proposal) => (
                <option key={proposal.id} value={proposal.id}>
                  {proposal.id.slice(0, 12)}... · {proposal.yesVotes || 0} yes / {proposal.noVotes || 0} no
                </option>
              ))}
            </select>
            {selectedProposal && (
              <p className="text-xs text-neutral-400 mt-2 font-mono">
                Hash: {selectedProposal.descriptionHash.slice(0, 24)}...
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={loading || !proposalId}
              className="btn btn-success btn-lg"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <><ThumbsUp size={18} /> Vote YES</>
              )}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={loading || !proposalId}
              className="btn btn-danger btn-lg"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <><ThumbsDown size={18} /> Vote NO</>
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            Your vote weight equals your position size. Each address can only vote once per proposal.
          </p>
        </div>
      </div>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
