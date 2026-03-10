class ScoringEngine {
    computeSalesRisk(metrics, history = []) {
        // Step 1: Expected Sales (moving average of recent sales)
        let expectedSales = metrics.sales.target || 1;
        if (history && history.length > 0) {
            const recent = history.slice(-7);
            expectedSales = recent.reduce((sum, entry) => sum + entry.revenue, 0) / recent.length;
        }

        // Step 2: Sales Volatility
        const currentSales = metrics.sales.revenue;
        const salesDeviation = Math.abs(currentSales - expectedSales) / Math.max(expectedSales, 1);

        // Step 3: Conversion Quality
        const conversionRate = metrics.sales.conversionRate;
        const conversionRisk = Math.max(0, (2 - conversionRate) / 2);

        // Final Sales Risk
        const salesRisk = 100 * (0.7 * salesDeviation + 0.3 * conversionRisk);
        return Math.min(salesRisk, 100);
    }

    computeInventoryRisk(metrics) {
        const items = metrics.inventory.items;
        
        let totalStockoutRisk = 0;
        
        items.forEach(item => {
            // Step 1: Demand Velocity
            const demandVelocity = Math.max(item.demandVelocity, 0.1); 
            
            // Step 2: Stockout Time
            const stockoutHours = item.stock / demandVelocity;
            
            // Step 3: Stockout Risk
            const itemStockoutRisk = Math.max(0, (48 - stockoutHours) / 48);
            totalStockoutRisk += itemStockoutRisk;
        });

        const avgStockoutRisk = items.length > 0 ? totalStockoutRisk / items.length : 0;

        // Step 4: Low Stock Penalty
        const lowStockPenalty = items.length > 0 ? metrics.inventory.lowStockCount / items.length : 0;

        // Final Inventory Risk
        const inventoryRisk = 100 * (0.75 * avgStockoutRisk + 0.25 * lowStockPenalty);
        return Math.min(inventoryRisk, 100);
    }

    computeSupportRisk(metrics) {
        const { openTickets, resolvedTickets, avgSeverity, satisfaction } = metrics.support;
        
        // Step 1: Ticket Pressure
        const ticketPressure = openTickets / (resolvedTickets + 1);
        
        // Step 2: Severity Impact
        const severityImpact = avgSeverity / 5;
        
        // Step 3: Satisfaction Risk
        const satisfactionRisk = Math.max(0, (3 - satisfaction) / 3);
        
        // Final Support Risk
        const supportRisk = 100 * (0.5 * ticketPressure + 0.3 * severityImpact + 0.2 * satisfactionRisk);
        return Math.min(supportRisk, 100);
    }

    computeCashflowRisk(metrics) {
        const { monthlyExpenses, available } = metrics.cashflow;
        
        // Step 1: Burn Ratio
        const burnRatio = available > 0 ? monthlyExpenses / available : 1;
        
        // Step 2: Runway Months
        const runway = monthlyExpenses > 0 ? available / monthlyExpenses : 999;
        
        // Step 3: Runway Risk
        const runwayRisk = Math.max(0, (6 - runway) / 6);
        
        // Step 4: Expense Pressure
        const expensePressure = burnRatio;
        
        // Final Cashflow Risk
        const cashflowRisk = 100 * (0.6 * runwayRisk + 0.4 * expensePressure);
        return Math.min(cashflowRisk, 100);
    }

    computeBSS(salesRisk, invRisk, supportRisk, cfRisk) {
        // Base Score
        const baseBss = (0.35 * salesRisk) + (0.30 * invRisk) + (0.20 * supportRisk) + (0.15 * cfRisk);
        
        const maxRisk = Math.max(salesRisk, invRisk, supportRisk, cfRisk);
        
        // Crisis Multiplier
        let crisisMultiplier = 1;
        // The rule implies it should conditionally or unconditionally apply: 
        // We'll unconditionally compute it for the mathematical dynamic range as per user's "Final BSS" example.
        if (maxRisk > 0) { 
            crisisMultiplier = 1 + (maxRisk / 200);
        }
        
        // Final BSS
        const bss = baseBss * crisisMultiplier;
        return Math.min(Math.max(bss, 0), 100);
    }

    computeAllScores(metrics, history = []) {
        const sales = this.computeSalesRisk(metrics, history);
        const inventory = this.computeInventoryRisk(metrics);
        const support = this.computeSupportRisk(metrics);
        const cashflow = this.computeCashflowRisk(metrics);
        const bss = this.computeBSS(sales, inventory, support, cashflow);
        return { bss, sales, inventory, support, cashflow };
    }
}

module.exports = { ScoringEngine };
