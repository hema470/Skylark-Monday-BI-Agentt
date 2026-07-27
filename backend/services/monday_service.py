import asyncio
import json
import httpx
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.utils.logger import logger

DEFAULT_DEALS_MOCK = [
    {"id": "d1", "name": "Global Energy Grid Expansion", "stage": "Closed Won", "value": 450000.0, "sector": "Energy", "owner": "Sarah Jenkins", "close_date": "2026-06-15"},
    {"id": "d2", "name": "Apex Mfg Robotics Suite", "stage": "Closed Won", "value": 280000.0, "sector": "Manufacturing", "owner": "David Chen", "close_date": "2026-07-02"},
    {"id": "d3", "name": "SolarTech Turbine Optimization", "stage": "Negotiation", "value": 320000.0, "sector": "Energy", "owner": "Sarah Jenkins", "close_date": "2026-08-30"},
    {"id": "d4", "name": "Smart Factory IoT Sensors", "stage": "Proposal", "value": 175000.0, "sector": "Manufacturing", "owner": "Marcus Vance", "close_date": "2026-09-15"},
    {"id": "d5", "name": "BioHealth Analytics Cloud", "stage": "Closed Won", "value": 210000.0, "sector": "Healthcare", "owner": "Elena Rostova", "close_date": "2026-05-20"},
    {"id": "d6", "name": "Quantum Financial Trading Engine", "stage": "Qualified", "value": 500000.0, "sector": "Finance", "owner": "David Chen", "close_date": "2026-10-01"},
    {"id": "d7", "name": "HydroPower Plant Maintenance", "stage": "Closed Won", "value": 390000.0, "sector": "Energy", "owner": "Sarah Jenkins", "close_date": "2026-07-10"},
    {"id": "d8", "name": "Industrial Automation Gen-3", "stage": "Closed Lost", "value": 240000.0, "sector": "Manufacturing", "owner": "Marcus Vance", "close_date": "2026-06-01"},
    {"id": "d9", "name": "Retail Logistics AI Platform", "stage": "Closed Won", "value": 160000.0, "sector": "Retail", "owner": "Elena Rostova", "close_date": "2026-06-25"},
    {"id": "d10", "name": "Wind Turbine Predictive Maintenance", "stage": "Negotiation", "value": 290000.0, "sector": "Energy", "owner": "Sarah Jenkins", "close_date": "2026-08-15"}
]

DEFAULT_WORKORDERS_MOCK = [
    {"id": "wo1", "name": "WO-2026-101 Energy Substation Install", "status": "Completed", "customer": "Global Energy Corp", "sector": "Energy", "start_date": "2026-05-01", "due_date": "2026-06-01", "completion_date": "2026-05-28"},
    {"id": "wo2", "name": "WO-2026-102 Mfg Assembly Calibration", "status": "Completed", "customer": "Apex Manufacturing", "sector": "Manufacturing", "start_date": "2026-05-10", "due_date": "2026-06-15", "completion_date": "2026-06-12"},
    {"id": "wo3", "name": "WO-2026-103 Turbine Blade Replacement", "status": "Delayed", "customer": "SolarTech Solutions", "sector": "Energy", "start_date": "2026-06-01", "due_date": "2026-07-01", "completion_date": None},
    {"id": "wo4", "name": "WO-2026-104 Factory Sensor Wiring", "status": "In Progress", "customer": "Smart Factory Inc", "sector": "Manufacturing", "start_date": "2026-06-15", "due_date": "2026-08-01", "completion_date": None},
    {"id": "wo5", "name": "WO-2026-105 Healthcare Data Integration", "status": "Completed", "customer": "BioHealth Systems", "sector": "Healthcare", "start_date": "2026-05-15", "due_date": "2026-06-20", "completion_date": "2026-06-18"},
    {"id": "wo6", "name": "WO-2026-106 Hydro Generator Overhaul", "status": "Delayed", "customer": "HydroPower Ltd", "sector": "Energy", "start_date": "2026-06-10", "due_date": "2026-07-15", "completion_date": None},
    {"id": "wo7", "name": "WO-2026-107 Retail AI Camera Deployment", "status": "Completed", "customer": "OmniRetail Co", "sector": "Retail", "start_date": "2026-06-20", "due_date": "2026-07-20", "completion_date": "2026-07-19"},
    {"id": "wo8", "name": "WO-2026-108 Financial Terminal Setup", "status": "Pending", "customer": "Quantum Capital", "sector": "Finance", "start_date": "2026-07-01", "due_date": "2026-08-15", "completion_date": None}
]

async def executeGraphQL(query: str, variables: Optional[Dict[str, Any]] = None, max_retries: int = 3) -> Dict[str, Any]:
    """Executes a GraphQL query against Monday.com API v2 with retry and exponential backoff."""
    api_key = settings.MONDAY_API_KEY
    if not api_key:
        logger.warning("MONDAY_API_KEY is not set. Returning mock fallback state.")
        return {"data": None, "error": "MONDAY_API_KEY missing"}

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
        "API-Version": "2023-10"
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    async with httpx.AsyncClient(timeout=15.0) as client:
        for attempt in range(1, max_retries + 1):
            try:
                response = await client.post(settings.MONDAY_API_URL, json=payload, headers=headers)
                if response.status_code == 200:
                    res_json = response.json()
                    if "errors" in res_json:
                        logger.error(f"Monday API GraphQL Errors: {res_json['errors']}")
                    return res_json
                elif response.status_code in [429, 500, 502, 503, 504]:
                    wait_time = 2 ** attempt
                    logger.warning(f"Monday API HTTP {response.status_code}. Retrying in {wait_time}s (Attempt {attempt}/{max_retries})")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Monday API HTTP error {response.status_code}: {response.text}")
                    return {"data": None, "error": f"HTTP {response.status_code}: {response.text}"}
            except Exception as e:
                logger.error(f"Error communicating with Monday API (Attempt {attempt}): {e}")
                if attempt == max_retries:
                    return {"data": None, "error": str(e)}
                await asyncio.sleep(2 ** attempt)

    return {"data": None, "error": "Max retries exceeded"}

async def fetchDeals(board_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches deals dynamically from Monday.com Deals board via GraphQL."""
    effective_board_id = board_id or settings.MONDAY_DEALS_BOARD_ID
    if not settings.MONDAY_API_KEY or not effective_board_id:
        logger.info("Using default mock Deals dataset (Monday API key or board ID not configured).")
        return DEFAULT_DEALS_MOCK

    query = """
    query GetDealsBoard($boardId: ID!) {
      boards(ids: [$boardId]) {
        name
        items_page(limit: 250) {
          items {
            id
            name
            created_at
            column_values {
              id
              title
              text
              value
            }
          }
        }
      }
    }
    """
    
    res = await executeGraphQL(query, variables={"boardId": effective_board_id})
    boards = res.get("data", {}).get("boards", []) if res.get("data") else []
    
    if not boards or not boards[0].get("items_page", {}).get("items"):
        logger.warning(f"No items retrieved from Monday Deals board {effective_board_id}. Falling back to default mock dataset.")
        return DEFAULT_DEALS_MOCK

    raw_items = boards[0]["items_page"]["items"]
    parsed_deals = []

    for item in raw_items:
        deal = {
            "id": str(item.get("id")),
            "name": item.get("name", "Unnamed Deal"),
            "stage": "Lead",
            "value": 0.0,
            "sector": "Other",
            "owner": "Unassigned",
            "close_date": None,
            "created_at": item.get("created_at")
        }

        for cv in item.get("column_values", []):
            title = (cv.get("title") or cv.get("id") or "").lower()
            text_val = cv.get("text") or ""

            if any(k in title for k in ["stage", "status", "phase"]):
                deal["stage"] = text_val
            elif any(k in title for k in ["value", "amount", "price", "deal value", "revenue"]):
                deal["value"] = text_val
            elif any(k in title for k in ["sector", "industry", "category"]):
                deal["sector"] = text_val
            elif any(k in title for k in ["owner", "rep", "assignee", "person"]):
                deal["owner"] = text_val
            elif any(k in title for k in ["close", "expected close", "date"]):
                deal["close_date"] = text_val

        parsed_deals.append(deal)

    return parsed_deals

async def fetchWorkOrders(board_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches work orders dynamically from Monday.com Work Orders board via GraphQL."""
    effective_board_id = board_id or settings.MONDAY_WORKORDER_BOARD_ID
    if not settings.MONDAY_API_KEY or not effective_board_id:
        logger.info("Using default mock Work Orders dataset (Monday API key or board ID not configured).")
        return DEFAULT_WORKORDERS_MOCK

    query = """
    query GetWorkOrdersBoard($boardId: ID!) {
      boards(ids: [$boardId]) {
        name
        items_page(limit: 250) {
          items {
            id
            name
            created_at
            column_values {
              id
              title
              text
              value
            }
          }
        }
      }
    }
    """

    res = await executeGraphQL(query, variables={"boardId": effective_board_id})
    boards = res.get("data", {}).get("boards", []) if res.get("data") else []

    if not boards or not boards[0].get("items_page", {}).get("items"):
        logger.warning(f"No items retrieved from Monday Work Orders board {effective_board_id}. Falling back to default mock dataset.")
        return DEFAULT_WORKORDERS_MOCK

    raw_items = boards[0]["items_page"]["items"]
    parsed_orders = []

    for item in raw_items:
        order = {
            "id": str(item.get("id")),
            "name": item.get("name", "Unnamed Work Order"),
            "status": "Pending",
            "customer": "Unknown Customer",
            "sector": "General",
            "start_date": None,
            "due_date": None,
            "completion_date": None
        }

        for cv in item.get("column_values", []):
            title = (cv.get("title") or cv.get("id") or "").lower()
            text_val = cv.get("text") or ""

            if any(k in title for k in ["status", "state", "progress"]):
                order["status"] = text_val
            elif any(k in title for k in ["customer", "client", "account", "company"]):
                order["customer"] = text_val
            elif any(k in title for k in ["sector", "industry"]):
                order["sector"] = text_val
            elif "start" in title:
                order["start_date"] = text_val
            elif any(k in title for k in ["due", "deadline"]):
                order["due_date"] = text_val
            elif any(k in title for k in ["complete", "completed", "finish", "done"]):
                order["completion_date"] = text_val

        parsed_orders.append(order)

    return parsed_orders
