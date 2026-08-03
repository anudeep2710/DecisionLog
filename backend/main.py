from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import decisions, teams, tags, comments, votes, chat, bot, whiteboards
from routers.auth_routes import router as auth_router
from database import engine, Base, get_db
from sqlalchemy import text
from sqlalchemy.orm import Session
import uvicorn
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DecisionLog API")

# CORS middleware. Set CORS_ORIGINS to a comma-separated list in production.
configured_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
allow_all_origins = origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(decisions.router)
app.include_router(teams.router)
app.include_router(tags.router)
app.include_router(comments.router)
app.include_router(votes.router)
app.include_router(chat.router)
app.include_router(bot.router)
app.include_router(whiteboards.router)

@app.get("/")
def root():
    return {"message": "Welcome to DecisionLog API"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    """Return a health response only when the application can reach its DB."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
