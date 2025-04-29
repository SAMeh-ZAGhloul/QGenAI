import os
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Document, User
from app.db.session import get_db
from app.schemas.document import Document as DocumentSchema, DocumentCreate
from app.api.deps import get_current_user
from app.rag.document_processor import process_document

router = APIRouter()

@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Upload a document for processing.
    """
    # Check file type
    content_type = file.content_type
    if content_type not in ["application/pdf", "text/plain"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files are supported"
        )

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, unique_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create document record
    document = Document(
        filename=file.filename,
        file_path=file_path,
        content_type=content_type,
        size=os.path.getsize(file_path),
        processed=False,
        owner_id=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Process the document in the background
    # In a production environment, this would be done asynchronously
    # For simplicity, we'll do it synchronously here
    process_document(document, db)

    return document

@router.get("/", response_model=List[DocumentSchema])
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all documents for the current user.
    """
    documents = db.query(Document).filter(Document.owner_id == current_user.id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentSchema)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return document

@router.get("/{document_id}/status", response_model=dict)
def get_document_status(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get the processing status of a document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return {
        "id": document.id,
        "filename": document.filename,
        "processed": document.processed,
        "processing_progress": document.processing_progress,
        "processing_status": document.processing_status
    }

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete the file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete the document from the database
    db.delete(document)
    db.commit()
