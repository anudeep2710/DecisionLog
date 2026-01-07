from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routers import decisions, teams, tags, comments, votes

app = FastAPI(title="DecisionLog API")

# CORS - Allow all origins for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(decisions.router)
app.include_router(teams.router)
app.include_router(tags.router)
app.include_router(comments.router)
app.include_router(votes.router)

@app.get("/api")
def root():
    return {"message": "DecisionLog API is running!"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}
