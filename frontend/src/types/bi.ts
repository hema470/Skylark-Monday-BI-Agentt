export interface SectorRevenueBreakdown {
  sector: string;
  won_revenue: number;
  pipeline_value: number;
  total_deals: number;
  win_rate: number;
}

export interface SectorComparison {
  sector_a: string;
  revenue_a: number;
  deals_a: number;
  sector_b: string;
  revenue_b: number;
  deals_b: number;
  revenue_difference: number;
  winner: string;
}

export interface BIMetricsResponse {
  total_revenue: number;
  pipeline_value: number;
  total_deals: number;
  closed_won_count: number;
  closed_lost_count: number;
  win_rate: number;
  loss_rate: number;
  avg_deal_size: number;
  total_work_orders: number;
  completed_work_orders: number;
  pending_work_orders: number;
  delayed_work_orders: number;
  completion_percentage: number;
  avg_completion_time_days: number;
  top_sector: string;
  top_customer: string;
  sector_breakdown: SectorRevenueBreakdown[];
  energy_vs_manufacturing: SectorComparison;
  is_live_data: boolean;
  data_source: string;
}

export interface LeadershipUpdateResponse {
  summary: string;
  revenue_overview: string;
  pipeline_health: string;
  operational_health: string;
  identified_risks: string[];
  strategic_recommendations: string[];
  missing_data_notices: string[];
  timestamp: string;
}

export interface ClarifyingOption {
  label: string;
  query_text: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  requires_clarification?: boolean;
  clarifying_options?: ClarifyingOption[];
}

export interface ChatResponse {
  answer: string;
  requires_clarification: boolean;
  clarifying_options: ClarifyingOption[];
  metrics?: BIMetricsResponse;
  leadership_update?: LeadershipUpdateResponse;
  query_intent: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  monday_api_configured: boolean;
  deals_board_id: string;
  workorder_board_id: string;
  gemini_api_configured: boolean;
}
