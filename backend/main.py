from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import decisions, teams, tags, comments, votes, chat, bot, whiteboards
from routers.auth_routes import router as auth_router
from database import engine, Base
import uvicorn
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DecisionLog API")

# CORS middleware - allow all origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
    return {"message": "Welcome to DecisionLog API - SQLite Edition"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
