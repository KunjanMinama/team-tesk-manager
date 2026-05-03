from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# ─── REQUEST SCHEMAS ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    due_date: date
    priority: str
    assigned_to: int

class TaskStatusUpdate(BaseModel):
    status: str

# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    admin_id: int

    class Config:
        from_attributes = True

class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    due_date: Optional[date]
    priority: str
    status: str
    project_id: int
    assigned_to: Optional[int]

    class Config:
        from_attributes = True