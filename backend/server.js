const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

let businessProfile = {};

// Webhooks State
let registeredWebhooks = [];
let internalSimulators = {};

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

let sourceValues = {
    sales: {},
    inventory: {},
    support: {},
    cashflow: {}
};

function averageValues(obj, fallback) {
    const vals = Object.values(obj);
    if (!vals || vals.length === 0) return fallback;
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum / vals.length;
}

function processWebhookPayload(source, payload) {
    let sourceName = source;
    // For demo CRMs and ERPs
    if (source === 'hubspot') {
        sourceName = 'HubSpot';
        if (payload.deals) {
            const total = payload.deals.filter(d => d.dealstage === 'closedwon').reduce((sum, d) => sum + d.amount, 0);
            sourceValues.sales['HubSpot'] = total;
            currentState.metrics.sales.revenue = averageValues(sourceValues.sales, currentState.metrics.sales.revenue);
            currentState.metrics.sales.source = Object.keys(sourceValues.sales).join(' & ');
        }
    } else if (source === 'salesforce') {
        sourceName = 'Salesforce';
        if (payload.sobject && payload.sobject.Opportunity) {
            const opps = Array.isArray(payload.sobject.Opportunity) ? payload.sobject.Opportunity : [payload.sobject.Opportunity];
            const total = opps.filter(o => o.StageName === 'Closed Won').reduce((sum, o) => sum + o.Amount, 0);
            sourceValues.sales['Salesforce'] = total;
            currentState.metrics.sales.revenue = averageValues(sourceValues.sales, currentState.metrics.sales.revenue);
            currentState.metrics.sales.source = Object.keys(sourceValues.sales).join(' & ');
        }
    } else if (source === 'sap') {
        sourceName = 'SAP';
        if (payload.materialDocument && payload.materialDocument.items) {
            const totalQty = payload.materialDocument.items.reduce((sum, item) => sum + item.quantity, 0);
            sourceValues.inventory['SAP'] = totalQty;
            currentState.metrics.inventory.totalUnits = averageValues(sourceValues.inventory, currentState.metrics.inventory.totalUnits);
            currentState.metrics.inventory.source = Object.keys(sourceValues.inventory).join(' & ');
        }
    } else if (source === 'quickbooks') {
        sourceName = 'QuickBooks';
        if (payload.eventNotifications) {
            let total = currentState.metrics.cashflow.available;
            payload.eventNotifications.forEach(ev => {
                if (ev.dataChangeEvent && ev.dataChangeEvent.entities) {
                    ev.dataChangeEvent.entities.forEach(entity => {
                        if (entity.name === 'Invoice') total += entity.amount;
                        if (entity.name === 'Bill') total -= entity.amount;
                    });
                }
            });
            sourceValues.cashflow['QuickBooks'] = total;
            currentState.metrics.cashflow.available = averageValues(sourceValues.cashflow, currentState.metrics.cashflow.available);
            currentState.metrics.cashflow.source = Object.keys(sourceValues.cashflow).join(' & ');
        }
    } else {
        // Custom Webhook
        const webhook = registeredWebhooks.find(w => w.sourceId === source);
        if (webhook) {
            sourceName = webhook.name;
            const val = getNestedValue(payload, webhook.fieldPath);
            if (val !== undefined) {
                if (webhook.targetMetric === 'Sales Revenue') {
                    sourceValues.sales[webhook.name] = Number(val);
                    currentState.metrics.sales.revenue = averageValues(sourceValues.sales, currentState.metrics.sales.revenue);
                    currentState.metrics.sales.source = Object.keys(sourceValues.sales).join(' & ');
                } else if (webhook.targetMetric === 'Inventory Level') {
                    sourceValues.inventory[webhook.name] = Number(val);
                    currentState.metrics.inventory.totalUnits = averageValues(sourceValues.inventory, currentState.metrics.inventory.totalUnits);
                    currentState.metrics.inventory.source = Object.keys(sourceValues.inventory).join(' & ');
                } else if (webhook.targetMetric === 'Support Tickets') {
                    sourceValues.support[webhook.name] = Number(val);
                    currentState.metrics.support.openTickets = averageValues(sourceValues.support, currentState.metrics.support.openTickets);
                    currentState.metrics.support.source = Object.keys(sourceValues.support).join(' & ');
                } else if (webhook.targetMetric === 'Cash Flow') {
                    sourceValues.cashflow[webhook.name] = Number(val);
                    currentState.metrics.cashflow.available = averageValues(sourceValues.cashflow, currentState.metrics.cashflow.available);
                    currentState.metrics.cashflow.source = Object.keys(sourceValues.cashflow).join(' & ');
                }
            }
        }
    }
}

function toggleSimulator(source, active) {
    if (active) {
        if (!internalSimulators[source]) {
            internalSimulators[source] = setInterval(() => {
                let payload = {};
                if (source === 'hubspot') {
                    payload = {
                        deals: [
                            { dealname: 'Acme Corp', amount: 45000 + (Math.random() - 0.5) * 5000, dealstage: 'closedwon', closedate: new Date() },
                            { dealname: 'Global UI', amount: 12000 + (Math.random() - 0.5) * 2000, dealstage: 'closedwon', closedate: new Date() }
                        ]
                    };
                } else if (source === 'salesforce') {
                    payload = {
                        sobject: {
                            Opportunity: [
                                { Amount: 50000 + (Math.random() - 0.5) * 8000, StageName: 'Closed Won' }
                            ]
                        }
                    };
                } else if (source === 'sap') {
                    payload = {
                        materialDocument: {
                            items: [
                                { material: 'A1', quantity: 1500 + Math.floor((Math.random() - 0.5) * 200) },
                                { material: 'B2', quantity: 3000 + Math.floor((Math.random() - 0.5) * 400) }
                            ]
                        }
                    };
                } else if (source === 'quickbooks') {
                    payload = {
                        eventNotifications: [{
                            dataChangeEvent: {
                                entities: [
                                    { name: 'Invoice', amount: 30000 + Math.random() * 5000 },
                                    { name: 'Bill', amount: 20000 + Math.random() * 2000 }
                                ]
                            }
                        }]
                    };
                }
                processWebhookPayload(source, payload);
            }, 3000);
        }
    } else {
        if (internalSimulators[source]) {
            clearInterval(internalSimulators[source]);
            delete internalSimulators[source];
            
            // Cleanup sourceValues
            const sourceName = source === 'hubspot' ? 'HubSpot' : source === 'salesforce' ? 'Salesforce' : source === 'sap' ? 'SAP' : source === 'quickbooks' ? 'QuickBooks' : source;
            if (source === 'hubspot' || source === 'salesforce') {
                delete sourceValues.sales[sourceName];
                currentState.metrics.sales.source = Object.keys(sourceValues.sales).length ? Object.keys(sourceValues.sales).join(' & ') : undefined;
            }
            if (source === 'sap') {
                delete sourceValues.inventory[sourceName];
                currentState.metrics.inventory.source = Object.keys(sourceValues.inventory).length ? Object.keys(sourceValues.inventory).join(' & ') : undefined;
            }
            if (source === 'quickbooks') {
                delete sourceValues.cashflow[sourceName];
                currentState.metrics.cashflow.source = Object.keys(sourceValues.cashflow).length ? Object.keys(sourceValues.cashflow).join(' & ') : undefined;
            }
        }
    }
}

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

    const scores = scoringEngine.computeAllScores(metrics, metricsGen.history, businessProfile);
    
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

let dashboardInterval;
function startDashboardInterval(ms) {
    if (dashboardInterval) clearInterval(dashboardInterval);
    dashboardInterval = setInterval(updateDashboard, ms);
}
startDashboardInterval(3000);

// Socket.io connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('dashboard:update', currentState);

    socket.on('setUpdateFreq', (seconds) => {
        const ms = parseInt(seconds) * 1000;
        if (ms >= 1000 && ms <= 60000) {
            startDashboardInterval(ms);
        }
    });

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

// Webhook Endpoints
app.post('/api/webhooks/register', (req, res) => {
    const { name, targetMetric, fieldPath } = req.body;
    const sourceId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const secret = crypto.randomBytes(32).toString('hex');
    const newWebhook = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        sourceId,
        targetMetric,
        fieldPath,
        secret,
        url: `${req.protocol}://${req.get('host')}/api/webhooks/ingest/${sourceId}`,
        createdAt: Date.now(),
        lastEvents: []
    };
    registeredWebhooks.push(newWebhook);
    res.json(newWebhook);
});

app.get('/api/webhooks/list', (req, res) => {
    res.json(registeredWebhooks);
});

app.delete('/api/webhooks/:id', (req, res) => {
    registeredWebhooks = registeredWebhooks.filter(w => w.id !== req.params.id);
    res.json({ success: true });
});

app.post('/api/settings/profile', (req, res) => {
    businessProfile = req.body;
    res.json({ success: true, profile: businessProfile });
});

app.post('/api/settings/complete', (req, res) => {
    // Flag to mark onboarding completion. Currently just responds with success.
    res.json({ success: true });
});

app.post('/api/webhooks/ingest/:source', (req, res) => {
    const { source } = req.params;
    
    const isStandardDemo = ['hubspot', 'salesforce', 'sap', 'quickbooks'].includes(source);

    if (!isStandardDemo) {
        const webhook = registeredWebhooks.find(w => w.sourceId === source);
        if (!webhook) return res.status(404).json({ error: 'Webhook source not found' });

        const signature = req.headers['x-webhook-signature'];
        if (signature) {
            const hmac = crypto.createHmac('sha256', webhook.secret);
            const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
            if (signature !== digest) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }
        webhook.lastEvents.unshift({
            timestamp: Date.now(),
            size: JSON.stringify(req.body).length,
            status: 'success'
        });
        webhook.lastEvents = webhook.lastEvents.slice(0, 10);
    }

    processWebhookPayload(source, req.body);
    // Send immediate dashboard update on push
    io.emit('dashboard:update', currentState);
    res.json({ success: true, message: 'Payload integrated' });
});

app.post('/api/webhooks/test/:connectorId', (req, res) => {
    const { connectorId } = req.params;
    let payload = {};
    let metricType = '';
    let extractedValue = '';

    if (connectorId === 'hubspot') {
        payload = { deals: [{ dealname: 'Test Deal', amount: 24500, dealstage: 'closedwon', closedate: new Date() }] };
        metricType = 'Sales Revenue';
        extractedValue = '$24,500 from 1 closed deal';
    } else if (connectorId === 'salesforce') {
        payload = { sobject: { Opportunity: [{ Amount: 32000, StageName: 'Closed Won' }] } };
        metricType = 'Sales Revenue';
        extractedValue = '$32,000 from Opportunity';
    } else if (connectorId === 'sap') {
        payload = { materialDocument: { items: [{ material: 'TEST-SKU', quantity: 847 }] } };
        metricType = 'Inventory Level';
        extractedValue = '847 units across 1 SKU';
    } else if (connectorId === 'quickbooks') {
         payload = { eventNotifications: [{ dataChangeEvent: { entities: [{ name: 'Invoice', amount: 15000 }] } }] };
         metricType = 'Cash Flow';
         extractedValue = '$15,000 via Invoice';
    } else {
        return res.status(404).json({ error: 'Unknown connector' });
    }

    processWebhookPayload(connectorId, payload);
    io.emit('dashboard:update', currentState);

    res.json({ success: true, metric: metricType, message: `${metricType} updated → ${extractedValue}` });
});

app.post('/api/webhooks/simulate/:source', (req, res) => {
    const { source } = req.params;
    const { active } = req.body;
    toggleSimulator(source, active);
    res.json({ success: true, active });
});

app.get('/api/webhooks/simulators', (req, res) => {
    res.json({
        hubspot: !!internalSimulators['hubspot'],
        salesforce: !!internalSimulators['salesforce'],
        sap: !!internalSimulators['sap'],
        quickbooks: !!internalSimulators['quickbooks']
    });
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
