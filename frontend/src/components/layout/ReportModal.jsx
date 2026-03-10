import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { apiClient } from '../../api/apiClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportModal() {
    const { 
        reportModalOpen, setReportModalOpen,
        metrics, scores, alerts, strategy
    } = useDashboardStore();

    const [title, setTitle] = useState(`OpsPulse Business Report — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
    const [sections, setSections] = useState({
        execSummary: true,
        bss: true,
        verticals: true,
        alerts: true,
        strategy: true
    });
    const [period, setPeriod] = useState('Snapshot');
    const [format, setFormat] = useState('PDF');
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            let aiSummary = "No AI summary requested.";

            if (sections.execSummary) {
                const bss = scores?.bss || 0;
                const topAlerts = alerts?.slice(0, 3).map(a => a.message).join("; ") || "None";
                const prompt = `Write a short 3-4 sentence comprehensive executive summary of this business's current health.
Current BSS Score: ${Math.round(bss)} out of 100.
Sales: $${Math.round(metrics?.sales?.revenue || 0).toLocaleString()}, Inventory: ${metrics?.inventory?.totalUnits || 0} units, Support: ${metrics?.support?.openTickets || 0} tickets open, Cash Flow: $${Math.round(metrics?.cashflow?.available || 0).toLocaleString()}.
Top Alerts: ${topAlerts}.
Act as an expert business advisor summarizing the situation for the owner. Be professional but direct.`;
                
                try {
                    const aiRes = await apiClient.postQuery(prompt);
                    aiSummary = typeof aiRes.response === 'string' ? aiRes.response : (aiRes.response?.text || "AI summary generation failed.");
                } catch (e) {
                    console.error("AI Assistant error:", e);
                    aiSummary = "AI summary temporarily unavailable due to a network error.";
                }
            }

            if (format === 'PDF') {
                generatePDF(aiSummary);
            } else {
                generateCSV();
            }

            setReportModalOpen(false);
            showToast();
        } catch (error) {
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const generatePDF = (aiSummary) => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // Dark slate
        doc.text(title, 14, yPos);
        yPos += 8;

        // Timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Muted slate
        doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${period}`, 14, yPos);
        yPos += 15;

        // AI Summary
        if (sections.execSummary) {
            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241); // Indigo-500
            doc.text("Executive Summary", 14, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setTextColor(51, 65, 85);
            const splitSummary = doc.splitTextToSize(aiSummary, 180);
            doc.text(splitSummary, 14, yPos);
            yPos += (splitSummary.length * 6) + 10;
        }

        // BSS Section
        if (sections.bss && scores) {
            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241);
            doc.text("Business Stress Score (BSS)", 14, yPos);
            yPos += 8;
            
            const bss = Math.round(scores.bss || 0);
            let zone = bss > 70 ? "CRITICAL (Red)" : bss > 40 ? "WARNING (Yellow)" : "HEALTHY (Green)";
            
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text(`Current Score: ${bss} / 100 - ${zone}`, 14, yPos);
            yPos += 15;
        }

        // Verticals Table
        if (sections.verticals && metrics) {
            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241);
            doc.text("Metric Verticals", 14, yPos);
            yPos += 6;

            const tableData = [
                ["Sales", `$${Math.round(metrics.sales?.revenue || 0).toLocaleString()}`, "Stable"],
                ["Inventory", `${metrics.inventory?.totalUnits || 0} units`, metrics.inventory?.lowStockCount > 0 ? "Check Stock" : "Optimal"],
                ["Support", `${metrics.support?.openTickets || 0} tickets`, metrics.support?.openTickets > 30 ? "High Volume" : "Normal"],
                ["Cash Flow", `$${Math.round(metrics.cashflow?.available || 0).toLocaleString()}`, "Stable"]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Vertical', 'Current Value', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [99, 102, 241] },
                styles: { font: 'courier' }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Alerts
        if (sections.alerts && alerts && alerts.length > 0) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241);
            doc.text("Active Alerts", 14, yPos);
            yPos += 6;

            const alertData = alerts.map(a => [
                new Date(a.timestamp).toLocaleTimeString(),
                a.severity,
                a.vertical,
                a.message
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Time', 'Severity', 'Vertical', 'Description']],
                body: alertData,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] }, // Red for alerts
                styles: { font: 'courier' }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Strategy
        if (sections.strategy && strategy && strategy.recommendations) {
            if (yPos > 240) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setTextColor(99, 102, 241);
            doc.text("Grand Strategy Recommendations", 14, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            strategy.recommendations.forEach((rec, idx) => {
                const recText = `${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.action} - ${rec.detail} (Impact: ${rec.impact})`;
                const splitRec = doc.splitTextToSize(recText, 180);
                doc.text(splitRec, 14, yPos);
                yPos += (splitRec.length * 5) + 4;
            });
        }

        doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    };

    const generateCSV = () => {
        let csv = `Report Title,${title}\n`;
        csv += `Timestamp,${new Date().toISOString()}\n`;
        csv += `Period,${period}\n\n`;

        if (sections.bss && scores) {
            csv += `--- BSS Summary ---\n`;
            csv += `Business Stress Score,${Math.round(scores.bss || 0)}\n\n`;
        }

        if (sections.verticals && metrics) {
            csv += `--- Metric Verticals ---\n`;
            csv += `Vertical,Current Value,Status\n`;
            csv += `Sales,$${Math.round(metrics.sales?.revenue || 0)},Stable\n`;
            csv += `Inventory,${metrics.inventory?.totalUnits || 0},${metrics.inventory?.lowStockCount > 0 ? "Check Stock" : "Optimal"}\n`;
            csv += `Support,${metrics.support?.openTickets || 0},${metrics.support?.openTickets > 30 ? "High Volume" : "Normal"}\n`;
            csv += `Cash Flow,$${Math.round(metrics.cashflow?.available || 0)},Stable\n\n`;
        }

        if (sections.alerts && alerts) {
            csv += `--- Active Alerts ---\n`;
            csv += `Time,Severity,Vertical,Message\n`;
            alerts.forEach(a => {
                csv += `${new Date(a.timestamp).toLocaleTimeString()},${a.severity},${a.vertical},"${a.message.replace(/"/g, '""')}"\n`;
            });
            csv += `\n`;
        }

        if (sections.strategy && strategy && strategy.recommendations) {
            csv += `--- Grand Strategy Recommendations ---\n`;
            csv += `Priority,Action,Detail,Impact\n`;
            strategy.recommendations.forEach(rec => {
                csv += `${rec.priority},"${rec.action}","${rec.detail}","${rec.impact}"\n`;
            });
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const showToast = () => {
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    return (
        <>
            <AnimatePresence>
                {reportModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#1a2236] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FileText className="text-indigo-400" size={20} />
                                    Configure Report
                                </h2>
                                <button 
                                    onClick={() => setReportModalOpen(false)}
                                    className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Report Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Sections Multi-Select */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Sections to Include</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'execSummary', label: 'Executive Summary (AI)' },
                                            { id: 'bss', label: 'BSS Breakdown' },
                                            { id: 'verticals', label: 'Metric Verticals' },
                                            { id: 'alerts', label: 'Active Alerts' },
                                            { id: 'strategy', label: 'Strategy Forecast' }
                                        ].map(sec => (
                                            <label key={sec.id} className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={sections[sec.id]}
                                                    onChange={() => setSections({ ...sections, [sec.id]: !sections[sec.id] })}
                                                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500/50"
                                                />
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{sec.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Time Period */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Time Period</label>
                                        <select 
                                            value={period}
                                            onChange={(e) => setPeriod(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option>Snapshot</option>
                                            <option>Last 24 Hours</option>
                                            <option>Last 7 Days</option>
                                        </select>
                                    </div>

                                    {/* Format Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Format</label>
                                        <div className="flex bg-black/30 border border-white/10 rounded-lg p-1">
                                            <button 
                                                onClick={() => setFormat('PDF')}
                                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${format === 'PDF' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                PDF
                                            </button>
                                            <button 
                                                onClick={() => setFormat('CSV')}
                                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${format === 'CSV' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                                <button 
                                    onClick={() => setReportModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    <span>{generating ? 'Generating...' : 'Generate Report'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-4 py-3 bg-[#111827] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 rounded-xl"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">Report Downloaded</h4>
                            <p className="text-xs text-gray-400">{format} file generated successfully.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
