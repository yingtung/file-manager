"""File routes for CRUD operations."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func

from database import get_session
from dependencies import get_pagination_params, get_current_user_id
from models import (
    DownloadLink,
    File,
    FileCreate,
    FileRead,
    FileUpdate,
    Pagination,
    SortField,
    SortDirection,
)
from services.supabase import generate_signed_url, get_supabase
from supabase import Client

router = APIRouter(prefix="/file", tags=["file"])


@router.post("", response_model=FileRead, status_code=status.HTTP_201_CREATED)
def create_file(
    file: FileCreate,
    session: Session = Depends(get_session),
    owner_id: UUID = Depends(get_current_user_id),
) -> FileRead:
    """Create a new file record."""
    db_file = File(**file.model_dump())
    db_file.owner_id = owner_id
    session.add(db_file)
    session.commit()
    session.refresh(db_file)
    return db_file


@router.get("", response_model=Pagination[FileRead])
def read_files(
    user_id: str | None = None,
    sort_by: List[SortField] = Query(default=[SortField.CREATED_AT]),
    sort_order: List[SortDirection] = Query(default=[SortDirection.DESC]),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    session: Session = Depends(get_session),
) -> Pagination[FileRead]:
    """Get all files, optionally filtered by user_id and sorted by multiple fields."""
    skip, limit = pagination

    # Get total count
    count_statement = select(func.count(File.id))
    if user_id:
        count_statement = count_statement.where(File.owner_id == user_id)
    total = session.exec(count_statement).one()

    # Build query with sorting
    statement = select(File)
    if user_id:
        statement = statement.where(File.owner_id == user_id)

    if sort_by:
        order_fields = []
        for i, field in enumerate(sort_by):
            # Map field to actual column
            if field == SortField.CREATED_AT:
                order_field = File.created_at
            elif field == SortField.NAME:
                order_field = File.name
            elif field == SortField.SIZE:
                order_field = File.size
            else:
                order_field = File.created_at  # Default fallback

            # Get corresponding sort order, default to DESC if not enough provided
            if sort_order and i < len(sort_order):
                order = sort_order[i]
            else:
                order = SortDirection.DESC  # Default when not specified

            # Apply the sorting
            if order == SortDirection.ASC:
                order_fields.append(order_field.asc())
            else:
                order_fields.append(order_field.desc())

        # Apply all order_by clauses
        if order_fields:
            statement = statement.order_by(*order_fields)
    else:
        # Default sorting by created_at DESC if no sorting specified
        statement = statement.order_by(File.created_at.desc())

    # Apply pagination
    statement = statement.offset(skip).limit(limit)
    files = session.exec(statement).all()

    return Pagination(data=files, total=total, page=page, page_size=limit)


@router.get("/{file_id}", response_model=FileRead)
def read_file(file_id: UUID, session: Session = Depends(get_session)) -> FileRead:
    """Get a single file by ID."""
    file = session.get(File, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with id {file_id} not found",
        )
    return file


@router.put("/{file_id}", response_model=FileRead)
def update_file(
    file_id: UUID, file_update: FileUpdate, session: Session = Depends(get_session)
) -> FileRead:
    """Update a file record."""
    file = session.get(File, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with id {file_id} not found",
        )

    file_data = file_update.model_dump(exclude_unset=True)

    for key, value in file_data.items():
        setattr(file, key, value)

    session.add(file)
    session.commit()
    session.refresh(file)
    return file


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: UUID, session: Session = Depends(get_session)) -> None:
    """Delete a file record."""
    file = session.get(File, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with id {file_id} not found",
        )

    session.delete(file)
    session.commit()
    return None


@router.get("/{file_id}/download", response_model=DownloadLink)
def download_file(
    file_id: UUID,
    session: Session = Depends(get_session),
    supabase_client: Client = Depends(get_supabase),
) -> DownloadLink:
    """Generate a Supabase signed URL to download the file."""
    file = session.get(File, file_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with id {file_id} not found",
        )

    if not file.storage_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File does not have a storage path",
        )

    try:
        signed_url = generate_signed_url(file.storage_path, 3600)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}",
        )

    return DownloadLink(signed_url=signed_url, filename=file.name)
