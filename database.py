"""
Database initialization module for MindPulse FastAPI application.
Handles SQLAlchemy setup and table creation.
"""

from models import create_tables

def init_db():
    """
    Initialize the database tables.
    Creates all tables defined in SQLAlchemy models if they don't exist.
    """
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully.")
