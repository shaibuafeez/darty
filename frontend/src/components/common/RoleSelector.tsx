import { Building2, User } from 'lucide-react';
import { UserRole } from '../../lib/types';

interface Props {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({ role, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <button
        onClick={() => onChange('issuer')}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          role === 'issuer'
            ? 'bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.12)]'
            : 'text-white/55 hover:text-white'
        }`}
      >
        <Building2 size={16} />
        Issuer
      </button>
      <button
        onClick={() => onChange('investor')}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          role === 'investor'
            ? 'bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.12)]'
            : 'text-white/55 hover:text-white'
        }`}
      >
        <User size={16} />
        Investor
      </button>
    </div>
  );
}
