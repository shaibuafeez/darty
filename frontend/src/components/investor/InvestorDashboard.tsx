import { Link } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import {
  Briefcase,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  Vote,
  TrendingUp,
} from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';
import StatCard from '../shared/StatCard';
import PositionCard from '../shared/PositionCard';

export default function InvestorDashboard() {
  const { address } = useWallet();
  const { positions, distributions, loading } = usePortfolio(address || null);

  const totalUnits = positions.reduce((sum, p) => sum + p.amount, 0);
  const unclaimedDist = distributions.filter((d) => !d.claimed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Investor Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">Your private real estate portfolio</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/investor/onboarding"
            className="btn btn-secondary"
          >
            <ShieldCheck size={16} />
            Get Credentialed
          </Link>
          <Link
            to="/marketplace"
            className="btn btn-primary"
          >
            <TrendingUp size={16} />
            Browse Offerings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard icon={Briefcase} label="Positions" value={positions.length} />
        <StatCard icon={DollarSign} label="Total Units" value={totalUnits} />
        <StatCard icon={ArrowRightLeft} label="Unclaimed" value={unclaimedDist} />
        <StatCard icon={Vote} label="Active Votes" value={0} sub="Coming soon" />
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/investor/portfolio" className="btn btn-ghost btn-sm text-amber-400">
          View Full Portfolio
        </Link>
        <Link to="/investor/distributions" className="btn btn-ghost btn-sm text-amber-400">
          Claim Distributions
        </Link>
        <Link to="/investor/governance" className="btn btn-ghost btn-sm text-amber-400">
          Governance
        </Link>
        <Link to="/investor/transfer" className="btn btn-ghost btn-sm text-amber-400">
          Transfer
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-amber-400" />
          Recent Positions
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="skeleton-heading w-2/3 mb-2" />
                    <div className="skeleton-text w-1/3" />
                  </div>
                  <div className="text-right">
                    <div className="skeleton-heading w-16 ml-auto mb-1" />
                    <div className="skeleton-text w-10 ml-auto" />
                  </div>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-700/50">
                  <div className="skeleton-text w-1/3" />
                  <div className="skeleton-text w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="gradient-border-card p-12 text-center">
            <Briefcase size={40} className="text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-4">No positions yet</p>
            <Link
              to="/marketplace"
              className="btn btn-primary"
            >
              <TrendingUp size={16} />
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {positions.slice(0, 4).map((pos, i) => (
              <PositionCard key={pos.positionId || `${pos.offeringId}-${i}`} position={pos} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
