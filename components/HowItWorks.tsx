"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Wallet, TrendingUp, Trophy } from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        icon: <Wallet className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "Connect Wallet",
        description: "Link your verified wallet to the 0G Network.",
        step: "01"
    },
    {
        icon: <TrendingUp className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "Place Your Bet",
        description: "Choose an outcome in any active market via smart contract.",
        step: "02"
    },
    {
        icon: <Trophy className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "Win & Claim",
        description: "Automated payouts are sent instantly upon resolution.",
        step: "03"
    }
];

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const lineHeight = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

    return (
        <section ref={containerRef} id="how-it-works" className="py-32 bg-[var(--color-zg-black)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4"
                        >
                            HOW IT <br />
                            <span className="text-[var(--color-zg-purple)]">WORKS</span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-gray-400 max-w-md text-lg text-right"
                    >
                        A simple, transparent process powered by decentralized infrastructure.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[rgba(255,255,255,0.05)] -translate-y-1/2 z-0" />
                    <motion.div
                        style={{ scaleX: lineHeight, originX: 0 }}
                        className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--color-zg-purple)] via-[#fff] to-[var(--color-zg-purple)] -translate-y-1/2 z-0 shadow-[0_0_10px_var(--color-zg-purple)]"
                    />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative z-10 bg-[var(--color-zg-black)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[var(--color-zg-purple)]/50 transition-colors group"
                        >
                            <div className="text-6xl font-black text-[rgba(255,255,255,0.03)] absolute top-4 right-4 group-hover:text-[var(--color-zg-purple)]/10 transition-colors">
                                {step.step}
                            </div>

                            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(212,173,255,0.05)]">
                                {step.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 text-center md:text-left">
                                {step.title}
                            </h3>
                            <p className="text-gray-400 text-center md:text-left leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
