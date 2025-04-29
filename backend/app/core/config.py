import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Knowledge Navigator"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/knowledge_navigator")

    # Vector Database
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./vector_db")

    # Document Storage
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "./uploads")

    # LLM Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")  # openai, google, ollama
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL", "gemini-pro")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama2")
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175"]

settings = Settings()
