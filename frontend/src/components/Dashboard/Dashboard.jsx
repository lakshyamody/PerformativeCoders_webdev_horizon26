import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDashboardStore from '../../store/dashboardStore';
import MetricCard from './MetricCard';
import RevenueChart from './RevenueChart';
import ProfitPanel from './ProfitPanel';
import RuleManager from './RuleManager';
import AlertFeed from '../AlertFeed/AlertFeed';
import { Activity, CircleDollarSign, Package, Ticket, X } from 'lucide-react';

export default function Dashboard() {
    const metrics = useDashboardStore((s) => s.metrics);
    const scores = useDashboardStore((s) => s.scores);
    const alerts = useDashboardStore((s) => s.alerts);
    const history = useDashboardStore((s) => s.metricsHistory);

    const [bssModalOpen, setBssModalOpen] = useState(false);

    const bss = scores?.bss || 0;
    
    // Safely extract metrics with fallbacks
    const sales = metrics?.sales?.revenue || 0;
    const inventory = metrics?.inventory?.totalUnits || 0;
    const support = metrics?.support?.openTickets || 0;

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Phase 2: Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Business Stress Score" 
                    value={Math.round(bss)} 
                    icon={Activity} 
                    badgeValue={bss > 70 ? 'CRITICAL' : bss > 40 ? 'WARNING' : 'HEALTHY'}
                    badgeType={bss > 70 ? 'negative' : bss > 40 ? 'warning' : 'positive'}
                    delay={0}
                    onClick={() => setBssModalOpen(true)}
                />
                <MetricCard 
                    title="Total Revenue" 
                    value={`$${Math.round(sales).toLocaleString()}`} 
                    icon={CircleDollarSign} 
                    badgeValue="+8.2%"
                    badgeType="positive"
                    delay={0.1}
                />
                <MetricCard 
                    title="Inventory Levels" 
                    value={Math.round(inventory).toLocaleString()} 
                    icon={Package} 
                    badgeValue={metrics?.inventory?.lowStockCount > 0 ? `${metrics.inventory.lowStockCount} Low` : 'Optimal'}
                    badgeType={metrics?.inventory?.lowStockCount > 0 ? 'warning' : 'neutral'}
                    delay={0.2}
                />
                <MetricCard 
                    title="Open Support Tickets" 
                    value={support} 
                    icon={Ticket} 
                    badgeValue={support > 30 ? 'High Volume' : 'Normal'}
                    badgeType={support > 30 ? 'negative' : 'neutral'}
                    delay={0.3}
                />
            </div>

            {/* Phase 3: Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RevenueChart history={history} />
                <ProfitPanel history={history} bss={bss} />
            </div>

            {/* Phase 4: Rules & Alerts */}
            <div className="w-full mt-2 space-y-4">
                <RuleManager />
                <AlertFeed alerts={alerts} />
            </div>

            <AnimatePresence>
                {bssModalOpen && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-[#1a2236] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">BSS Breakdown</h3>
                                <button onClick={() => setBssModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(scores || {}).map(([key, val]) => (
                                    <div key={key} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 capitalize">{key}</span>
                                            <span className="text-white font-medium">{val.toFixed(1)} / 100</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className={`h-full ${val > 70 ? 'bg-red-500' : val > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, Math.max(0, val))}%` }} 
                                                transition={{ duration: 1, type: "spring" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
