# Knowledge Navigator

Knowledge Navigator is a SaaS application that allows users to upload internal business documents and query them to receive sourced answers and summaries. It implements robust Retrieval Augmented Generation (RAG) with mandatory source citation to address user pain points around AI inaccuracy, relevance, and trust.

## Features

- **Secure Document Ingestion**: Upload PDF and TXT files, process them into searchable chunks with vector embeddings.
- **Document Querying (RAG)**: Submit natural language queries against your document collection.
- **Sourced Response Generation**: Get answers strictly based on your documents with citations for every piece of information.
- **User Interface**: Simple, responsive interface for document management and querying.

## Technology Stack

### Backend
- Python with FastAPI
- PostgreSQL for relational data
- ChromaDB for vector database
- LangChain for RAG pipeline orchestration
- OpenAI API for embeddings and LLM (configurable)

### Frontend
- React with Vite
- Tailwind CSS for responsive design
- React Router for navigation
- React Query for state management

## Project Structure

```
knowledge-navigator/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── rag/
│   │   └── schemas/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── public/
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost/knowledge_navigator
   SECRET_KEY=your-secret-key-for-jwt
   OPENAI_API_KEY=your-openai-api-key
   ```

5. Run the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Usage

1. Register a new account or log in to an existing account.
2. Upload your documents (PDF or TXT files).
3. Wait for the documents to be processed.
4. Navigate to the Query page to ask questions about your documents.
5. View the answers with citations to your source documents.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [LangChain](https://langchain.readthedocs.io/)
- [ChromaDB](https://www.trychroma.com/)
- [OpenAI](https://openai.com/)
