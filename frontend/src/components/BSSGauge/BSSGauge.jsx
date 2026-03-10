import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function BSSGauge({ score = 0, scores = {} }) {
    const radius = 90;
    const strokeWidth = 14;
    const circumference = Math.PI * radius;
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    const offset = circumference - (normalizedScore / 100) * circumference;

    const zone = normalizedScore > 70 ? 'critical' : normalizedScore > 40 ? 'warning' : 'healthy';
    const zoneLabel = normalizedScore > 70 ? 'CRITICAL' : normalizedScore > 40 ? 'ELEVATED' : 'HEALTHY';

    const gaugeColor = useMemo(() => {
        if (normalizedScore > 70) return '#ef4444';
        if (normalizedScore > 40) return '#f59e0b';
        return '#22c55e';
    }, [normalizedScore]);

    const glowColor = useMemo(() => {
        if (normalizedScore > 70) return 'rgba(239, 68, 68, 0.4)';
        if (normalizedScore > 40) return 'rgba(245, 158, 11, 0.3)';
        return 'rgba(34, 197, 94, 0.3)';
    }, [normalizedScore]);

    const riskItems = [
        { label: 'Sales', value: scores.sales || 0, icon: '📈' },
        { label: 'Inventory', value: scores.inventory || 0, icon: '📦' },
        { label: 'Support', value: scores.support || 0, icon: '🎫' },
        { label: 'Cash Flow', value: scores.cashflow || 0, icon: '💰' },
    ];

    const getRiskColor = (v) => v > 60 ? 'red' : v > 35 ? 'yellow' : 'green';

    return (
        <div className="card bss-gauge-container">
            <div className="card-header" style={{ width: '100%' }}>
                <div className="card-title">
                    <span className="card-title-icon">⚡</span>
                    Business Stress Score
                </div>
                <span className={`card-badge ${zone === 'critical' ? 'red' : zone === 'warning' ? 'yellow' : 'green'}`}>
                    LIVE
                </span>
            </div>

            <div className="bss-gauge-svg-wrap">
                <svg
                    viewBox="0 0 200 120"
                    style={{ width: '100%', height: '100%' }}
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>

                    {/* Background arc */}
                    <path
                        d="M 15 105 A 90 90 0 0 1 185 105"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.08)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Colored arc */}
                    <motion.path
                        d="M 15 105 A 90 90 0 0 1 185 105"
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        filter="url(#glow)"
                        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
                    />

                    {/* Zone markers */}
                    <text x="15" y="118" fill="#64748b" fontSize="8" fontFamily="Inter">0</text>
                    <text x="88" y="10" fill="#64748b" fontSize="8" fontFamily="Inter">50</text>
                    <text x="175" y="118" fill="#64748b" fontSize="8" fontFamily="Inter">100</text>
                </svg>

                <motion.div
                    className="bss-gauge-value"
                    style={{ color: gaugeColor }}
                    key={Math.round(normalizedScore)}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {Math.round(normalizedScore)}
                </motion.div>
            </div>

            <div className="bss-gauge-label">Business Stress Score</div>
            <div className={`bss-zone-label ${zone}`}>{zoneLabel}</div>

            <div className="risk-breakdown">
                {riskItems.map((item) => (
                    <div className="risk-item" key={item.label}>
                        <div className="risk-item-header">
                            <span className="risk-item-label">{item.icon} {item.label}</span>
                            <span
                                className="risk-item-value"
                                style={{ color: item.value > 60 ? '#ef4444' : item.value > 35 ? '#f59e0b' : '#22c55e' }}
                            >
                                {item.value.toFixed(0)}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <motion.div
                                className={`progress-fill ${getRiskColor(item.value)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(item.value, 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
