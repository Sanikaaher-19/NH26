import React from 'react';
import { ArrowRight, Bot, Clock, AlertTriangle, Zap, LineChart } from 'lucide-react';

const AutoRouting = () => {
  const rules = [
    { color: 'bg-red-500', category: 'Outage', agent: 'Dev Kumar', tickets: 1 },
    { color: 'bg-orange-500', category: 'Billing', agent: 'Rahul Agarwal', tickets: 1 },
    { color: 'bg-purple-500', category: 'Voltage', agent: 'Dev Kumar', tickets: 1 },
    { color: 'bg-blue-500', category: 'Meter', agent: 'Rahul Agarwal', tickets: 1 },
    { color: 'bg-emerald-500', category: 'New Connection', agent: 'Priya Sharma', tickets: 1 },
    { color: 'bg-cyan-500', category: 'Infrastructure', agent: 'Dev Kumar', tickets: 0 },
    { color: 'bg-slate-500', category: 'General', agent: 'Priya Sharma', tickets: 0 },
  ];

  const aiFeatures = [
    { icon: <Bot size={20} className="text-blue-600" />, title: 'AI Auto-Resolution', desc: 'FAQ queries resolved instantly before escalation.', color: 'bg-blue-50' },
    { icon: <Zap size={20} className="text-yellow-600" />, title: 'Smart Auto-Routing', desc: 'Category to agent assignment.', color: 'bg-yellow-50' },
    { icon: <LineChart size={20} className="text-purple-600" />, title: 'Live Analytics', desc: 'Charts, category distribution, SLA timers.', color: 'bg-purple-50' },
    { icon: <Clock size={20} className="text-green-600" />, title: 'SLA Timers', desc: 'Per-ticket resolution deadlines.', color: 'bg-green-50' },
    { icon: <AlertTriangle size={20} className="text-red-600" />, title: 'Auto Ticketing', desc: 'Chat transcript auto-converted to ticket.', color: 'bg-red-50' }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Auto Routing</h2>
        <p className="text-sm text-slate-500">Category to agent assignment rules.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700">Routing Rules</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {rules.map((rule, i) => (
            <div key={i} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${rule.color}`}></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-0.5">{rule.category}</h4>
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    Routed to <ArrowRight size={10} className="text-slate-300" /> <span className="text-slate-600">{rule.agent}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400">{rule.tickets} ticket{rule.tickets !== 1 ? 's' : ''}</span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">AI Features Active</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiFeatures.map((feat, i) => (
            <div key={i} className={`p-4 rounded-xl border border-slate-100 shadow-sm ${feat.color}`}>
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center mb-3">
                {feat.icon}
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">{feat.title}</h4>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoRouting;
