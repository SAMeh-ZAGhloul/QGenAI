from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    documents = relationship("Document", back_populates="owner")
    queries = relationship("Query", back_populates="user")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_path = Column(String)
    content_type = Column(String)
    size = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)
    processing_progress = Column(Integer, default=0)  # Progress percentage (0-100)
    processing_status = Column(String, default="pending")  # pending, processing, completed, error
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String, index=True)
    content = Column(Text)
    page_number = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"))

    document = relationship("Document", back_populates="chunks")

class Query(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text)
    response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="queries")
    sources = relationship("QuerySource", back_populates="query")

class QuerySource(Base):
    __tablename__ = "query_sources"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String)
    document_id = Column(Integer, ForeignKey("documents.id"))
    query_id = Column(Integer, ForeignKey("queries.id"))

    query = relationship("Query", back_populates="sources")
