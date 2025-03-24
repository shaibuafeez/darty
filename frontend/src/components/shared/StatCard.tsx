import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ icon: Icon, label, value, sub }: Props) {
  return (
    <div className="glass-card p-5 group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-neutral-900/50 rounded-lg shadow-lg shadow-neutral-900/20">
          <Icon size={20} className="text-amber-400" />
        </div>
        <span className="text-sm text-neutral-400">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white font-mono group-hover:text-amber-400 transition-colors">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}
