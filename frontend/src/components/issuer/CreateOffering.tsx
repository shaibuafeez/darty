import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { useOfferings } from '../../hooks/useOfferings';
import { generateId, hashToField, dateToI64, textToFieldChunks, parseCreditsToMicrocredits } from '../../lib/utils';
import { PROPERTY_TYPE_CODES, PROPERTY_TYPES, SETTLEMENT_ASSET_CODES, SETTLEMENT_ASSET_LABELS } from '../../lib/constants';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';

export default function CreateOffering() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { createOffering } = useHarbor();
  const { refreshOfferings } = useOfferings();

  const [form, setForm] = useState({
    name: '',
    description: '',
    propertyType: PROPERTY_TYPES[0],
    location: '',
    totalSupply: '1000',
    pricePerUnit: '1000',
    settlementAsset: String(SETTLEMENT_ASSET_CODES.ALEO),
    lockupMonths: '12',
    accreditedOnly: false,
    minSubscription: '1',
    maxInvestors: '100',
  });
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Creating offering...' });

    try {
      const lockupMonths = Number.parseInt(form.lockupMonths, 10);
      if (!Number.isFinite(lockupMonths) || lockupMonths < 0) {
        throw new Error('Lockup period must be a valid number of months.');
      }

      const offeringId = generateId();
      const [nameField] = textToFieldChunks(form.name, 1);
      const [description1, description2] = textToFieldChunks(form.description, 2);
      const [locationField] = textToFieldChunks(form.location, 1);
      const propertyTypeCode = PROPERTY_TYPE_CODES[form.propertyType];
      const assetHash = hashToField(`${form.name}:${form.location}:${form.propertyType}`);
      const lockupEnd = dateToI64(
        new Date(Date.now() + lockupMonths * 30 * 24 * 60 * 60 * 1000),
      );

      const result = await createOffering(
        offeringId,
        nameField,
        description1,
        description2,
        propertyTypeCode,
        locationField,
        assetHash,
        form.totalSupply,
        parseCreditsToMicrocredits(form.pricePerUnit),
        parseInt(form.settlementAsset, 10),
        lockupEnd,
        form.accreditedOnly,
        form.minSubscription,
        form.maxInvestors,
      );

      await refreshOfferings();

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: 'Offering created successfully!',
      });
      setTimeout(() => navigate('/issuer'), 2000);
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Failed to create offering',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/issuer')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-neutral-900/50 rounded-lg shadow-lg shadow-neutral-900/20">
            <Building2 size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Offering</h2>
            <p className="text-sm text-neutral-400">Tokenize a real estate asset</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Offering Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g., Manhattan Office Tower A"
                maxLength={31}
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g., New York, NY"
                maxLength={31}
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Description
            </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Short on-chain summary for investors..."
                maxLength={62}
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Stored on-chain. Keep this under 62 characters.
              </p>
            </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Property Type
            </label>
            <select
              value={form.propertyType}
              onChange={(e) => set('propertyType', e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Total Supply (units)
              </label>
              <input
                type="number"
                value={form.totalSupply}
                onChange={(e) => set('totalSupply', e.target.value)}
                min="1"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Price Per Unit
              </label>
              <input
                type="number"
                value={form.pricePerUnit}
                onChange={(e) => set('pricePerUnit', e.target.value)}
                min="0"
                step="0.000001"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Stored on-chain in 6-decimal base units for the selected settlement asset.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Settlement Asset
              </label>
              <select
                value={form.settlementAsset}
                onChange={(e) => set('settlementAsset', e.target.value)}
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
              >
                {Object.entries(SETTLEMENT_ASSET_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Lockup Period (months)
              </label>
              <input
                type="number"
                value={form.lockupMonths}
                onChange={(e) => set('lockupMonths', e.target.value)}
                min="0"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Min Subscription
              </label>
              <input
                type="number"
                value={form.minSubscription}
                onChange={(e) => set('minSubscription', e.target.value)}
                min="1"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Max Investors
              </label>
              <input
                type="number"
                value={form.maxInvestors}
                onChange={(e) => set('maxInvestors', e.target.value)}
                min="1"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accreditedOnly}
              onChange={(e) => set('accreditedOnly', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-neutral-300">Accredited Investors Only</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Offering...
              </>
            ) : (
              'Create Offering'
            )}
          </button>
        </form>
      </div>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
