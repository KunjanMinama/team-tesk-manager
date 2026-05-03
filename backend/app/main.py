from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.projects.routes import router as project_router
from app.tasks.routes import router as task_router
from app.dashboard.routes import router as dashboard_router
from app.db import engine
from app.models import Base
import os

app = FastAPI(
    title="Team Task Manager API",
    description="Full-stack task management system with role-based access control",
    version="1.0.0"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# In production, set CORS_ORIGINS env var to your Railway frontend URL
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DATABASE SETUP ───────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── ROUTERS ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(task_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Team Task Manager API running", "docs": "/docs"}