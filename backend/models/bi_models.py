from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DealItem(BaseModel):
    id: str
    name: str
    stage: str
    value: float
    sector: str
    owner: str = "Unassigned"
    close_date: Optional[str] = None
    created_at: Optional[str] = None

class WorkOrderItem(BaseModel):
    id: str
    name: str
    status: str
    customer: str
    sector: str = "General"
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    completion_date: Optional[str] = None
    days_to_complete: Optional[float] = None
    is_delayed: bool = False

class SectorRevenueBreakdown(BaseModel):
    sector: str
    won_revenue: float
    pipeline_value: float
    total_deals: int
    win_rate: float

class SectorComparison(BaseModel):
    sector_a: str
    revenue_a: float
    deals_a: int
    sector_b: str
    revenue_b: float
    deals_b: int
    revenue_difference: float
    winner: str

class BIMetricsResponse(BaseModel):
    total_revenue: float
    pipeline_value: float
    open_revenue: float = 0.0
    total_deals: int
    closed_won_count: int
    closed_lost_count: int
    win_rate: float
    loss_rate: float
    avg_deal_size: float
    total_work_orders: int
    active_work_orders: int = 0
    completed_work_orders: int
    pending_work_orders: int
    delayed_work_orders: int
    completion_percentage: float
    avg_completion_time_days: float
    top_sector: str
    top_customer: str
    sector_breakdown: List[SectorRevenueBreakdown]
    energy_vs_manufacturing: SectorComparison
    is_live_data: bool = False
    data_source: str = "Monday.com API"
    data_quality_score: float = 95.0
    missing_revenue_count: int = 0
    missing_dates_count: int = 0
    duplicate_customers_count: int = 0
    invalid_records_count: int = 0
    blank_values_count: int = 0
    unknown_sectors_count: int = 0
    data_quality_recommendations: List[str] = []
    api_response_time_ms: float = 0.0
    total_records_loaded: int = 0
    last_sync_time: str = ""

class LeadershipUpdateResponse(BaseModel):
    summary: str
    revenue_overview: str
    pipeline_health: str
    operational_health: str
    top_customers: List[str] = []
    delayed_projects: List[str] = []
    identified_risks: List[str]
    strategic_recommendations: List[str]
    missing_data_notices: List[str]
    next_actions: List[str] = []
    timestamp: str

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    board_id_deals: Optional[str] = None
    board_id_workorders: Optional[str] = None

class ClarifyingOption(BaseModel):
    label: str
    query_text: str

class ChatResponse(BaseModel):
    answer: str
    requires_clarification: bool = False
    clarifying_options: List[ClarifyingOption] = []
    metrics: Optional[BIMetricsResponse] = None
    leadership_update: Optional[LeadershipUpdateResponse] = None
    query_intent: str = "general"

