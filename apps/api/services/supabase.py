"""Supabase client and storage operations."""

from typing import Generator

from supabase import Client, create_client
from settings import settings


class SupabaseService:
    """
    Singleton service for Supabase client operations.

    This service manages the Supabase client lifecycle and provides
    methods for interacting with Supabase Storage and other services.
    """

    _instance: "SupabaseService | None" = None
    _client: Client | None = None

    def __new__(cls) -> "SupabaseService":
        """Ensure only one instance exists."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self) -> None:
        """
        Initialize the Supabase client.

        Raises:
            ValueError: If Supabase credentials are not configured
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "Supabase credentials not configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            )

        if self._client is None:
            try:
                self._client = create_client(
                    settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
                )
                print("✓ Supabase service initialized")
            except ValueError as e:
                # Log warning but don't fail startup if Supabase is not configured
                # This allows the app to run without Supabase (e.g., for development)
                print(f"⚠ Warning: Supabase not initialized: {e}")

    def get_client(self) -> Client:
        """
        Get the Supabase client instance.

        Returns:
            Supabase client

        Raises:
            ValueError: If client has not been initialized
        """
        if self._client is None:
            raise ValueError(
                "Supabase client not initialized. "
                "Call initialize() first or ensure lifespan event runs."
            )
        return self._client

    def is_initialized(self) -> bool:
        """Check if the client has been initialized."""
        return self._client is not None


# Create global instance
supabase_service = SupabaseService()


def get_supabase() -> Generator[Client, None, None]:
    """
    FastAPI dependency to get Supabase client.

    Yields:
        Supabase client instance

    Raises:
        ValueError: If Supabase client is not initialized
    """
    client = supabase_service.get_client()
    yield client


def generate_signed_url(file_path: str, expires_in: int = 3600) -> str:
    """Generate a signed URL for a file."""
    client = supabase_service.get_client()
    try:
        response = client.storage.from_(
            settings.SUPABASE_BUCKET_NAME
        ).create_signed_url(
            file_path,
            expires_in=expires_in,
            options={
                "download": True,
            },
        )
        signed_url = response.get("signedURL", "")
    except Exception as e:
        raise Exception(f"Failed to generate signed URL: {str(e)}")
    return signed_url


def delete_storage_files(file_paths: list[str]) -> None:
    """Delete a file from Supabase Storage."""
    client = supabase_service.get_client()
    try:
        client.storage.from_(settings.SUPABASE_BUCKET_NAME).remove(file_paths)
    except Exception as e:
        raise Exception(f"Failed to delete file: {str(e)}")
