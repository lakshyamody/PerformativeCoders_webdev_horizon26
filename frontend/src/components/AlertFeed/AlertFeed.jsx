import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, AlertOctagon, TrendingUp, Calendar, Download, Plus, X } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
}

export default function AlertFeed({ alerts = [] }) {
    const { dismissAlert, activeFilters } = useDashboardStore();
    
    const getAlertStyles = (type) => {
        switch(type) {
            case 'crisis': return { 
                icon: AlertOctagon, 
                color: 'text-red-400', 
                bg: 'bg-red-500/10', 
                border: 'border-red-500/20' 
            };
            case 'warning': return { 
                icon: AlertTriangle, 
                color: 'text-amber-400', 
                bg: 'bg-amber-500/10', 
                border: 'border-amber-500/20' 
            };
            case 'opportunity': return { 
                icon: TrendingUp, 
                color: 'text-emerald-400', 
                bg: 'bg-emerald-500/10', 
                border: 'border-emerald-500/20' 
            };
            default: return { 
                icon: Bell, 
                color: 'text-[#6366f1]', 
                bg: 'bg-indigo-500/10', 
                border: 'border-indigo-500/20' 
            };
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (activeFilters.severity.length > 0 && !activeFilters.severity.includes(alert.type.toLowerCase())) {
            return false;
        }
        if (activeFilters.vertical.length > 0 && !activeFilters.vertical.includes(alert.source)) {
            return false;
        }
        // Basic time filtering logic could go here based on activeFilters.timeRange
        return true;
    });

    return (
        <div className="bg-[#1a2236] border border-white/5 rounded-xl shadow-lg overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <span>Alerts Overview</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[#6366f1] text-xs font-semibold">{filteredAlerts.length}</span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Real-time system events and opportunities</p>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            <th className="p-4 pl-6 font-medium">Alert</th>
                            <th className="p-4 font-medium">Source</th>
                            <th className="p-4 font-medium">Severity</th>
                            <th className="p-4 font-medium">Time</th>
                            <th className="p-4 pr-6 text-right font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                                        {alerts.length === 0 ? 'No active alerts — all systems nominal ✓' : 'No alerts match your current filters.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredAlerts.slice(0, 15).map((alert, index) => {
                                    const { icon: Icon, color, bg, border } = getAlertStyles(alert.type);
                                    
                                    return (
                                        <motion.tr
                                            key={alert.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">{alert.title}</span>
                                                        <span className="text-xs text-gray-400 max-w-md truncate" title={alert.message}>{alert.message}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-300 capitalize">{alert.source}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 flex items-center justify-center w-max rounded text-xs font-medium border ${bg} ${color} ${border}`}>
                                                    {alert.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                {timeAgo(alert.timestamp)}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button 
                                                    onClick={() => dismissAlert(alert.id)}
                                                    className="text-gray-400 hover:text-white hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-white/10"
                                                    title="Dismiss Alert"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-white/5 flex justify-center">
                <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
                    View all alerts
                </button>
            </div>
            
        </div>
    );
}
