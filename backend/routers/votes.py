from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import Vote, User
from auth import get_current_user

router = APIRouter(
    prefix="/votes",
    tags=["votes"]
)

# Pydantic models
class VoteCreate(BaseModel):
    decision_id: str
    vote: str  # 'approve', 'reject', 'abstain'

class VoteResponse(BaseModel):
    id: str
    decision_id: str
    user_id: str
    vote: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class VoteSummary(BaseModel):
    decision_id: str
    approve_count: int
    reject_count: int
    abstain_count: int
    user_vote: Optional[str]
    voters: List[dict]


@router.get("/decision/{decision_id}", response_model=VoteSummary)
def get_votes(
    decision_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get vote summary for a decision"""
    votes = db.query(Vote).filter(Vote.decision_id == decision_id).all()
    
    approve_count = sum(1 for v in votes if v.vote == "approve")
    reject_count = sum(1 for v in votes if v.vote == "reject")
    abstain_count = sum(1 for v in votes if v.vote == "abstain")
    
    user_vote = next((v.vote for v in votes if v.user_id == current_user.id), None)
    
    voters = []
    for v in votes:
        user = db.query(User).filter(User.id == v.user_id).first()
        voters.append({
            "user_id": v.user_id,
            "name": user.full_name if user else "Unknown",
            "vote": v.vote
        })
    
    return {
        "decision_id": decision_id,
        "approve_count": approve_count,
        "reject_count": reject_count,
        "abstain_count": abstain_count,
        "user_vote": user_vote,
        "voters": voters
    }


@router.post("/", response_model=VoteResponse)
def cast_vote(
    vote: VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cast or update a vote"""
    if vote.vote not in ["approve", "reject", "abstain"]:
        raise HTTPException(status_code=400, detail="Invalid vote type")
    
    existing = db.query(Vote).filter(
        Vote.decision_id == vote.decision_id,
        Vote.user_id == current_user.id
    ).first()
    
    if existing:
        existing.vote = vote.vote
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_vote = Vote(
            decision_id=vote.decision_id,
            user_id=current_user.id,
            vote=vote.vote
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote


@router.delete("/decision/{decision_id}")
def remove_vote(
    decision_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove user's vote"""
    db.query(Vote).filter(
        Vote.decision_id == decision_id,
        Vote.user_id == current_user.id
    ).delete()
    db.commit()
    return {"detail": "Vote removed successfully"}
