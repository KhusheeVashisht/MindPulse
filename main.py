"""
Main entry point for MindPulse FastAPI application.
Run with: uvicorn main:app --reload
"""

from api.api import app
from database import init_db

@app.on_event("startup")
def startup():
    """
    FastAPI startup event handler.
    Initializes the database when the server starts.
    """
    init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
