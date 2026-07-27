import re
from datetime import datetime
from typing import Any, Optional, Dict, List
from backend.utils.logger import logger

SECTOR_MAPPINGS = {
    "energy": "Energy",
    "enrgy": "Energy",
    "power": "Energy",
    "oil & gas": "Energy",
    "renewable": "Energy",
    "manufacturing": "Manufacturing",
    "mfg": "Manufacturing",
    "industrial": "Manufacturing",
    "factory": "Manufacturing",
    "tech": "Technology",
    "technology": "Technology",
    "software": "Technology",
    "it": "Technology",
    "healthcare": "Healthcare",
    "health": "Healthcare",
    "pharma": "Healthcare",
    "finance": "Finance",
    "banking": "Finance",
    "financial": "Finance",
    "retail": "Retail",
    "commerce": "Retail",
}

def clean_string(val: Any, default: str = "Unknown") -> str:
    """Removes leading/trailing whitespace, converts nulls/blanks to default."""
    if val is None:
        return default
    s = str(val).strip()
    if not s or s.lower() in ["none", "null", "undefined", "n/a", "-", "nan", ""]:
        return default
    # Remove redundant inner spaces
    s = re.sub(r'\s+', ' ', s)
    return s

def clean_currency(val: Any) -> float:
    """Extracts numeric value from currency strings like '$150,000.00', '150k', '€200 000'."""
    if val is None:
        return 0.0
    s = str(val).strip().lower()
    if not s or s in ["none", "null", "n/a", "-", "nan"]:
        return 0.0
    
    # Handle 'k' or 'm' multipliers
    multiplier = 1.0
    if s.endswith('k'):
        multiplier = 1000.0
        s = s[:-1]
    elif s.endswith('m'):
        multiplier = 1000000.0
        s = s[:-1]

    # Remove non-numeric characters except dots and digits
    cleaned_digits = re.sub(r'[^\d.]', '', s)
    if not cleaned_digits:
        return 0.0
    
    try:
        # Handle cases with multiple decimal points
        parts = cleaned_digits.split('.')
        if len(parts) > 2:
            cleaned_digits = parts[0] + '.' + ''.join(parts[1:])
        return float(cleaned_digits) * multiplier
    except ValueError:
        logger.warning(f"Failed to parse currency value: {val}")
        return 0.0

def clean_date(val: Any) -> Optional[str]:
    """Parses various date formats and normalizes to YYYY-MM-DD format."""
    if not val:
        return None
    s = str(val).strip()
    if not s or s.lower() in ["none", "null", "n/a", "-", "nan"]:
        return None

    # Strip time portion if present ISO format
    s = s.split('T')[0].split(' ')[0]

    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%b %d, %Y",
        "%d %b %Y"
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(s, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    # Regex search for year-month-day pattern
    match = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', s)
    if match:
        y, m, d = match.groups()
        return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"

    return s

def clean_sector(val: Any) -> str:
    """Normalizes sector names to standardized taxonomy."""
    raw = clean_string(val, default="Other")
    if raw == "Other":
        return "Other"
    
    normalized_key = raw.lower()
    for key, standardized in SECTOR_MAPPINGS.items():
        if key in normalized_key:
            return standardized
    
    return raw.capitalize()

def clean_stage(val: Any) -> str:
    """Normalizes deal stage into Closed Won, Closed Lost, Negotiating, Proposal, Qualified, Lead."""
    raw = clean_string(val, default="Lead").lower()
    if any(term in raw for term in ["won", "closed won", "signed", "done", "contracted", "closed-won"]):
        return "Closed Won"
    if any(term in raw for term in ["lost", "closed lost", "cancelled", "rejected", "closed-lost"]):
        return "Closed Lost"
    if any(term in raw for term in ["negotiation", "negotiating", "contract", "legal"]):
        return "Negotiation"
    if any(term in raw for term in ["proposal", "quote", "offered", "pitch"]):
        return "Proposal"
    if any(term in raw for term in ["qualified", "demo", "meeting", "discovery"]):
        return "Qualified"
    return "Lead"

def clean_work_order_status(val: Any) -> str:
    """Normalizes work order statuses."""
    raw = clean_string(val, default="Pending").lower()
    if any(term in raw for term in ["completed", "done", "finished", "closed", "delivered"]):
        return "Completed"
    if any(term in raw for term in ["in progress", "working", "ongoing", "active", "wip"]):
        return "In Progress"
    if any(term in raw for term in ["delayed", "overdue", "blocked", "stuck", "on hold"]):
        return "Delayed"
    return "Pending"

def deduplicate_records(records: List[Dict[str, Any]], key_fields: List[str]) -> List[Dict[str, Any]]:
    """Deduplicates list of dictionaries based on specific key fields."""
    seen = set()
    unique_records = []
    for r in records:
        composite_key = tuple(str(r.get(f, "")).strip().lower() for f in key_fields)
        if composite_key not in seen:
            seen.add(composite_key)
            unique_records.append(r)
    return unique_records
