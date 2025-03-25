import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useHarbor } from '../../hooks/useHarbor';
import { JURISDICTIONS, COMPLIANCE_TIERS } from '../../lib/constants';
import { hashToField, dateToI64, currentTimestampI64, isLikelyAleoAddress } from '../../lib/utils';
import { buildHarborZPassIssueArtifacts, DEFAULT_HARBOR_ZPASS_PROGRAM_ID, DEFAULT_ZPASS_HOST, DEFAULT_ZPASS_ISSUE_FEE, DEFAULT_ZPASS_ISSUE_FUNCTION, DEFAULT_ZPASS_NETWORK } from '../../lib/zpassSchemas';
import { issueZPassWithConfig, signHarborCredentialWithZPass } from '../../lib/zpass';
import TransactionStatus from '../common/TransactionStatus';
import { TransactionResult } from '../../lib/types';

export default function ComplianceOnboarding() {
  const navigate = useNavigate();
  const { address, issueComplianceCredential } = useHarbor();

  const [form, setForm] = useState({
    fullName: '',
    jurisdiction: '1',
    accredited: true,
    tier: '2',
    investorAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);
  const [zpassIssuerKey, setZpassIssuerKey] = useState('');
  const [zpassHolderKey, setZpassHolderKey] = useState('');
  const [zpassBundle, setZpassBundle] = useState('');
  const [zpassTxId, setZpassTxId] = useState('');

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAddr = form.investorAddress || address;
    if (!targetAddr) return;
    if (!isLikelyAleoAddress(targetAddr)) {
      setTxResult({ txId: '', status: 'error', message: 'Enter a valid Aleo address.' });
      return;
    }

    setLoading(true);
    setTxResult({ txId: '', status: 'pending', message: 'Issuing credential...' });

    try {
      const credentialHash = hashToField(`${form.fullName}:${form.jurisdiction}:${Date.now()}`);
      const issuedAt = currentTimestampI64();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const expiry = dateToI64(expiryDate);
      const issuedAtSeconds = Math.floor(Date.now() / 1000);
      const expirySeconds = Math.floor(expiryDate.getTime() / 1000);

      const result = await issueComplianceCredential(
        targetAddr,
        parseInt(form.jurisdiction),
        form.accredited,
        parseInt(form.tier),
        credentialHash,
        issuedAt,
        expiry,
      );

      let successMessage = 'Credential issued! The investor now has a private compliance credential.';

      if (zpassIssuerKey.trim() && address) {
        const signed = await signHarborCredentialWithZPass(
          {
            privateKey: zpassIssuerKey.trim(),
            host: DEFAULT_ZPASS_HOST,
            network: DEFAULT_ZPASS_NETWORK,
          },
          {
            issuer: address,
            subject: targetAddr,
            jurisdiction: parseInt(form.jurisdiction, 10),
            accredited: form.accredited,
            tier: parseInt(form.tier, 10),
            credentialHash,
            issuedAt: issuedAtSeconds,
            expiry: expirySeconds,
          },
        );

        const artifacts = buildHarborZPassIssueArtifacts(signed.data, signed.signature);
        const bundle = {
          schema: 'harbor_compliance_zpass_v1',
          network: DEFAULT_ZPASS_NETWORK,
          program_name: DEFAULT_HARBOR_ZPASS_PROGRAM_ID,
          function_name: DEFAULT_ZPASS_ISSUE_FUNCTION,
          payload: signed.data,
          signature: signed.signature,
          hash: signed.hash,
          issuer_wallet: address,
          inputs: artifacts.inputs,
        };

        setZpassBundle(JSON.stringify(bundle, null, 2));
        setZpassTxId('');
        successMessage = 'Harbor credential issued and zPass bundle prepared.';

        if (zpassHolderKey.trim()) {
          const zpassIssueTx = await issueZPassWithConfig(
            {
              privateKey: zpassHolderKey.trim(),
              host: DEFAULT_ZPASS_HOST,
              network: DEFAULT_ZPASS_NETWORK,
            },
            {
              programName: DEFAULT_HARBOR_ZPASS_PROGRAM_ID,
              functionName: DEFAULT_ZPASS_ISSUE_FUNCTION,
              inputs: artifacts.inputs,
              privateFee: false,
              fee: DEFAULT_ZPASS_ISSUE_FEE,
            },
          );

          setZpassTxId(zpassIssueTx);
          successMessage = 'Harbor credential issued and companion zPass credential minted.';
        }
      }

      setTxResult({
        txId: result?.transactionId || '',
        status: 'success',
        message: successMessage,
      });
    } catch (err: any) {
      setTxResult({
        txId: '',
        status: 'error',
        message: err?.message || 'Failed to issue credential',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-neutral-900/50 rounded-lg shadow-lg shadow-neutral-900/20">
            <ShieldCheck size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Compliance Onboarding</h2>
            <p className="text-sm text-neutral-400">Issue a private KYC credential on Aleo</p>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-6 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            Demo mode: In production, credentials would be issued by a licensed KYC provider
            after identity verification. This simulates the issuer flow and can optionally prepare
            a reusable companion credential via <span className="font-mono">{DEFAULT_HARBOR_ZPASS_PROGRAM_ID}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Investor Address (leave blank for self)
            </label>
            <input
              type="text"
              value={form.investorAddress}
              onChange={(e) => set('investorAddress', e.target.value)}
              placeholder={address || 'aleo1...'}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="John Smith"
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Jurisdiction</label>
            <select
              value={form.jurisdiction}
              onChange={(e) => set('jurisdiction', e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
            >
              {Object.entries(JURISDICTIONS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Compliance Tier</label>
            <select
              value={form.tier}
              onChange={(e) => set('tier', e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none input-glow transition-all duration-200"
            >
              {Object.entries(COMPLIANCE_TIERS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accredited}
              onChange={(e) => set('accredited', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 text-amber-500"
            />
            <span className="text-sm text-neutral-300">Accredited Investor</span>
          </label>

          <div className="border border-white/10 rounded-xl bg-black/20 p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-white">Optional zPass companion credential</p>
              <p className="mt-1 text-xs text-neutral-500">
                Harbor can also prepare a reusable investor credential bundle for <span className="font-mono">{DEFAULT_HARBOR_ZPASS_PROGRAM_ID}</span>.
                Provide the issuer key to sign it. Provide the holder key to mint it immediately in demo mode.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                zPass Issuer Key
              </label>
              <input
                type="password"
                value={zpassIssuerKey}
                onChange={(e) => setZpassIssuerKey(e.target.value)}
                placeholder="Issuer private key for zPass signing"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Holder zPass Key (optional)
              </label>
              <input
                type="password"
                value={zpassHolderKey}
                onChange={(e) => setZpassHolderKey(e.target.value)}
                placeholder="Holder private key to mint the companion zPass now"
                className="w-full bg-neutral-900/80 border border-neutral-600 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Issuing Credential...</>
            ) : (
              <><ShieldCheck size={18} /> Issue Credential</>
            )}
          </button>
        </form>
      </div>

      {(zpassBundle || zpassTxId) && (
        <div className="glass-card p-6 mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white">zPass companion output</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Use this bundle to issue or verify a reusable investor credential outside the core Harbor contract flow.
            </p>
          </div>

          {zpassTxId && (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-900/10 px-4 py-3 text-sm text-emerald-300">
              zPass transaction submitted: <span className="font-mono break-all">{zpassTxId}</span>
            </div>
          )}

          {zpassBundle && (
            <textarea
              readOnly
              value={zpassBundle}
              rows={12}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-xs text-neutral-300 font-mono"
            />
          )}
        </div>
      )}

      <TransactionStatus result={txResult} onDismiss={() => setTxResult(null)} />
    </div>
  );
}
