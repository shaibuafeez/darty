import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, DollarSign, Vote, XCircle, Loader2 } from 'lucide-react';
import { useOfferings } from '../../hooks/useOfferings';
import { useHarbor } from '../../hooks/useHarbor';
import InvestorApproval from './InvestorApproval';
import DistributionDeclare from './DistributionDeclare';
import OfferingCard from '../shared/OfferingCard';
import { TransactionResult } from '../../lib/types';
import TransactionStatus from '../common/TransactionStatus';
import { generateId, hashToField, dateToI64 } from '../../lib/utils';

type Tab = 'details' | 'investors' | 'distributions' | 'governance';

export default function OfferingManage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOffering, refreshOfferings, loading: offeringsLoading } = useOfferings();
  const { closeOffering, createProposal } = useHarbor();
  const [tab, setTab] = useState<Tab>('details');
  const [closing, setClosing] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const [proposalDesc, setProposalDesc] = useState('');
  const [votingDays, setVotingDays] = useState('7');

  const offering = id ? getOffering(id) : undefined;

  if (offeringsLoading && !offering) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400">Loading offering...</p>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400">Offering not found</p>
        <button onClick={() => navigate('/issuer')} className="text-amber-400 hover:text-amber-300 mt-2 text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this offering?')) return;
    setClosing(true);
    setTxResult({ txId: '', status: 'pending', message: 'Closing offering...' });
    try {
      const result = await closeOffering(offering.id);
      await refreshOfferings();
      setTxResult({ txId: result?.transactionId || '', status: 'success', message: 'Offering closed' });
    } catch (err: any) {
      setTxResult({ txId: '', status: 'error', message: err?.message || 'Failed' });
    } finally {
      setClosing(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProposal(true);
    setTxResult({ txId: '', status: 'pending', message: 'Creating proposal...' });
    try {
      const proposalId = generateId();
      const descHash = hashToField(proposalDesc);
      const votingEnd = dateToI64(new Date(Date.now() + parseInt(votingDays) * 86400000));
      const result = await createProposal(offering.id, proposalId, descHash, votingEnd);
      setTxResult({ txId: result?.transactionId || '', status: 'success', message: 'Proposal created!' });
      setProposalDesc('');
    } catch (err: any) {
      setTxResult({ txId: '', status: 'error', message: err?.message || 'Failed' });
    } finally {
      setCreatingProposal(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Settings }[] = [
    { key: 'details', label: 'Details', icon: Settings },
    { key: 'investors', label: 'Investors', icon: Users },
    { key: 'distributions', label: 'Distributions', icon: DollarSign },
    { key: 'governance', label: 'Governance', icon: Vote },
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/issuer')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">{offering.name || 'Manage Offering'}</h1>
        {offering.isActive && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="btn btn-ghost btn-sm text-red-400 hover:text-red-300 ml-auto"
          >
            <XCircle size={16} /> Close Offering
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-neutral-700 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="max-w-xl">
          <OfferingCard offering={offering} showActions={false} />
          {offering.description && (
            <div className="mt-4 glass-card p-5">
              <h3 className="text-sm font-medium text-neutral-300 mb-2">Description</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{offering.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'investors' && <InvestorApproval offeringId={offering.id} />}

      {tab === 'distributions' && <DistributionDeclare offeringId={offering.id} />}

      {tab === 'governance' && (
        <div className="max-w-xl glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Vote size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Create Proposal</h3>
          </div>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Proposal Description</label>
              <textarea
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                rows={3}
                placeholder="Describe the proposal for token holders..."
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Voting Period (days)</label>
              <input
                type="number"
                value={votingDays}
                onChange={(e) => setVotingDays(e.target.value)}
                min="1"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={creatingProposal}
              className="btn btn-primary btn-full"
            >
              {creatingProposal ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Vote size={16} /> Create Proposal</>}
            </button>
          </form>
        </div>
      )}

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
