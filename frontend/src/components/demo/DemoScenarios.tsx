import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  ArrowRightLeft,
  Vote,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

const scenarios = [
  {
    id: 1,
    title: 'Investor Onboarding',
    icon: ShieldCheck,
    color: 'blue',
    steps: [
      'Connect wallet (no credential yet)',
      'Issuer completes KYC and issues ComplianceCredential',
      'Investor sees "Credentialed" badge on dashboard',
    ],
    link: '/investor/onboarding',
    shows: 'Privacy-preserving KYC with reusable ZK credentials',
  },
  {
    id: 2,
    title: 'Offering Subscription',
    icon: Building2,
    color: 'amber',
    steps: [
      'Issuer creates a real estate offering',
      'Issuer whitelists qualified investors',
      'Investor subscribes using their credential — gets Position record',
    ],
    link: '/issuer/create-offering',
    shows: 'Compliant issuance with private ownership proofs',
  },
  {
    id: 3,
    title: 'Restricted Transfer',
    icon: ArrowRightLeft,
    color: 'green',
    steps: [
      'Investor A tries to transfer to Investor B (not whitelisted) — fails',
      'Issuer whitelists Investor B',
      'Transfer succeeds — enforced by protocol, not middleware',
    ],
    link: '/investor/transfer',
    shows: 'Protocol-enforced transfer restrictions and lockups',
  },
  {
    id: 4,
    title: 'Distribution + Governance',
    icon: Vote,
    color: 'purple',
    steps: [
      'Issuer declares rental distribution (amount per unit)',
      'Investor claims distribution — receives DistributionReceipt',
      'Issuer creates proposal — investor votes weighted by position',
    ],
    link: '/issuer',
    shows: 'Full lifecycle: income + governance beyond token minting',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-neutral-900/30 border-neutral-800/50 text-neutral-400',
  amber: 'bg-amber-900/30 border-amber-800/50 text-amber-400',
  green: 'bg-green-900/30 border-green-800/50 text-green-400',
  purple: 'bg-purple-900/30 border-purple-800/50 text-purple-400',
};

export default function DemoScenarios() {
  return (
    <div>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-neutral-900/20 border border-neutral-800/50 text-neutral-400 text-sm px-4 py-1.5 rounded-full mb-4">
          <PlayCircle size={14} />
          Interactive Demo
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Demo Scenarios</h1>
        <p className="text-neutral-400 max-w-xl mx-auto">
          Walk through the key flows of Harbor Protocol. Each scenario demonstrates
          a different aspect of privacy-preserving real estate securities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto stagger-children">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-lg border ${colorMap[s.color]}`}>
                <s.icon size={22} />
              </div>
              <div>
                <span className="text-xs font-mono text-neutral-500">SCENARIO {s.id}</span>
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              </div>
            </div>

            <ol className="space-y-2 mb-4">
              {s.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-400 font-mono text-xs mt-0.5 flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-neutral-300">{step}</span>
                </li>
              ))}
            </ol>

            <div className="bg-neutral-900/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-neutral-400">
                <span className="text-amber-400 font-medium">Shows:</span> {s.shows}
              </p>
            </div>

            <Link
              to={s.link}
              className="btn btn-secondary btn-full"
            >
              Try This Flow <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 gradient-border-card p-8 max-w-4xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-white mb-2">How Privacy Works</h3>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-4">
          Harbor uses Aleo's zero-knowledge proof system. When you subscribe to an offering,
          your compliance credential is verified in ZK — the network confirms you're qualified
          without seeing your identity. Position amounts, vote weights, and distribution claims
          are all stored as private records that only you can decrypt.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          <div>
            <p className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>13</p>
            <p className="text-xs text-neutral-500">Transitions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>6</p>
            <p className="text-xs text-neutral-500">Private Records</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>13</p>
            <p className="text-xs text-neutral-500">Public Mappings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
