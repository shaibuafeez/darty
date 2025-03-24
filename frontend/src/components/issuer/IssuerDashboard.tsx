import { Link } from 'react-router-dom';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import {
  Building2,
  PlusCircle,
  Users,
  DollarSign,
  BarChart3,
  FileCheck,
} from 'lucide-react';
import { useOfferings } from '../../hooks/useOfferings';
import StatCard from '../shared/StatCard';
import OfferingCard from '../shared/OfferingCard';

export default function IssuerDashboard() {
  const { address } = useWallet();
  const { offerings, loading } = useOfferings();

  const myOfferings = offerings.filter((o) => o.issuer === address);
  const activeCount = myOfferings.filter((o) => o.isActive).length;
  const totalSubscribed = myOfferings.reduce((sum, o) => sum + (o.subscribed || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Issuer Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your real estate offerings</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/issuer/register"
            className="btn btn-secondary"
          >
            <FileCheck size={16} />
            Register
          </Link>
          <Link
            to="/issuer/create-offering"
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            New Offering
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatCard icon={Building2} label="Active Offerings" value={activeCount} />
        <StatCard icon={Users} label="Total Investors" value={myOfferings.reduce((s, o) => s + (o.investorCount || 0), 0)} />
        <StatCard icon={DollarSign} label="Units Subscribed" value={totalSubscribed} />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Your Offerings</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="skeleton-heading w-3/4 mb-2" />
                    <div className="skeleton-text w-1/2" />
                  </div>
                  <div className="skeleton w-16 h-6 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="skeleton-text" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text" />
                </div>
                <div className="skeleton w-full h-2 rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : myOfferings.length === 0 ? (
          <div className="gradient-border-card p-12 text-center">
            <Building2 size={40} className="text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-4">No offerings yet</p>
            <Link
              to="/issuer/create-offering"
              className="btn btn-primary"
            >
              <PlusCircle size={16} />
              Create Your First Offering
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {myOfferings.map((offering) => (
              <OfferingCard
                key={offering.id}
                offering={offering}
                linkTo={`/issuer/offerings/${offering.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
