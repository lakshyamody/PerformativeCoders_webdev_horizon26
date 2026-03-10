import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ 
    title, 
    value, 
    icon: Icon, 
    badgeValue, 
    badgeType = 'neutral', 
    compact = false,
    delay = 0,
    source = '',
    onClick 
}) {
    // Determine badge colors based on type
    let badgeColors = 'bg-white/10 text-gray-300';
    if (badgeType === 'positive') badgeColors = 'bg-emerald-500/10 text-emerald-400';
    if (badgeType === 'negative') badgeColors = 'bg-red-500/10 text-red-400';
    if (badgeType === 'warning') badgeColors = 'bg-amber-500/10 text-amber-400';

    const CardBase = onClick ? motion.button : motion.div;

    return (
        <CardBase
            onClick={onClick}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`flex flex-col text-left bg-[#1a2236] border border-white/5 rounded-xl shadow-lg transition-all duration-300 ${compact ? 'p-3' : 'p-5'} ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-white/10 hover:shadow-xl' : 'hover:-translate-y-1'}`}
        >
            <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={compact ? 14 : 18} className="text-gray-400" />}
                    <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>{title}</h3>
                </div>
                {badgeValue && (
                    <span className={`px-2 py-0.5 font-semibold rounded-full ${badgeColors} ${compact ? 'text-[10px]' : 'text-xs'}`}>
                        {badgeValue}
                    </span>
                )}
            </div>
            
            <div className="flex flex-col gap-0.5">
                <span className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-white tracking-tight`}>
                    {value}
                </span>
                {source && (
                    <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                        {source === 'Simulated' ? 'Simulated' : `via ${source}`}
                    </span>
                )}
            </div>
        </CardBase>
    );
}
