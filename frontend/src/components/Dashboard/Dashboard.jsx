import { useEffect } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import MetricCard from './MetricCard';
import RevenueChart from './RevenueChart';
import ProfitPanel from './ProfitPanel';
import AlertFeed from '../AlertFeed/AlertFeed';
import { Activity, CircleDollarSign, Package, Ticket } from 'lucide-react';

export default function Dashboard() {
    const metrics = useDashboardStore((s) => s.metrics);
    const scores = useDashboardStore((s) => s.scores);
    const alerts = useDashboardStore((s) => s.alerts);
    const history = useDashboardStore((s) => s.metricsHistory);

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

            {/* Phase 4: Alert Feed */}
            <div className="w-full mt-2">
                <AlertFeed alerts={alerts} />
            </div>
        </div>
    );
}
