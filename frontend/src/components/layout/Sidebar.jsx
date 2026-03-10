import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  CreditCard, 
  Blocks, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.substring(1) || 'dashboard';
  const settings = useDashboardStore(s => s.settings);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(settings?.showStrategy ? [{ id: 'strategy', label: 'Strategy', icon: Target }] : []),
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`flex flex-col h-screen bg-[#111827] border-r border-white/5 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-white font-semibold">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366f1] text-white">
              <Zap size={18} />
            </div>
            <span>OpsPulse</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex w-full items-center justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366f1] text-white">
              <Zap size={18} />
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-gray-400 hover:text-white transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      {isCollapsed && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/${item.id}`);
              }}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className={`${isActive ? 'text-[#6366f1]' : 'text-gray-400 group-hover:text-gray-300'}`} />
              {!isCollapsed && <span className="ml-3 text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-4 border-t border-white/5">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366f1] to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                JS
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-white">John Smith</span>
                <span className="text-xs text-gray-400">Pro Plan</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366f1] to-purple-500 flex items-center justify-center text-white font-medium text-sm">
              JS
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
