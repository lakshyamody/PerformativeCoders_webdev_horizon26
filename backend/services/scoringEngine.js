class ScoringEngine {
    computeSalesRisk(metrics) {
        const { revenue, target } = metrics.sales;
        const gap = Math.abs(revenue - target) / target;
        const conversionPenalty = metrics.sales.conversionRate < 2 ? 15 : 0;
        return Math.min(gap * 100 + conversionPenalty, 100);
    }

    computeInventoryRisk(metrics) {
        const items = metrics.inventory.items;
        let totalRisk = 0;
        items.forEach(item => {
            if (item.stock === 0) {
                totalRisk += 100 / items.length;
            } else {
                const ratio = item.demandVelocity / item.stock;
                totalRisk += Math.min(ratio * 100, 100) / items.length;
            }
        });
        const lowStockPenalty = metrics.inventory.lowStockCount * 8;
        return Math.min(totalRisk + lowStockPenalty, 100);
    }

    computeSupportRisk(metrics) {
        const { openTickets, resolvedTickets, avgSeverity, satisfaction } = metrics.support;
        const ratio = openTickets / Math.max(resolvedTickets, 1);
        const severityFactor = ratio * avgSeverity * 10;
        const satisfactionPenalty = satisfaction < 3 ? 20 : 0;
        return Math.min(severityFactor + satisfactionPenalty, 100);
    }

    computeCashflowRisk(metrics) {
        const { monthlyExpenses, available } = metrics.cashflow;
        const burnRisk = (monthlyExpenses / Math.max(available, 1)) * 100;
        const runwayPenalty = metrics.cashflow.runway < 2 ? 25 : 0;
        return Math.min(burnRisk + runwayPenalty, 100);
    }

    computeBSS(salesRisk, invRisk, supportRisk, cfRisk) {
        const bss = (0.35 * salesRisk) + (0.30 * invRisk) + (0.20 * supportRisk) + (0.15 * cfRisk);
        return Math.min(Math.max(bss, 0), 100);
    }

    computeAllScores(metrics) {
        const sales = this.computeSalesRisk(metrics);
        const inventory = this.computeInventoryRisk(metrics);
        const support = this.computeSupportRisk(metrics);
        const cashflow = this.computeCashflowRisk(metrics);
        const bss = this.computeBSS(sales, inventory, support, cashflow);
        return { bss, sales, inventory, support, cashflow };
    }
}

module.exports = { ScoringEngine };
