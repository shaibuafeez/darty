import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { ArrowLeft, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { useOfferings } from '../../hooks/useOfferings';
import { usePortfolio } from '../../hooks/usePortfolio';
import { generateId, formatNumber, formatTokenAmount } from '../../lib/utils';
import { parseComplianceCredentialRecord } from '../../lib/records';
import OfferingCard from '../shared/OfferingCard';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';
import { getSettlementAssetTokenId, SETTLEMENT_ASSET_CODES, SETTLEMENT_ASSET_LABELS } from '../../lib/constants';

export default function OfferingSubscribe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useWallet();
  const { subscribe, getRecords, transferPublicCredits, transferTokenPublic } = useHarbor();
  const { getOffering, refreshOfferings, loading: offeringsLoading } = useOfferings();
  const { refreshPortfolio } = usePortfolio(address || null);

  const [amount, setAmount] = useState('');
  const [settleWithCredits, setSettleWithCredits] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const offering = id ? getOffering(id) : undefined;
  const parsedAmount = Number.parseInt(amount, 10);
  const settlementLabel = SETTLEMENT_ASSET_LABELS[offering?.settlementAsset || SETTLEMENT_ASSET_CODES.ALEO] || 'ALEO';

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
        <button onClick={() => navigate('/marketplace')} className="text-amber-400 mt-2 text-sm">
          Back to Marketplace
        </button>
      </div>
    );
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount) return;
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setTxResult({ txId: '', status: 'error', message: 'Enter a valid subscription amount.' });
      return;
    }

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Subscribing to offering...' });

    try {
      const records = await getRecords();
      const now = Math.floor(Date.now() / 1000);
      const credential = (records || [])
        .map((record) => parseComplianceCredentialRecord(record))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .find((entry) => entry.expiry > now);

      if (!credential) {
        throw new Error('No compliance credential found. Please get credentialed first.');
      }

      const totalCost = `${parsedAmount * offering.pricePerUnit}`;

      if (settleWithCredits) {
        setTxResult({
          txId: '',
          status: 'pending',
          message: `Settling subscription in ${settlementLabel}...`,
        });

        if (offering.settlementAsset === SETTLEMENT_ASSET_CODES.ALEO) {
          await transferPublicCredits(offering.issuer, totalCost);
        } else {
          const tokenId = getSettlementAssetTokenId(offering.settlementAsset);
          if (!tokenId) {
            throw new Error(`Settlement token ID for ${settlementLabel} is not configured.`);
          }
          await transferTokenPublic(tokenId, offering.issuer, totalCost);
        }
      }

      const result = await subscribe(
        credential.record || '',
        offering.id,
        amount,
        generateId(),
        offering.issuer,
      );

      await Promise.all([refreshPortfolio(), refreshOfferings()]);

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: `Subscribed ${amount} units!`,
      });
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Subscription failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const remaining = offering.totalSupply - (offering.subscribed || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/marketplace')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <OfferingCard offering={offering} showActions={false} />

      <div className="glass-card p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShoppingCart size={20} className="text-amber-400" />
          Subscribe
        </h3>

        {offering.description && (
          <p className="text-sm text-neutral-400 mb-4 leading-relaxed">{offering.description}</p>
        )}

        <div className="bg-neutral-900/20 border border-neutral-800/50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-300">
            You need a valid compliance credential and whitelist approval to subscribe.
            Min: {formatNumber(offering.minSubscription)} units | Remaining: {formatNumber(remaining)} units
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Amount (units)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={offering.minSubscription}
              max={remaining}
              placeholder={`Min ${offering.minSubscription}`}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              required
            />
            {amount && Number.isFinite(parsedAmount) && (
              <p className="text-xs text-neutral-400 mt-1">
                Total cost: {formatTokenAmount(parsedAmount * offering.pricePerUnit, settlementLabel)}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settleWithCredits}
              onChange={(e) => setSettleWithCredits(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-amber-500"
            />
            <span className="text-sm text-neutral-300">
              Add a demo settlement transfer before minting the position.
              <span className="mt-1 block text-xs text-neutral-500">
                This runs as a separate public transfer before the Harbor subscription transaction using {settlementLabel}. Stablecoin transfers use the Aleo token registry.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !offering.isActive}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Subscribing...</>
            ) : (
              <><ShoppingCart size={18} /> Subscribe</>
            )}
          </button>
        </form>
      </div>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
