from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from ..db import get_db
from ..models import Task, Project, ProjectMember, TaskStatus, User
from ..schemas import TaskCreate
from ..auth.dependancies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def serialize_task(task: Task, db: Session) -> dict:
    """Convert a Task ORM object to a JSON-serializable dict."""
    assigned_user = None
    if task.assigned_to:
        u = db.query(User).filter(User.id == task.assigned_to).first()
        if u:
            assigned_user = {"id": u.id, "name": u.name, "email": u.email}

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "due_date": str(task.due_date) if task.due_date else None,
        "priority": task.priority,
        "status": task.status.value if task.status else "To Do",
        "project_id": task.project_id,
        "assigned_to": task.assigned_to,
        "assigned_user": assigned_user,
    }


# ─── CREATE TASK (Admin only) ─────────────────────────────────────────────────
@router.post("/{project_id}/create")
def create_task(
    project_id: int,
    task: TaskCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    if project.admin_id != user["id"]:
        raise HTTPException(403, "Only the project admin can create tasks")

    # Verify assigned user is a project member
    assignee_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == task.assigned_to
    ).first()
    if not assignee_member:
        raise HTTPException(400, "Assigned user is not a member of this project")

    new_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        assigned_to=task.assigned_to,
        project_id=project_id,
        status=TaskStatus.todo
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {"message": "Task created successfully", "task": serialize_task(new_task, db)}


# ─── GET TASKS FOR A PROJECT ──────────────────────────────────────────────────
@router.get("/project/{project_id}")
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # Allow access for admin OR project members
    is_admin = project.admin_id == user["id"]
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user["id"]
    ).first()

    if not is_admin and not member:
        raise HTTPException(403, "Not a project member")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return {"tasks": [serialize_task(t, db) for t in tasks]}


# ─── UPDATE TASK STATUS ───────────────────────────────────────────────────────
@router.put("/{task_id}/status")
def update_task_status(
    task_id: int,
    status: str = Query(..., description="New status: 'To Do', 'In Progress', or 'Done'"),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    is_admin = project.admin_id == user["id"]
    is_assigned = task.assigned_to == user["id"]

    if not is_admin and not is_assigned:
        raise HTTPException(403, "Only the assigned user or project admin can update this task")

    # Map status string to enum
    status_map = {
        "To Do": TaskStatus.todo,
        "In Progress": TaskStatus.in_progress,
        "Done": TaskStatus.done,
    }
    if status not in status_map:
        raise HTTPException(400, f"Invalid status. Must be one of: {list(status_map.keys())}")

    task.status = status_map[status]
    db.commit()
    db.refresh(task)

    return {"message": "Status updated", "task": serialize_task(task, db)}


# ─── GET MY ASSIGNED TASKS ────────────────────────────────────────────────────
@router.get("/my-tasks")
def get_my_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == user["id"]).all()
    return {"tasks": [serialize_task(t, db) for t in tasks]}


# ─── GET OVERDUE TASKS FOR A PROJECT ─────────────────────────────────────────
@router.get("/overdue/{project_id}")
def overdue_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user["id"]
    ).first()
    is_admin = project.admin_id == user["id"]

    if not member and not is_admin:
        raise HTTPException(403, "Not a project member")

    today = date.today()
    overdue = db.query(Task).filter(
        Task.project_id == project_id,
        Task.due_date < today,
        Task.status != TaskStatus.done
    ).all()

    return {"overdue_tasks": [serialize_task(t, db) for t in overdue]}