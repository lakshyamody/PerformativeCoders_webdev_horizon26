class StrategyEngine {
    computeInternalMomentum(metrics, scores) {
        const revGrowth = Math.max(0, 100 - scores.sales);
        const operationalHealth = Math.max(0, 100 - scores.bss);
        const custSatisfaction = (metrics.support.satisfaction / 5) * 100;
        return (revGrowth * 0.4 + operationalHealth * 0.3 + custSatisfaction * 0.3);
    }

    computeMarketSentiment() {
        // Simulated market sentiment based on pseudo-random signals
        const base = 55 + Math.sin(Date.now() / 100000) * 15;
        return Math.min(Math.max(base + (Math.random() - 0.5) * 10, 0), 100);
    }

    computePolicyImpact() {
        // Simulated policy/regulatory impact
        const base = 50 + Math.cos(Date.now() / 200000) * 20;
        return Math.min(Math.max(base + (Math.random() - 0.5) * 5, 0), 100);
    }

    computeGSS(momentum, sentiment, policy) {
        return Math.min(Math.max(
            (0.5 * momentum + 0.3 * sentiment + 0.2 * policy), 0
        ), 100);
    }

    computeStrategy(metrics, scores) {
        const momentum = this.computeInternalMomentum(metrics, scores);
        const sentiment = this.computeMarketSentiment();
        const policy = this.computePolicyImpact();
        const gss = this.computeGSS(momentum, sentiment, policy);

        return {
            gss,
            momentum,
            sentiment,
            policy,
            signals: this.generateSignals(gss, momentum, sentiment),
            recommendations: this.generateRecommendations(gss, scores, momentum)
        };
    }

    generateSignals(gss, momentum, sentiment) {
        const signals = [
            {
                source: 'Market Trends',
                sentiment: sentiment > 60 ? 'positive' : sentiment > 40 ? 'neutral' : 'negative',
                impact: sentiment > 60 ? 'Favorable market conditions detected' : 'Market headwinds anticipated',
                confidence: 0.75 + Math.random() * 0.2
            },
            {
                source: 'Industry News',
                sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
                impact: 'Competitor activity detected in adjacent market',
                confidence: 0.65 + Math.random() * 0.2
            },
            {
                source: 'Economic Indicators',
                sentiment: momentum > 50 ? 'positive' : 'negative',
                impact: momentum > 50 ? 'Consumer spending trends positive' : 'Consumer spending showing signs of contraction',
                confidence: 0.8 + Math.random() * 0.15
            },
            {
                source: 'Supply Chain',
                sentiment: Math.random() > 0.6 ? 'positive' : 'neutral',
                impact: 'Supply chain lead times stabilizing',
                confidence: 0.7 + Math.random() * 0.2
            }
        ];
        return signals;
    }

    generateRecommendations(gss, scores, momentum) {
        const recs = [];

        if (gss > 70) {
            recs.push({
                priority: 'high',
                action: 'Expand market presence',
                detail: 'Conditions are favorable for growth initiatives. Consider launching new product line.',
                impact: '+15-20% revenue potential'
            });
        }

        if (scores.inventory > 50) {
            recs.push({
                priority: 'urgent',
                action: 'Optimize inventory levels',
                detail: 'Multiple SKUs approaching stockout. Initiate emergency restock for critical items.',
                impact: 'Prevent $5-10K revenue loss'
            });
        }

        if (scores.support > 40) {
            recs.push({
                priority: 'medium',
                action: 'Scale support capacity',
                detail: 'Ticket volume trending up. Consider temporary support staff or AI chatbot deployment.',
                impact: 'Improve resolution rate by 20%'
            });
        }

        if (momentum < 50) {
            recs.push({
                priority: 'high',
                action: 'Stabilize operations',
                detail: 'Internal momentum is below threshold. Focus on reducing operational friction before expansion.',
                impact: 'Reduce BSS by 15-25 points'
            });
        }

        if (recs.length === 0) {
            recs.push({
                priority: 'low',
                action: 'Maintain current trajectory',
                detail: 'All metrics within acceptable ranges. Continue monitoring for early warning signs.',
                impact: 'Sustained healthy operations'
            });
        }

        return recs;
    }

    getForecast(metrics) {
        const hours = 24;
        const forecast = [];
        let rev = metrics.sales.revenue;
        let stock = metrics.inventory.totalUnits;
        let tickets = metrics.support.openTickets;
        let cash = metrics.cashflow.available;

        for (let h = 0; h < hours; h++) {
            const time = new Date();
            time.setHours(time.getHours() + h);

            // Simple trend + noise forecasting
            const hourFactor = Math.sin((time.getHours() / 24) * Math.PI * 2) * 0.2;
            rev = rev * (1 + hourFactor * 0.05 + (Math.random() - 0.5) * 0.03);
            stock = Math.max(0, stock - (2 + Math.random() * 3));
            tickets = Math.max(0, tickets + Math.floor((Math.random() - 0.45) * 3));
            cash = cash + rev * 0.001 - metrics.cashflow.dailyBurn / 24;

            forecast.push({
                hour: h,
                time: time.toISOString(),
                revenue: Math.round(rev),
                inventory: Math.round(stock),
                tickets: tickets,
                cash: Math.round(cash)
            });
        }

        return forecast;
    }
}

module.exports = { StrategyEngine };
