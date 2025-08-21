"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function ScoreMeter({ score, label }) {
    const controls = useAnimation();
    const pred_score = parseInt(score);

    const radius = 40;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(score, 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    useEffect(() => {
        controls.start({
            strokeDashoffset,
            transition: { duration: 1.5, ease: "easeInOut" },
        });
    }, [score]);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={stroke}
                        fill="transparent"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#10B981"
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        animate={controls}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                        {pred_score}%
                    </span>
                </div>
            </div>
        </div>
    );
}
