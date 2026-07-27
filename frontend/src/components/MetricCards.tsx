import React from 'react';
import { DollarSign, TrendingUp, Award, Clock, AlertTriangle, CheckCircle2, Building2 } from 'lucide-react';
import { BIMetricsResponse } from '../types/bi';

interface MetricCardsProps {
  metrics: BIMetricsResponse | null;
  loading: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 rounded-xl glass-card animate-pulse p-4 flex flex-col justify-between">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue (Q3)',
      value: `$${metrics.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtext: `Top Sector: ${metrics.top_sector}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Active Pipeline Value',
      value: `$${metrics.pipeline_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtext: `${metrics.total_deals} Total Deals | Avg: $${metrics.avg_deal_size.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgGradient: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/20'
    },
    {
      title: 'Win Rate',
      value: `${metrics.win_rate}%`,
      subtext: `${metrics.closed_won_count} Won vs ${metrics.closed_lost_count} Lost`,
      icon: Award,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/20'
    },
    {
      title: 'Work Order Completion',
      value: `${metrics.completion_percentage}%`,
      subtext: `${metrics.completed_work_orders} / ${metrics.total_work_orders} Orders Completed`,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bgGradient: 'from-teal-500/10 to-transparent',
      borderColor: 'border-teal-500/20'
    },
    {
      title: 'Delayed Work Orders',
      value: `${metrics.delayed_work_orders}`,
      subtext: `${metrics.pending_work_orders} Pending Field Delivery`,
      icon: AlertTriangle,
      color: metrics.delayed_work_orders > 0 ? 'text-rose-400' : 'text-slate-400',
      bgGradient: metrics.delayed_work_orders > 0 ? 'from-rose-500/10 to-transparent' : 'from-slate-500/10 to-transparent',
      borderColor: metrics.delayed_work_orders > 0 ? 'border-rose-500/30' : 'border-slate-800'
    },
    {
      title: 'Avg Delivery Time',
      value: `${metrics.avg_completion_time_days} Days`,
      subtext: `Top Client: ${metrics.top_customer}`,
      icon: Clock,
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card glass-card-hover p-4 rounded-xl border bg-gradient-to-br ${card.bgGradient} ${card.borderColor} flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-lg bg-slate-900/60 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1 truncate">{card.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
