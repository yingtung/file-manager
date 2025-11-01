"""SQLModel models for the application."""

from datetime import datetime, timezone
from enum import Enum
from typing import Generic, List, Optional, TypeVar
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field
from pydantic.generics import GenericModel


def get_utc_now() -> datetime:
    """Helper function to get current UTC time."""
    return datetime.now(tz=timezone.utc)


class FileBase(SQLModel):
    """Base file model with common fields."""

    storage_path: Optional[str] = Field(
        default=None, description="the path to the file in the storage"
    )
    name: str = Field(description="Original file name")
    size: Optional[float] = Field(default=None, description="File size in bytes")
    mime_type: Optional[str] = Field(default=None, description="MIME type of the file")
    uploaded_at: Optional[datetime] = Field(
        default=None, description="Time when the file was uploaded"
    )


class File(FileBase, table=True):
    """File model representing a database table."""

    __tablename__ = "files"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=get_utc_now)
    owner_id: Optional[UUID] = Field(
        default=None, description="ID of the user who uploaded the file"
    )


class FileCreate(FileBase):
    """Schema for creating a new file."""

    pass


class FileRead(FileBase):
    """Schema for reading a file."""

    id: UUID
    created_at: datetime
    owner_id: Optional[UUID] = Field(
        default=None, description="ID of the user who uploaded the file"
    )


class FileUpdate(SQLModel):
    """Schema for updating a file."""

    name: Optional[str] = None


class FileBulkDelete(SQLModel):
    """Schema for bulk deleting files."""

    file_ids: List[str] = Field(description="IDs of the files to delete")


class SortField(str, Enum):
    """Valid sort fields for files."""

    CREATED_AT = "created_at"
    NAME = "name"
    SIZE = "size"


class SortDirection(str, Enum):
    """Valid sort directions."""

    ASC = "asc"
    DESC = "desc"


_ModelType = TypeVar("_ModelType", bound=SQLModel)


class PaginationParams(SQLModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(
        default=10, ge=1, le=100, description="Number of items per page"
    )


class Pagination(GenericModel, Generic[_ModelType]):
    """Pagination response model."""

    data: List[_ModelType]
    total: int
    page: int
    page_size: int


class DownloadLink(SQLModel):
    signed_url: str = Field(description="the signed url to download the file")
    filename: str = Field(description="the original filename of the file")
