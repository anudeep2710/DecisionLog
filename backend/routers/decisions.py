from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from auth import get_current_user, supabase

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"]
)

# Pydantic Models
class DecisionBase(BaseModel):
    title: str
    context: Optional[str] = None
    choice_made: Optional[str] = None
    confidence_level: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = "pending" # pending, reviewed
    outcome: Optional[str] = "unknown" # success, failure, unknown
    notes: Optional[str] = None
    team_id: Optional[str] = None  # null for personal, uuid for team

class DecisionCreate(DecisionBase):
    pass

class DecisionUpdate(DecisionBase):
    pass

class DecisionResponse(DecisionBase):
    id: str
    user_id: str
    team_id: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Routes
@router.get("/", response_model=List[DecisionResponse])
def get_decisions(team_id: Optional[str] = None, user = Depends(get_current_user)):
    """Get decisions - personal or filtered by team"""
    try:
        if team_id:
            # Get team decisions (must be a member)
            membership = supabase.table("team_members").select("role").eq("team_id", team_id).eq("user_id", user.id).execute()
            if not membership.data:
                raise HTTPException(status_code=403, detail="Not a member of this team")
            response = supabase.table("decisions").select("*").eq("team_id", team_id).order("created_at", desc=True).execute()
        else:
            # Get only personal decisions (no team)
            response = supabase.table("decisions").select("*").eq("user_id", user.id).is_("team_id", "null").order("created_at", desc=True).execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=DecisionResponse)
def create_decision(decision: DecisionCreate, user = Depends(get_current_user)):
    try:
        data = decision.model_dump(exclude_unset=True)
        data["user_id"] = user.id
        
        response = supabase.table("decisions").insert(data).execute()
        
        if not response.data:
             raise HTTPException(status_code=400, detail="Failed to create decision")
             
        return response.data[0]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{decision_id}", response_model=DecisionResponse)
def update_decision(decision_id: str, decision: DecisionUpdate, user = Depends(get_current_user)):
    try:
        data = decision.model_dump(exclude_unset=True)
        # Ensure 'updated_at' is updated? Supabase might handle it via trigger or we send it.
        # Let's let the DB handle it if configured, or send it here. 
        # For now, just sending data.
        
        response = supabase.table("decisions").update(data).eq("id", decision_id).eq("user_id", user.id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Decision not found or not authorized")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{decision_id}")
def delete_decision(decision_id: str, user = Depends(get_current_user)):
    try:
        response = supabase.table("decisions").delete().eq("id", decision_id).eq("user_id", user.id).execute()
        # Checking if data returned tells us if something was deleted (Supabase returns deleted rows)
        if not response.data:
             raise HTTPException(status_code=404, detail="Decision not found or not authorized")
        return {"detail": "Decision deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
