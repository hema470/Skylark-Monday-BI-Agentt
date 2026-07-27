import React from 'react';
import { Layers, Swords, PieChart, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { BIMetricsResponse } from '../types/bi';

interface ChartsViewProps {
  metrics: BIMetricsResponse | null;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ metrics }) => {
  if (!metrics) return null;

  const maxRevenue = Math.max(...metrics.sector_breakdown.map((s) => s.won_revenue), 1);
  const comp = metrics.energy_vs_manufacturing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Sector Revenue Breakdown Bar Visualizer */}
      <div className="lg:col-span-2 glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Revenue & Pipeline Distribution by Sector
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Monday Deals Sync</span>
          </div>

          <div className="space-y-4">
            {metrics.sector_breakdown.map((item, idx) => {
              const wonPct = Math.round((item.won_revenue / maxRevenue) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.sector}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-mono">${item.won_revenue.toLocaleString()} won</span>
                      <span className="text-slate-400 font-mono">(${item.pipeline_value.toLocaleString()} pipe)</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(wonPct, 6)}%` }}
                      title={`Won Revenue: $${item.won_revenue.toLocaleString()}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Leading Sector: <strong className="text-indigo-300 font-semibold">{metrics.top_sector}</strong></span>
          <span>Win Rate Leader: <strong className="text-emerald-400 font-semibold">{metrics.win_rate}%</strong></span>
        </div>
      </div>

      {/* 2. Energy vs Manufacturing Comparison & Work Order Breakdown */}
      <div className="space-y-6">
        {/* Sector Comparison Card */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              {comp.sector_a} vs {comp.sector_b}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
              Head-to-Head
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-center p-2 rounded bg-indigo-950/20 border border-indigo-500/20">
              <div className="text-[11px] text-indigo-300 font-bold uppercase">{comp.sector_a}</div>
              <div className="text-base font-extrabold text-white mt-1">${comp.revenue_a.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{comp.deals_a} total deals</div>
            </div>

            <div className="text-center p-2 rounded bg-cyan-950/20 border border-cyan-500/20">
              <div className="text-[11px] text-cyan-300 font-bold uppercase">{comp.sector_b}</div>
              <div className="text-base font-extrabold text-white mt-1">${comp.revenue_b.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{comp.deals_b} total deals</div>
            </div>
          </div>

          <div className="mt-3 text-center text-xs font-semibold text-slate-300">
            Winner: <span className="text-emerald-400 font-bold">{comp.winner}</span> (+${comp.revenue_difference.toLocaleString()} lead)
          </div>
        </div>

        {/* Work Order Status Gauge */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Work Order Delivery Status
            </h3>
            <span className="text-[11px] font-semibold text-emerald-400">{metrics.completion_percentage}% Done</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed ({metrics.completed_work_orders})
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3.5 h-3.5" /> Pending ({metrics.pending_work_orders})
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Delayed ({metrics.delayed_work_orders})
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${metrics.completion_percentage}%` }}
                title="Completed"
              ></div>
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{
                  width: `${metrics.total_work_orders > 0 ? (metrics.pending_work_orders / metrics.total_work_orders) * 100 : 0}%`,
                }}
                title="Pending"
              ></div>
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{
                  width: `${metrics.total_work_orders > 0 ? (metrics.delayed_work_orders / metrics.total_work_orders) * 100 : 0}%`,
                }}
                title="Delayed"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
