import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function ProfitPanel({ history, bss, currency }) {
    
    // Total Profit (mocked using revenue data)
    const profitData = history.slice(-15).map((h, i) => ({
        name: i,
        profit: h.revenue * 0.3 + (Math.random() * 500) // Mock 30% margin + variance
    }));

    // Sessions / BSS Sparkline
    const sessionData = history.slice(-15).map((h, i) => ({
        name: i,
        sessions: h.bss + (Math.random() * 10)
    }));

    const currentProfit = profitData.length ? profitData[profitData.length - 1].profit : 0;
    
    return (
        <div className="col-span-1 flex flex-col gap-6">
            
            {/* Total Profit Card */}
            <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex-1 flex flex-col"
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium">Total Profit</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-white">{formatCurrency(currentProfit, currency)}</span>
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+12.5%</span>
                        </div>
                    </div>
                    <button className="text-[#6366f1] hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors">
                        View report <ArrowUpRight size={14} />
                    </button>
                </div>
                
                <div className="flex-1 mt-4 min-h-[100px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitData}>
                            <Bar 
                                dataKey="profit" 
                                fill="#6366f1" 
                                radius={[2, 2, 0, 0]} 
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Total Sessions / BSS Sparkline */}
            <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex-1 flex flex-col"
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium">System Pulse (BSS)</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-white">{Math.round(bss)}</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${bss > 70 ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                {bss > 70 ? 'Elevated' : 'Normal'}
                            </span>
                        </div>
                    </div>
                    <button className="text-[#6366f1] hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors">
                        View report <ArrowUpRight size={14} />
                    </button>
                </div>
                
                <div className="flex-1 mt-4 min-h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sessionData}>
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                            <Line 
                                type="monotone" 
                                dataKey="sessions" 
                                stroke={bss > 70 ? "#ef4444" : "#10b981"} 
                                strokeWidth={3} 
                                dot={false} 
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

        </div>
    );
}
