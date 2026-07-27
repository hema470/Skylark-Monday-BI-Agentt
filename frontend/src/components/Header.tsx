import React from 'react';
import { RefreshCw, SlidersHorizontal, CheckCircle2, AlertCircle, Database, Bot } from 'lucide-react';
import { HealthResponse } from '../types/bi';

interface HeaderProps {
  health: HealthResponse | null;
  isSyncing: boolean;
  onSync: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, isSyncing, onSync, onOpenConfig }) => {
  return (
    <header className="h-16 border-b border-slate-800/60 bg-[#0B101D]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          Business Intelligence Command Center
        </h2>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Live Sync Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-2 text-[11px] bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Monday API:</span>
            {health?.monday_api_configured ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" /> Dynamic Sync
              </span>
            )}
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Model:</span>
            <span className="text-indigo-300 font-semibold">Gemini BI Engine</span>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all disabled:opacity-50"
          title="Refetch and normalize live Monday.com GraphQL data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Monday.com'}</span>
        </button>

        {/* Config Modal Trigger */}
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
          title="Configure Monday Board IDs & API Key"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
