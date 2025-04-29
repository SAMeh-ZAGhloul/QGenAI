from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class DocumentChunkBase(BaseModel):
    chunk_id: str
    content: str
    page_number: Optional[int] = None
    section: Optional[str] = None

class DocumentChunkCreate(DocumentChunkBase):
    document_id: int

class DocumentChunk(DocumentChunkBase):
    id: int
    document_id: int

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    filename: str
    content_type: str
    size: int

class DocumentCreate(DocumentBase):
    file_path: str
    owner_id: int

class Document(DocumentBase):
    id: int
    file_path: str
    created_at: datetime
    processed: bool
    owner_id: int
    
    class Config:
        from_attributes = True

class DocumentWithChunks(Document):
    chunks: List[DocumentChunk] = []
    
    class Config:
        from_attributes = True
