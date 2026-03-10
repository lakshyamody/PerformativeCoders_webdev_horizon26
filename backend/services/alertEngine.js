const { v4: uuidv4 } = require('uuid');

const ALERT_TYPES = {
    CRISIS: 'crisis',
    WARNING: 'warning',
    OPPORTUNITY: 'opportunity',
    ANOMALY: 'anomaly',
    INFO: 'info'
};

class AlertEngine {
    constructor() {
        this.cooldowns = {};
        this.cooldownMs = 15000;
    }

    canAlert(type) {
        const now = Date.now();
        if (this.cooldowns[type] && now - this.cooldowns[type] < this.cooldownMs) {
            return false;
        }
        this.cooldowns[type] = now;
        return true;
    }

    generateAlerts(metrics, scores, existingAlerts) {
        const newAlerts = [];

        // BSS Crisis
        if (scores.bss > 75 && this.canAlert('bss_crisis')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.CRISIS,
                title: '🚨 Critical Stress Level',
                message: `BSS has reached ${scores.bss.toFixed(0)}/100. War Room activation recommended.`,
                timestamp: Date.now(),
                active: true,
                source: 'BSS Engine'
            });
        }

        // Inventory alerts
        const lowStockItems = metrics.inventory.items.filter(i => i.stock < i.reorderPoint);
        if (lowStockItems.length >= 3 && this.canAlert('inventory_crisis')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.CRISIS,
                title: '📦 Multi-SKU Stockout Risk',
                message: `${lowStockItems.length} products below reorder threshold. Immediate restocking needed.`,
                timestamp: Date.now(),
                active: true,
                source: 'Inventory Monitor'
            });
        } else if (lowStockItems.length > 0 && this.canAlert('inventory_warning')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.WARNING,
                title: '📦 Low Stock Alert',
                message: `${lowStockItems[0].name} has only ${Math.floor(lowStockItems[0].stock)} units remaining.`,
                timestamp: Date.now(),
                active: true,
                source: 'Inventory Monitor'
            });
        }

        // Revenue anomaly
        if (scores.sales > 60 && this.canAlert('sales_warning')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.WARNING,
                title: '📉 Revenue Below Target',
                message: `Current revenue is ${((metrics.sales.revenue / metrics.sales.target) * 100).toFixed(0)}% of daily target.`,
                timestamp: Date.now(),
                active: true,
                source: 'Sales Tracker'
            });
        }

        // Support escalation
        if (metrics.support.avgSeverity > 3.5 && this.canAlert('support_escalation')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.WARNING,
                title: '🎫 High Severity Support Queue',
                message: `Average ticket severity is ${metrics.support.avgSeverity.toFixed(1)}/5 with ${metrics.support.openTickets} open tickets.`,
                timestamp: Date.now(),
                active: true,
                source: 'Support Monitor'
            });
        }

        // Cash flow alert
        if (metrics.cashflow.runway < 3 && this.canAlert('cashflow_warning')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.CRISIS,
                title: '💰 Low Cash Runway',
                message: `Only ${metrics.cashflow.runway.toFixed(1)} months of runway remaining at current burn.`,
                timestamp: Date.now(),
                active: true,
                source: 'Finance Monitor'
            });
        }

        // Opportunity alerts
        if (metrics.sales.conversionRate > 5 && this.canAlert('conversion_opportunity')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.OPPORTUNITY,
                title: '🚀 High Conversion Rate',
                message: `Conversion rate spiking at ${metrics.sales.conversionRate.toFixed(1)}%. Consider increasing ad spend.`,
                timestamp: Date.now(),
                active: true,
                source: 'Growth Engine'
            });
        }

        // Satisfaction anomaly
        if (metrics.support.satisfaction >= 4.5 && this.canAlert('satisfaction_high')) {
            newAlerts.push({
                id: uuidv4(),
                type: ALERT_TYPES.OPPORTUNITY,
                title: '⭐ Customer Satisfaction Peak',
                message: `CSAT at ${metrics.support.satisfaction.toFixed(1)}/5. Great time for NPS survey or review requests.`,
                timestamp: Date.now(),
                active: true,
                source: 'CX Monitor'
            });
        }

        return newAlerts;
    }
}

module.exports = { AlertEngine };
