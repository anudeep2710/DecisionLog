from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from auth import get_current_user, supabase

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

# Pydantic Models
class CommentCreate(BaseModel):
    decision_id: str
    content: str

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    decision_id: str
    user_id: str
    content: str
    created_at: str
    updated_at: str

# Routes

@router.get("/decision/{decision_id}", response_model=List[CommentResponse])
def get_comments(decision_id: str, user = Depends(get_current_user)):
    """Get all comments for a decision"""
    try:
        # Verify user owns the decision
        decision = supabase.table("decisions").select("user_id").eq("id", decision_id).execute()
        if not decision.data or decision.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        response = supabase.table("comments").select("*")\
            .eq("decision_id", decision_id)\
            .order("created_at", desc=False).execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, user = Depends(get_current_user)):
    """Create a new comment on a decision"""
    try:
        # Verify user owns the decision
        decision = supabase.table("decisions").select("user_id").eq("id", comment.decision_id).execute()
        if not decision.data or decision.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        data = {
            "decision_id": comment.decision_id,
            "user_id": user.id,
            "content": comment.content
        }
        response = supabase.table("comments").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create comment")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(comment_id: str, comment: CommentUpdate, user = Depends(get_current_user)):
    """Update a comment"""
    try:
        # Verify user owns the comment
        existing = supabase.table("comments").select("*").eq("id", comment_id).execute()
        if not existing.data or existing.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        response = supabase.table("comments").update({
            "content": comment.content,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", comment_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to update comment")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{comment_id}")
def delete_comment(comment_id: str, user = Depends(get_current_user)):
    """Delete a comment"""
    try:
        # Verify user owns the comment
        existing = supabase.table("comments").select("*").eq("id", comment_id).execute()
        if not existing.data or existing.data[0]["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        supabase.table("comments").delete().eq("id", comment_id).execute()
        return {"detail": "Comment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
