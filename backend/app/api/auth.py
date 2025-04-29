from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models import User
from app.db.session import get_db
from app.schemas.user import Token, User as UserSchema, UserCreate

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    print(f"Login attempt with username: {form_data.username}")

    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        print(f"User not found with email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        print(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        print(f"User is inactive: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Verify the secret key is not empty
    if not settings.SECRET_KEY or settings.SECRET_KEY == "your-secret-key-for-jwt":
        print("WARNING: Using default or empty SECRET_KEY. This is insecure!")

    # Create the token
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Log token details (first 10 chars only for security)
    print(f"Generated token (first 10 chars): {access_token[:10]}...")
    print(f"Token expiration: {access_token_expires.total_seconds()/60} minutes")
    print(f"Login successful for user: {form_data.username}")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
