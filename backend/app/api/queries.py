from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Query, User
from app.db.session import get_db
from app.schemas.query import Query as QuerySchema, QueryBase, QueryResponse
from app.api.deps import get_current_user
from app.rag.query_engine import process_query

router = APIRouter()

@router.post("/", response_model=QueryResponse)
def create_query(
    query_in: QueryBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new query and get a response.
    """
    # Process the query
    result = process_query(query_in.query_text, current_user.id, db)
    
    return result

@router.get("/", response_model=List[QuerySchema])
def get_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all queries for the current user.
    """
    queries = db.query(Query).filter(Query.user_id == current_user.id).all()
    return queries

@router.get("/{query_id}", response_model=QuerySchema)
def get_query(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific query.
    """
    query = db.query(Query).filter(
        Query.id == query_id,
        Query.user_id == current_user.id
    ).first()
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    return query
