"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Database, Zap } from "lucide-react";

const features = [
    {
        icon: <Cpu className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "0G Compute",
        description: "Results are calculated off-chain on verifiable nodes."
    },
    {
        icon: <Database className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "0G Storage",
        description: "Proof of resolution is permanently stored on 0G DA."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "Trustless",
        description: "No central authority. Smart contracts verify every outcome."
    },
    {
        icon: <Zap className="w-8 h-8 text-[var(--color-zg-purple)]" />,
        title: "Instant Settlement",
        description: "Payouts are automated immediately after verification."
    }
];

export default function TrustSection() {
    return (
        <section className="py-24 bg-[var(--color-zg-black)] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-zg-purple-dark)] rounded-full blur-[150px] opacity-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4"
                    >
                        VERIFIABLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-zg-purple)] to-[var(--color-zg-purple-glow)]">TRUTH</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        WordWars isn't just a betting platform. It's a demonstration of <span className="text-white">verifiable compute</span>.
                        Every outcome is cryptographically proven.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[var(--color-zg-purple)]/30 transition-all duration-300 group"
                        >
                            <div className="mb-6 bg-[rgba(255,255,255,0.03)] w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-[var(--color-zg-purple)]/10 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
