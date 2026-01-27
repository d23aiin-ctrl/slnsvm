import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, students, parents, teachers, admin, fees, admissions, ai, payments, notifications, bulk
from app.seed_data import run_seed

logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting SLNSVM API...")

    # Run seed data if enabled
    if settings.SEED_DATA_ENABLED:
        logger.info("Seed data is enabled. Running seed...")
        try:
            run_seed()
        except Exception as e:
            logger.error(f"Seed data failed: {e}")

    yield

    # Shutdown
    logger.info("Shutting down SLNSVM API...")

app = FastAPI(
    title=settings.APP_NAME,
    description="API for SLNSVM School Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:3000",
        "http://localhost:9000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:9000",
        # Production domains
        "https://www.slnsvm.com",
        "https://slnsvm.com",
        "https://www.admin.slnsvm.com",
        "https://admin.slnsvm.com",
        "https://www.api.slnsvm.com",
        "https://api.slnsvm.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(students.router, prefix="/api/v1")
app.include_router(parents.router, prefix="/api/v1")
app.include_router(teachers.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(fees.router, prefix="/api/v1")
app.include_router(admissions.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(bulk.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to SLNSVM School Management System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
