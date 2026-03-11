# OpsPulse — AI-Powered Business Operations Command Center 🚀

OpsPulse aggregates operational data from sales, inventory, customer support, and finance into a real-time intelligence platform for SMBs. Instead of a passive dashboard, it acts as an **AI-powered command center** that predicts, alerts, and acts.

![OpsPulse](https://img.shields.io/badge/OpsPulse-AI%20Command%20Center-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)

## ✨ Key Features

### 📊 Real-Time Dashboard
- **Business Stress Score (BSS)** — Animated radial gauge with green/yellow/red zones
- **4 Vertical Cards** — Sales, Inventory, Support, Cash Flow with live sparklines
- **Alert Feed** — Real-time scrolling alerts for crises, warnings, and opportunities
- **Live WebSocket updates** every 3 seconds

### 🚨 War Room Mode
- Auto-triggers when BSS exceeds critical threshold (>70)
- Pulsing red border overlay with crisis banner
- Visual urgency through animations and color shifts

### 🤖 AI Assistant
**OpsPulse AI Assistant** is a text-based chatbot that lets you query your live business data in plain English, asking anything from "Why is my stress score high?" to "What's my cash flow trend?" and getting instant, context-aware answers. What makes it more than a chatbot is its ability to act as an **autonomous agent** — when a metric crosses a critical threshold, it doesn't just alert you, it reasons about the cause and fires corrective actions back through your connected integrations automatically. This means a sudden inventory drop triggers a restock order through SAP, a cash flow crisis flags overdue invoices in QuickBooks, and a support ticket surge escalates cases through your helpdesk — all without any human input, the moment the problem is detected.

### 🧠 Grand Strategy Engine
- **Grand Strategy Score (GSS)** — Weighted composite of momentum, sentiment, policy
- **Market Signals** — Simulated external intelligence feeds
- **24-Hour Forecasts** — Revenue, inventory, ticket, and cash predictions
- **AI Recommendations** — Prioritized action items with expected impact

### 🔴 Crisis Simulation Mode

OpsPulse includes a realistic crisis engine to demonstrate system resilience and AI-powered recovery.

- **Automated Trigger:** A full-scale crisis is **automatically scheduled** to occur 2 minutes after onboarding is completed, testing the user's readiness.
- **Manual Control:** Simulation can be toggled via the dashboard or through the `POST /api/simulation/toggle` endpoint.
- **Operational Impact:**
    - **Revenue Crash:** Sales revenue and conversion rates drop rapidly.
    - **Inventory Crisis:** Stock levels plummet while demand velocity spikes.
    - **Support Flood:** A surge of high-severity tickets overwhelms the support queue.
    - **Cash Burn:** Available cash reserves deplete as operational expenses rise.
- **Dynamic War Room:** When the **Business Stress Score (BSS)** exceeds 70, the interface shifts into **War Room Mode** with pulsing red alerts and high-urgency notifications.
- **AI-Powered Recovery:** Users can interact with the **Voice AI Assistant** to initiate "Emergency Recovery Protocols," deploying autonomous agents to stabilize the business.

## 🏗️ Architecture

```
Frontend (React + Vite)           Backend (Node.js + Express)
├── Dashboard UI                  ├── REST API
├── BSS Gauge (SVG)               ├── WebSocket Server (Socket.io)
├── Metric Cards + Charts         ├── Mock Data Generator
├── Alert Feed                    ├── BSS Scoring Engine
├── Voice Assistant               ├── Alert Engine
├── War Room Overlay              ├── Strategy Engine
├── Strategy Panel                ├── AI Assistant (NLP)
└── Strategy Panel                └── Webhook Simulation Engine
```

## 🔌 Integration & Webhooks (Mocked)

OpsPulse features a robust webhook ingestion engine capable of processing payloads from enterprise platforms like HubSpot, Salesforce, SAP, and QuickBooks.

> [!IMPORTANT]  
> **Note on Mock Integration:** For the purpose of this demonstration and to comply with legal/privacy requirements (as real-world enterprise integrations often require registered business entities and official API partnerships), this project uses **Mock Webhook Simulators** to display live data features.

### How it Works:
- **Simulators:** The backend includes built-in simulators that generate realistic JSON payloads for Sales (CRM), Inventory (ERP), and Cash Flow (Accounting).
- **Ingestion Engine:** These simulated payloads pass through the same `processWebhookPayload` logic that real production webhooks would use, triggering real-time updates in the **Business Stress Score (BSS)** and activating the **War Room**.
- **Demonstration:** This allows the platform to be fully functional and "live" immediately upon startup without requiring external API keys or business registrations, making it safe for open-source distribution on GitHub.

To toggle simulators, navigate to the **Integrations** page in the dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/lakshyamody/PerformativeCoders_webdev_horizon26.git
cd PerformativeCoders_webdev_horizon26

# Start the backend
cd backend
npm install
node server.js

# In a new terminal, start the frontend
cd frontend
npm install
npm run dev
```

### Access
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/state` | Current BSS, metrics, active alerts |
| GET | `/api/metrics/history` | Time-series data for charts |
| POST | `/api/assistant/query` | Voice/text query → AI response + actions |
| POST | `/api/assistant/action` | Execute action (restock, escalate, etc.) |
| GET | `/api/strategy/score` | Grand Strategy Score + breakdown |
| GET | `/api/strategy/forecast` | 24h predictions for all verticals |
| GET | `/api/alerts/active` | Active crisis/opportunity/anomaly alerts |
| POST | `/api/simulation/toggle` | Toggle crisis simulation mode |
| WS | `dashboard:update` | Real-time push every 3s |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| State | Zustand |
| Animations | Framer Motion |
| Real-Time | Socket.io |
| Voice | Web Speech API + Web TTS |
| Backend | Node.js + Express |
| WebSockets | Socket.io |



## 👥 Team

**PerformativeCoders** — Horizon26 Hackathon

---

*Built with ⚡ by PerformativeCoders*
