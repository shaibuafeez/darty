import { Building, MapPin, Users, DollarSign, Lock, Clock } from 'lucide-react';
import { Offering } from '../../lib/types';
import { formatNumber, formatTokenAmount } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { SETTLEMENT_ASSET_LABELS } from '../../lib/constants';

interface Props {
  offering: Offering;
  linkTo?: string;
  showActions?: boolean;
}

export default function OfferingCard({ offering, linkTo, showActions = true }: Props) {
  const subscriptionPct = offering.subscribed
    ? Math.round((offering.subscribed / offering.totalSupply) * 100)
    : 0;
  const settlementLabel = SETTLEMENT_ASSET_LABELS[offering.settlementAsset] || 'ALEO';

  const card = (
    <div className="glass-card p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {offering.name || `Offering ${offering.id.slice(0, 8)}...`}
          </h3>
          {offering.propertyType && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-1">
              <Building size={14} />
              {offering.propertyType}
            </div>
          )}
          {offering.location && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-0.5">
              <MapPin size={14} />
              {offering.location}
            </div>
          )}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            offering.isActive
              ? 'bg-green-900/50 text-green-400 border border-green-800 animate-pulse-glow'
              : 'bg-red-900/50 text-red-400 border border-red-800'
          }`}
        >
          {offering.isActive ? 'Active' : 'Closed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={14} className="text-amber-400" />
          <span className="text-neutral-400">Price:</span>
          <span className="text-white font-mono">{formatTokenAmount(offering.pricePerUnit, settlementLabel)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-amber-400" />
          <span className="text-neutral-400">Max:</span>
          <span className="text-white font-mono">{offering.maxInvestors}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Lock size={14} className="text-amber-400" />
          <span className="text-neutral-400">Supply:</span>
          <span className="text-white font-mono">{formatNumber(offering.totalSupply)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-amber-400" />
          <span className="text-neutral-400">Min:</span>
          <span className="text-white font-mono">{formatNumber(offering.minSubscription)}</span>
        </div>
      </div>

      {offering.accreditedOnly && (
        <div className="mb-3">
          <span className="text-xs bg-amber-900/50 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
            Accredited Only
          </span>
        </div>
      )}

      <div className="mb-3">
        <span className="text-xs bg-white/5 text-white/70 border border-white/10 px-2 py-0.5 rounded-full">
          Settles in {settlementLabel}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
          <span>Subscribed</span>
          <span>{subscriptionPct}%</span>
        </div>
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neutral-600 to-amber-500 rounded-full transition-all group-hover:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{ width: `${subscriptionPct}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (linkTo && showActions) {
    return <Link to={linkTo}>{card}</Link>;
  }
  return card;
}
