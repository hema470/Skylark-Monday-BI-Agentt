import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.routes.bi_routes import router as bi_router
from backend.config import settings
from backend.utils.logger import logger

app = FastAPI(
    title="Skylark Monday BI Agent API",
    description="AI Business Intelligence Agent connecting Monday.com GraphQL API to executive dashboards & Gemini AI",
    version="1.0.0"
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API Routes
# -----------------------------
app.include_router(bi_router)

# -----------------------------
# API Info
# -----------------------------
@app.get("/api")
async def api_info():
    return {
        "app": "Skylark Monday BI Agent API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

# -----------------------------
# Serve React Frontend
# -----------------------------
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):

    assets_dir = os.path.join(STATIC_DIR, "assets")

    if os.path.exists(assets_dir):
        app.mount(
            "/assets",
            StaticFiles(directory=assets_dir),
            name="assets"
        )

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = settings.PORT
    logger.info(f"Starting Skylark Monday BI Agent Backend Server on port {port}...")
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )