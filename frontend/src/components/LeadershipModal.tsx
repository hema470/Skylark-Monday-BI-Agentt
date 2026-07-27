import React from 'react';
import { LeadershipUpdateResponse } from '../types/bi';
import { Sparkles, AlertTriangle, ShieldCheck, FileSpreadsheet, Copy, Check, Calendar } from 'lucide-react';

interface LeadershipModalProps {
  data: LeadershipUpdateResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const LeadershipModal: React.FC<LeadershipModalProps> = ({ data, loading, onRefresh }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!data) return;
    const text = `
LEADERSHIP BRIEFING SUMMARY (${data.timestamp})
--------------------------------------------------
${data.summary}

1. REVENUE OVERVIEW
${data.revenue_overview}

2. PIPELINE HEALTH
${data.pipeline_health}

3. OPERATIONAL HEALTH
${data.operational_health}

4. IDENTIFIED RISKS
${data.identified_risks.map((r) => `• ${r}`).join('\n')}

5. STRATEGIC RECOMMENDATIONS
${data.strategic_recommendations.map((r) => `• ${r}`).join('\n')}

6. DATA QUALITY NOTICES
${data.missing_data_notices.map((n) => `• ${n}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Generating Executive Leadership Summary...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
            Executive Briefing
          </span>
          <h2 className="text-lg font-extrabold text-slate-100 mt-2 flex items-center gap-2">
            Leadership & Board Update Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Generated {data.timestamp}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Export Executive Summary'}</span>
        </button>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Revenue Overview */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400">
            💰 Revenue Overview
          </h4>
          <p className="text-slate-300 leading-relaxed">{data.revenue_overview}</p>
        </div>

        {/* Pipeline Health */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-indigo-400">
            📈 Pipeline Health
          </h4>
          <p className="text-slate-300 leading-relaxed">{data.pipeline_health}</p>
        </div>
      </div>

      {/* Operational Health */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-teal-400">
          ⚙️ Operational Health & Work Order Delivery
        </h4>
        <p className="text-slate-300 leading-relaxed">{data.operational_health}</p>
      </div>

      {/* Risks & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Identified Risks */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
          <h4 className="font-bold text-rose-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Identified Risks & Blockers
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {data.identified_risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-2">
          <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Strategic Recommendations
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {data.strategic_recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Data Quality Notices */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          Data Quality & Governance Audit
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.missing_data_notices.map((notice, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              {notice}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
