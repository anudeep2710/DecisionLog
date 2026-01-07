from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from auth import get_current_user, supabase

router = APIRouter(
    prefix="/votes",
    tags=["votes"]
)

# Pydantic Models
class VoteCreate(BaseModel):
    decision_id: str
    vote: str  # 'approve', 'reject', 'abstain'

class VoteResponse(BaseModel):
    id: str
    decision_id: str
    user_id: str
    vote: str
    created_at: str

class VoteSummary(BaseModel):
    decision_id: str
    approve_count: int
    reject_count: int
    abstain_count: int
    user_vote: Optional[str]
    voters: List[dict]

# Routes

@router.get("/decision/{decision_id}", response_model=VoteSummary)
def get_votes(decision_id: str, user = Depends(get_current_user)):
    """Get vote summary for a decision"""
    try:
        # Get all votes for this decision
        response = supabase.table("votes").select("*").eq("decision_id", decision_id).execute()
        votes = response.data or []
        
        approve_count = sum(1 for v in votes if v["vote"] == "approve")
        reject_count = sum(1 for v in votes if v["vote"] == "reject")
        abstain_count = sum(1 for v in votes if v["vote"] == "abstain")
        
        # Get current user's vote
        user_vote = next((v["vote"] for v in votes if v["user_id"] == user.id), None)
        
        # Get voter list with profiles
        voters = []
        for v in votes:
            profile = supabase.table("profiles").select("full_name").eq("id", v["user_id"]).execute()
            name = profile.data[0]["full_name"] if profile.data else "Unknown"
            voters.append({
                "user_id": v["user_id"],
                "name": name,
                "vote": v["vote"]
            })
        
        return {
            "decision_id": decision_id,
            "approve_count": approve_count,
            "reject_count": reject_count,
            "abstain_count": abstain_count,
            "user_vote": user_vote,
            "voters": voters
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=VoteResponse)
def cast_vote(vote: VoteCreate, user = Depends(get_current_user)):
    """Cast or update a vote on a decision"""
    try:
        if vote.vote not in ["approve", "reject", "abstain"]:
            raise HTTPException(status_code=400, detail="Invalid vote type")
        
        # Check if user already voted
        existing = supabase.table("votes").select("*")\
            .eq("decision_id", vote.decision_id)\
            .eq("user_id", user.id).execute()
        
        if existing.data:
            # Update existing vote
            response = supabase.table("votes").update({
                "vote": vote.vote
            }).eq("id", existing.data[0]["id"]).execute()
        else:
            # Create new vote
            response = supabase.table("votes").insert({
                "decision_id": vote.decision_id,
                "user_id": user.id,
                "vote": vote.vote
            }).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to cast vote")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/decision/{decision_id}")
def remove_vote(decision_id: str, user = Depends(get_current_user)):
    """Remove user's vote from a decision"""
    try:
        supabase.table("votes").delete()\
            .eq("decision_id", decision_id)\
            .eq("user_id", user.id).execute()
        
        return {"detail": "Vote removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
