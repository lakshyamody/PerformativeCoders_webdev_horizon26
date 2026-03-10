import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../../api/apiClient';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Target, Activity, Zap, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

export default function StrategyPanel({ strategy, history }) {
    const [forecast, setForecast] = useState(null);
    const [loadingForecast, setLoadingForecast] = useState(false);

    const handleFetchForecast = async () => {
        setLoadingForecast(true);
        try {
            const data = await apiClient.getForecast();
            setForecast(data);
        } catch (err) {
            console.error('Failed to load 24h forecast', err);
        } finally {
            setLoadingForecast(false);
        }
    };
    if (!strategy) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-[#1a2236] border border-white/5 rounded-xl text-center">
                <Target size={48} className="text-[#6366f1] mb-4 opacity-50 blur-[1px] animate-pulse" />
                <h3 className="text-lg font-medium text-white mb-2">Initializing Strategy Engine</h3>
                <p className="text-sm text-gray-500">Aggregating real-time business intelligence...</p>
            </div>
        );
    }

    const { gss, momentum, sentiment, policy, signals, recommendations } = strategy;

    // GSS Gauge Calculations
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (gss / 100) * circumference;
    
    const getGSSColor = (score) => score > 70 ? '#10b981' : score > 45 ? '#f59e0b' : '#ef4444';
    const gssColor = getGSSColor(gss);

    const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111827] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {prefix}{Math.round(entry.value).toLocaleString()}{suffix}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Top Row: GSS & Sub-scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Grand Strategy Score Gauge */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="col-span-1 bg-[#1a2236] border border-white/5 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded border ${
                            gss > 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            gss > 45 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {gss > 70 ? 'OPTIMAL' : gss > 45 ? 'MONITOR' : 'CRITICAL'}
                        </span>
                    </div>

                    <h3 className="text-base font-semibold text-white mb-6">Grand Strategy Score</h3>
                    
                    <div className="relative flex items-center justify-center">
                        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                            <circle
                                stroke="rgba(255,255,255,0.05)"
                                fill="transparent"
                                strokeWidth={stroke}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                            <motion.circle
                                stroke={gssColor}
                                fill="transparent"
                                strokeWidth={stroke}
                                strokeLinecap="round"
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset }}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white tracking-tighter shadow-sm" style={{ textShadow: `0 0 20px ${gssColor}40` }}>
                                {Math.round(gss)}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">GSS</span>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-scores */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Momentum */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Zap size={16} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{Math.round(momentum)}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-2">Internal Momentum</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${momentum}%` }} transition={{ duration: 1 }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Sentiment */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Activity size={16} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{Math.round(sentiment)}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-2">Market Sentiment</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-purple-500" initial={{ width: 0 }} animate={{ width: `${sentiment}%` }} transition={{ duration: 1 }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Policy (Mocked from BSS or fixed if policy not provided) */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <TrendingUp size={16} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{Math.round(policy || 85)}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-2">Policy Alignment</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${policy || 85}%` }} transition={{ duration: 1 }} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Middle Row: Forecasts & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 24h Forecast Section */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">24-Hour Forecast Overlay</h3>
                        <button 
                            onClick={handleFetchForecast}
                            disabled={loadingForecast}
                            className="text-xs font-medium text-[#6366f1] hover:text-indigo-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                            {loadingForecast ? 'Loading...' : 'View 24h Forecast'} <ArrowRight size={12} />
                        </button>
                    </div>
                    
                    {forecast ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Revenue Forecast */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg">
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Revenue Projection</h4>
                            <div className="h-[140px] w-full">
                                <ResponsiveContainer>
                                    <AreaChart data={forecast}>
                                        <defs>
                                            <linearGradient id="foreRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="hour" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`} width={40} />
                                        <Tooltip content={<CustomTooltip prefix="$" />} />
                                        <Area type="monotone" dataKey="revenue" name="Expected" stroke="#3b82f6" strokeWidth={2} fill="url(#foreRev)" isAnimationActive={false}/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Inventory Forecast */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-[#1a2236] border border-white/5 rounded-xl p-5 shadow-lg">
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Inventory Burn</h4>
                            <div className="h-[140px] w-full">
                                <ResponsiveContainer>
                                    <AreaChart data={forecast}>
                                        <defs>
                                            <linearGradient id="foreInv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="hour" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} width={30} />
                                        <Tooltip content={<CustomTooltip suffix=" Units" />} />
                                        <Area type="monotone" dataKey="inventory" name="Projected" stroke="#f59e0b" strokeWidth={2} fill="url(#foreInv)" isAnimationActive={false}/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                    ) : (
                        <div className="flex items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                            <p className="text-sm text-gray-500">Run the forecast engine to view 24-hour predictive models.</p>
                        </div>
                    )}
                </div>

                {/* AI Recommendations */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="col-span-1 bg-[#1a2236] border border-white/5 rounded-xl shadow-lg flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-base font-semibold text-white">AI Action Items</h3>
                        <p className="text-xs text-gray-400 mt-1">Prioritized by impact</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {recommendations?.map((rec, idx) => {
                            const isHigh = rec.priority === 'high' || rec.priority === 'critical';
                            return (
                                <div key={idx} className="p-3 mb-2 rounded-lg hover:bg-white/[0.02] border border-transparent transition-colors group">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{rec.action}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${
                                            isHigh ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20'
                                        }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{rec.detail}</p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                        <TrendingUp size={12} />
                                        Impact: {rec.impact}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
