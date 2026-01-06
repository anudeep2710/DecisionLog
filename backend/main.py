from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import decisions, teams
import uvicorn

app = FastAPI(title="DecisionLog API")

# CORS middleware
origins = [
    "http://localhost:3000", # Next.js
    "http://127.0.0.1:3000",
]

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

@app.get("/")
def root():
    return {"message": "Welcome to DecisionLog API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
