from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get the current user from the token.
    """
    print(f"Authenticating user with token: {token[:10]}...")

    try:
        # Verify the secret key is not empty
        if not settings.SECRET_KEY or settings.SECRET_KEY == "your-secret-key-for-jwt":
            print("WARNING: Using default or empty SECRET_KEY for token validation. This is insecure!")

        # Decode the token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        print(f"Token decoded successfully. Payload: {payload}")

        token_data = TokenPayload(**payload)
        print(f"User ID from token: {token_data.sub}")

    except JWTError as jwt_error:
        print(f"JWT Error: {str(jwt_error)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Could not validate credentials: {str(jwt_error)}",
        )
    except ValidationError as val_error:
        print(f"Validation Error: {str(val_error)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid token payload: {str(val_error)}",
        )
    except Exception as e:
        print(f"Unexpected error during token validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}",
        )

    # Get user from database
    try:
        user = db.query(User).filter(User.id == token_data.sub).first()

        if not user:
            print(f"User not found with ID: {token_data.sub}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not user.is_active:
            print(f"User is inactive: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        print(f"Authentication successful for user: {user.email}")
        return user

    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error during user lookup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )
