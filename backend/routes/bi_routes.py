from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models.bi_models import ChatRequest, ChatResponse, BIMetricsResponse, LeadershipUpdateResponse
from backend.services.monday_service import fetchDeals, fetchWorkOrders
from backend.services.bi_service import normalize_deals, normalize_work_orders, calculate_bi_metrics
from backend.services.gemini_service import generate_gemini_response, generate_leadership_update_summary
from backend.config import settings
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["BI Operations"])

@router.get("/health")
async def health_check():
    """Health check endpoint and Monday.com API integration status."""
    return {
        "status": "online",
        "service": "Skylark Monday BI Agent Backend",
        "monday_api_configured": bool(settings.MONDAY_API_KEY),
        "deals_board_id": settings.MONDAY_DEALS_BOARD_ID or "Not set (Using Mock)",
        "workorder_board_id": settings.MONDAY_WORKORDER_BOARD_ID or "Not set (Using Mock)",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }

@router.get("/metrics", response_model=BIMetricsResponse)
async def get_bi_metrics(
    deals_board_id: Optional[str] = Query(None),
    workorder_board_id: Optional[str] = Query(None)
):
    """Fetches raw data from Monday API, normalizes records, and computes BI metrics."""
    try:
        raw_deals = await fetchDeals(deals_board_id)
        raw_workorders = await fetchWorkOrders(workorder_board_id)

        clean_d = normalize_deals(raw_deals)
        clean_wo = normalize_work_orders(raw_workorders)

        is_live = bool(settings.MONDAY_API_KEY and (deals_board_id or settings.MONDAY_DEALS_BOARD_ID))
        metrics = calculate_bi_metrics(clean_d, clean_wo, is_live=is_live)
        return metrics
    except Exception as e:
        logger.error(f"Error computing BI metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute BI metrics: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bi_agent(request: ChatRequest):
    """Answers user's business questions using live BI metrics & Gemini AI."""
    try:
        raw_deals = await fetchDeals(request.board_id_deals)
        raw_workorders = await fetchWorkOrders(request.board_id_workorders)

        clean_d = normalize_deals(raw_deals)
        clean_wo = normalize_work_orders(raw_workorders)

        is_live = bool(settings.MONDAY_API_KEY and (request.board_id_deals or settings.MONDAY_DEALS_BOARD_ID))
        metrics = calculate_bi_metrics(clean_d, clean_wo, is_live=is_live)

        answer_text, req_clarification, options, intent = await generate_gemini_response(
            query=request.message,
            metrics=metrics,
            history=request.history
        )

        leadership_upd = None
        if intent == "leadership_update":
            leadership_upd = await generate_leadership_update_summary(metrics)

        return ChatResponse(
            answer=answer_text,
            requires_clarification=req_clarification,
            clarifying_options=options,
            metrics=metrics,
            leadership_update=leadership_upd,
            query_intent=intent
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {str(e)}")

@router.get("/leadership-update", response_model=LeadershipUpdateResponse)
async def get_leadership_update(
    deals_board_id: Optional[str] = Query(None),
    workorder_board_id: Optional[str] = Query(None)
):
    """Generates an executive leadership update report."""
    try:
        raw_deals = await fetchDeals(deals_board_id)
        raw_workorders = await fetchWorkOrders(workorder_board_id)

        clean_d = normalize_deals(raw_deals)
        clean_wo = normalize_work_orders(raw_workorders)

        is_live = bool(settings.MONDAY_API_KEY and (deals_board_id or settings.MONDAY_DEALS_BOARD_ID))
        metrics = calculate_bi_metrics(clean_d, clean_wo, is_live=is_live)

        update = await generate_leadership_update_summary(metrics)
        return update
    except Exception as e:
        logger.error(f"Error generating leadership update: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate leadership update: {str(e)}")

@router.post("/sync")
async def sync_monday_data():
    """Triggers dynamic resynchronization with Monday.com GraphQL endpoints."""
    raw_deals = await fetchDeals()
    raw_workorders = await fetchWorkOrders()
    clean_d = normalize_deals(raw_deals)
    clean_wo = normalize_work_orders(raw_workorders)
    
    return {
        "status": "success",
        "message": "Data synchronized and normalized successfully",
        "deals_count": len(clean_d),
        "work_orders_count": len(clean_wo)
    }
