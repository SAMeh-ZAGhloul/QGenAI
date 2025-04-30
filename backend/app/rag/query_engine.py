from typing import List, Dict, Any, Tuple
import requests
import logging
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain.chat_models.base import BaseChatModel

from app.core.config import settings
from app.rag.vector_store import query_vector_store
from app.db.models import Query, QuerySource, Document
from sqlalchemy.orm import Session

# Set up logging
logger = logging.getLogger(__name__)

class OllamaLLM(BaseChatModel):
    """Custom LLM class for Ollama integration."""

    def __init__(self, model_name: str = None, temperature: float = 0, base_url: str = None):
        """Initialize the Ollama LLM.

        Args:
            model_name: Name of the Ollama model to use
            temperature: Temperature for generation (0-1)
            base_url: Base URL for the Ollama API
        """
        super().__init__()
        self.model_name = model_name or settings.OLLAMA_MODEL
        self.temperature = temperature
        self.base_url = base_url or settings.OLLAMA_URL

    def _generate(self, messages, **_):
        """Generate a response from the Ollama API."""
        try:
            # Format messages for Ollama (ignore unused parameters for compatibility)
            prompt = "\n".join([f"{m.type}: {m.content}" for m in messages])

            # Make API request
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "temperature": self.temperature,
                }
            )

            # Check for errors
            if response.status_code != 200:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                raise Exception(f"Ollama API error: {response.text}")

            # Return the response
            return response.json()["response"]

        except Exception as e:
            logger.error(f"Error generating response with Ollama: {str(e)}")
            raise

def get_llm() -> BaseChatModel:
    """Get the appropriate LLM based on configuration settings."""
    try:
        if settings.LLM_PROVIDER == "openai":
            logger.info(f"Using OpenAI model: {settings.LLM_MODEL}")
            return ChatOpenAI(
                model=settings.LLM_MODEL,
                temperature=0,
                openai_api_key=settings.OPENAI_API_KEY
            )
        elif settings.LLM_PROVIDER == "google":
            logger.info(f"Using Google model: {settings.GOOGLE_MODEL}")
            return ChatGoogleGenerativeAI(
                model=settings.GOOGLE_MODEL,
                temperature=0,
                google_api_key=settings.GOOGLE_API_KEY
            )
        elif settings.LLM_PROVIDER == "ollama":
            logger.info(f"Using Ollama model: {settings.OLLAMA_MODEL}")
            return OllamaLLM(
                model_name=settings.OLLAMA_MODEL,
                temperature=0,
                base_url=settings.OLLAMA_URL
            )
        else:
            # Default to OpenAI if provider is not recognized
            logger.warning(f"Unknown LLM provider: {settings.LLM_PROVIDER}. Defaulting to OpenAI.")
            return ChatOpenAI(
                model=settings.LLM_MODEL,
                temperature=0,
                openai_api_key=settings.OPENAI_API_KEY
            )
    except Exception as e:
        logger.error(f"Error initializing LLM: {str(e)}")
        raise

def format_chunks(chunks: List[Dict[str, Any]]) -> List[str]:
    """Format document chunks for the prompt."""
    formatted_chunks = []

    for chunk in chunks:
        doc_name = chunk["metadata"]["document_name"]
        page_info = f"Page {chunk['metadata']['page_number']}" if chunk['metadata'].get("page_number") else ""
        section_info = f"Section: {chunk['metadata']['section']}" if chunk['metadata'].get("section") else ""
        location = f"{page_info} {section_info}".strip()

        formatted_chunk = f"Document: {doc_name}\n"
        if location:
            formatted_chunk += f"Location: {location}\n"
        formatted_chunk += f"Content: {chunk['text']}\n\n"

        formatted_chunks.append(formatted_chunk)

    return formatted_chunks

def get_rag_prompt() -> ChatPromptTemplate:
    """Get the RAG prompt template."""
    system_prompt = """You are a helpful assistant that answers questions based ONLY on the provided document chunks.
Your task is to provide accurate answers with citations for every piece of information.

IMPORTANT RULES:
1. ONLY use information from the provided document chunks to answer the question.
2. If the answer cannot be found in the provided chunks, respond with: "I couldn't find information about this in your documents."
3. DO NOT make up or infer information that is not explicitly stated in the chunks.
4. ALWAYS cite your sources using the format [Document Name - Location] after each statement.
5. If multiple chunks from the same document support a statement, include all relevant citations.
6. Organize your answer in a clear, concise manner.
7. If the chunks contain conflicting information, acknowledge this and present both viewpoints with their respective citations.

Format your response as follows:
1. A direct answer to the question based only on the provided chunks
2. Include inline citations for every piece of information using [Document Name - Location] format
"""

    human_prompt = """
Here are the relevant document chunks:

{context}

Question: {question}

Remember to ONLY use information from these chunks and include citations for every piece of information.
"""

    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])

def save_query_to_db(
    query_text: str,
    answer: str,
    user_id: int,
    relevant_chunks: List[Dict[str, Any]],
    db: Session
) -> Tuple[Query, List[Dict[str, Any]]]:
    """Save the query, response, and sources to the database."""
    # Save the query and response
    db_query = Query(
        query_text=query_text,
        response=answer,
        user_id=user_id
    )
    db.add(db_query)
    db.flush()  # Get the query ID

    # Save the sources
    sources_data = []
    for chunk in relevant_chunks:
        # Get the document
        document_id = chunk["metadata"]["document_id"]
        document = db.query(Document).filter(Document.id == document_id).first()

        if document:
            # Create a query source
            query_source = QuerySource(
                chunk_id=chunk["id"],
                document_id=document_id,
                query_id=db_query.id
            )
            db.add(query_source)

            # Add to sources data for response
            sources_data.append({
                "document_name": document.filename,
                "chunk_id": chunk["id"],
                "page_number": chunk["metadata"].get("page_number"),
                "section": chunk["metadata"].get("section"),
                "content": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
            })

    db.commit()
    return db_query, sources_data

def process_query(query_text: str, user_id: int, db: Session) -> Dict[str, Any]:
    """
    Process a user query using RAG.

    This is the core RAG implementation with mandatory source citation.
    """
    try:
        # Retrieve relevant chunks from vector store
        relevant_chunks = query_vector_store(query_text, n_results=5)

        if not relevant_chunks:
            return {
                "answer": "I couldn't find any relevant information in your documents to answer this query.",
                "sources": []
            }

        # Format chunks for the prompt
        formatted_chunks = format_chunks(relevant_chunks)

        # Get the prompt template
        prompt = get_rag_prompt()

        # Get the LLM
        llm = get_llm()

        # Create the chain
        chain = prompt | llm | StrOutputParser()

        # Run the chain
        answer = chain.invoke({
            "context": "\n".join(formatted_chunks),
            "question": query_text
        })

        # Save to database
        _, sources_data = save_query_to_db(query_text, answer, user_id, relevant_chunks, db)

        return {
            "answer": answer,
            "sources": sources_data
        }

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        # Return a graceful error message
        return {
            "answer": f"I encountered an error while processing your query. Please try again later.",
            "sources": [],
            "error": str(e)
        }
