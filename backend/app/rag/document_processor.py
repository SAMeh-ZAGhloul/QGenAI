import os
import tempfile
from typing import List, Dict, Any, Tuple
from pathlib import Path

from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.db.models import Document, DocumentChunk
from app.rag.embeddings import get_embeddings
from app.rag.vector_store import add_chunks_to_vector_store

def process_document(document: Document, db) -> bool:
    """Process a document by extracting text, splitting into chunks, and storing in vector DB."""
    try:
        # Extract text from document
        text = extract_text(document.file_path, document.content_type)
        
        # Split text into chunks
        chunks = split_text(text)
        
        # Create document chunks in database
        db_chunks = []
        for i, chunk in enumerate(chunks):
            # Determine page number or section if possible
            page_number = chunk.get("page_number")
            section = chunk.get("section", "")
            
            # Create a unique chunk ID
            chunk_id = f"{document.id}-chunk-{i}"
            
            # Create database record
            db_chunk = DocumentChunk(
                chunk_id=chunk_id,
                content=chunk["text"],
                page_number=page_number,
                section=section,
                document_id=document.id
            )
            db.add(db_chunk)
            db_chunks.append(db_chunk)
        
        # Generate embeddings and store in vector DB
        chunk_texts = [chunk.content for chunk in db_chunks]
        chunk_ids = [chunk.chunk_id for chunk in db_chunks]
        chunk_metadata = [
            {
                "document_id": document.id,
                "document_name": document.filename,
                "chunk_id": chunk.chunk_id,
                "page_number": chunk.page_number,
                "section": chunk.section
            }
            for chunk in db_chunks
        ]
        
        # Add chunks to vector store
        add_chunks_to_vector_store(chunk_texts, chunk_ids, chunk_metadata)
        
        # Mark document as processed
        document.processed = True
        db.commit()
        
        return True
    except Exception as e:
        print(f"Error processing document: {e}")
        db.rollback()
        return False

def extract_text(file_path: str, content_type: str) -> str:
    """Extract text from a document file."""
    if content_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif content_type == "text/plain":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported content type: {content_type}")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(file_path)
    text = ""
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += f"[Page {i+1}]\n{page_text}\n\n"
    return text

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from a text file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def split_text(text: str) -> List[Dict[str, Any]]:
    """Split text into chunks with metadata."""
    # Create a text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    # Split the text
    chunks = []
    
    # Check if text has page markers
    if "[Page " in text:
        # Split by page
        pages = text.split("[Page ")
        current_page = 1
        
        for page in pages[1:]:  # Skip the first empty split
            # Extract page number
            page_parts = page.split("]", 1)
            if len(page_parts) == 2:
                try:
                    page_number = int(page_parts[0])
                    page_content = page_parts[1]
                    
                    # Split the page content
                    page_chunks = text_splitter.create_documents([page_content])
                    
                    # Add chunks with page metadata
                    for chunk in page_chunks:
                        chunks.append({
                            "text": chunk.page_content,
                            "page_number": page_number,
                            "section": ""
                        })
                except ValueError:
                    # If page number parsing fails, just use the current page counter
                    page_content = page
                    page_chunks = text_splitter.create_documents([page_content])
                    
                    for chunk in page_chunks:
                        chunks.append({
                            "text": chunk.page_content,
                            "page_number": current_page,
                            "section": ""
                        })
                    
                    current_page += 1
    else:
        # No page markers, just split the text
        raw_chunks = text_splitter.create_documents([text])
        
        for chunk in raw_chunks:
            chunks.append({
                "text": chunk.page_content,
                "page_number": None,
                "section": ""
            })
    
    return chunks
