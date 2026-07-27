import React from 'react';
import { LayoutDashboard, MessageSquareText, TrendingUp, ShieldAlert, Sparkles, HelpCircle, Layers } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'chat' | 'leadership';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'leadership') => void;
  onSelectQuickPrompt: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSelectQuickPrompt }) => {
  const quickPrompts = [
    { label: 'Pipeline Health', query: 'How is our pipeline?', icon: TrendingUp },
    { label: 'Revenue This Quarter', query: 'Revenue this quarter', icon: Sparkles },
    { label: 'Top Sectors', query: 'Top sectors', icon: Layers },
    { label: 'Delayed Work Orders', query: 'Delayed work orders', icon: ShieldAlert },
    { label: 'Avg Completion Time', query: 'Average completion time', icon: LayoutDashboard },
    { label: 'Completed Projects', query: 'Projects completed this month', icon: Sparkles },
    { label: 'Energy vs Manufacturing', query: 'Compare Energy vs Manufacturing', icon: Layers },
    { label: 'Leadership Update', query: 'Prepare leadership update', icon: MessageSquareText },
  ];

  return (
    <aside className="w-64 bg-[#0D1322] border-r border-slate-800/60 flex flex-col h-screen shrink-0 sticky top-0 z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-xl text-white">
          🦅
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
            Skylark BI <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-400 rounded font-semibold border border-indigo-500/30">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Monday.com Executive Agent</p>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</div>
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          Executive Dashboard
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <MessageSquareText className="w-4 h-4 text-cyan-400" />
          AI BI Chat Advisor
        </button>

        <button
          onClick={() => setActiveTab('leadership')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'leadership'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Leadership Update
        </button>
      </div>

      {/* Quick Questions Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Quick Founder Questions</span>
          <HelpCircle className="w-3 h-3 text-slate-500" />
        </div>
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveTab('chat');
                onSelectQuickPrompt(item.query);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-indigo-950/40 border border-transparent hover:border-indigo-800/40 transition-all flex items-center gap-2 group truncate"
            >
              <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Monday GraphQL Live
          </span>
          <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
