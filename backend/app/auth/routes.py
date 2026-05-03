from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserLogin
from .utils import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == user.email).first()
    if exists:
        raise HTTPException(400, "Email already registered")

    hashed = hash_password(user.password)
    new_user = User(name=user.name, email=user.email, password=hashed, role=UserRole.member)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Return token on signup so frontend can auto-login
    token = create_token({
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role.value,
        "name": new_user.name
    })
    return {"message": "Signup successful", "access_token": token, "role": new_user.role.value}


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(400, "Invalid credentials")

    token = create_token({
        "id": user.id,
        "email": user.email,
        "role": user.role.value if user.role else "member",
        "name": user.name
    })

    return {
        "access_token": token,
        "role": user.role.value if user.role else "member",
        "name": user.name,
        "user_id": user.id
    }