import { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Lock,
  Vote,
  ArrowRight,
  Globe,
  FileCheck,
  Wallet,
  Landmark,
  Layers,
  ChevronRight,
  Zap,
  ExternalLink,
  EyeOff,
  AlertTriangle,
  FileQuestion,
  Network,
  FileText
} from 'lucide-react';
import ConnectWallet from '../common/ConnectWallet';

/* ── Scroll Reveal Hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    const targets = el.querySelectorAll('.reveal-up, .reveal-scale');
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Spotlight Mouse Tracker ── */
function useSpotlight(containerRef: React.RefObject<HTMLElement | null>) {
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const cards = container.querySelectorAll<HTMLElement>('.spotlight-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    },
    [containerRef],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, [containerRef, handleMouseMove]);
}

/* ── Data ── */
const PROBLEMS = [
  { icon: EyeOff, title: 'Public Cap Tables', desc: 'Holdings are entirely public. Any competitor or observer can parse ownership structures.' },
  { icon: Network, title: 'Exposed Investor Activity', desc: 'Every transfer, distribution claim, and trade is permanently written to a public ledger.' },
  { icon: AlertTriangle, title: 'Manual Compliance Ops', desc: 'Off-chain spreadsheets and manual checks are required before authorizing any asset transfer.' },
  { icon: FileQuestion, title: 'Fragmented Lifecycles', desc: 'Trading happens on one platform, distributions on another, creating messy operational silos.' }
];

const CAPABILITIES = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Verification',
    desc: 'Verify accredited investor status once via ZK proofs, without ever publishing raw identity documents on-chain. Privacy is guaranteed mathematically.',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-2',
    accent: 'amber',
  },
  {
    icon: Lock,
    title: 'Enforced Transfer Controls',
    desc: 'Lockups and whitelist restrictions run automatically via Aleo smart contracts under one unified parameter system.',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1',
    accent: 'blue',
  },
  {
    icon: Building2,
    title: 'Private Cap Tables',
    desc: 'Manage allocations anonymously without public chain exposure.',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    accent: 'green',
  },
  {
    icon: Vote,
    title: 'Governance',
    desc: 'Coordinate shareholder voting and distributions entirely in private.',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    accent: 'purple',
  },
];

const STEPS = [
  {
    step: '01',
    icon: FileCheck,
    title: 'Verify Investor',
    desc: 'Investors generate a zero-knowledge credential proving their eligibility to hold the asset.',
  },
  {
    step: '02',
    icon: Globe,
    title: 'Allocate Position',
    desc: 'Sponsors allocate private ownership records securely to the investor\'s wallet on Aleo.',
  },
  {
    step: '03',
    icon: Wallet,
    title: 'Operate Asset',
    desc: 'Investors transfer assets and claim returns within the contract\'s predefined compliance bounds.',
  },
];

const USE_CASES = [
  {
    title: 'Private Placements',
    desc: 'Sponsor-led offerings for SPVs with strict, contract-enforced access.',
    tag: 'Issuer Role',
    icon: Building2,
  },
  {
    title: 'Secondary Transfers',
    desc: 'Compliant peer-to-peer trading between verified network participants.',
    tag: 'Operator Role',
    icon: Layers,
  },
  {
    title: 'Income Distribution',
    desc: 'Automate dividend distributions and asset voting for shareholders.',
    tag: 'Investor Role',
    icon: Zap,
  },
];

const LANDING_SHELL = 'max-w-[92rem] mx-auto px-6 lg:px-8';

/* ── Component ── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const pageRef = useReveal();
  const featuresRef = useRef<HTMLDivElement>(null);
  useSpotlight(featuresRef);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-black overflow-hidden font-sans">
      
      {/* ─── Nav ─── */}
      <nav className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none px-4">
        <div
          className={`pointer-events-auto flex items-center justify-between gap-4 rounded-full px-4 py-3 transition-all duration-500 animate-slide-down ${
            scrolled
              ? 'nav-glass-pill w-full md:max-w-4xl'
              : 'bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_14px_44px_rgba(0,0,0,0.18)] w-full xl:max-w-[78rem]'
          }`}
        >
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 transition-colors hover:bg-white/[0.08]"
          >
            <div className="relative">
              <Landmark className="text-white icon-glow" size={18} />
              <div className="absolute inset-0 rounded-full bg-white/12 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="leading-none">
              <div className="text-[15px] font-semibold text-white tracking-tight">Harbor</div>
              <div className="mt-1 hidden text-[9px] uppercase tracking-[0.22em] text-white/38 sm:block">
                Private RWA Rail
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-black/24 p-1 text-sm">
            <Link
              to="/marketplace"
              className="rounded-full px-3.5 py-1.5 text-[13px] text-white/64 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Marketplace
            </Link>
            <Link
              to="/demo"
              className="rounded-full px-3.5 py-1.5 text-[13px] text-white/64 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Demo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ConnectWallet compact hideAddress />
          </div>
        </div>
      </nav>

      {/* 1. ─── Hero ─── */}
      <section className="relative grain overflow-hidden min-h-screen bg-black flex items-center">
        {/* Background Image Container (Oversized to allow natural shift without hard edges) */}
        <div 
          className="absolute z-0 pointer-events-none"
          style={{
            top: '-5%', 
            bottom: '-5%', 
            left: '-10%', 
            right: '-25%',
            backgroundImage: 'url("/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />
        {/* Black gradient removed to let the photo shine completely */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none bg-black/10"
        />
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_28%)]" />

        <div className={`relative z-10 w-full ${LANDING_SHELL} mt-24 md:mt-32 pb-16`}>
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-12 items-center">
            {/* Hero Text */}
            <div className="max-w-[48rem] text-left">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h1 className="text-[3.5rem] text-premium font-bold tracking-tighter text-white sm:text-[4.5rem] lg:text-[4.5rem] xl:text-[5rem] leading-[1]">
                  Private infrastructure<br />
                  for real estate<br />
                  <span className="text-white/90">securities.</span>
                </h1>
              </div>

              <p
                className="mt-8 max-w-[34rem] text-[1.15rem] leading-[1.6] font-normal tracking-tight text-neutral-400 md:text-[1.25rem]"
                style={{ animationDelay: '0.2s' }}
              >
                The zero-knowledge OS for tokenized real estate. Manage compliance, transfers, and governance with absolute privacy.
              </p>

              <div
                className="mt-10 flex flex-wrap items-center gap-4 animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold !bg-white !text-black hover:!bg-neutral-200 transition-colors min-w-[12rem] text-[15px]">
                  <Building2 size={18} />
                  Explore Marketplace
                </Link>
                <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold !bg-white/10 border border-white/10 !text-white hover:!bg-white/20 transition-colors backdrop-blur-md min-w-[12rem] text-[15px]">
                  Run Demo
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Security & Audience Indicators */}
              <div 
                className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 text-[13px] font-semibold text-neutral-400 tracking-tight animate-slide-up" 
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex items-center gap-2 text-white">
                  <EyeOff size={16} className="text-amber-500" /> Private by Default
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <div className="flex items-center gap-2">
                  <Globe size={16} /> Built on Aleo
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <div className="flex items-center gap-2">
                  <Layers size={16} /> Issuers, Operators & Investors
                </div>
              </div>
            </div>

            {/* Visual Proof Card */}
            <div className="hidden lg:flex justify-end animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] max-w-sm w-full tilt-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/5">
                      <Shield className="text-amber-400" size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Identity Verified</div>
                      <div className="text-xs text-neutral-500 font-mono tracking-widest mt-0.5">ZK PROOF VALIDATED</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                
                <div className="space-y-4">
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[100%]" />
                  </div>
                  <div className="h-1.5 w-3/4 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-600 w-full" />
                  </div>
                </div>

                <div className="mt-8 p-5 bg-neutral-900/60 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Off-Chain Record</div>
                  <div className="flex justify-between items-end">
                    <div className="text-3xl font-bold text-white tracking-tighter">$1.2M</div>
                    <div className="text-[10px] font-bold font-mono tracking-widest uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1.5 rounded">Hidden via ZK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 3. ─── Problem ─── */}
      <section className="w-full py-32 relative bg-gradient-to-b from-[#090202] via-[#050101] to-black border-t border-red-900/20">
        <div className={`${LANDING_SHELL} relative`}>
          {/* Ambient Dark Red Glow */}
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start relative z-10">
          {/* Left Column (Sticky Title) */}
          <div className="lg:sticky lg:top-40 reveal-up">
            <span className="inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full mb-6 border border-red-500/20">
              <AlertTriangle size={14} /> The Problem
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold text-white tracking-tighter leading-[1.05] mb-6">
              Tokenization is structurally broken.
            </h2>
            <p className="text-[17px] text-neutral-400 font-medium leading-relaxed max-w-md">
              Current blockchain infrastructure forces a catastrophic trade-off: institutional workflows require absolute privacy, but public ledgers expose everything.
            </p>
          </div>

          {/* Right Column (Cards Grid) */}
          <div className="grid sm:grid-cols-2 gap-5">
            {PROBLEMS.map((prob, i) => (
              <div 
                key={prob.title} 
                className="reveal-up relative group bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 overflow-hidden hover:bg-[#0D0D0D] hover:border-red-500/20 transition-all duration-500 shadow-2xl" 
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {/* Minimal Dark Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Giant Faded Number */}
                <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-white/[0.02] leading-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:text-white/[0.04]">
                  0{i + 1}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-black border border-white/5 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-black group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-colors duration-500">
                    <prob.icon className="text-neutral-500 group-hover:text-red-400 transition-colors duration-500" size={20} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{prob.title}</h4>
                  <p className="text-[14px] text-neutral-400 font-medium leading-loose">{prob.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* 4. ─── Core Capabilities (What Harbor Does) ─── */}
      <section ref={featuresRef} className="w-full relative py-24 lg:py-32 dot-grid bg-gradient-to-b from-[#020512] via-[#010208] to-black border-t border-blue-900/20">
        <div className={`${LANDING_SHELL} relative`}>
          <div className="reveal-up mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full mb-6 border border-amber-500/20">
              <Zap size={14} /> Platform Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-white tracking-tighter leading-[1.05]">
              Everything you need, built to be invisible.
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-lg font-medium leading-relaxed">
            A comprehensive execution layer engineered to operate highly sensitive financial logic without leaking a single byte of state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 auto-rows-min gap-5" style={{ minHeight: '600px' }}>
          {CAPABILITIES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal-up relative group overflow-hidden bg-[#070707] border border-white/5 rounded-3xl p-8 lg:p-10 hover:border-amber-500/30 transition-all duration-500 shadow-2xl flex flex-col justify-end ${f.colSpan} ${f.rowSpan}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {/* Ambient Focus Glow */}
              <div 
                className={`absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${
                  f.accent === 'amber' ? 'bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent_60%)]' :
                  f.accent === 'blue' ? 'bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.05),transparent_60%)]' :
                  f.accent === 'green' ? 'bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.05),transparent_60%)]' :
                  'bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05),transparent_60%)]'
                }`} 
              />
              
              {/* Massive Structural Icon in Background for Visual Depth */}
              <div className="absolute -top-10 -right-10 pointer-events-none opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 text-white">
                <f.icon 
                  size={f.rowSpan === 'lg:row-span-2' ? 360 : 200} 
                  strokeWidth={1}
                />
              </div>

              <div className="relative z-10 w-full mt-10">
                <div className={`w-14 h-14 bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 ${
                  f.accent === 'amber' ? 'group-hover:border-amber-500/30 group-hover:shadow-amber-500/10' :
                  f.accent === 'blue' ? 'group-hover:border-blue-500/30 group-hover:shadow-blue-500/10' :
                  f.accent === 'green' ? 'group-hover:border-green-500/30 group-hover:shadow-green-500/10' :
                  'group-hover:border-purple-500/30 group-hover:shadow-purple-500/10'
                }`}>
                  <f.icon className={`transition-colors duration-500 text-white ${
                    f.accent === 'amber' ? 'group-hover:text-amber-400' :
                    f.accent === 'blue' ? 'group-hover:text-blue-400' :
                    f.accent === 'green' ? 'group-hover:text-green-400' :
                    'group-hover:text-purple-400'
                  }`} size={26} />
                </div>
                <h3 className={`font-bold text-white mb-4 tracking-tighter ${f.colSpan === 'lg:col-span-2' ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>{f.title}</h3>
                <p className="text-[15px] font-medium text-neutral-400 leading-loose max-w-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* 5. ─── How It Works ─── */}
      <section className="w-full relative bg-gradient-to-b from-[#020A05] via-[#010502] to-black border-t border-emerald-900/20 py-32 lg:py-48 overflow-hidden">
        {/* Core Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none" />

        <div className={`${LANDING_SHELL} relative z-10`}>
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
            
            {/* Sticky Left Content */}
            <div className="lg:sticky lg:top-40 reveal-up">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full mb-6 border border-emerald-500/20">
                <Network size={14} /> The Architecture
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-white tracking-tighter leading-[1.05] mb-6">
                Programmable privacy.
              </h2>
              <p className="text-neutral-400 text-lg font-medium leading-relaxed mb-10 max-w-md">
                From initial identity verification to secondary market operations. Harbor seamlessly connects compliance requirements with decentralized execution.
              </p>
              
              {/* Abstract Visual Anchor */}
              <div className="hidden lg:flex relative w-full xl:w-[80%] aspect-square rounded-[3rem] border border-white/5 bg-[#050505] overflow-hidden items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
                 {/* CSS 3D Rings / Core */}
                 <div className="relative flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full border border-emerald-500/10 absolute animate-[spin_20s_linear_infinite]" />
                    <div className="w-48 h-48 rounded-full border border-emerald-500/20 absolute animate-[spin_15s_linear_reverse_infinite] border-dashed" />
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                      <div className="w-8 h-8 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Scrolling Right Content (The Steps) */}
            <div className="flex flex-col gap-8 md:gap-10 relative z-10 pt-10 lg:pt-0">
              {STEPS.map((s, i) => (
                <div 
                  key={s.step}
                  className="reveal-up group relative p-8 md:p-12 rounded-[2.5rem] bg-[#0A0B0A] border border-white/5 shadow-2xl hover:border-emerald-500/30 transition-all duration-700 hover:bg-[#0D0E0D] overflow-hidden"
                  style={{ transitionDelay: `${i * 0.15}s` }}
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 text-[10rem] font-black text-white/[0.02] group-hover:text-emerald-500/[0.04] transition-colors duration-700 leading-none pointer-events-none group-hover:scale-105">
                    0{s.step}
                  </div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center mb-10 shadow-xl group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all duration-700 group-hover:scale-110">
                      <s.icon size={26} className="text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tighter group-hover:text-emerald-400 transition-colors duration-700">
                      {s.title}
                    </h3>
                    <p className="text-[16px] md:text-lg text-neutral-400 leading-loose font-medium max-w-lg">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6. ─── Use Cases ─── */}
      <section className="w-full py-32 lg:py-48 relative outline-grid bg-gradient-to-b from-[#070503] via-[#040201] to-black border-t border-amber-900/20 overflow-hidden">
        {/* Massive Ambient Background Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-900/5 blur-[150px] rounded-full pointer-events-none" />

        <div className={`${LANDING_SHELL} relative z-10`}>
          <div className="reveal-up text-center mb-24 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 mb-6">
              <Layers size={14} /> Production Applications
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-white mt-4 tracking-tighter leading-[1.05]">
              Real world execution.
            </h2>
            <p className="text-neutral-400 mt-6 text-lg font-medium leading-relaxed max-w-xl text-center mx-auto">
              Harbor doesn't just tokenize assets, it fundamentally upgrades the privacy mechanisms of traditional corporate structures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {USE_CASES.map((c, i) => (
              <div
                key={c.title}
                className="reveal-up relative group h-[500px] rounded-3xl bg-[#050403] border border-amber-900/20 overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all duration-700"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                {/* Internal lighting / Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-colors duration-700 pointer-events-none" />

                {/* Holographic Visual Display Area */}
                <div className="absolute top-0 left-0 w-full h-[65%] flex items-center justify-center p-6 overflow-hidden pointer-events-none">
                    {i === 0 && (
                      <div className="relative w-full h-full min-h-[200px] flex items-end justify-center gap-2 md:gap-3 opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
                          {/* CSS Skyline/Funds Bar Chart */}
                          <div className="w-10 sm:w-16 h-[40%] bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-t border-l border-r border-amber-500/30 rounded-t-lg transition-all duration-700 group-hover:h-[60%] relative overflow-hidden shadow-xl shadow-amber-500/5">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
                          </div>
                          <div className="w-14 sm:w-24 h-[70%] bg-gradient-to-t from-white/10 to-amber-500/10 border-t border-l border-r border-amber-500/40 rounded-t-lg shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-700 group-hover:h-[85%] relative overflow-hidden z-10">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_8px]" />
                          </div>
                          <div className="w-10 sm:w-16 h-[50%] bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-t border-l border-r border-amber-500/30 rounded-t-lg transition-all duration-700 group-hover:h-[55%] relative overflow-hidden shadow-xl shadow-amber-500/5">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_6px]" />
                          </div>
                      </div>
                    )}

                    {i === 1 && (
                      <div className="relative w-full h-full min-h-[200px] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
                          {/* ID Card Hologram */}
                          <div className="w-48 sm:w-56 h-32 rounded-2xl border border-amber-500/30 bg-black/60 backdrop-blur-md rotate-[-12deg] group-hover:rotate-0 transition-transform duration-700 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex p-5 gap-5 items-center z-10">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                              <FileCheck className="text-amber-500" size={20} />
                            </div>
                            <div className="flex-1 flex flex-col gap-2.5">
                              <div className="h-2 w-full bg-white/20 rounded-full" />
                              <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                              <div className="h-2 w-1/2 bg-amber-500/30 rounded-full" />
                            </div>
                          </div>
                          <div className="absolute w-64 h-64 rounded-full border border-amber-500/10 border-dashed animate-spin-slow pointer-events-none" />
                      </div>
                    )}

                    {i === 2 && (
                      <div className="relative w-full h-full min-h-[200px] flex flex-col items-center justify-center opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
                          {/* Treasury Nodes / Orbits */}
                          <div className="relative w-36 h-36 flex items-center justify-center mt-8">
                            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                              <Wallet className="text-amber-500/60 group-hover:text-amber-400 transition-colors duration-500" size={36} />
                            </div>
                            <div className="absolute -inset-10 rounded-full border border-white/5 opacity-50" />
                            <div className="absolute -inset-16 rounded-full border border-white/[0.02] opacity-50" />
                            {/* Floating Orbits */}
                            <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,1)]" />
                            <div className="absolute bottom-6 left-1 w-3 h-3 rounded-full bg-white/40" />
                            <div className="absolute bottom-6 right-1 w-3 h-3 rounded-full bg-white/40" />
                          </div>
                      </div>
                    )}
                </div>

                {/* Text Container (Glass docked to bottom) */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 bg-gradient-to-t from-[#050403] via-[#050403]/95 to-transparent pt-32 z-10 translate-y-[4.5rem] group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full mb-5">
                    {c.tag}
                  </span>

                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-500 tracking-tight">
                    {c.title}
                  </h3>
                  
                  {/* Invisible until hovered for elegant, uncluttered resting state */}
                  <p className="text-[14px] lg:text-[15px] font-medium text-neutral-400 leading-loose mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {c.desc}
                  </p>

                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-amber-500/0 group-hover:text-amber-500 transition-colors duration-500">
                    <span>Explore Use Case</span>
                    <ArrowRight size={16} className="-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 delay-150" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ─── Privacy / Aleo Advantage ─── */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#03030A] via-[#010105] to-black border-t border-indigo-900/20 py-32 lg:py-48">
        
        {/* Ambient Dark Deep Blue Space */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[1200px] h-[800px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

        <div className={`${LANDING_SHELL} relative z-10`}>
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-20 items-center">
            
            {/* Left Column: Vision & Thesis */}
            <div className="reveal-up relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-8 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Globe size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Aleo Network Advantage</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-white tracking-tighter leading-[1.05] mb-8">
                Your cap table is nobody's business.
              </h2>
              
              <p className="text-neutral-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                Legacy blockchains force a catastrophic trade-off: transparency for compliance. By executing logic entirely in zero-knowledge, Harbor guarantees regulatory bounds are met without leaking a single byte of investor data to the public.
              </p>

              <div className="flex flex-col gap-4">
                <div className="group flex items-center justify-between p-5 rounded-2xl bg-[#09090C] border border-white/5 hover:bg-[#0C0C12] hover:border-indigo-500/30 transition-all duration-500 shadow-xl cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Shield size={18} className="text-indigo-400" />
                    </div>
                    <span className="text-white font-bold text-[15px] tracking-tight">KYC Encrypted Off-Chain</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,1)] transition-all duration-500" />
                  </div>
                </div>

                <div className="group flex items-center justify-between p-5 rounded-2xl bg-[#09090C] border border-white/5 hover:bg-[#0C0C12] hover:border-indigo-500/30 transition-all duration-500 shadow-xl cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Lock size={18} className="text-indigo-400" />
                    </div>
                    <span className="text-white font-bold text-[15px] tracking-tight">Transfers Enforced Blindly</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,1)] transition-all duration-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Cryptographic Core Visual */}
            <div className="reveal-up relative flex items-center justify-center mt-16 md:mt-24 lg:mt-0 min-h-[400px]">
              {/* Massive Ambient Background Flare */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />

              <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center scale-90 md:scale-100">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/10 border-dashed animate-[spin_40s_linear_infinite] shadow-[inset_0_0_50px_rgba(99,102,241,0.05)]" />
                
                {/* Middle Ring */}
                <div className="absolute inset-8 rounded-full border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent backdrop-blur-[2px] flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.15)] animate-[spin_30s_linear_reverse_infinite]" />
                
                {/* Inner Ring */}
                <div className="absolute inset-20 rounded-full border border-indigo-500/30 flex items-center justify-center bg-black/40 backdrop-blur-md animate-[spin_20s_linear_infinite]" />

                {/* Core Shield */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] backdrop-blur-xl group cursor-default">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse group-hover:bg-indigo-500/40 transition-colors duration-500" />
                  <EyeOff size={40} className="text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)] group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Orbiting Elements / Lasers */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -rotate-45" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent rotate-45" />

                {/* Data Packets */}
                <div className="absolute top-[10%] right-[15%] w-14 h-14 rounded-2xl bg-[#09090C] border border-white/10 flex items-center justify-center shadow-2xl skew-y-6 animate-[bounce_4s_infinite]">
                  <FileText size={20} className="text-neutral-500" />
                  <div className="absolute w-2 h-2 rounded-full bg-red-500 -top-1 -right-1 animate-ping" />
                </div>
                
                <div className="absolute bottom-[10%] left-[15%] w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] -skew-y-6 animate-[bounce_4s_infinite_1s]">
                  <Lock size={24} className="text-indigo-400" />
                  <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -top-1 -left-1 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. ─── Final CTA ─── */}
      <section className={`${LANDING_SHELL} py-24 lg:py-32 text-center`}>
        <div className="reveal-scale relative">
          <div className="gradient-border-card p-12 md:p-20 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter leading-tight">
                Build the Private Side of{' '}
                <span className="gradient-text-animated">Real Estate.</span>
              </h2>
              <p className="text-neutral-400 mb-12 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                For sponsors running private placements and operators enforcing transfer rules with zero compromises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold !bg-white !text-black hover:!bg-neutral-200 transition-colors min-w-[14rem] text-[16px] shadow-xl">
                  Explore Marketplace
                </Link>
                <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold !bg-white/10 border border-white/10 !text-white hover:!bg-white/20 transition-colors backdrop-blur-md min-w-[14rem] text-[16px]">
                  Run Demo
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Minimal Footer ─── */}
      <footer className="relative bg-[#050505] border-t border-white/5">
        <div className={`${LANDING_SHELL} py-12`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Landmark size={20} className="text-white" />
              <span className="text-xl font-bold text-white tracking-tighter">Harbor</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] font-bold tracking-tight">
              <a href="https://developer.aleo.org" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                <Globe size={16} /> Aleo Docs
              </a>
              <a href="https://github.com/cyber/harbor" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                <ExternalLink size={16} /> GitHub
              </a>
              <a href="mailto:hello@harbor.network" className="text-neutral-500 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
