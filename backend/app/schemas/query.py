from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class QuerySourceBase(BaseModel):
    chunk_id: str
    document_id: int

class QuerySourceCreate(QuerySourceBase):
    query_id: int

class QuerySource(QuerySourceBase):
    id: int
    query_id: int

    class Config:
        from_attributes = True

class QueryBase(BaseModel):
    query_text: str

class QueryCreate(QueryBase):
    user_id: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]

class Query(QueryBase):
    id: int
    response: str
    created_at: datetime
    user_id: int
    sources: List[QuerySource] = []

    class Config:
        from_attributes = True
