import { useState } from 'react';
import { Search, Building2, Filter, Info } from 'lucide-react';
import { useOfferings } from '../../hooks/useOfferings';
import OfferingCard from '../shared/OfferingCard';

export default function BrowseOfferings() {
  const { offerings, activeOfferings, loading } = useOfferings();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? offerings : activeOfferings;
  const filtered = displayed.filter(
    (o) =>
      (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.propertyType || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.location || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-neutral-400 text-sm mt-1">Browse real estate offerings</p>
        </div>
      </div>

      <div className="bg-neutral-900/20 border border-neutral-800/50 rounded-lg p-3 mb-6 flex items-start gap-2">
        <Info size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-neutral-300">
          <strong>On-chain catalog:</strong> Offerings, metadata, supply, subscriptions, and active
          status are loaded from Harbor&apos;s public mappings on Aleo testnet.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md group">
          <Search size={16} className="absolute left-3 top-1/2 -tranneutral-y-1/2 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offerings..."
            className="w-full bg-neutral-900/80 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none input-glow transition-all duration-200"
          />
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`btn ${
            showAll
              ? 'btn-accent'
              : 'btn-secondary'
          }`}
        >
          <Filter size={16} />
          {showAll ? 'Show Active Only' : 'Show All'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="skeleton-heading w-3/4 mb-2" />
                  <div className="skeleton-text w-1/2" />
                </div>
                <div className="skeleton w-16 h-6 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="skeleton-text w-full" />
                <div className="skeleton-text w-full" />
                <div className="skeleton-text w-full" />
                <div className="skeleton-text w-full" />
              </div>
              <div className="skeleton w-full h-2 rounded-full mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 size={40} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">
            {search ? 'No offerings match your search' : 'No offerings available yet'}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Offerings will appear here when issuers create them
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
              linkTo={`/marketplace/${offering.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
