import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { Network } from '@provablehq/aleo-types';
import { Landmark, Building2, User, BarChart3, PlayCircle, Menu, X } from 'lucide-react';
import ConnectWallet from './components/common/ConnectWallet';
import RoleSelector from './components/common/RoleSelector';
import Preloader from './components/common/Preloader';
import LandingPage from './components/landing/LandingPage';
import IssuerDashboard from './components/issuer/IssuerDashboard';
import RegisterIssuer from './components/issuer/RegisterIssuer';
import CreateOffering from './components/issuer/CreateOffering';
import OfferingManage from './components/issuer/OfferingManage';
import InvestorDashboard from './components/investor/InvestorDashboard';
import ComplianceOnboarding from './components/investor/ComplianceOnboarding';
import Portfolio from './components/investor/Portfolio';
import OfferingSubscribe from './components/investor/OfferingSubscribe';
import TransferPosition from './components/investor/TransferPosition';
import ClaimDistributions from './components/investor/ClaimDistributions';
import GovernanceVoting from './components/investor/GovernanceVoting';
import BrowseOfferings from './components/investor/BrowseOfferings';
import DemoScenarios from './components/demo/DemoScenarios';
import { UserRole } from './lib/types';

const navLinks = [
  { to: '/issuer', label: 'Issuer', icon: Building2, match: '/issuer' },
  { to: '/investor', label: 'Investor', icon: User, match: '/investor' },
  { to: '/marketplace', label: 'Market', icon: BarChart3, match: '/marketplace' },
  { to: '/demo', label: 'Demo', icon: PlayCircle, match: '/demo' },
];

function AppLayout() {
  const location = useLocation();
  const [role, setRole] = useState<UserRole>('investor');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Hide nav on landing page
  if (location.pathname === '/') {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-4 z-40 px-4">
        <nav className="mx-auto max-w-[92rem] rounded-[1.75rem] border border-white/10 bg-black/72 px-4 py-3 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 transition-colors hover:bg-white/[0.08]"
              >
                <div className="relative">
                  <Landmark className="text-white icon-glow" size={22} />
                  <div className="absolute inset-0 rounded-full bg-white/12 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <span className="text-base font-semibold text-white tracking-tight">Harbor</span>
              </Link>

              <div className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                      location.pathname.startsWith(link.match)
                        ? 'bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.12)]'
                        : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <link.icon size={14} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden xl:block">
                <RoleSelector role={role} onChange={setRole} />
              </div>
              <ConnectWallet />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-2.5 text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="mt-4 border-t border-white/10 pt-4 lg:hidden animate-slide-down">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      location.pathname.startsWith(link.match)
                        ? 'bg-white text-black'
                        : 'bg-white/[0.03] text-white/65 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <RoleSelector role={role} onChange={setRole} />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* Issuer Routes */}
          <Route path="/issuer" element={<IssuerDashboard />} />
          <Route path="/issuer/register" element={<RegisterIssuer />} />
          <Route path="/issuer/create-offering" element={<CreateOffering />} />
          <Route path="/issuer/offerings/:id" element={<OfferingManage />} />

          {/* Investor Routes */}
          <Route path="/investor" element={<InvestorDashboard />} />
          <Route path="/investor/onboarding" element={<ComplianceOnboarding />} />
          <Route path="/investor/portfolio" element={<Portfolio />} />
          <Route path="/investor/transfer" element={<TransferPosition />} />
          <Route path="/investor/distributions" element={<ClaimDistributions />} />
          <Route path="/investor/governance" element={<GovernanceVoting />} />

          {/* Marketplace */}
          <Route path="/marketplace" element={<BrowseOfferings />} />
          <Route path="/marketplace/:id" element={<OfferingSubscribe />} />

          {/* Demo */}
          <Route path="/demo" element={<DemoScenarios />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const wallets = useMemo(
    () => [new ShieldWalletAdapter(), new LeoWalletAdapter()],
    [],
  );

  return (
    <AleoWalletProvider wallets={wallets} network={Network.TESTNET} autoConnect>
      <WalletModalProvider>
        <BrowserRouter>
          <Preloader />
          <AppLayout />
        </BrowserRouter>
      </WalletModalProvider>
    </AleoWalletProvider>
  );
}
