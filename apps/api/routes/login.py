"""Login routes."""

from fastapi import APIRouter, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import SQLModel
from services.supabase import supabase_service

router = APIRouter(prefix="/login", tags=["login"])

# Security scheme for Bearer token
security = HTTPBearer()


class UserLogin(SQLModel):
    """User information login model."""

    email: str
    password: str


class AccessToken(SQLModel):
    """User information response model."""

    access_token: str


@router.post("/access-token", response_model=AccessToken)
def login(
    user_login: UserLogin,
) -> AccessToken:
    """
    sign in with email and password and return access token.

    Args:
        user_login: UserLogin model containing email and password

    Returns:
        UserInfo: User information from Supabase

    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        client = supabase_service.get_client()
        response = client.auth.sign_in_with_password(
            {"email": user_login.email, "password": user_login.password}
        )

        session = response.session

        return AccessToken(
            access_token=session.access_token,
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    except Exception as e:
        # Other errors (e.g., token verification failed)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
