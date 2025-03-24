import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { hashToField } from '../../lib/utils';
import { executeZPassFunctionWithConfig } from '../../lib/zpass';
import {
  DEFAULT_HARBOR_ZPASS_PROGRAM_ID,
  DEFAULT_ZPASS_HOST,
  DEFAULT_ZPASS_NETWORK,
  DEFAULT_ZPASS_REGISTER_FUNCTION,
} from '../../lib/zpassSchemas';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';

export default function RegisterIssuer() {
  const navigate = useNavigate();
  const { registerIssuer } = useHarbor();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [zpassIssuerKey, setZpassIssuerKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) return;

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Registering as issuer...' });

    try {
      const hash = hashToField(licenseNumber);
      const result = await registerIssuer(hash);
      let zpassMessage = '';

      if (zpassIssuerKey.trim()) {
        await executeZPassFunctionWithConfig(
          {
            privateKey: zpassIssuerKey.trim(),
            host: DEFAULT_ZPASS_HOST,
            network: DEFAULT_ZPASS_NETWORK,
          },
          {
            programName: DEFAULT_HARBOR_ZPASS_PROGRAM_ID,
            functionName: DEFAULT_ZPASS_REGISTER_FUNCTION,
            inputs: [],
            privateFee: false,
            fee: 300000,
          },
        );
        zpassMessage = ' Registered on Harbor zPass as well.';
      }

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: `Successfully registered as issuer!${zpassMessage}`,
      });
      setTimeout(() => navigate('/issuer'), 2000);
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate('/issuer')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-neutral-900/50 rounded-lg shadow-lg shadow-neutral-900/20">
            <FileCheck size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Register as Issuer</h2>
            <p className="text-sm text-neutral-400">Provide your securities license to become an issuer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              License Number / Registration ID
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g., SEC-2024-00123"
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used to derive your registration hash. The raw license value stays local; only the derived hash is stored on-chain with your issuer registration.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Harbor zPass Issuer Key (optional)
            </label>
            <input
              type="password"
              value={zpassIssuerKey}
              onChange={(e) => setZpassIssuerKey(e.target.value)}
              placeholder="Aleo private key for reusable investor credentials"
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
            />
            <p className="text-xs text-neutral-500 mt-1">
              If provided, this also registers the issuer on <span className="font-mono">{DEFAULT_HARBOR_ZPASS_PROGRAM_ID}</span>
              {' '}for reusable investor credentials.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register as Issuer'
            )}
          </button>
        </form>
      </div>

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
