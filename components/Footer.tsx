"use client";

import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="relative py-20 bg-[var(--color-zg-black)] border-t border-[rgba(255,255,255,0.05)] overflow-hidden">
            {/* Background Elements */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-zg-purple)]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 pr-12">
                        <h3 className="text-3xl font-black text-white mb-6 tracking-tighter">
                            DART
                            <span className="text-[var(--color-zg-purple)]">.MEME</span>
                        </h3>
                        <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-6">
                            The first verifiable prediction market on 0G Network.
                            Uncensored, transparent, and immutable.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            {['twitter', 'github', 'discord'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center hover:bg-[var(--color-zg-purple)]/20 transition-colors">
                                    <span className="sr-only">{social}</span>
                                    <div className="w-4 h-4 bg-gray-400 rounded-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#markets" className="hover:text-[var(--color-zg-purple)] transition-colors">Live Markets</a></li>
                            <li><a href="/create" className="hover:text-[var(--color-zg-purple)] transition-colors">Create Market</a></li>
                            <li><a href="#leaderboard" className="hover:text-[var(--color-zg-purple)] transition-colors">Leaderboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">0G Integrity</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[var(--color-zg-purple)] transition-colors">View Contract</a></li>
                            <li><a href="#" className="hover:text-[var(--color-zg-purple)] transition-colors">Proof Explorer</a></li>
                            <li><a href="#" className="hover:text-[var(--color-zg-purple)] transition-colors">Node Status</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wider">
                        © 2026 Dart. Built on 0G.
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider">0G Newton Testnet: Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
