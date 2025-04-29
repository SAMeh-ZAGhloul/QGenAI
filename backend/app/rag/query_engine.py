from typing import List, Dict, Any, Tuple
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser

from app.core.config import settings
from app.rag.vector_store import query_vector_store
from app.db.models import Query, QuerySource, Document
from sqlalchemy.orm import Session

def process_query(query_text: str, user_id: int, db: Session) -> Dict[str, Any]:
    """
    Process a user query using RAG.
    
    This is the core RAG implementation with mandatory source citation.
    """
    # Retrieve relevant chunks from vector store
    relevant_chunks = query_vector_store(query_text, n_results=5)
    
    if not relevant_chunks:
        return {
            "answer": "I couldn't find any relevant information in your documents to answer this query.",
            "sources": []
        }
    
    # Format chunks for the prompt
    formatted_chunks = []
    for chunk in relevant_chunks:
        doc_name = chunk["metadata"]["document_name"]
        page_info = f"Page {chunk['metadata']['page_number']}" if chunk["metadata"]["page_number"] else ""
        section_info = f"Section: {chunk['metadata']['section']}" if chunk["metadata"]["section"] else ""
        location = f"{page_info} {section_info}".strip()
        
        formatted_chunk = f"Document: {doc_name}\n"
        if location:
            formatted_chunk += f"Location: {location}\n"
        formatted_chunk += f"Content: {chunk['text']}\n\n"
        
        formatted_chunks.append(formatted_chunk)
    
    # Create the prompt
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

    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])
    
    # Initialize the LLM
    llm = ChatOpenAI(
        model=settings.LLM_MODEL,
        temperature=0,
        openai_api_key=settings.OPENAI_API_KEY
    )
    
    # Create the chain
    chain = prompt | llm | StrOutputParser()
    
    # Run the chain
    answer = chain.invoke({
        "context": "\n".join(formatted_chunks),
        "question": query_text
    })
    
    # Save the query and response to the database
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
                "page_number": chunk["metadata"]["page_number"],
                "section": chunk["metadata"]["section"],
                "content": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
            })
    
    db.commit()
    
    return {
        "answer": answer,
        "sources": sources_data
    }
