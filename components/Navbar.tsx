"use client";

import { motion } from "framer-motion";
import { Wallet, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
    account: string;
    connectWallet: () => void;
}

export default function Navbar({ account, connectWallet }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Live Markets", href: "#markets" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Leaderboard", href: "#leaderboard" },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "py-4 bg-[var(--color-zg-black)]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-lg"
                    : "py-6 bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-zg-purple)]/10 flex items-center justify-center border border-[var(--color-zg-purple)]/20 group-hover:border-[var(--color-zg-purple)] transition-colors">
                                <div className="w-3 h-3 bg-[var(--color-zg-purple)] rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white">
                                DART
                                <span className="text-[var(--color-zg-purple)]">.MEME</span>
                            </span>
                        </a>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[var(--color-zg-purple)] transition-all duration-300 group-hover:w-full" />
                                </a>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {account ? (
                                <div className="flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-zg-purple)]/50 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-mono text-gray-300">
                                        {account.slice(0, 6)}...{account.slice(-4)}
                                    </span>
                                    <button
                                        onClick={() => { }} // Placeholder for disconnect
                                        className="ml-2 w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={connectWallet}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-zg-purple)] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(212,173,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5"
                                >
                                    <Wallet size={16} />
                                    Connect Wallet
                                </button>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden text-white"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center"
                >
                    <button
                        className="absolute top-8 right-8 text-white p-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={32} />
                    </button>

                    <div className="flex flex-col gap-8 text-center">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-2xl font-bold text-white hover:text-[var(--color-zg-purple)] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}

                        <div className="mt-8">
                            {account ? (
                                <div className="text-gray-400 font-mono">
                                    Connected: {account.slice(0, 6)}...{account.slice(-4)}
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        connectWallet();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="px-8 py-4 bg-[var(--color-zg-purple)] text-black font-bold uppercase tracking-widest rounded-full"
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}
