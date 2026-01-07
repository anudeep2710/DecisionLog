from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from auth import get_current_user, supabase

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)

# Pydantic Models
class TagCreate(BaseModel):
    name: str

class TagResponse(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: str

class DecisionTagRequest(BaseModel):
    decision_id: str
    tag_id: str

# Routes

@router.get("/", response_model=List[TagResponse])
def get_tags(user = Depends(get_current_user)):
    """Get all tags for the current user"""
    try:
        response = supabase.table("tags").select("*").eq("user_id", user.id).order("name").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=TagResponse)
def create_tag(tag: TagCreate, user = Depends(get_current_user)):
    """Create a new tag"""
    try:
        # Check if tag already exists
        existing = supabase.table("tags").select("*").eq("user_id", user.id).eq("name", tag.name).execute()
        if existing.data:
            return existing.data[0]  # Return existing tag instead of creating duplicate
        
        data = {"name": tag.name, "user_id": user.id}
        response = supabase.table("tags").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create tag")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{tag_id}")
def delete_tag(tag_id: str, user = Depends(get_current_user)):
    """Delete a tag"""
    try:
        # Verify ownership
        tag = supabase.table("tags").select("*").eq("id", tag_id).eq("user_id", user.id).execute()
        if not tag.data:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        supabase.table("tags").delete().eq("id", tag_id).execute()
        return {"detail": "Tag deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/decision/{decision_id}", response_model=List[TagResponse])
def get_decision_tags(decision_id: str, user = Depends(get_current_user)):
    """Get all tags for a specific decision"""
    try:
        # Get tag IDs for the decision
        decision_tags = supabase.table("decision_tags").select("tag_id").eq("decision_id", decision_id).execute()
        
        if not decision_tags.data:
            return []
        
        tag_ids = [dt["tag_id"] for dt in decision_tags.data]
        tags = supabase.table("tags").select("*").in_("id", tag_ids).execute()
        
        return tags.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/decision")
def add_tag_to_decision(request: DecisionTagRequest, user = Depends(get_current_user)):
    """Add a tag to a decision"""
    try:
        # Verify user owns the decision
        decision = supabase.table("decisions").select("user_id").eq("id", request.decision_id).execute()
        if not decision.data or decision.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Check if already tagged
        existing = supabase.table("decision_tags").select("*")\
            .eq("decision_id", request.decision_id)\
            .eq("tag_id", request.tag_id).execute()
        
        if existing.data:
            return {"detail": "Tag already added"}
        
        supabase.table("decision_tags").insert({
            "decision_id": request.decision_id,
            "tag_id": request.tag_id
        }).execute()
        
        return {"detail": "Tag added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/decision/{decision_id}/{tag_id}")
def remove_tag_from_decision(decision_id: str, tag_id: str, user = Depends(get_current_user)):
    """Remove a tag from a decision"""
    try:
        # Verify user owns the decision
        decision = supabase.table("decisions").select("user_id").eq("id", decision_id).execute()
        if not decision.data or decision.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        supabase.table("decision_tags").delete()\
            .eq("decision_id", decision_id)\
            .eq("tag_id", tag_id).execute()
        
        return {"detail": "Tag removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
