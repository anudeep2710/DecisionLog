from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import random

from database import get_db
from models import Decision, User
from auth import get_current_user

router = APIRouter(
    prefix="/bot",
    tags=["bot"],
    responses={404: {"description": "Not found"}},
)

class BotQuery(BaseModel):
    query: str

class BotResponse(BaseModel):
    answer: str
    sources: Optional[List[dict]] = None

@router.post("/query", response_model=BotResponse)
def query_bot(query_data: BotQuery, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = query_data.query.lower()
    user_decisions = db.query(Decision).filter(Decision.user_id == current_user.id).all()
    
    # Simple rule-based logic for MVP
    
    # 1. Count decisions
    if "how many decisions" in query or "total decisions" in query:
        count = len(user_decisions)
        return {"answer": f"You have logged a total of {count} decisions so far."}
    
    # 2. Successful outcomes
    if "successful" in query or "success" in query:
        success_decisions = [d for d in user_decisions if d.outcome == 'success']
        count = len(success_decisions)
        sources = [{"title": d.title, "id": d.id} for d in success_decisions[:3]]
        return {
            "answer": f"You have {count} decisions marked as successful.",
            "sources": sources
        }
    
    # 3. Pending/Open decisions
    if "pending" in query or "open" in query:
        pending_decisions = [d for d in user_decisions if d.status == 'pending']
        count = len(pending_decisions)
        sources = [{"title": d.title, "id": d.id} for d in pending_decisions[:3]]
        return {
            "answer": f"You have {count} pending decisions waiting for review.",
            "sources": sources
        }
    
    # 4. Recent decisions
    if "recent" in query or "latest" in query:
        recent = sorted(user_decisions, key=lambda x: x.created_at, reverse=True)[:3]
        sources = [{"title": d.title, "id": d.id} for d in recent]
        return {
            "answer": "Here are your most recent decisions:",
            "sources": sources
        }

    # Default generic response
    return {
        "answer": "I can help you track your decisions! Try asking 'How many decisions have I made?' or 'Show me my successful decisions'."
    }
