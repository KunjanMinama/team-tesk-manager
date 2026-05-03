from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from ..db import get_db
from ..models import Task, Project, ProjectMember, TaskStatus, User
from ..auth.dependancies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def check_membership(db, project_id, user_id):
    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()


@router.get("/{project_id}")
def project_dashboard(
    project_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user["id"]

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # Allow admin OR member
    is_admin = project.admin_id == user_id
    member = check_membership(db, project_id, user_id)

    if not is_admin and not member:
        raise HTTPException(403, "You are not a member of this project")

    today = date.today()

    total_tasks = db.query(Task).filter(Task.project_id == project_id).count()

    todo = db.query(Task).filter(
        Task.project_id == project_id, Task.status == TaskStatus.todo
    ).count()

    in_progress = db.query(Task).filter(
        Task.project_id == project_id, Task.status == TaskStatus.in_progress
    ).count()

    done = db.query(Task).filter(
        Task.project_id == project_id, Task.status == TaskStatus.done
    ).count()

    overdue = db.query(Task).filter(
        Task.project_id == project_id,
        Task.due_date < today,
        Task.status != TaskStatus.done
    ).count()

    # Tasks per user — only members of THIS project
    project_members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    tasks_per_user = []
    for pm in project_members:
        u = db.query(User).filter(User.id == pm.user_id).first()
        if u:
            count = db.query(Task).filter(
                Task.project_id == project_id,
                Task.assigned_to == u.id
            ).count()
            tasks_per_user.append({
                "user_id": u.id,
                "name": u.name,
                "tasks": count
            })

    return {
        "project_name": project.name,
        "total_tasks": total_tasks,
        "status_breakdown": {
            "todo": todo,
            "in_progress": in_progress,
            "done": done,
        },
        "overdue": overdue,
        "tasks_per_user": tasks_per_user
    }