# QGenAI - Knowledge Navigator

QGenAI is a modern SaaS application that allows users to upload internal business documents and query them to receive sourced answers and summaries. It implements robust Retrieval Augmented Generation (RAG) with mandatory source citation to address user pain points around AI inaccuracy, relevance, and trust.

## Features

- **Secure Document Ingestion**: Upload PDF and TXT files, process them into searchable chunks with vector embeddings.
- **Document Querying (RAG)**: Submit natural language queries against your document collection.
- **Sourced Response Generation**: Get answers strictly based on your documents with citations for every piece of information.
- **User Interface**: Simple, responsive interface for document management and querying.
- **Multiple LLM Support**: Use OpenAI, Google Gemini, or local Ollama models.

## Technology Stack

### Backend
- Python with FastAPI
- SQLite (default) or PostgreSQL for relational data
- ChromaDB for vector database
- LangChain for RAG pipeline orchestration
- Multiple LLM providers:
  - OpenAI API
  - Google Gemini
  - Ollama (local models)

### Frontend
- React with Vite
- Tailwind CSS for responsive design
- React Router for navigation
- React Query for state management

## Project Structure

```
qgenai/
├── backend/
│   ├── app/
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Core configuration
│   │   ├── db/         # Database models and session
│   │   ├── rag/        # RAG implementation
│   │   └── schemas/    # Pydantic schemas
│   ├── main.py         # Application entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   ├── public/
│   ├── index.html
│   └── package.json
└── start.sh            # Startup script
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- uv (Python package installer)
- API key for your chosen LLM provider (OpenAI, Google, or Ollama running locally)

### Quick Start

The easiest way to get started is to use the provided start script:

```bash
# Make the script executable
chmod +x start.sh

# Run the application
./start.sh
```

This will:
1. Create a Python virtual environment if needed
2. Install backend dependencies using uv
3. Start the backend server
4. Install frontend dependencies
5. Start the frontend development server

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies using uv:
   ```bash
   uv pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
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

5. Run the backend server:
   ```bash
   python main.py
   # Or alternatively:
   # uvicorn main:app --reload
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Register a new account or log in to an existing account.
2. Upload your documents (PDF or TXT files).
3. Wait for the documents to be processed.
4. Navigate to the Query page to ask questions about your documents.
5. View the answers with citations to your source documents.

## Configuration Options

### LLM Providers

You can configure different LLM providers in the `.env` file:

```
# OpenAI
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=your-openai-api-key

# Google Gemini
LLM_PROVIDER=google
GOOGLE_MODEL=gemini-pro
GOOGLE_API_KEY=your-google-api-key

# Ollama (local)
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama2
OLLAMA_URL=http://localhost:11434
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [LangChain](https://langchain.readthedocs.io/)
- [ChromaDB](https://www.trychroma.com/)
- [OpenAI](https://openai.com/)
- [Google Gemini](https://ai.google.dev/)
- [Ollama](https://ollama.ai/)
