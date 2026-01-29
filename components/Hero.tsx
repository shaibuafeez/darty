"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--color-zg-black)]"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-zg-purple-dark)] rounded-full blur-[120px] opacity-20 animate-[float_6s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-zg-purple-glow)] rounded-full blur-[120px] opacity-20 animate-[float_7s_ease-in-out_infinite_reverse]" />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                    backgroundSize: "50px 50px"
                }}
            />

            <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
                <motion.div style={{ y: y2, opacity }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-[var(--color-zg-purple-glow)] animate-pulse" />
                        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-zg-purple)] font-medium">
                            Powered by 0G Network
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, type: "spring" }}
                        className="text-7xl md:text-9xl font-black tracking-tighter mb-6 text-white leading-[0.9]"
                    >
                        ZERO
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-zg-purple)] to-[var(--color-zg-purple-glow)]">
                            GRAVITY
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                    >
                        The world's first <span className="text-white font-medium">verifiable prediction market</span>.
                        Built on a modular AI chain for absolute transparency and infinite scale.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <a
                            href="#markets"
                            className="px-8 py-4 bg-[var(--color-zg-purple)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-sm"
                        >
                            Launch App
                        </a>
                        <a
                            href="#how-it-works"
                            className="px-8 py-4 bg-transparent border border-[rgba(255,255,255,0.2)] text-white font-bold uppercase tracking-widest text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-300 rounded-sm"
                        >
                            How it works
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-1/4 left-10 hidden lg:block"
            >
                <div className="glass-panel p-4 rounded-lg transform -rotate-6 max-w-xs">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>BTC / USD</span>
                        <span className="text-[var(--color-zg-purple)]">Active</span>
                    </div>
                    <div className="text-white font-bold mb-1">Will Bitcoin hit $100k?</div>
                    <div className="h-1 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[75%] bg-[var(--color-zg-purple-glow)]" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
                className="absolute bottom-1/4 right-10 hidden lg:block"
            >
                <div className="glass-panel p-4 rounded-lg transform rotate-3 max-w-xs">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>ETH / USD</span>
                        <span className="text-[var(--color-zg-purple)]">Resolved</span>
                    </div>
                    <div className="text-white font-bold mb-1">Ethereum Upgrade Successful</div>
                    <div className="flex -space-x-2 mt-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border border-black" />
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
