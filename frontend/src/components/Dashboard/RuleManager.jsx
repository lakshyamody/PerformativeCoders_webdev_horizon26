import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Download, Plus, X, Trash2, Check, AlertTriangle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { apiClient } from '../../api/apiClient';

export default function RuleManager() {
    const {
        isLoaded,
        activeFilters,
        setActiveFilters,
        customRules,
        setCustomRules,
        scores,
        metrics,
        alerts,
        strategy
    } = useDashboardStore();

    const [filterOpen, setFilterOpen] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    // Filter local state
    const [localFilters, setLocalFilters] = useState(activeFilters);

    // Rule modal state
    const [ruleForm, setRuleForm] = useState({
        name: '',
        metric: 'BSS Score',
        operator: 'rises above',
        value: 75,
        severity: 'Warning'
    });

    useEffect(() => {
        if (isLoaded) {
            fetchRules();
        }
    }, [isLoaded]);

    const fetchRules = async () => {
        try {
            const data = await apiClient.getRules();
            setCustomRules(data);
        } catch (e) {
            console.error('Failed to fetch rules', e);
        }
    };

    // FILTER LOGIC
    const handleFilterChange = (type, val) => {
        setLocalFilters(prev => {
            const current = [...prev[type]];
            if (current.includes(val)) {
                return { ...prev, [type]: current.filter(x => x !== val) };
            } else {
                return { ...prev, [type]: [...current, val] };
            }
        });
    };

    const applyFilters = () => {
        setActiveFilters(localFilters);
        setFilterOpen(false);
    };

    const activeFilterCount = activeFilters.severity.length + activeFilters.vertical.length;

    // EXPORT LOGIC
    const handleExport = (format) => {
        setExportOpen(false);
        const data = {
            timestamp: new Date().toISOString(),
            scores,
            metrics,
            strategy,
            alerts
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            triggerDownload(blob, `opspulse-export-${new Date().toISOString().slice(0, 10)}.json`);
        } else if (format === 'csv') {
            let csv = `TIMESTAMP,TYPE,TITLE,MESSAGE\n`;
            alerts.forEach(a => {
                csv += `"${new Date(a.timestamp).toISOString()}","${a.type}","${a.title}","${a.message.replace(/"/g, '""')}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            triggerDownload(blob, `opspulse-export-${new Date().toISOString().slice(0, 10)}.csv`);
        }
    };

    const triggerDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // RULE LOGIC
    const saveRule = async (e) => {
        e.preventDefault();
        try {
            const newRule = await apiClient.createRule(ruleForm);
            setCustomRules([...customRules, newRule]);
            setRuleForm({ name: '', metric: 'BSS Score', operator: 'rises above', value: 75, severity: 'Warning' });
            setRulesOpen(false);
        } catch (err) {
            console.error('Failed to create rule', err);
        }
    };

    const deleteRule = async (id) => {
        try {
            await apiClient.deleteRule(id);
            setCustomRules(customRules.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete rule', err);
        }
    };

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex flex-wrap items-center gap-3">
                {/* FILTER BUTTON */}
                <button
                    disabled={!isLoaded}
                    onClick={() => { setFilterOpen(!filterOpen); setExportOpen(false); setRulesOpen(false); }}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                        filterOpen || activeFilterCount > 0
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            : 'bg-[#1a2236] border-white/10 text-gray-300 hover:bg-white/5'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!isLoaded ? 'No data yet' : 'Filter Alerts'}
                >
                    <Filter size={16} />
                    Filter
                    {activeFilterCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[10px]">{activeFilterCount}</span>}
                </button>

                {/* EXPORT BUTTON */}
                <div className="relative">
                    <button
                        disabled={!isLoaded}
                        onClick={() => { setExportOpen(!exportOpen); setFilterOpen(false); setRulesOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1a2236] border border-white/10 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isLoaded ? 'No data yet' : 'Export Data'}
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <AnimatePresence>
                        {exportOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-48 bg-[#1a2236] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5">
                                    Export as CSV
                                </button>
                                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    Export as JSON
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CREATE RULE BUTTON */}
                <button
                    disabled={!isLoaded}
                    onClick={() => { setRulesOpen(true); setFilterOpen(false); setExportOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#6366f1] text-white hover:bg-indigo-600 transition-colors shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    title={!isLoaded ? 'No data yet' : 'Create Custom Rule'}
                >
                    <Plus size={16} />
                    Create Rule
                </button>
            </div>

            {/* EXPANDABLE FILTER PANEL */}
            <AnimatePresence>
                {filterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#1a2236] border border-white/10 rounded-xl p-6 mt-2 shadow-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-3">Severity</h4>
                                    <div className="space-y-2">
                                        {['crisis', 'warning', 'opportunity', 'info'].map(sev => (
                                            <label key={sev} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.severity.includes(sev)}
                                                    onChange={() => handleFilterChange('severity', sev)}
                                                    className="rounded border-gray-600 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span className="capitalize">{sev}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-3">Vertical</h4>
                                    <div className="space-y-2">
                                        {['BSS Engine', 'Inventory Monitor', 'Sales Tracker', 'Support Monitor', 'Finance Monitor', 'Custom Rule'].map(v => (
                                            <label key={v} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.vertical.includes(v)}
                                                    onChange={() => handleFilterChange('vertical', v)}
                                                    className="rounded border-gray-600 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span>{v}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
                                <button
                                    onClick={() => setLocalFilters({ severity: [], vertical: [], timeRange: 'All Time' })}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RULES TABLE (If any exist) */}
            {customRules.length > 0 && (
                <div className="bg-[#1a2236] border border-white/5 rounded-xl overflow-hidden mt-2">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1a2236]/80 text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">Rule Name</th>
                                <th className="px-4 py-3 font-medium">Condition</th>
                                <th className="px-4 py-3 font-medium">Severity</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {customRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-white/[0.02] text-gray-300">
                                    <td className="px-4 py-3 font-medium text-white">{rule.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-indigo-300 bg-indigo-500/10 rounded px-2 inline-block mt-2 mb-2 ml-4">
                                        {rule.metric} {rule.operator} {rule.value}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                                            rule.severity === 'Crisis' ? 'bg-red-500/20 text-red-400' :
                                            rule.severity === 'Warning' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {rule.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => deleteRule(rule.id)} className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-400/10 rounded transition-colors" title="Delete Rule">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE RULE MODAL */}
            <AnimatePresence>
                {rulesOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-[#1a2236] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl relative"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        >
                            <button onClick={() => setRulesOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <AlertTriangle className="text-indigo-400" size={20} />
                                Create Automation Rule
                            </h3>

                            <form onSubmit={saveRule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Rule Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Stop campaigns if inventory dies"
                                        value={ruleForm.name}
                                        onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Condition</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={ruleForm.metric}
                                            onChange={e => setRuleForm({ ...ruleForm, metric: e.target.value })}
                                            className="w-1/3 bg-black/30 border border-white/10 rounded-lg py-2 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option>Sales Revenue</option>
                                            <option>Inventory Level</option>
                                            <option>Support Tickets</option>
                                            <option>Cash Flow</option>
                                            <option>BSS Score</option>
                                        </select>
                                        <select
                                            value={ruleForm.operator}
                                            onChange={e => setRuleForm({ ...ruleForm, operator: e.target.value })}
                                            className="w-1/3 bg-black/30 border border-white/10 rounded-lg py-2 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option>drops below</option>
                                            <option>rises above</option>
                                            <option>changes by</option>
                                        </select>
                                        <input
                                            type="number"
                                            required
                                            value={ruleForm.value}
                                            onChange={e => setRuleForm({ ...ruleForm, value: e.target.value })}
                                            className="w-1/3 bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
                                    <select
                                        value={ruleForm.severity}
                                        onChange={e => setRuleForm({ ...ruleForm, severity: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Crisis">Crisis (Red)</option>
                                        <option value="Warning">Warning (Yellow)</option>
                                        <option value="Opportunity">Opportunity (Green)</option>
                                        <option value="Info">Info (Blue)</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-black/50 text-indigo-500 focus:ring-indigo-500" />
                                        <span>Show in Alert Feed</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-not-allowed">
                                        <input type="checkbox" disabled className="rounded border-gray-700 bg-black/20" />
                                        <span className="flex items-center gap-2">Send Email / SMS <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] uppercase">Coming Soon</span></span>
                                    </label>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRulesOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                                    >
                                        <Check size={16} />
                                        Save Rule
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
