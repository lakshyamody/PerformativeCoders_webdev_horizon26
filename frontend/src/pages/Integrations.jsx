import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Cloud, Package, DollarSign, LifeBuoy, Webhook, X, Copy, Check, Plus, Loader2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

const standardConnectors = [
  { id: 'hubspot', name: 'HubSpot (Demo)', group: 'CRM', metric: 'Sales Revenue', description: 'Simulated sales pipeline feed.', icon: PieChart },
  { id: 'salesforce', name: 'Salesforce (Demo)', group: 'CRM', metric: 'Sales Revenue', description: 'Simulated opportunity data.', icon: Cloud },
  { id: 'sap', name: 'SAP (Demo)', group: 'ERP', metric: 'Inventory Level', description: 'Simulated warehouse inventory receipts.', icon: Package },
  { id: 'quickbooks', name: 'QuickBooks (Demo)', group: 'ERP', metric: 'Cash Flow', description: 'Simulated accounting cash flow.', icon: DollarSign },
  { id: 'zendesk', name: 'Zendesk (Placeholder)', group: 'Support', metric: 'Support Tickets', description: 'Ticket volume connector.', icon: LifeBuoy, disabled: true }
];

export default function Integrations() {
  const [simulators, setSimulators] = useState({});
  const [customWebhooks, setCustomWebhooks] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [activeTab, setActiveTab] = useState('setup');
  
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormState, setCustomFormState] = useState({ name: '', targetMetric: 'Sales Revenue', fieldPath: '' });
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const simRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/simulators`);
      if (simRes.ok) setSimulators(await simRes.json());

      const webRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/list`);
      if (webRes.ok) setCustomWebhooks(await webRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConnection = async (integration) => {
    const isCustom = integration.group === 'Custom';
    if (isCustom) return; // Custom handled differently (delete)

    const isConnected = simulators[integration.id];
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/simulate/${integration.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isConnected })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customFormState)
      });
      await fetchData();
      setShowCustomForm(false);
      setCustomFormState({ name: '', targetMetric: 'Sales Revenue', fieldPath: '' });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDeleteCustom = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/${id}`, { method: 'DELETE' });
      fetchData();
      if (selectedIntegration && selectedIntegration.id === id) {
        setSelectedIntegration(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const testConnection = async (integration) => {
    if (!integration.url) return;
    setLoading(true);
    try {
      // Send a dummy payload
      const dummyPayload = { data: { dummy: 100 } };
      // Inject dummy into the registered path so it succeeds
      if (integration.fieldPath) {
        const parts = integration.fieldPath.split('.');
        let current = dummyPayload;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = 50000;
      }
      
      await fetch(integration.url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dummyPayload)
      });
      setTimeout(fetchData, 500); // refresh history
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allConnectors = [
    ...standardConnectors,
    ...customWebhooks.map(cw => ({
      ...cw,
      group: 'Custom',
      description: `Extracts data to ${cw.targetMetric}`,
      icon: Webhook
    }))
  ];

  return (
    <div className="w-full h-full flex gap-6 animate-in fade-in duration-500 relative">
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Integrations & Webhooks</h2>
            <p className="text-gray-400 max-w-xl text-sm">
              Connect external data sources directly into the OpsPulse scoring engine in real-time.
            </p>
          </div>
          <button 
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 rounded-lg text-white font-medium text-sm transition-colors shadow-lg"
          >
            <Plus size={16} /> Add Custom Webhook
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6 relative z-10">
          {allConnectors.map(c => {
            const isConnected = c.group === 'Custom' ? true : simulators[c.id];
            
            return (
              <div 
                key={c.id || c.name}
                className={`flex flex-col h-full bg-[#1a2236] border rounded-xl p-5 transition-all duration-300 ${
                  isConnected ? 'border-[#6366f1]/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5 opacity-80'
                } ${c.disabled ? 'grayscale opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${
                      isConnected ? 'bg-[#6366f1]/20 text-[#6366f1]' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    <c.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {c.group !== 'Custom' && !c.disabled && (
                      <button 
                        onClick={() => toggleConnection(c)}
                        className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                          isConnected ? 'bg-[#6366f1]' : 'bg-white/10'
                        }`}
                      >
                        <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform mt-[3px] ${
                          isConnected ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    {c.name}
                    {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </h3>
                  <p className="text-xs text-gray-400 mb-5 line-clamp-2 min-h-[32px]">
                    {c.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">{c.group}</span>
                  {!c.disabled && (
                    <button 
                      onClick={() => { setSelectedIntegration(c); setActiveTab('setup'); }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Configuration Drawer */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-96 shrink-0 bg-[#1a2236] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden absolute right-0 top-0 z-50"
          >
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <selectedIntegration.icon size={20} />
                </div>
                <h3 className="font-bold text-lg text-white">{selectedIntegration.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedIntegration(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex text-sm font-medium border-b border-white/5">
              {['setup', 'mapping', 'history'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-center capitalize transition-colors ${activeTab === tab ? 'text-[#6366f1] border-b-2 border-[#6366f1]' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {activeTab === 'setup' && (
                <div className="space-y-6">
                  {selectedIntegration.group === 'Custom' ? (
                    <>
                      <div>
                        <label className="text-xs font-mono text-gray-500 block mb-2">Ingestion URL</label>
                        <div className="flex gap-2">
                          <input readOnly value={selectedIntegration.url} className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                          <button onClick={() => handleCopy(selectedIntegration.url)} className="p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-mono text-gray-500 block mb-2">Verification Secret</label>
                        <div className="flex gap-2">
                          <input readOnly value={selectedIntegration.secret} className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white" type="password" />
                          <button onClick={() => handleCopy(selectedIntegration.secret)} className="p-2 bg-white/5 rounded hover:bg-white/10 text-gray-300">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => testConnection(selectedIntegration)}
                        className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-colors flex justify-center items-center h-10"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Test Connection'}
                      </button>

                      <div className="pt-6 mt-6 border-t border-red-500/20">
                        <button 
                          onClick={() => handleDeleteCustom(selectedIntegration.id)}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete Webhook
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">
                      <p className="mb-4">This is a simulated demo connector. When activated, OpsPulse automatically generates realistic payloads internally.</p>
                      <p>In a production environment, this page would display OAuth configuration or dedicated API keys for {selectedIntegration.name}.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mapping' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 mb-2">
                    <div>OpsPulse Metric</div>
                    <div>Payload Field Path</div>
                  </div>
                  
                  <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm items-center">
                      <div className="text-white font-medium">{selectedIntegration.targetMetric || selectedIntegration.metric}</div>
                      <div className="text-indigo-400 font-mono text-xs break-all">
                        {selectedIntegration.fieldPath || (selectedIntegration.id === 'hubspot' ? 'deals[].amount' : selectedIntegration.id === 'sap' ? 'materialDocument.items[].quantity' : 'auto-mapped')}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">For demo purposes, the JSON paths are read-only.</p>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {selectedIntegration.lastEvents && selectedIntegration.lastEvents.length > 0 ? (
                    selectedIntegration.lastEvents.map((ev, i) => (
                      <div key={i} className="bg-black/20 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-xs text-white font-medium">Event Received</p>
                          <p className="text-[10px] text-gray-500">{new Date(ev.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{ev.status}</span>
                          <p className="text-[10px] text-gray-500">{ev.size} bytes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-10">
                      No webhook history available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Custom Webhook Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a2236] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Create Custom Webhook</h3>
              <button onClick={() => setShowCustomForm(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Webhook Name</label>
                <input 
                  required
                  value={customFormState.name}
                  onChange={e => setCustomFormState({...customFormState, name: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" 
                  placeholder="e.g. Internal Legacy ERP" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Target OpsPulse Metric</label>
                <select 
                  value={customFormState.targetMetric}
                  onChange={e => setCustomFormState({...customFormState, targetMetric: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm appearance-none"
                >
                  <option>Sales Revenue</option>
                  <option>Inventory Level</option>
                  <option>Support Tickets</option>
                  <option>Cash Flow</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">JSON Field Path</label>
                <input 
                  required
                  value={customFormState.fieldPath}
                  onChange={e => setCustomFormState({...customFormState, fieldPath: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  placeholder="e.g. payload.data.total_amount" 
                />
                <p className="text-[10px] text-gray-500 mt-1">Specify where in the incoming JSON payload we can extract the value.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCustomForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 rounded-lg text-white font-medium text-sm transition-colors flex items-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Generate Webhook URL
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
