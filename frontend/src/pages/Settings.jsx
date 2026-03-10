import React, { useState } from 'react';
import { Settings2, Bell, Shield, SlidersHorizontal, Save, Check, RefreshCcw } from 'lucide-react';
import useDashboardStore from '../store/dashboardStore';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const { settings, updateSettings, setOnboardingComplete } = useDashboardStore();

  const [formState, setFormState] = useState({
    businessName: settings.businessName || 'Acme Corp',
    timezone: settings.timezone || 'UTC',
    currency: settings.currency || 'INR',
    emailAlerts: true,
    browserPush: false,
    digestFreq: 'daily',
    bssThreshold: 70,
    stockThreshold: 20,
    cashWarning: 3,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    // Update global store settings so the whole app reflects currency, etc.
    updateSettings(formState);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-4xl mx-auto h-full flex flex-col md:flex-row gap-8 relative z-10">
      
      {/* Settings Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6 pl-2">Settings</h2>
        <nav className="space-y-1">
          {[
            { id: 'general', label: 'General', icon: Settings2 },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'thresholds', label: 'Thresholds', icon: SlidersHorizontal },
            { id: 'security', label: 'Security & SSO', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-inner' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-[#6366f1]' : 'text-gray-500'} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Panel */}
      <div className="flex-1 bg-[#1a2236] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative flair */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 rounded-bl-full blur-[40px] pointer-events-none" />
        
        <form onSubmit={handleSave} className="h-full flex flex-col relative z-10">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h3 className="text-xl font-bold text-white">General Configuration</h3>
                <p className="text-sm text-gray-400 mt-1">Basic organizational settings for your workspace.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  value={formState.businessName}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select 
                    name="timezone"
                    value={formState.timezone}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency Display</label>
                  <select 
                    name="currency"
                    value={formState.currency}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                <p className="text-sm text-gray-400 mt-1">Control how and when OpsPulse alerts you.</p>
              </div>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <p className="font-semibold text-white">Critical Email Alerts</p>
                  <p className="text-sm text-gray-400">Receive emails instantly when BSS enters critical zone.</p>
                </div>
                <input 
                  type="checkbox" 
                  name="emailAlerts"
                  checked={formState.emailAlerts}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-black/30" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <p className="font-semibold text-white">Browser Push Notifications</p>
                  <p className="text-sm text-gray-400">Show native desktop notifications for War Room triggers.</p>
                </div>
                <input 
                  type="checkbox" 
                  name="browserPush"
                  checked={formState.browserPush}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-black/30" 
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Digest Frequency</label>
                <select 
                  name="digestFreq"
                  value={formState.digestFreq}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                >
                  <option value="daily">Daily Morning Briefing</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          )}

          {/* THRESHOLDS TAB */}
          {activeTab === 'thresholds' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h3 className="text-xl font-bold text-white">Risk Thresholds</h3>
                <p className="text-sm text-gray-400 mt-1">Adjust engine sensitivity for your specific operating environment.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">War Room BSS Trigger</label>
                  <span className="text-sm font-mono text-[#6366f1] font-bold">{formState.bssThreshold}/100</span>
                </div>
                <input 
                  type="range" 
                  name="bssThreshold"
                  min="50" max="90" 
                  value={formState.bssThreshold}
                  onChange={handleChange}
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#6366f1]" 
                />
                <p className="text-xs text-gray-500 mt-2">Score at which automatic War Room protocols activate.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">Inventory Low Stock Warning</label>
                  <span className="text-sm font-mono text-[#6366f1] font-bold">{formState.stockThreshold} items</span>
                </div>
                <input 
                  type="number" 
                  name="stockThreshold"
                  value={formState.stockThreshold}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">Cash Runway Crisis Trigger</label>
                  <span className="text-sm font-mono text-[#6366f1] font-bold">{formState.cashWarning} months</span>
                </div>
                <input 
                  type="number" 
                  name="cashWarning"
                  value={formState.cashWarning}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="border-b border-white/10 pb-4 mb-6">
                <h3 className="text-xl font-bold text-white">Security & Access</h3>
                <p className="text-sm text-gray-400 mt-1">Enterprise-grade security settings.</p>
              </div>
              
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center text-center">
                <Shield className="text-amber-500 mb-3" size={32} />
                <h4 className="font-semibold text-white">Advanced Security Active</h4>
                <p className="text-sm text-gray-400 max-w-sm mt-2 mb-4">SSO configuration, Audit Logs, and IP Whitelisting are managed by your identity provider integration.</p>
                <button type="button" className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium hover:bg-indigo-500/20 transition-colors">
                  View Audit Logs
                </button>
              </div>

              <div className="pt-8 border-t border-red-500/20 mt-8">
                <h4 className="font-semibold text-red-500 text-sm mb-2">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div>
                    <h5 className="font-medium text-white text-sm">Reset Onboarding</h5>
                    <p className="text-xs text-gray-400 mt-1">Clears dashboard initialization and returns to setup flow.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setOnboardingComplete(false);
                      navigate('/onboarding/welcome');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded text-xs font-semibold transition-colors border border-red-500/20"
                  >
                    <RefreshCcw size={14} /> Factory Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="mt-auto pt-8 border-t border-white/10 flex justify-end">
            <button 
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                saved 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-[#6366f1] hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {saved ? (
                <>
                  <Check size={18} />
                  Settings Saved
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
