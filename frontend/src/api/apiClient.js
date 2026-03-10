const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function fetchWithHandling(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export const apiClient = {
    // Dashboard & Simulation
    getDashboard: () => fetchWithHandling('/api/dashboard/state'),
    toggleSimulation: () => fetchWithHandling('/api/simulation/toggle', { method: 'POST' }),

    // AI Assistant
    postQuery: (query) => fetchWithHandling('/api/assistant/query', {
        method: 'POST',
        body: JSON.stringify({ query })
    }),
    postAction: (action) => fetchWithHandling('/api/assistant/action', {
        method: 'POST',
        body: JSON.stringify({ action })
    }),

    // Strategy Engine
    getStrategy: () => fetchWithHandling('/api/strategy/score'),
    getForecast: () => fetchWithHandling('/api/strategy/forecast'),

    // Alerts & Metrics
    getAlerts: () => fetchWithHandling('/api/alerts/active'),
    getMetricsHistory: (range) => fetchWithHandling(`/api/metrics/history?range=${range}`),

    // Users
    getUsers: () => fetchWithHandling('/api/users'),
    inviteUser: (data) => fetchWithHandling('/api/users/invite', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteUser: (id) => fetchWithHandling(`/api/users/${id}`, {
        method: 'DELETE'
    })
};
