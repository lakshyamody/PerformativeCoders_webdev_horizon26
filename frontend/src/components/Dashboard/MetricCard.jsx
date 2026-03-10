import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ 
    title, 
    value, 
    icon: Icon, 
    badgeValue, 
    badgeType = 'neutral', 
    delay = 0 
}) {
    // Determine badge colors based on type
    let badgeColors = 'bg-white/10 text-gray-300';
    if (badgeType === 'positive') badgeColors = 'bg-emerald-500/10 text-emerald-400';
    if (badgeType === 'negative') badgeColors = 'bg-red-500/10 text-red-400';
    if (badgeType === 'warning') badgeColors = 'bg-amber-500/10 text-amber-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="flex flex-col p-5 bg-[#1a2236] border border-white/5 rounded-xl shadow-lg hover:-translate-y-1 transition-transform duration-300"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className="text-gray-400" />}
                    <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                </div>
                {badgeValue && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColors}`}>
                        {badgeValue}
                    </span>
                )}
            </div>
            
            <div className="flex items-baseline gap-2">
                <span className="text-3xl items-center font-bold text-white tracking-tight">
                    {value}
                </span>
            </div>
        </motion.div>
    );
}
