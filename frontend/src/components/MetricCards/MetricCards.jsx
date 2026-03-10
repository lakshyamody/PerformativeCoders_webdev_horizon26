import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

function SalesCard({ metrics, history }) {
    if (!metrics) return <CardSkeleton title="Sales" icon="📈" />;

    const { revenue, target, unitsSold, conversionRate, topProducts } = metrics.sales;
    const pct = (revenue / target) * 100;
    const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444';

    const chartData = history.slice(-20).map(h => ({
        time: h.time,
        value: h.revenue
    }));

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="card-header">
                <div className="card-title">
                    <span className="card-title-icon">📈</span>
                    Sales & Revenue
                </div>
                <span className={`card-badge ${pct >= 90 ? 'green' : pct >= 70 ? 'yellow' : 'red'}`}>
                    {pct.toFixed(0)}%
                </span>
            </div>

            <div className="metric-value" style={{ color }}>
                ${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="metric-label">of ${target.toLocaleString()} daily target</div>

            <div className="progress-bar" style={{ marginBottom: 12 }}>
                <motion.div
                    className={`progress-fill ${pct >= 90 ? 'green' : pct >= 70 ? 'yellow' : 'red'}`}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6 }}
                />
            </div>

            <div className="chart-container" style={{ height: 80 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
                        <Tooltip
                            contentStyle={{
                                background: '#1a1f35',
                                border: '1px solid rgba(148,163,184,0.12)',
                                borderRadius: 8,
                                fontSize: 11,
                                color: '#f1f5f9'
                            }}
                            formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Revenue']}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 8 }}>
                <div className="stat-row">
                    <span className="stat-label">Units Sold</span>
                    <span className="stat-value">{unitsSold}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Conversion Rate</span>
                    <span className="stat-value">{conversionRate.toFixed(1)}%</span>
                </div>
                {topProducts?.slice(0, 2).map((p, i) => (
                    <div className="ticker-item" key={i}>
                        <span className="ticker-rank">#{i + 1}</span>
                        <span className="ticker-name">{p.name}</span>
                        <span className="ticker-value">${p.revenue.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function InventoryCard({ metrics }) {
    if (!metrics) return <CardSkeleton title="Inventory" icon="📦" />;

    const { items, lowStockCount, totalUnits } = metrics.inventory;

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <div className="card-header">
                <div className="card-title">
                    <span className="card-title-icon">📦</span>
                    Inventory
                </div>
                <span className={`card-badge ${lowStockCount > 2 ? 'red' : lowStockCount > 0 ? 'yellow' : 'green'}`}>
                    {lowStockCount > 0 ? `${lowStockCount} LOW` : 'OK'}
                </span>
            </div>

            <div className="metric-value">
                {Math.round(totalUnits).toLocaleString()}
            </div>
            <div className="metric-label">Total units across {items.length} SKUs</div>

            <div style={{ marginTop: 12 }}>
                {items.map((item) => {
                    const pct = Math.min((item.stock / (item.reorderPoint * 3)) * 100, 100);
                    const isLow = item.stock < item.reorderPoint;
                    return (
                        <div className="stock-item-mini" key={item.id}>
                            <span className={`stock-item-name ${isLow ? 'text-red' : ''}`}>
                                {item.name}
                            </span>
                            <div className="stock-item-bar">
                                <motion.div
                                    className="stock-item-fill"
                                    style={{
                                        background: isLow
                                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                            : 'linear-gradient(90deg, #22c55e, #34d399)',
                                    }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <span className={`stock-item-count ${isLow ? 'text-red' : 'text-green'}`}>
                                {Math.round(item.stock)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function SupportCard({ metrics }) {
    if (!metrics) return <CardSkeleton title="Support" icon="🎫" />;

    const { openTickets, resolvedTickets, avgSeverity, resolutionRate, satisfaction } = metrics.support;
    const stars = Math.round(satisfaction);

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <div className="card-header">
                <div className="card-title">
                    <span className="card-title-icon">🎫</span>
                    Customer Support
                </div>
                <span className={`card-badge ${avgSeverity > 3.5 ? 'red' : avgSeverity > 2.5 ? 'yellow' : 'green'}`}>
                    SEV {avgSeverity.toFixed(1)}
                </span>
            </div>

            <div className="metric-value" style={{
                color: openTickets > 30 ? '#ef4444' : openTickets > 15 ? '#f59e0b' : '#22c55e'
            }}>
                {openTickets}
            </div>
            <div className="metric-label">Open tickets</div>

            <div style={{ marginTop: 12 }}>
                <div className="stat-row">
                    <span className="stat-label">Resolved Today</span>
                    <span className="stat-value text-green">{resolvedTickets}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Resolution Rate</span>
                    <span className="stat-value">{resolutionRate.toFixed(0)}%</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Avg Severity</span>
                    <span className="stat-value" style={{
                        color: avgSeverity > 3.5 ? '#ef4444' : avgSeverity > 2.5 ? '#f59e0b' : '#22c55e'
                    }}>
                        {avgSeverity.toFixed(1)}/5
                    </span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Satisfaction</span>
                    <div className="satisfaction-stars">
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`star ${s <= stars ? 'filled' : 'empty'}`}>★</span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CashFlowCard({ metrics, history }) {
    if (!metrics) return <CardSkeleton title="Cash Flow" icon="💰" />;

    const { available, monthlyExpenses, runway } = metrics.cashflow;
    const runwayMonths = available / Math.max(monthlyExpenses, 1);

    const chartData = history.slice(-20).map(h => ({
        time: h.time,
        value: h.cash
    }));

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        >
            <div className="card-header">
                <div className="card-title">
                    <span className="card-title-icon">💰</span>
                    Cash Flow
                </div>
                <span className={`card-badge ${runwayMonths < 2 ? 'red' : runwayMonths < 4 ? 'yellow' : 'green'}`}>
                    {runwayMonths.toFixed(1)}mo
                </span>
            </div>

            <div className="metric-value" style={{
                color: runwayMonths < 2 ? '#ef4444' : runwayMonths < 4 ? '#f59e0b' : '#22c55e'
            }}>
                ${available.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="metric-label">Available cash balance</div>

            <div className="chart-container" style={{ height: 80, marginTop: 8 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
                        <Tooltip
                            contentStyle={{
                                background: '#1a1f35',
                                border: '1px solid rgba(148,163,184,0.12)',
                                borderRadius: 8,
                                fontSize: 11,
                                color: '#f1f5f9'
                            }}
                            formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Cash']}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 8 }}>
                <div className="stat-row">
                    <span className="stat-label">Monthly Expenses</span>
                    <span className="stat-value">${monthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Runway</span>
                    <span className="stat-value" style={{
                        color: runwayMonths < 2 ? '#ef4444' : runwayMonths < 4 ? '#f59e0b' : '#22c55e'
                    }}>
                        {runwayMonths.toFixed(1)} months
                    </span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Daily Burn</span>
                    <span className="stat-value text-red">-${(monthlyExpenses / 30).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
            </div>
        </motion.div>
    );
}

function CardSkeleton({ title, icon }) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <span className="card-title-icon">{icon}</span>
                    {title}
                </div>
                <span className="card-badge blue">LOADING</span>
            </div>
            <div className="shimmer" style={{ height: 32, borderRadius: 6, marginBottom: 8 }} />
            <div className="shimmer" style={{ height: 14, borderRadius: 4, width: '60%', marginBottom: 16 }} />
            <div className="shimmer" style={{ height: 80, borderRadius: 8 }} />
        </div>
    );
}

export { SalesCard, InventoryCard, SupportCard, CashFlowCard };
