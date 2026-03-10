
const PRODUCT_NAMES = [
    'Premium Widget A', 'Standard Widget B', 'Economy Pack C',
    'Deluxe Bundle D', 'Starter Kit E', 'Pro Module F'
];

const SUPPORT_CATEGORIES = [
    'Billing', 'Technical', 'Shipping', 'Returns', 'Account', 'General'
];

class MetricsGenerator {
    constructor() {
        this.history = [];
        this.maxHistory = 50000;
        this.tickCount = 0;
        this.generateHistoricalData();
    }

    generateHistoricalData() {
        const now = Date.now();
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
        
        // Use realistic baselines matching the dashboard
        let revenue = 45000;
        let stock = 600;
        let tickets = 20;
        let cash = 120000;

        // 12 months ago up to 24 hours ago (1 point per hour)
        const startMilli = oneYearAgo;
        const endMilli = now - 24 * 60 * 60 * 1000;
        const step = 60 * 60 * 1000;

        for (let t = startMilli; t < endMilli; t += step) {
            revenue = Math.max(10000, revenue + (Math.random() - 0.48) * 800);
            stock = Math.max(0, stock + (Math.random() - 0.5) * 20);
            tickets = Math.max(0, tickets + Math.floor((Math.random() - 0.52) * 4));
            cash = Math.max(10000, cash + (Math.random() - 0.45) * 2000);

            this.history.push({
                timestamp: t,
                bss: 35 + (Math.random() - 0.5) * 15, // Synthetic BSS
                revenue: Math.round(revenue),
                stock: Math.round(stock),
                tickets: Math.round(tickets),
                cash: Math.round(cash)
            });
        }

        // Last 24 hours (1 point per minute)
        const startRecent = now - 24 * 60 * 60 * 1000;
        const stepRecent = 60 * 1000;
        for (let t = startRecent; t <= now; t += stepRecent) {
            revenue = Math.max(10000, revenue + (Math.random() - 0.48) * 100);
            stock = Math.max(0, stock + (Math.random() - 0.5) * 5);
            tickets = Math.max(0, tickets + Math.floor((Math.random() - 0.52) * 2));
            cash = Math.max(10000, cash + (Math.random() - 0.45) * 500);

            this.history.push({
                timestamp: t,
                bss: 35 + (Math.random() - 0.5) * 10,
                revenue: Math.round(revenue),
                stock: Math.round(stock),
                tickets: Math.round(tickets),
                cash: Math.round(cash)
            });
        }
    }

    generateInitialMetrics() {
        return {
            sales: {
                revenue: 42500 + Math.random() * 5000,
                target: 55000,
                unitsSold: 340 + Math.floor(Math.random() * 50),
                avgOrderValue: 125 + Math.random() * 20,
                conversionRate: 3.2 + Math.random() * 1.5,
                topProducts: PRODUCT_NAMES.slice(0, 3).map(name => ({
                    name,
                    units: Math.floor(30 + Math.random() * 70),
                    revenue: Math.floor(2000 + Math.random() * 5000)
                })),
                hourlyRevenue: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    revenue: Math.floor(500 + Math.random() * 3000)
                }))
            },
            inventory: {
                totalSKUs: 6,
                items: PRODUCT_NAMES.map((name, idx) => ({
                    id: `SKU-${String(idx + 1).padStart(3, '0')}`,
                    name,
                    stock: Math.floor(20 + Math.random() * 200),
                    reorderPoint: 50,
                    demandVelocity: 2 + Math.random() * 8,
                    daysOfSupply: 0
                })),
                totalUnits: 0,
                lowStockCount: 0
            },
            support: {
                openTickets: Math.floor(12 + Math.random() * 20),
                resolvedTickets: Math.floor(45 + Math.random() * 30),
                avgSeverity: 2.5 + Math.random() * 1.5,
                avgResponseTime: 15 + Math.random() * 30,
                resolutionRate: 75 + Math.random() * 15,
                categories: SUPPORT_CATEGORIES.map(cat => ({
                    name: cat,
                    count: Math.floor(2 + Math.random() * 10)
                })),
                satisfaction: 3.5 + Math.random() * 1.5
            },
            cashflow: {
                available: 120000 + Math.random() * 30000,
                monthlyExpenses: 45000 + Math.random() * 10000,
                dailyBurn: 0,
                runway: 0,
                revenue30d: 150000 + Math.random() * 30000,
                expenses30d: 135000 + Math.random() * 20000,
                projectedBalance: 0
            }
        };
    }

    generateMetrics(prevMetrics) {
        this.tickCount++;
        const metrics = JSON.parse(JSON.stringify(prevMetrics));

        // Sales fluctuation
        const salesDelta = (Math.random() - 0.45) * 800;
        metrics.sales.revenue = Math.max(0, metrics.sales.revenue + salesDelta);
        metrics.sales.unitsSold += Math.floor((Math.random() - 0.4) * 5);
        metrics.sales.avgOrderValue = metrics.sales.revenue / Math.max(metrics.sales.unitsSold, 1);
        metrics.sales.conversionRate = Math.max(0.5, Math.min(8, metrics.sales.conversionRate + (Math.random() - 0.5) * 0.3));

        // Update hourly revenue
        const currentHour = new Date().getHours();
        metrics.sales.hourlyRevenue[currentHour] = {
            hour: currentHour,
            revenue: Math.floor(metrics.sales.hourlyRevenue[currentHour].revenue + salesDelta / 3)
        };

        // Inventory decay
        metrics.inventory.items.forEach(item => {
            item.stock = Math.max(0, item.stock - Math.random() * item.demandVelocity * 0.1);
            item.demandVelocity = Math.max(0.5, item.demandVelocity + (Math.random() - 0.5) * 0.3);
            item.daysOfSupply = item.stock / Math.max(item.demandVelocity, 0.01);
        });
        metrics.inventory.totalUnits = metrics.inventory.items.reduce((s, i) => s + i.stock, 0);
        metrics.inventory.lowStockCount = metrics.inventory.items.filter(i => i.stock < i.reorderPoint).length;

        // Support ticket fluctuation
        const ticketDelta = Math.floor((Math.random() - 0.45) * 3);
        metrics.support.openTickets = Math.max(0, metrics.support.openTickets + ticketDelta);
        if (ticketDelta < 0) metrics.support.resolvedTickets += Math.abs(ticketDelta);
        metrics.support.avgSeverity = Math.max(1, Math.min(5, metrics.support.avgSeverity + (Math.random() - 0.5) * 0.2));
        metrics.support.resolutionRate = Math.max(50, Math.min(99, metrics.support.resolutionRate + (Math.random() - 0.5) * 2));
        metrics.support.satisfaction = Math.max(1, Math.min(5, metrics.support.satisfaction + (Math.random() - 0.5) * 0.1));

        // Cash flow
        const dailyBurn = metrics.cashflow.monthlyExpenses / 30;
        metrics.cashflow.dailyBurn = dailyBurn;
        metrics.cashflow.available = Math.max(0, metrics.cashflow.available + (salesDelta * 0.3) - dailyBurn * 0.01);
        metrics.cashflow.runway = metrics.cashflow.available / Math.max(metrics.cashflow.monthlyExpenses, 1);
        metrics.cashflow.projectedBalance = metrics.cashflow.available - metrics.cashflow.monthlyExpenses;

        // Store history
        this.history.push({
            timestamp: Date.now(),
            bss: null, // this will be patched by updateDashboard if needed, or getHistory handles it
            revenue: metrics.sales.revenue,
            stock: metrics.inventory.totalUnits,
            tickets: metrics.support.openTickets,
            cash: metrics.cashflow.available
        });

        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        return metrics;
    }

    generateCrisisMetrics(prevMetrics) {
        const metrics = JSON.parse(JSON.stringify(prevMetrics));

        // Revenue crash
        metrics.sales.revenue *= 0.92;
        metrics.sales.unitsSold = Math.max(0, metrics.sales.unitsSold - Math.floor(Math.random() * 15));
        metrics.sales.conversionRate = Math.max(0.5, metrics.sales.conversionRate - Math.random() * 0.5);

        // Inventory crisis
        metrics.inventory.items.forEach(item => {
            item.stock = Math.max(0, item.stock - item.demandVelocity * 0.5);
            item.demandVelocity *= 1.2;
        });
        metrics.inventory.totalUnits = metrics.inventory.items.reduce((s, i) => s + i.stock, 0);
        metrics.inventory.lowStockCount = metrics.inventory.items.filter(i => i.stock < i.reorderPoint).length;

        // Support flood
        metrics.support.openTickets += Math.floor(3 + Math.random() * 8);
        metrics.support.avgSeverity = Math.min(5, metrics.support.avgSeverity + Math.random() * 0.5);
        metrics.support.resolutionRate = Math.max(40, metrics.support.resolutionRate - Math.random() * 5);
        metrics.support.satisfaction = Math.max(1, metrics.support.satisfaction - Math.random() * 0.3);

        // Cash burn
        metrics.cashflow.available *= 0.97;
        metrics.cashflow.monthlyExpenses *= 1.02;
        metrics.cashflow.dailyBurn = metrics.cashflow.monthlyExpenses / 30;
        metrics.cashflow.runway = metrics.cashflow.available / Math.max(metrics.cashflow.monthlyExpenses, 1);

        this.history.push({
            timestamp: Date.now(),
            revenue: metrics.sales.revenue,
            stock: metrics.inventory.totalUnits,
            tickets: metrics.support.openTickets,
            cash: metrics.cashflow.available
        });

        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        return metrics;
    }

    generateRecoveryMetrics(prevMetrics) {
        this.tickCount++;
        const metrics = JSON.parse(JSON.stringify(prevMetrics));

        // Sales recovery
        metrics.sales.revenue += 1500 + Math.random() * 500;
        metrics.sales.conversionRate = Math.min(4.5, metrics.sales.conversionRate + 0.15);

        // Inventory recovery
        metrics.inventory.items.forEach(item => {
            if (item.stock < item.reorderPoint) {
                item.stock += 15; // fast emergency restock
            }
            item.demandVelocity = Math.max(2, item.demandVelocity * 0.95);
        });
        metrics.inventory.totalUnits = metrics.inventory.items.reduce((s, i) => s + i.stock, 0);
        metrics.inventory.lowStockCount = metrics.inventory.items.filter(i => i.stock < i.reorderPoint).length;

        // Support recovery
        metrics.support.openTickets = Math.max(5, metrics.support.openTickets - 3);
        metrics.support.avgSeverity = Math.max(1.5, metrics.support.avgSeverity - 0.15);
        metrics.support.resolutionRate = Math.min(95, metrics.support.resolutionRate + 2);
        metrics.support.satisfaction = Math.min(4.8, metrics.support.satisfaction + 0.1);

        // Cash recovery
        metrics.cashflow.available *= 1.01;
        metrics.cashflow.monthlyExpenses *= 0.99;
        metrics.cashflow.dailyBurn = metrics.cashflow.monthlyExpenses / 30;
        metrics.cashflow.runway = metrics.cashflow.available / Math.max(metrics.cashflow.monthlyExpenses, 1);

        this.history.push({
            timestamp: Date.now(),
            revenue: metrics.sales.revenue,
            stock: metrics.inventory.totalUnits,
            tickets: metrics.support.openTickets,
            cash: metrics.cashflow.available
        });

        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        return metrics;
    }

    getHistory(rangeStr = 'live') {
        if (!rangeStr || rangeStr === 'live') {
            return this.history.slice(-60);
        }

        const now = Date.now();
        const map = {
            '30m': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '3m': 90 * 24 * 60 * 60 * 1000,
            '6m': 180 * 24 * 60 * 60 * 1000,
            '12m': 365 * 24 * 60 * 60 * 1000
        };

        const duration = map[rangeStr] || map['24h'];
        const cutoff = now - duration;

        const filtered = this.history.filter(d => d.timestamp >= cutoff);

        // Downsample to max 200 points
        if (filtered.length <= 200) return filtered;

        const bucketSize = Math.ceil(filtered.length / 200);
        const downsampled = [];
        
        for (let i = 0; i < filtered.length; i += bucketSize) {
            const bucket = filtered.slice(i, i + bucketSize);
            const avgBss = bucket.reduce((sum, d) => sum + (d.bss || 35), 0) / bucket.length;
            const avgRev = bucket.reduce((sum, d) => sum + d.revenue, 0) / bucket.length;
            const avgStock = bucket.reduce((sum, d) => sum + d.stock, 0) / bucket.length;
            const avgTkt = bucket.reduce((sum, d) => sum + d.tickets, 0) / bucket.length;
            const avgCash = bucket.reduce((sum, d) => sum + d.cash, 0) / bucket.length;

            downsampled.push({
                timestamp: bucket[bucket.length - 1].timestamp,
                bss: avgBss,
                revenue: avgRev,
                stock: avgStock,
                tickets: avgTkt,
                cash: avgCash
            });
        }
        return downsampled;
    }
}

module.exports = { MetricsGenerator };
