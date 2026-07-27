import os
import sys
from dotenv import load_dotenv

# Ensure root directory is in sys.path for backend package resolution
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Load .env file from root or backend directory
load_dotenv()
load_dotenv(os.path.join(root_dir, ".env"))


class Settings:
    MONDAY_API_KEY: str = os.getenv("MONDAY_API_KEY", "")
    MONDAY_DEALS_BOARD_ID: str = os.getenv("MONDAY_DEALS_BOARD_ID", "")
    MONDAY_WORKORDER_BOARD_ID: str = os.getenv("MONDAY_WORKORDER_BOARD_ID", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    PORT: int = int(os.getenv("PORT", "8000"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    MONDAY_API_URL: str = "https://api.monday.com/v2"

settings = Settings()
