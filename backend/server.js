const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Services
const { MetricsGenerator } = require('./services/metricsGenerator');
const { ScoringEngine } = require('./services/scoringEngine');
const { AlertEngine } = require('./services/alertEngine');
const { StrategyEngine } = require('./services/strategyEngine');

const metricsGen = new MetricsGenerator();
const scoringEngine = new ScoringEngine();
const alertEngine = new AlertEngine();
const strategyEngine = new StrategyEngine();

// State
let currentState = {
    metrics: metricsGen.generateInitialMetrics(),
    scores: { bss: 35, sales: 25, inventory: 30, support: 20, cashflow: 15 },
    alerts: [],
    warRoomActive: false,
    simulationMode: false,
    strategy: { gss: 65, momentum: 70, sentiment: 60, policy: 55, forecast: [] }
};

// Simulation mode
let simulationActive = false;

// Users Mock Data
let users = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'Admin', lastActive: '2 mins ago' },
    { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'Analyst', lastActive: '1 hr ago' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', lastActive: '1 day ago' }
];

// Custom Rules
let customRules = [];
let ruleCooldowns = {};

function evaluateCustomRules(metrics, scores) {
    const alerts = [];
    const now = Date.now();
    
    customRules.forEach(rule => {
        let currentValue;
        switch(rule.metric) {
            case 'Sales Revenue': currentValue = metrics.sales.revenue; break;
            case 'Inventory Level': currentValue = metrics.inventory.totalUnits; break;
            case 'Support Tickets': currentValue = metrics.support.openTickets; break;
            case 'Cash Flow': currentValue = metrics.cashflow.available; break;
            case 'BSS Score': currentValue = scores.bss; break;
            default: return;
        }

        let conditionMet = false;
        const targetValue = parseFloat(rule.value);
        switch(rule.operator) {
            case 'drops below': conditionMet = currentValue < targetValue; break;
            case 'rises above': conditionMet = currentValue > targetValue; break;
            case 'changes by more than': conditionMet = false; break; // Requires history, stubbed for now
        }

        if (conditionMet) {
            const cooldownKey = `rule_${rule.id}`;
            if (!ruleCooldowns[cooldownKey] || now - ruleCooldowns[cooldownKey] > 15000) {
                ruleCooldowns[cooldownKey] = now;
                alerts.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: rule.severity.toLowerCase(),
                    title: `Automation: ${rule.name}`,
                    message: `${rule.metric} ${rule.operator} ${targetValue} (Current: ${currentValue.toFixed(0)})`,
                    timestamp: Date.now(),
                    active: true,
                    ruleId: rule.id,
                    source: 'Custom Rule'
                });
            }
        }
    });
    return alerts;
}

function updateDashboard() {
    const metrics = simulationActive
        ? metricsGen.generateCrisisMetrics(currentState.metrics)
        : metricsGen.generateMetrics(currentState.metrics);

    const scores = scoringEngine.computeAllScores(metrics);
    
    // Patch the synthetic bss on the latest history entry
    if (metricsGen.history && metricsGen.history.length > 0) {
        metricsGen.history[metricsGen.history.length - 1].bss = scores.bss;
    }

    let newAlerts = alertEngine.generateAlerts(metrics, scores, currentState.alerts);
    const ruleAlerts = evaluateCustomRules(metrics, scores);
    
    newAlerts = [...ruleAlerts, ...newAlerts];

    const strategy = strategyEngine.computeStrategy(metrics, scores);
    const warRoomActive = scores.bss > 70;

    currentState = {
        metrics,
        scores,
        alerts: [...newAlerts, ...currentState.alerts].slice(0, 50),
        warRoomActive,
        simulationMode: simulationActive,
        strategy,
        timestamp: Date.now()
    };

    io.emit('dashboard:update', currentState);
}

// Update every 3 seconds
setInterval(updateDashboard, 3000);

// Socket.io connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('dashboard:update', currentState);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// REST API Routes
app.get('/api/dashboard/state', (req, res) => {
    res.json(currentState);
});

app.get('/api/metrics/history', (req, res) => {
    res.json(metricsGen.getHistory(req.query.range));
});

app.get('/api/alerts/active', (req, res) => {
    res.json(currentState.alerts.filter(a => a.active));
});

app.get('/api/strategy/score', (req, res) => {
    res.json(currentState.strategy);
});

app.get('/api/strategy/forecast', (req, res) => {
    res.json(strategyEngine.getForecast(currentState.metrics));
});

// Simulation control
app.post('/api/simulation/toggle', (req, res) => {
    simulationActive = !simulationActive;
    if (!simulationActive) {
        currentState.metrics = metricsGen.generateInitialMetrics();
    }
    res.json({ active: simulationActive });
});

app.get('/api/simulation/status', (req, res) => {
    res.json({ active: simulationActive });
});

// Users
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users/invite', (req, res) => {
    const { email, role } = req.body;
    const name = email.split('@')[0];
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role: role || 'Viewer',
        lastActive: 'Just now'
    };
    users.push(newUser);
    res.json(newUser);
});

app.delete('/api/users/:id', (req, res) => {
    users = users.filter(u => u.id !== req.params.id);
    res.json({ success: true });
});

// Rules endpoints
app.get('/api/rules', (req, res) => {
    res.json(customRules);
});

app.post('/api/rules', (req, res) => {
    const newRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...req.body,
        createdAt: Date.now()
    };
    customRules.push(newRule);
    res.json(newRule);
});

app.delete('/api/rules/:id', (req, res) => {
    customRules = customRules.filter(r => r.id !== req.params.id);
    res.json({ success: true });
});

// AI Assistant
app.post('/api/assistant/query', async (req, res) => {
    const { query } = req.body;
    try {
        const response = await generateAIResponse(query, currentState);
        res.json(response);
    } catch (err) {
        console.error('AI query error:', err);
        res.json({
            text: generateFallbackResponse(query, currentState),
            actions: [],
            confidence: 0.85
        });
    }
});

app.post('/api/assistant/action', (req, res) => {
    const { action } = req.body;
    const result = executeAction(action, currentState, metricsGen);
    res.json(result);
});

function generateAIResponse(query, state) {
    const q = query.toLowerCase();
    const { scores, metrics, alerts } = state;

    let text = '';
    let actions = [];

    if (q.includes('stress') || q.includes('bss') || q.includes('score')) {
        const topRisk = Object.entries(scores)
            .filter(([k]) => k !== 'bss')
            .sort((a, b) => b[1] - a[1])[0];

        text = `Your Business Stress Score is currently ${scores.bss.toFixed(0)} out of 100. `;
        if (scores.bss > 70) {
            text += `This is in the CRITICAL zone. `;
        } else if (scores.bss > 40) {
            text += `This is in the WARNING zone. `;
        } else {
            text += `This is in the HEALTHY zone. `;
        }
        text += `The biggest contributing factor is ${topRisk[0]} risk at ${topRisk[1].toFixed(0)}%. `;

        if (topRisk[0] === 'inventory') {
            text += `I recommend restocking low-inventory items immediately.`;
            actions.push({ type: 'restock', label: 'Restock Low Items' });
        } else if (topRisk[0] === 'support') {
            text += `There are several high-severity support tickets. Consider escalating critical ones.`;
            actions.push({ type: 'escalate', label: 'Escalate Critical Tickets' });
        } else if (topRisk[0] === 'sales') {
            text += `Revenue is below target. Consider launching a promotional campaign.`;
            actions.push({ type: 'campaign', label: 'Launch Flash Sale' });
        } else {
            text += `Cash reserves are running low. Review upcoming expenses for potential cuts.`;
            actions.push({ type: 'review_expenses', label: 'Review Expenses' });
        }
    } else if (q.includes('inventory') || q.includes('stock') || q.includes('restock')) {
        const lowStock = metrics.inventory.items.filter(i => i.stock < i.reorderPoint);
        text = `You have ${lowStock.length} items below reorder threshold. `;
        if (lowStock.length > 0) {
            text += `The most critical is "${lowStock[0].name}" with only ${lowStock[0].stock} units remaining against a reorder point of ${lowStock[0].reorderPoint}. `;
            text += `At current demand velocity, you'll run out in approximately ${Math.ceil(lowStock[0].stock / Math.max(lowStock[0].demandVelocity, 0.1))} hours.`;
            actions.push({ type: 'restock', label: `Restock ${lowStock[0].name}`, target: lowStock[0].name });
        }
    } else if (q.includes('sales') || q.includes('revenue')) {
        text = `Current revenue is $${metrics.sales.revenue.toLocaleString()} against today's target of $${metrics.sales.target.toLocaleString()}. `;
        const pct = ((metrics.sales.revenue / metrics.sales.target) * 100).toFixed(1);
        text += `You're at ${pct}% of target. `;
        if (parseFloat(pct) < 80) {
            text += `This is below expectations. Recommend activating promotional pricing or targeted outreach.`;
            actions.push({ type: 'campaign', label: 'Launch Flash Sale' });
        } else {
            text += `You're on track for today's goals.`;
        }
    } else if (q.includes('support') || q.includes('ticket') || q.includes('customer')) {
        text = `There are currently ${metrics.support.openTickets} open support tickets with an average severity of ${metrics.support.avgSeverity.toFixed(1)}/5. `;
        text += `Resolution rate is at ${metrics.support.resolutionRate.toFixed(0)}%. `;
        if (metrics.support.avgSeverity > 3.5) {
            text += `Severity is elevated. Recommend escalating critical tickets immediately.`;
            actions.push({ type: 'escalate', label: 'Escalate Critical Tickets' });
        }
    } else if (q.includes('cash') || q.includes('flow') || q.includes('expense') || q.includes('money')) {
        text = `Available cash balance is $${metrics.cashflow.available.toLocaleString()} with monthly expenses of $${metrics.cashflow.monthlyExpenses.toLocaleString()}. `;
        const runway = (metrics.cashflow.available / metrics.cashflow.monthlyExpenses).toFixed(1);
        text += `That gives you approximately ${runway} months of runway. `;
        if (parseFloat(runway) < 3) {
            text += `This is concerning. Consider reviewing expenses for optimization.`;
            actions.push({ type: 'review_expenses', label: 'Review Expenses' });
        }
    } else if (q.includes('strategy') || q.includes('forecast') || q.includes('predict')) {
        text = `Your Grand Strategy Score is ${state.strategy.gss.toFixed(0)}/100. `;
        text += `Internal momentum is at ${state.strategy.momentum.toFixed(0)}%, `;
        text += `market sentiment is ${state.strategy.sentiment.toFixed(0)}%, `;
        text += `and policy impact is ${state.strategy.policy.toFixed(0)}%. `;
        if (state.strategy.gss > 60) {
            text += `Overall outlook is positive. The AI recommends expanding market presence.`;
        } else {
            text += `Outlook is cautious. Focus on stabilizing internal operations before expanding.`;
        }
    } else if (q.includes('restock')) {
        actions.push({ type: 'restock', label: 'Restock All Low Items' });
        text = `I'll initiate a restock order for all items below their reorder threshold. This will restore inventory levels and reduce your inventory risk score.`;
    } else if (q.includes('morning') || q.includes('brief') || q.includes('summary')) {
        text = `Good morning! Here's your daily brief: BSS is at ${scores.bss.toFixed(0)}/100. `;
        text += `Revenue is at $${metrics.sales.revenue.toLocaleString()} (${((metrics.sales.revenue / metrics.sales.target) * 100).toFixed(0)}% of target). `;
        text += `${metrics.support.openTickets} support tickets are open. `;
        text += `Cash runway is ${(metrics.cashflow.available / metrics.cashflow.monthlyExpenses).toFixed(1)} months. `;

        const risks = [];
        if (scores.inventory > 50) risks.push('inventory shortages');
        if (scores.support > 50) risks.push('support backlog');
        if (scores.sales > 50) risks.push('revenue shortfall');
        if (scores.cashflow > 50) risks.push('low cash reserves');

        if (risks.length > 0) {
            text += `Top risks today: ${risks.join(', ')}. `;
        } else {
            text += `No critical risks detected today. `;
        }
        text += `Recommended actions: focus on the highest-risk area first.`;
    } else {
        text = `Based on current data: BSS is ${scores.bss.toFixed(0)}/100, Revenue at $${metrics.sales.revenue.toLocaleString()}, ${metrics.support.openTickets} open tickets, cash runway of ${(metrics.cashflow.available / metrics.cashflow.monthlyExpenses).toFixed(1)} months. How can I help you further?`;
    }

    return Promise.resolve({ text, actions, confidence: 0.92 });
}

function generateFallbackResponse(query, state) {
    return `Your current BSS is ${state.scores.bss.toFixed(0)}/100. Revenue is $${state.metrics.sales.revenue.toLocaleString()}. ${state.metrics.support.openTickets} support tickets are open. How can I help?`;
}

function executeAction(action, state, metricsGen) {
    switch (action.type) {
        case 'restock':
            state.metrics.inventory.items.forEach(item => {
                if (item.stock < item.reorderPoint) {
                    item.stock = item.reorderPoint * 2;
                }
            });
            return { success: true, message: `Restock order placed for low-inventory items. Stock levels restored.` };

        case 'escalate':
            state.metrics.support.openTickets = Math.max(state.metrics.support.openTickets - 3, 0);
            state.metrics.support.resolvedTickets += 3;
            return { success: true, message: '3 critical tickets escalated and assigned to senior support team.' };

        case 'campaign':
            state.metrics.sales.revenue *= 1.15;
            return { success: true, message: 'Flash sale campaign activated. Projected 15% revenue boost.' };

        case 'review_expenses':
            state.metrics.cashflow.monthlyExpenses *= 0.9;
            return { success: true, message: 'Expense review initiated. Identified 10% potential savings.' };

        default:
            return { success: false, message: 'Unknown action type.' };
    }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 OpsPulse Backend running on port ${PORT}`);
});
