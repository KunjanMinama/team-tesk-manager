from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Project, ProjectMember, User, UserRole
from ..schemas import ProjectCreate, ProjectOut, UserOut
from ..auth.dependancies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/")
def create_project(
    project: ProjectCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_project = Project(
        name=project.name,
        description=project.description,
        admin_id=user["id"]
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Auto-add creator as a member
    member = ProjectMember(user_id=user["id"], project_id=new_project.id)
    db.add(member)
    db.commit()

    return {"message": "Project created", "project_id": new_project.id, "project": {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "admin_id": new_project.admin_id
    }}


@router.post("/{project_id}/add-member")
def add_member(
    project_id: int,
    email: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    if project.admin_id != user["id"]:
        raise HTTPException(403, "Only project admin can add members")

    new_user = db.query(User).filter(User.email == email).first()
    if not new_user:
        raise HTTPException(404, "User not found with that email")

    # Check if already a member
    existing = db.query(ProjectMember).filter(
        ProjectMember.user_id == new_user.id,
        ProjectMember.project_id == project_id
    ).first()
    if existing:
        raise HTTPException(400, "User is already a member")

    db.add(ProjectMember(user_id=new_user.id, project_id=project_id))
    db.commit()

    return {"message": f"{new_user.name} added as member"}


@router.delete("/{project_id}/remove-member/{user_id}")
def remove_member(
    project_id: int,
    user_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    if project.admin_id != user["id"]:
        raise HTTPException(403, "Only project admin can remove members")

    if user_id == project.admin_id:
        raise HTTPException(400, "Cannot remove the project admin")

    db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).delete()
    db.commit()

    return {"message": "Member removed successfully"}


@router.get("/my-projects")
def my_projects(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(ProjectMember).filter(
        ProjectMember.user_id == user["id"]
    ).all()

    projects = []
    for m in memberships:
        project = db.query(Project).filter(Project.id == m.project_id).first()
        if project:
            projects.append({
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "admin_id": project.admin_id,
                "is_admin": project.admin_id == user["id"]
            })

    return {"projects": projects}


@router.get("/members/{project_id}")
def project_members(
    project_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify requester is a member
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user["id"]
    ).first()
    if not membership:
        raise HTTPException(403, "Not a member of this project")

    members_db = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    result = []
    for m in members_db:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            result.append({"id": u.id, "name": u.name, "email": u.email})

    return {"members": result}


@router.get("/{project_id}")
def get_project(
    project_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # Verify membership
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user["id"]
    ).first()
    if not membership:
        raise HTTPException(403, "Not a member of this project")

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "admin_id": project.admin_id,
        "is_admin": project.admin_id == user["id"]
    }