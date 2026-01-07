from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import decisions, teams, tags, comments, votes
import uvicorn
import os

app = FastAPI(title="DecisionLog API")

# CORS middleware - allow all origins in production
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "*"),  # Vercel frontend URL
]

# Allow all origins if FRONTEND_URL is set to "*"
if "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(decisions.router)
app.include_router(teams.router)
app.include_router(tags.router)
app.include_router(comments.router)
app.include_router(votes.router)

@app.get("/")
def root():
    return {"message": "Welcome to DecisionLog API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
