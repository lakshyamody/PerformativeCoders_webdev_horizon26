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

### 🤖 Voice AI Assistant
- **Speech Recognition** — Browser-native voice input (Web Speech API)
- **Text-to-Speech** — AI responses spoken aloud
- **Natural Language Queries** — "Why is my stress score high?", "Restock Product A"
- **Action Execution** — Restock, escalate tickets, launch campaigns directly from chat

### 🧠 Grand Strategy Engine
- **Grand Strategy Score (GSS)** — Weighted composite of momentum, sentiment, policy
- **Market Signals** — Simulated external intelligence feeds
- **24-Hour Forecasts** — Revenue, inventory, ticket, and cash predictions
- **AI Recommendations** — Prioritized action items with expected impact

### 🔴 Crisis Simulation Mode
- One-click toggle to simulate a full business crisis
- Revenue crash + inventory stockout + support flood + cash burn
- Watch the BSS spike and War Room activate in real time

## 🏗️ Architecture

```
Frontend (React + Vite)           Backend (Node.js + Express)
├── Dashboard UI                  ├── REST API
├── BSS Gauge (SVG)               ├── WebSocket Server (Socket.io)
├── Metric Cards + Charts         ├── Mock Data Generator
├── Alert Feed                    ├── BSS Scoring Engine
├── Voice Assistant               ├── Alert Engine
├── War Room Overlay              ├── Strategy Engine
└── Strategy Panel                └── AI Assistant (NLP)
```

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
