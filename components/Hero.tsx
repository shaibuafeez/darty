"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Globe, Zap, Activity } from "lucide-react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax & Fade
    const yContent = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Mouse Interaction for the "Engine"
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Slight movement values
        mouseX.set((clientX - centerX) / 50);
        mouseY.set((clientY - centerY) / 50);
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-zg-black)]"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    style={{ x: springX, y: springY }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-zg-purple-dark)] rounded-full blur-[200px] opacity-10"
                />
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px"
                    }}
                />
            </div>

            {/* The "Prediction Engine" - Central Visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-[600px] h-[600px] border border-white/5 rounded-full border-dashed opacity-20"
                />
                {/* Inner Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[var(--color-zg-purple)]/20 rounded-full"
                />
                {/* Core Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-[var(--color-zg-purple-glow)]/10 rounded-full blur-xl animate-pulse" />
            </div>

            {/* Main Content */}
            <motion.div
                style={{ y: yContent, opacity }}
                className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
            >
                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-zg-purple)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-zg-purple)]"></span>
                        </span>
                        <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">
                            Prediction Engine Live
                        </span>
                    </div>
                </motion.div>

                {/* Cinematic Headline */}
                <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-white mb-8 leading-[1.1]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        FORECAST
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="font-serif italic text-white/50"
                    >
                        REALITY
                    </motion.div>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 font-light leading-relaxed"
                >
                    Harness the power of the <span className="text-white">Zero Gravity Network</span> to predict global events with absolute transparency and infinite scale.
                </motion.p>

                {/* Premium CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="group"
                >
                    <button className="relative px-10 py-5 bg-white text-black font-medium tracking-wide text-sm rounded-sm overflow-hidden transition-all duration-300 hover:tracking-widest">
                        <span className="relative z-10 flex items-center gap-2">
                            INITIALIZE PROTOCOL <ArrowRight className="w-4 h-4" />
                        </span>
                        <div className="absolute inset-0 bg-[var(--color-zg-purple)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                    </button>
                </motion.div>
            </motion.div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-50">
                <div className="flex gap-12 text-[10px] md:text-xs font-mono text-gray-500 tracking-widest uppercase">
                    <span className="flex items-center gap-2">
                        <Globe className="w-3 h-3" /> ZG-NET: CONNECTED
                    </span>
                    <span className="flex items-center gap-2">
                        <Zap className="w-3 h-3" /> LATENCY: 12ms
                    </span>
                    <span className="flex items-center gap-2">
                        <Activity className="w-3 h-3" /> TVL: $24.5M
                    </span>
                </div>
            </div>
        </section>
    );
}
