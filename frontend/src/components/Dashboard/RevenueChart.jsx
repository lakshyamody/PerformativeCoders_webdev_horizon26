import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

export default function RevenueChart({ history }) {

    // Format data for chart
    const data = history.slice(-30).map(h => ({
        time: h.time,
        revenue: h.revenue,
        expenses: h.cashflow.monthlyExpenses / 30, // Rough estimate for a second teal line
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111827] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-400 text-xs mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: ${Math.round(entry.value).toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1 lg:col-span-2 bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-semibold text-white">Revenue vs Expenses</h3>
                    <p className="text-sm text-gray-400 mt-1">Real-time financial performance</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                    <Calendar size={14} />
                    <span>Last 30 days</span>
                </button>
            </div>

            <div className="flex-1 h-[300px] w-full relative">
                 {data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Waiting for real-time data...</div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="time" 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                tickMargin={10} 
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Revenue"
                                stroke="#6366f1" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorRev)" 
                                isAnimationActive={false}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="expenses" 
                                name="Expenses"
                                stroke="#06b6d4" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorExp)" 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                 )}
            </div>
        </motion.div>
    );
}
