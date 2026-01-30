"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Preloader() {
    const [step, setStep] = useState(0);
    const [complete, setComplete] = useState(false);

    const steps = [
        "INITIALIZING 0G PROTOCOL...",
        "SYNCING ZK-PROOFS...",
        "CALIBRATING EVENT HORIZON...",
        "ACCESS GRANTED"
    ];

    useEffect(() => {
        // Sequence the text updates
        const timer = setInterval(() => {
            setStep((prev) => {
                if (prev < steps.length - 1) return prev + 1;
                clearInterval(timer);
                setTimeout(() => setComplete(true), 800); // Wait a bit after last step
                return prev;
            });
        }, 800);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {!complete && (
                <motion.div
                    key="preloader"
                    // Exit animation: "Airlock" split
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
                >
                    {/* The "Airlock" Doors - visual only, animating out */}
                    <motion.div
                        className="absolute inset-y-0 left-0 w-1/2 bg-[var(--color-zg-black)] border-r border-[var(--color-zg-purple)]/20 z-0"
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    />
                    <motion.div
                        className="absolute inset-y-0 right-0 w-1/2 bg-[var(--color-zg-black)] border-l border-[var(--color-zg-purple)]/20 z-0"
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    />

                    {/* Content Content - Fades out slightly faster */}
                    <motion.div className="relative z-10 font-mono text-[var(--color-zg-purple)] text-sm md:text-base tracking-widest"
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div>
                            <span className="mr-2 text-white/50">{">"}</span>
                            {steps[step]}
                            <span className="animate-pulse ml-1">_</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 h-1 w-64 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--color-zg-purple)] shadow-[0_0_10px_var(--color-zg-purple)]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
