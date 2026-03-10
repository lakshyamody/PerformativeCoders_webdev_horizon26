import React, { useState } from 'react';
import { LayoutGrid, AlertCircle, ShoppingCart, DollarSign, LifeBuoy, Package as PkgIcon, Slack } from 'lucide-react';

export default function Integrations() {
  const [integrations, setIntegrations] = useState([
    { id: 'shopify', name: 'Shopify', description: 'Real-time sales and revenue tracking', icon: ShoppingCart, connected: true, group: 'sales' },
    { id: 'quickbooks', name: 'QuickBooks', description: 'Cash flow and expense synchronization', icon: DollarSign, connected: true, group: 'finance' },
    { id: 'zendesk', name: 'Zendesk', description: 'Support ticket resolution rates', icon: LifeBuoy, connected: true, group: 'support' },
    { id: 'inventory', name: 'ERP Inventory', description: 'Stock levels and reorder dynamics', icon: PkgIcon, connected: true, group: 'operations' },
    { id: 'slack', name: 'Slack', description: 'War Room channel notifications', icon: Slack, connected: false, group: 'communication' },
    { id: 'custom', name: 'Custom ERP', description: 'Legacy system data ingestion', icon: LayoutGrid, connected: false, group: 'operations' },
  ]);

  const [toastMessage, setToastMessage] = useState(null);

  const toggleIntegration = (id) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const isNowConnected = !integration.connected;
        showToast(`${integration.name} ${isNowConnected ? 'connected successfully.' : 'disconnected.'}`);
        return { ...integration, connected: isNowConnected };
      }
      return integration;
    }));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto relative h-full">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-10 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">Data Integrations</h2>
        <p className="text-gray-400 max-w-2xl">
          Connect your organization's tools to power the OpsPulse engine. The more data sources connected, the more accurate your Business Stress Score will be.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className={`flex flex-col h-full bg-[#1a2236]/80 backdrop-blur-md border rounded-xl p-6 transition-all duration-300 ${
              integration.connected ? 'border-[#6366f1]/30 shadow-lg shadow-[#6366f1]/5' : 'border-white/5 opacity-80'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl flex items-center justify-center ${
                  integration.connected 
                    ? 'bg-gradient-to-br from-[#6366f1]/20 to-purple-500/20 text-[#6366f1] shadow-inner' 
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                <integration.icon size={26} strokeWidth={1.5} />
              </div>

              {/* Toggle Switch */}
              <button 
                onClick={() => toggleIntegration(integration.id)}
                className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ring-2 ring-transparent ring-offset-2 ring-offset-[#1a2236] ${
                  integration.connected ? 'bg-[#6366f1]' : 'bg-white/10'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  integration.connected ? 'translate-x-[26px]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                {integration.name}
                {integration.connected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Connected and syncing"></span>
                )}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {integration.description}
              </p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-gray-500">
              <span>{integration.group}</span>
              <span className={integration.connected ? 'text-emerald-400' : ''}>
                {integration.connected ? 'Syncing...' : 'Idle'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warning if critical integrations are disabled */}
      {!integrations.find(i => i.id === 'shopify' && i.connected) && (
        <div className="mt-10 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4 text-amber-200/90 relative z-10 animate-pulse">
          <AlertCircle className="shrink-0 text-amber-500" size={20} />
          <div>
            <h4 className="font-semibold text-amber-500 text-sm mb-1">Critical Data Source Disconnected</h4>
            <p className="text-sm">Sales integration is currently disconnected. Revenue forecasting and the Business Stress Score accuracy will be severely degraded.</p>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#111827] border border-[#6366f1]/30 shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] text-white px-5 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse"></div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
