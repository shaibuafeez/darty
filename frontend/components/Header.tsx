'use client';

import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { publicKey } = useWallet();
  const router = useRouter();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center shadow-2xl shadow-new-mint/5">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-black text-xl tracking-tighter cursor-pointer flex items-center gap-1.5 text-white hover:text-new-mint transition-colors"
          onClick={() => router.push('/')}
        >
          <Target className="w-6 h-6" strokeWidth={3} />
          DART
        </motion.div>

        <div className="h-6 w-px bg-white/10 mx-3" />

        {/* Navigation */}
        <nav className="hidden md:flex items-center">
          <a href="/markets" className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
            markets
          </a>
          <a href="/portfolio" className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-new-mint hover:bg-new-mint/10 rounded-full transition-all">
            portfolio
          </a>
          <a href="/leaderboard" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-new-mint hover:bg-new-mint/10 rounded-full transition-all">
            leaderboard
          </a>
          <a href="/#polymarket" className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-new-blue hover:bg-new-blue/10 rounded-full transition-all">
            trending
          </a>
        </nav>

        <div className="h-6 w-px bg-white/10 mx-3" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {publicKey && (
            <button
              onClick={() => router.push('/create')}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-200 text-black rounded-full font-bold h-9 px-4 text-xs transition-all"
            >
              <Plus className="w-3 h-3" />
              create
            </button>
          )}
          <WalletMultiButton className="!bg-white/10 !text-white !border !border-white/10 !rounded-full !font-bold !h-9 !px-5 !text-xs hover:!bg-white hover:!text-black transition-all" />
        </div>
      </div>
    </header>
  );
}
