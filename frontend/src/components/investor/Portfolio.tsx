import { useNavigate } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useOfferings } from '../../hooks/useOfferings';
import PositionCard from '../shared/PositionCard';

export default function Portfolio() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { positions, loading } = usePortfolio(address || null);
  const { getOffering } = useOfferings();

  return (
    <div>
      <button
        onClick={() => navigate('/investor')}
        className="btn btn-ghost btn-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

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
        <div className="glass-card p-12 text-center">
          <Briefcase size={40} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">No positions in your portfolio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {positions.map((pos, i) => {
            const offering = getOffering(pos.offeringId);
            return (
              <PositionCard
                key={pos.positionId || `${pos.offeringId}-${i}`}
                position={pos}
                offeringName={offering?.name}
                onTransfer={() => navigate('/investor/transfer')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
