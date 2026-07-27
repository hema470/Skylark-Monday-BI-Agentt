import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.bi_routes import router as bi_router
from backend.config import settings
from backend.utils.logger import logger

app = FastAPI(
    title="Skylark Monday BI Agent API",
    description="AI Business Intelligence Agent connecting Monday.com GraphQL API to executive dashboards & Gemini AI",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local frontend dev server & Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bi_router)

@app.get("/")
async def root():
    return {
        "app": "Skylark Monday BI Agent API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    port = settings.PORT
    logger.info(f"Starting Skylark Monday BI Agent Backend Server on port {port}...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
