from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Department
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if (
        settings.ENVIRONMENT.lower() == "production"
        and user_in.role == "FACULTY"
        and not settings.ALLOW_FACULTY_REGISTRATION
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty accounts must be provisioned by an administrator.",
        )

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role,
        identifier=user_in.identifier,
        department_id=user_in.department_id,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.full_name}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    dept_name = user.department.name if user.department else "General"
    
    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        identifier=user.identifier,
        department_id=user.department_id,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        department_name=dept_name
    )
    return {"access_token": token, "token_type": "bearer", "user": user_out}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )
    
    token = create_access_token(subject=user.id, role=user.role)
    dept_name = user.department.name if user.department else "General"

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        identifier=user.identifier,
        department_id=user.department_id,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        department_name=dept_name
    )
    return {"access_token": token, "token_type": "bearer", "user": user_out}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    dept_name = current_user.department.name if current_user.department else "General"
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        identifier=current_user.identifier,
        department_id=current_user.department_id,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        department_name=dept_name
    )

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in depts]
