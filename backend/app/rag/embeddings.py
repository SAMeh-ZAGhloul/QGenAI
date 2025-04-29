from typing import List
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings

def get_embeddings():
    """Get the embedding model."""
    return OpenAIEmbeddings(
        model=settings.EMBEDDING_MODEL,
        openai_api_key=settings.OPENAI_API_KEY
    )

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    embeddings = get_embeddings()
    return embeddings.embed_documents(texts)
