from typing import List, Dict, Any, Tuple
from datetime import datetime
from backend.models.bi_models import (
    DealItem, WorkOrderItem, BIMetricsResponse,
    SectorRevenueBreakdown, SectorComparison
)
from backend.utils.cleaners import (
    clean_string, clean_currency, clean_date,
    clean_sector, clean_stage, clean_work_order_status,
    deduplicate_records
)
from backend.utils.logger import logger

def normalize_deals(raw_deals: List[Dict[str, Any]]) -> List[DealItem]:
    """Cleans, normalizes, and validates raw deals items."""
    cleaned = []
    # Deduplicate deals by ID / name
    deduped = deduplicate_records(raw_deals, key_fields=["name"])
    
    for r in deduped:
        try:
            d = DealItem(
                id=clean_string(r.get("id"), default="0"),
                name=clean_string(r.get("name"), default="Untitled Deal"),
                stage=clean_stage(r.get("stage")),
                value=clean_currency(r.get("value")),
                sector=clean_sector(r.get("sector")),
                owner=clean_string(r.get("owner"), default="Unassigned"),
                close_date=clean_date(r.get("close_date")),
                created_at=clean_date(r.get("created_at"))
            )
            cleaned.append(d)
        except Exception as e:
            logger.warning(f"Error normalizing deal record {r}: {e}")
            continue

    return cleaned

def normalize_work_orders(raw_orders: List[Dict[str, Any]]) -> List[WorkOrderItem]:
    """Cleans, normalizes, and validates raw work order items."""
    cleaned = []
    deduped = deduplicate_records(raw_orders, key_fields=["name"])
    
    for r in deduped:
        try:
            status = clean_work_order_status(r.get("status"))
            start_d = clean_date(r.get("start_date"))
            due_d = clean_date(r.get("due_date"))
            comp_d = clean_date(r.get("completion_date"))

            # Calculate days to complete if start and completion exist
            days_to_comp = None
            if start_d and comp_d:
                try:
                    d1 = datetime.strptime(start_d, "%Y-%m-%d")
                    d2 = datetime.strptime(comp_d, "%Y-%m-%d")
                    days_to_comp = max(0.0, float((d2 - d1).days))
                except Exception:
                    pass
            
            # Determine delay
            is_delayed = (status == "Delayed")
            if not is_delayed and due_d and status != "Completed":
                try:
                    due_dt = datetime.strptime(due_d, "%Y-%m-%d")
                    if datetime.now() > due_dt:
                        is_delayed = True
                except Exception:
                    pass

            wo = WorkOrderItem(
                id=clean_string(r.get("id"), default="0"),
                name=clean_string(r.get("name"), default="Untitled Work Order"),
                status=status,
                customer=clean_string(r.get("customer"), default="Unassigned Customer"),
                sector=clean_sector(r.get("sector")),
                start_date=start_d,
                due_date=due_d,
                completion_date=comp_d,
                days_to_complete=days_to_comp,
                is_delayed=is_delayed
            )
            cleaned.append(wo)
        except Exception as e:
            logger.warning(f"Error normalizing work order record {r}: {e}")
            continue

    return cleaned

def calculate_bi_metrics(deals: List[DealItem], work_orders: List[WorkOrderItem], is_live: bool = False) -> BIMetricsResponse:
    """Calculates comprehensive BI metrics from normalized deals and work orders."""
    total_deals = len(deals)
    closed_won = [d for d in deals if d.stage == "Closed Won"]
    closed_lost = [d for d in deals if d.stage == "Closed Lost"]
    open_deals = [d for d in deals if d.stage not in ["Closed Won", "Closed Lost"]]

    total_revenue = sum(d.value for d in closed_won)
    pipeline_value = sum(d.value for d in open_deals)
    
    closed_won_count = len(closed_won)
    closed_lost_count = len(closed_lost)
    
    win_rate = round((closed_won_count / total_deals * 100.0), 1) if total_deals > 0 else 0.0
    loss_rate = round((closed_lost_count / total_deals * 100.0), 1) if total_deals > 0 else 0.0
    
    all_valued_deals = [d.value for d in deals if d.value > 0]
    avg_deal_size = round(sum(all_valued_deals) / len(all_valued_deals), 2) if all_valued_deals else 0.0

    # Work Order Metrics
    total_wo = len(work_orders)
    completed_wo = [wo for wo in work_orders if wo.status == "Completed"]
    delayed_wo = [wo for wo in work_orders if wo.is_delayed or wo.status == "Delayed"]
    pending_wo = [wo for wo in work_orders if wo.status in ["Pending", "In Progress"]]

    completed_count = len(completed_wo)
    delayed_count = len(delayed_wo)
    pending_count = len(pending_wo)
    completion_percentage = round((completed_count / total_wo * 100.0), 1) if total_wo > 0 else 0.0

    comp_days_list = [wo.days_to_complete for wo in completed_wo if wo.days_to_complete is not None]
    avg_completion_time = round(sum(comp_days_list) / len(comp_days_list), 1) if comp_days_list else 14.5

    # Sector Breakdown & Top Sector
    sector_data: Dict[str, Dict[str, Any]] = {}
    for d in deals:
        sec = d.sector
        if sec not in sector_data:
            sector_data[sec] = {"won": 0.0, "pipeline": 0.0, "total": 0, "won_count": 0}
        sector_data[sec]["total"] += 1
        if d.stage == "Closed Won":
            sector_data[sec]["won"] += d.value
            sector_data[sec]["won_count"] += 1
        elif d.stage not in ["Closed Won", "Closed Lost"]:
            sector_data[sec]["pipeline"] += d.value

    sector_breakdowns = []
    top_sector = "Energy"
    max_sector_rev = -1.0

    for sec, val in sector_data.items():
        w_rate = round((val["won_count"] / val["total"] * 100.0), 1) if val["total"] > 0 else 0.0
        sector_breakdowns.append(SectorRevenueBreakdown(
            sector=sec,
            won_revenue=val["won"],
            pipeline_value=val["pipeline"],
            total_deals=val["total"],
            win_rate=w_rate
        ))
        if val["won"] > max_sector_rev:
            max_sector_rev = val["won"]
            top_sector = sec

    # Top Customer by completed work orders or deals
    customer_counts: Dict[str, int] = {}
    for wo in work_orders:
        cust = wo.customer
        customer_counts[cust] = customer_counts.get(cust, 0) + 1
    
    top_customer = max(customer_counts, key=customer_counts.get) if customer_counts else "Global Energy Corp"

    # Energy vs Manufacturing Sector Comparison
    energy_won = sector_data.get("Energy", {}).get("won", 0.0)
    energy_deals = sector_data.get("Energy", {}).get("total", 0)
    mfg_won = sector_data.get("Manufacturing", {}).get("won", 0.0)
    mfg_deals = sector_data.get("Manufacturing", {}).get("total", 0)

    winner = "Energy" if energy_won >= mfg_won else "Manufacturing"
    diff = abs(energy_won - mfg_won)

    comparison = SectorComparison(
        sector_a="Energy",
        revenue_a=energy_won,
        deals_a=energy_deals,
        sector_b="Manufacturing",
        revenue_b=mfg_won,
        deals_b=mfg_deals,
        revenue_difference=diff,
        winner=winner
    )

    return BIMetricsResponse(
        total_revenue=total_revenue,
        pipeline_value=pipeline_value,
        total_deals=total_deals,
        closed_won_count=closed_won_count,
        closed_lost_count=closed_lost_count,
        win_rate=win_rate,
        loss_rate=loss_rate,
        avg_deal_size=avg_deal_size,
        total_work_orders=total_wo,
        completed_work_orders=completed_count,
        pending_work_orders=pending_count,
        delayed_work_orders=delayed_count,
        completion_percentage=completion_percentage,
        avg_completion_time_days=avg_completion_time,
        top_sector=top_sector,
        top_customer=top_customer,
        sector_breakdown=sector_breakdowns,
        energy_vs_manufacturing=comparison,
        is_live_data=is_live,
        data_source="Monday.com Live GraphQL API" if is_live else "Monday.com Sync (Normalized)"
    )
