import { create } from 'zustand';

const useDashboardStore = create((set, get) => ({
    // Connection
    connected: false,
    setConnected: (connected) => set({ connected }),

    // Dashboard data
    metrics: null,
    scores: null,
    alerts: [],
    warRoomActive: false,
    simulationMode: false,
    strategy: null,
    timestamp: null,

    // UI state
    activeTab: 'dashboard',
    setActiveTab: (tab) => set({ activeTab: tab }),

    voicePanelOpen: false,
    setVoicePanelOpen: (open) => set({ voicePanelOpen: open }),
    toggleVoicePanel: () => set((s) => ({ voicePanelOpen: !s.voicePanelOpen })),

    // Voice messages
    voiceMessages: [
        {
            role: 'assistant',
            text: "Hello! I'm OpsPulse AI. Ask me anything about your business — \"Why is my stress score high?\", \"Restock Product A\", or \"Give me a morning brief.\"",
            actions: []
        }
    ],
    addVoiceMessage: (msg) => set((s) => ({
        voiceMessages: [...s.voiceMessages, msg]
    })),
    isTyping: false,
    setIsTyping: (t) => set({ isTyping: t }),

    // History for charts
    metricsHistory: [],
    addToHistory: (entry) => set((s) => ({
        metricsHistory: [...s.metricsHistory.slice(-60), entry]
    })),

    // Update all dashboard data
    updateDashboard: (data) => {
        const state = get();
        set({
            metrics: data.metrics,
            scores: data.scores,
            alerts: data.alerts || [],
            warRoomActive: data.warRoomActive || false,
            simulationMode: data.simulationMode || false,
            strategy: data.strategy || state.strategy,
            timestamp: data.timestamp || Date.now()
        });

        if (data.scores && data.metrics) {
            state.addToHistory({
                time: new Date().toLocaleTimeString(),
                bss: data.scores.bss,
                revenue: data.metrics.sales?.revenue,
                tickets: data.metrics.support?.openTickets,
                cash: data.metrics.cashflow?.available,
                inventory: data.metrics.inventory?.totalUnits
            });
        }
    }
}));

export default useDashboardStore;
