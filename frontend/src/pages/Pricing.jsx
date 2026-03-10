import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';

export default function Pricing() {
  const [currentPlan, setCurrentPlan] = useState('Pro');

  const plans = [
    {
      name: 'Free',
      description: 'Basic operations monitoring for small teams.',
      price: '$0',
      period: '/month',
      features: [
        'Up to 3 Integrations',
        'Basic Dashboard',
        'Email Alerts',
        '50 AI Queries / day',
        '7-day Data History'
      ],
      cta: 'Current Plan',
    },
    {
      name: 'Pro',
      description: 'Advanced analytics and simulated crisis response.',
      price: '$49',
      period: '/user/month',
      features: [
        'Unlimited Integrations',
        'Real-time Dashboard',
        'SMS & Email Alerts',
        'War Room Access',
        'Unlimited AI Queries',
        '1-year Data History'
      ],
      cta: 'Active Plan',
      highlight: true
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for complex organizational structures.',
      price: 'Custom',
      period: '',
      features: [
        'Dedicated Success Manager',
        'Custom Risk Thresholds',
        'On-premise Deployment',
        '24/7 Phone Support',
        'Custom SSO Integration',
        'Unlimited Data History'
      ],
      cta: 'Contact Sales',
    }
  ];

  const handleUpgrade = (planName) => {
    if (planName === 'Free' || planName === currentPlan) return;
    alert(`Thank you for your interest in the ${planName} plan! In a real app, this would open a payment gateway or contact form.`);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Subscription Plans</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the right plan for your business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative rounded-2xl p-8 bg-[#1a2236] flex flex-col h-full border ${
              plan.highlight ? 'border-[#6366f1] shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]' : 'border-white/5'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6366f1] text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm h-10">{plan.description}</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              <span className="text-sm text-gray-400 font-medium">{plan.period}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlight ? 'bg-indigo-500/20 text-[#6366f1]' : 'bg-white/5 text-gray-400'}`}>
                    <Check size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleUpgrade(plan.name)}
              disabled={plan.name === currentPlan}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a2236] ${
                plan.name === currentPlan
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/border-transparent'
                  : plan.highlight 
                    ? 'bg-[#6366f1] hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {plan.name === currentPlan ? 'Current Plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3 w-full max-w-3xl mx-auto text-indigo-200">
        <Info className="shrink-0 mt-0.5" size={18} />
        <p className="text-sm">
          <strong>Billing Note:</strong> Prices shown are in USD. Annual subscriptions receive a 20% discount. For custom integrations or dedicated support, please select the Enterprise plan to speak with our technical sales team.
        </p>
      </div>
    </div>
  );
}
