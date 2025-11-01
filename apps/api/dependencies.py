from typing import Tuple
from uuid import UUID

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.supabase import supabase_service


def get_pagination_params(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(
        default=10, ge=1, le=100, description="Number of items per page"
    ),
) -> Tuple[int, int]:
    """
    Dependency to convert page and page_size to skip and limit.

    Returns:
        Tuple of (skip, limit)
    """
    skip = (page - 1) * page_size
    return skip, page_size


# Security scheme for Bearer token
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """
    Dependency to extract and validate user ID from access token.

    Args:
        credentials: HTTP Bearer credentials containing the access token

    Returns:
        UUID: User ID from the access token

    Raises:
        HTTPException: If token is invalid or missing user ID
    """
    try:
        # Get Supabase client to verify the token
        client = supabase_service.get_client()

        # Verify the JWT token and get user info
        # The auth.get_user() method verifies the token and returns user information
        response = client.auth.get_user(credentials.credentials)

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Return the user
        return response.user

    except ValueError:
        # Invalid UUID format
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Other errors (e.g., token verification failed)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(user=Depends(get_current_user)):
    return UUID(user.id)
