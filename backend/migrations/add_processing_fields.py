"""
Migration script to add processing_progress and processing_status fields to the documents table.
"""
import os
import sys
import sqlite3
from sqlalchemy import create_engine, inspect, text

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def run_migration():
    """Run the migration to add the new fields."""
    print("Starting migration to add processing fields to documents table...")

    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)

    # Get existing columns
    existing_columns = [col['name'] for col in inspector.get_columns('documents')]
    print(f"Existing columns: {existing_columns}")

    # Add columns if they don't exist
    with engine.connect() as conn:
        try:
            if 'processing_progress' not in existing_columns:
                print("Adding processing_progress column...")
                conn.execute(text("""
                    ALTER TABLE documents
                    ADD COLUMN processing_progress INTEGER DEFAULT 0
                """))
            else:
                print("processing_progress column already exists.")

            if 'processing_status' not in existing_columns:
                print("Adding processing_status column...")
                conn.execute(text("""
                    ALTER TABLE documents
                    ADD COLUMN processing_status VARCHAR DEFAULT 'pending'
                """))
            else:
                print("processing_status column already exists.")

            # Commit the transaction
            conn.commit()
        except Exception as e:
            print(f"Error during migration: {e}")
            conn.rollback()
            raise

    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
