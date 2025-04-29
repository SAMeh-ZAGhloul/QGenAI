import os
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings

from app.core.config import settings as app_settings
from app.rag.embeddings import get_embeddings

# Initialize ChromaDB
def get_chroma_client():
    """Get the ChromaDB client."""
    return chromadb.Client(Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=app_settings.VECTOR_DB_PATH
    ))

def get_collection():
    """Get the ChromaDB collection."""
    client = get_chroma_client()
    # Create collection if it doesn't exist
    try:
        collection = client.get_collection("document_chunks")
    except ValueError:
        # Collection doesn't exist, create it
        collection = client.create_collection(
            name="document_chunks",
            embedding_function=get_embeddings()
        )
    return collection

def add_chunks_to_vector_store(
    texts: List[str],
    ids: List[str],
    metadatas: List[Dict[str, Any]]
) -> None:
    """Add document chunks to the vector store."""
    collection = get_collection()
    
    # Add documents to collection
    collection.add(
        documents=texts,
        ids=ids,
        metadatas=metadatas
    )
    
    # Persist the collection
    client = get_chroma_client()
    client.persist()

def query_vector_store(
    query_text: str,
    n_results: int = 5,
    filter_dict: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """Query the vector store for relevant document chunks."""
    collection = get_collection()
    
    # Query the collection
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        where=filter_dict
    )
    
    # Format results
    formatted_results = []
    for i in range(len(results["ids"][0])):
        formatted_results.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i] if "distances" in results else None
        })
    
    return formatted_results
