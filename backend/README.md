# QGenAI Backend

This is the backend service for QGenAI, a document-based question answering system using Retrieval Augmented Generation (RAG).

## Architecture

The backend is built with FastAPI and follows a modular architecture:

- **API Layer**: Handles HTTP requests and responses
- **Core**: Contains configuration and security utilities
- **Database**: Models and session management
- **RAG**: Implements the Retrieval Augmented Generation pipeline
- **Schemas**: Pydantic models for data validation

## Setup

### Prerequisites

- Python 3.9+
- uv (Python package installer)
- API key for your chosen LLM provider (OpenAI, Google, or Ollama running locally)

### Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies using uv:
   ```bash
   uv pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   # Database
   DATABASE_URL=sqlite:///./app.db
   
   # Security
   SECRET_KEY=your-secret-key-for-jwt
   
   # LLM Configuration
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_API_KEY=your-google-api-key
   LLM_PROVIDER=google  # openai, google, ollama
   GOOGLE_MODEL=gemini-pro
   ```

### Running the Server

```bash
python main.py
```

Or alternatively:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get access token

### Documents

- `POST /api/v1/documents/upload`: Upload a document
- `GET /api/v1/documents/`: List all documents
- `GET /api/v1/documents/{document_id}`: Get document details
- `GET /api/v1/documents/{document_id}/status`: Get document processing status
- `DELETE /api/v1/documents/{document_id}`: Delete a document

### Queries

- `POST /api/v1/queries/`: Submit a query
- `GET /api/v1/queries/`: List all queries
- `GET /api/v1/queries/{query_id}`: Get query details

## LLM Configuration

The backend supports multiple LLM providers:

### OpenAI

```
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=your-openai-api-key
```

### Google Gemini

```
LLM_PROVIDER=google
GOOGLE_MODEL=gemini-pro
GOOGLE_API_KEY=your-google-api-key
```

### Ollama (local)

```
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama2
OLLAMA_URL=http://localhost:11434
```

## Development

### Adding a New Endpoint

1. Create a new router in `app/api/`
2. Add the router to `app/api/__init__.py`
3. Implement the endpoint logic
4. Add appropriate schemas in `app/schemas/`

### Adding a New LLM Provider

1. Update the `app/rag/query_engine.py` file
2. Add the new provider to the configuration in `app/core/config.py`
3. Update the environment variables in `.env`
