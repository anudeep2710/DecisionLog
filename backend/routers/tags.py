from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_db
from models import Tag, DecisionTag, User
from auth import get_current_user

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)

# Pydantic models
class TagCreate(BaseModel):
    name: str

class TagResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DecisionTagRequest(BaseModel):
    decision_id: str
    tag_id: str


@router.get("/", response_model=List[TagResponse])
def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tags for user"""
    return db.query(Tag).filter(Tag.user_id == current_user.id).all()


@router.post("/", response_model=TagResponse)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new tag"""
    db_tag = Tag(user_id=current_user.id, name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/{tag_id}")
def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a tag"""
    db_tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(db_tag)
    db.commit()
    return {"detail": "Tag deleted successfully"}


@router.post("/decision")
def add_tag_to_decision(
    request: DecisionTagRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add tag to decision"""
    dt = DecisionTag(decision_id=request.decision_id, tag_id=request.tag_id)
    db.add(dt)
    db.commit()
    return {"detail": "Tag added to decision"}


@router.delete("/decision")
def remove_tag_from_decision(
    request: DecisionTagRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove tag from decision"""
    db.query(DecisionTag).filter(
        DecisionTag.decision_id == request.decision_id,
        DecisionTag.tag_id == request.tag_id
    ).delete()
    db.commit()
    return {"detail": "Tag removed from decision"}
