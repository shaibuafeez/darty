import { Briefcase, Calendar, Hash } from 'lucide-react';
import { Position } from '../../lib/types';
import { formatNumber, timestampToDate, formatAddress } from '../../lib/utils';

interface Props {
  position: Position;
  offeringName?: string;
  onTransfer?: () => void;
}

export default function PositionCard({ position, offeringName, onTransfer }: Props) {
  return (
    <div className="glass-card p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-medium">
            {offeringName || `Offering ${position.offeringId.slice(0, 12)}...`}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
            <Hash size={12} />
            <span className="font-mono">{formatAddress(position.offeringId, 8)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-amber-400 font-mono group-hover:scale-110 transition-transform origin-right">
            {formatNumber(position.amount)}
          </p>
          <p className="text-xs text-neutral-400">units</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-neutral-400 mt-3 pt-3 border-t border-neutral-700/50">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          Subscribed: {position.subscribedAt > 0 ? timestampToDate(position.subscribedAt).toLocaleDateString() : 'Pending sync'}
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} />
          Issuer: {formatAddress(position.issuer)}
        </div>
      </div>

      {onTransfer && (
        <button
          onClick={onTransfer}
          className="btn btn-secondary btn-full mt-3"
        >
          Transfer Position
        </button>
      )}
    </div>
  );
}
