"""FastAPI application with file CRUD operations."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes import file_router
from services.supabase import supabase_service
from settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    # Initialize database
    init_db()

    # Initialize Supabase service
    supabase_service.initialize()

    yield


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(file_router, prefix="/api")


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.get("/healthz")
def health_check():
    return {"health": "healthy"}


if __name__ == "__main__":
    # Local fallback for running via `python main.py`
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
    )
