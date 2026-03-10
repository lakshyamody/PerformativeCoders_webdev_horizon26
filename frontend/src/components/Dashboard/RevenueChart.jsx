import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function RevenueChart({ history, loading, selectedTimeRange = 'live', setSelectedTimeRange, currency }) {

    // Format data for chart
    const data = history.map(h => ({
        timestamp: h.timestamp,
        revenue: h.revenue,
        expenses: h.cashflow?.monthlyExpenses ? h.cashflow.monthlyExpenses / 30 : h.revenue * 0.7, // fallback estimate
    }));

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        if (['live', '30m', '1h', '6h', '24h'].includes(selectedTimeRange)) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (['7d', '30d'].includes(selectedTimeRange)) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111827] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-400 text-xs mb-2">{formatTime(label)}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value, currency)}
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
                <div className="relative">
                    <select 
                        className="appearance-none bg-[#111827] flex items-center gap-2 px-3 py-1.5 pr-8 text-xs font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                    >
                        <option value="live">Live</option>
                        <option value="30m">Last 30 minutes</option>
                        <option value="1h">Last 1 hour</option>
                        <option value="6h">Last 6 hours</option>
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="3m">Last 3 months</option>
                        <option value="6m">Last 6 months</option>
                        <option value="12m">Last 12 months</option>
                    </select>
                    <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
            </div>

            <div className="flex-1 h-[300px] w-full relative">
                 {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[#6366f1]">
                        <Loader2 className="animate-spin" size={24} />
                    </div>
                 ) : data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Waiting for data...</div>
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
                                dataKey="timestamp" 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={formatTime}
                                tickMargin={10} 
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value, currency, true)} 
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
