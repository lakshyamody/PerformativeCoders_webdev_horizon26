import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Cloud, Package, DollarSign, ArrowRight, Check, Loader2, Plus, MonitorPlay, Activity } from 'lucide-react';
import useDashboardStore from '../store/dashboardStore';

const steps = [
  { path: 'welcome', label: 'Welcome' },
  { path: 'business-profile', label: 'Profile' },
  { path: 'connect-integrations', label: 'Connect Tools' },
  { path: 'configure', label: 'Dashboard Setup' },
  { path: 'ready', label: 'Launch' }
];

export default function Onboarding() {
  const location = useLocation();
  const currentStepIndex = steps.findIndex(s => location.pathname.includes(s.path));

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Progress Bar */}
      {currentStepIndex > 0 && currentStepIndex < steps.length - 1 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-50">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (steps.length - 2)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full max-w-4xl mx-auto h-full min-h-[500px]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="welcome" element={<StepWelcome />} />
            <Route path="business-profile" element={<StepBusinessProfile />} />
            <Route path="connect-integrations" element={<StepConnectIntegrations />} />
            <Route path="configure" element={<StepConfigure />} />
            <Route path="ready" element={<StepReady />} />
            <Route path="*" element={<Navigate to="welcome" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

function StepWelcome() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
          <Activity size={40} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">OpsPulse</span>.
          </h1>
          <p className="text-lg text-gray-400 font-medium leading-relaxed">
            Your AI-powered business command center. Let's get your dashboard set up in about 2 minutes.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/onboarding/business-profile')}
          className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </PageTransition>
  );
}

function StepBusinessProfile() {
  const navigate = useNavigate();
  const { businessProfile, setBusinessProfile } = useDashboardStore();
  const [name, setName] = useState(businessProfile.name || '');
  const [industry, setIndustry] = useState(businessProfile.industry || '');
  const [size, setSize] = useState(businessProfile.size || '');

  const handleNext = async (e) => {
    e.preventDefault();
    const profile = { name, industry, size };
    setBusinessProfile(profile);
    
    // Send to backend
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/settings/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (err) {
      console.error(err);
    }
    
    navigate('/onboarding/connect-integrations');
  };

  const isComplete = name && industry && size;

  return (
    <PageTransition>
      <div className="w-full max-w-md bg-[#1a2236]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8">
          <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">Step 1 of 3</p>
          <h2 className="text-2xl font-bold text-white mb-2">Tell us about your business</h2>
          <p className="text-sm text-gray-400">This helps OpsPulse calibrate the automated risk scoring engine precisely to your operational model.</p>
        </div>

        <form onSubmit={handleNext} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1">Company Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
              placeholder="e.g. Acme Corp"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1">Primary Industry</label>
            <select 
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              <option value="" disabled>Select industry...</option>
              <option value="Retail">Retail & E-commerce</option>
              <option value="SaaS">SaaS & Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Professional Services</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1">Company Size</label>
            <select 
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              <option value="" disabled>Select team size...</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={!isComplete}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isComplete ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

function StepConnectIntegrations() {
  const navigate = useNavigate();
  const { connectedIntegrations, setConnectedIntegrations, setOnboardingComplete } = useDashboardStore();
  const [simulators, setSimulators] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetchSimulators();
  }, []);

  const fetchSimulators = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/simulators`);
      if (res.ok) {
        const data = await res.json();
        setSimulators(data);
        const activeIds = Object.keys(data).filter(k => data[k]);
        setConnectedIntegrations(activeIds);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConnection = async (id) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    const isConnected = simulators[id];
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/webhooks/simulate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isConnected })
      });
      await fetchSimulators();
    } catch (e) {
      console.error(e);
    }
    setLoading(prev => ({ ...prev, [id]: false }));
  };

  const connectors = [
    { id: 'hubspot', name: 'HubSpot', icon: PieChart },
    { id: 'salesforce', name: 'Salesforce', icon: Cloud },
    { id: 'sap', name: 'SAP ERP', icon: Package },
    { id: 'quickbooks', name: 'QuickBooks', icon: DollarSign }
  ];

  const hasConnection = Object.values(simulators).some(Boolean);

  const handleContinue = () => {
    if (hasConnection) {
      navigate('/onboarding/configure');
    }
  };

  const handleDemoMode = async () => {
    // Proceed purely with demo data mode
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/settings/complete`, { method: 'POST' });
    setOnboardingComplete(true);
    navigate('/');
  };

  return (
    <PageTransition>
      <div className="w-full max-w-2xl bg-[#1a2236]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8">
          <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">Step 2 of 3</p>
          <h2 className="text-2xl font-bold text-white mb-2">What tools do you use?</h2>
          <p className="text-sm text-gray-400">OpsPulse feeds natively from your existing data exhaust. Connect at least one source to activate your command center.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {connectors.map(c => {
            const isConnected = simulators[c.id];
            const isLoad = loading[c.id];
            return (
              <button
                key={c.id}
                onClick={() => toggleConnection(c.id)}
                disabled={isLoad}
                className={`relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 group ${isConnected ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:bg-black/40'}`}
              >
                {isConnected && (
                  <div className="absolute top-3 right-3 text-emerald-400 bg-emerald-400/10 p-1 rounded-full"><Check size={14} strokeWidth={3} /></div>
                )}
                {isLoad ? (
                  <Loader2 className="animate-spin text-indigo-400 mb-3" size={32} />
                ) : (
                  <c.icon size={32} strokeWidth={1.5} className={`mb-3 transition-transform duration-300 ${isConnected ? 'text-indigo-400 scale-110' : 'group-hover:scale-110'}`} />
                )}
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs opacity-60 mt-1">{isConnected ? 'Connected' : 'Click to connect'}</span>
              </button>
            )
          })}
        </div>
        
        <div className="flex flex-col items-end gap-3 border-t border-white/10 pt-6">
          <button 
            onClick={handleContinue}
            disabled={!hasConnection}
            className={`px-8 py-3 rounded-xl font-bold transition-all relative ${hasConnection ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
          >
            Continue to Configuration
            {!hasConnection && (
              <span className="absolute -top-8 right-0 text-xs text-amber-500/80 whitespace-nowrap opacity-0 transition-opacity">Connect a data source first</span>
            )}
          </button>
          
          <button onClick={handleDemoMode} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Skip setup & continue with simulated Demo Data
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

function StepConfigure() {
  const navigate = useNavigate();
  const { connectedIntegrations } = useDashboardStore();
  
  const hasSales = connectedIntegrations.includes('hubspot') || connectedIntegrations.includes('salesforce');
  const hasInv = connectedIntegrations.includes('sap');
  const hasCash = connectedIntegrations.includes('quickbooks');

  const [settings, setSettings] = useState({
    salesStage: 'Closed Won',
    invThreshold: '50',
    cashRunway: '3'
  });

  const handleNext = () => {
    // In a real app we'd dispatch settings
    navigate('/onboarding/ready');
  };

  return (
    <PageTransition>
      <div className="w-full max-w-2xl bg-[#1a2236]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8">
          <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">Step 3 of 3</p>
          <h2 className="text-2xl font-bold text-white mb-2">Configure Thresholds</h2>
          <p className="text-sm text-gray-400">Set the operational guardrails for your connected streams.</p>
        </div>

        <div className="space-y-6">
          {/* Sales Config */}
          <div className={`p-5 rounded-xl border ${hasSales ? 'bg-black/30 border-white/10' : 'bg-black/10 border-white/5 opacity-50'}`}>
            <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
              Revenue Tracking 
              {!hasSales && <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded">Simulated Data</span>}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Deal Stage to count as Revenue</label>
                <select disabled={!hasSales} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option>Closed Won</option>
                  <option>Committed</option>
                  <option>Verbal Agreement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inv Config */}
          <div className={`p-5 rounded-xl border ${hasInv ? 'bg-black/30 border-white/10' : 'bg-black/10 border-white/5 opacity-50'}`}>
            <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
              Inventory Alerts 
              {!hasInv && <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded">Simulated Data</span>}
            </h3>
            <div className="w-1/2">
              <label className="text-xs text-gray-400 block mb-1">Critical Low Stock Threshold (%)</label>
              <input disabled={!hasInv} type="number" value={settings.invThreshold} onChange={e=>setSettings({...settings, invThreshold: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Cash Config */}
          <div className={`p-5 rounded-xl border ${hasCash ? 'bg-black/30 border-white/10' : 'bg-black/10 border-white/5 opacity-50'}`}>
            <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
              Cash Flow Runway
              {!hasCash && <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded">Simulated Data</span>}
            </h3>
            <div className="w-1/2">
              <label className="text-xs text-gray-400 block mb-1">Crisis Alert Threshold (Months)</label>
              <input disabled={!hasCash} type="number" value={settings.cashRunway} onChange={e=>setSettings({...settings, cashRunway: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button 
            onClick={handleNext}
            className="px-8 py-3 rounded-xl font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

function StepReady() {
  const navigate = useNavigate();
  const { businessProfile, connectedIntegrations, setOnboardingComplete } = useDashboardStore();
  const [launching, setLaunching] = useState(false);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/settings/complete`, { method: 'POST' });
    } catch (e) { console.error(e) }
    
    // Slight artificial delay for UX heft
    setTimeout(() => {
      setOnboardingComplete(true);
      navigate('/');
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-0 h-0 w-full mb-12">
          {/* Decorative radar graphic */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-indigo-500/30 rounded-full"></div>
            <div className="absolute inset-8 bg-indigo-500/80 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center">
              <Check size={30} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 mt-12">
          Dashboard Prepared
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          OpsPulse is configured for <span className="text-white font-medium">{businessProfile.name || 'your business'}</span>. We detected bindings for {connectedIntegrations.length} data streams. The AI scoring engine is active.
        </p>

        <button 
          onClick={handleLaunch}
          disabled={launching}
          className="relative px-10 py-4 bg-emerald-500 text-black rounded-xl font-bold text-xl hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center gap-3 overflow-hidden"
        >
          {launching ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Synchronizing...
            </>
          ) : (
            <>
              <MonitorPlay size={24}/>
              Launch Command Center
            </>
          )}
          {launching && (
             <motion.div 
               className="absolute top-0 left-0 w-full h-full bg-white/20"
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
             />
          )}
        </button>
      </div>
    </PageTransition>
  );
}
