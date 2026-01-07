from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import Whiteboard, User, TeamMember
from auth import get_current_user
import json

router = APIRouter(
    prefix="/whiteboards",
    tags=["whiteboards"]
)

# Pydantic Models
class WhiteboardCreate(BaseModel):
    name: str
    team_id: Optional[str] = None
    data: Optional[str] = "[]"

class WhiteboardUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[str] = None

class WhiteboardResponse(BaseModel):
    id: str
    user_id: str
    team_id: Optional[str]
    name: str
    data: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[WhiteboardResponse])
def get_whiteboards(
    team_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get whiteboards for user or team"""
    query = db.query(Whiteboard)
    
    if team_id:
        # Verify membership
        member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not a member of this team")
        query = query.filter(Whiteboard.team_id == team_id)
    else:
        # Personal whiteboards
        query = query.filter(Whiteboard.user_id == current_user.id, Whiteboard.team_id.is_(None))
    
    return query.order_by(Whiteboard.updated_at.desc()).all()

@router.get("/{wb_id}", response_model=WhiteboardResponse)
def get_whiteboard(
    wb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wb = db.query(Whiteboard).filter(Whiteboard.id == wb_id).first()
    if not wb:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    # Check access
    if wb.team_id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == wb.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif wb.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return wb

@router.post("/", response_model=WhiteboardResponse)
def create_whiteboard(
    wb: WhiteboardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if wb.team_id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == wb.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not a member of this team")

    db_wb = Whiteboard(
        user_id=current_user.id,
        team_id=wb.team_id,
        name=wb.name,
        data=wb.data or "[]"
    )
    db.add(db_wb)
    db.commit()
    db.refresh(db_wb)
    return db_wb

@router.put("/{wb_id}", response_model=WhiteboardResponse)
def update_whiteboard(
    wb_id: str,
    wb_update: WhiteboardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_wb = db.query(Whiteboard).filter(Whiteboard.id == wb_id).first()
    if not db_wb:
        raise HTTPException(status_code=404, detail="Whiteboard not found")

    # Check update permissions (simplified: owner or team member)
    if db_wb.team_id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == db_wb.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not member:
             raise HTTPException(status_code=403, detail="Not authorized")
    elif db_wb.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")

    if wb_update.name is not None:
        db_wb.name = wb_update.name
    if wb_update.data is not None:
        db_wb.data = wb_update.data

    db.commit()
    db.refresh(db_wb)
    return db_wb

@router.delete("/{wb_id}")
def delete_whiteboard(
    wb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_wb = db.query(Whiteboard).filter(Whiteboard.id == wb_id).first()
    if not db_wb:
        raise HTTPException(status_code=404, detail="Whiteboard not found")

    # Only owner can delete (or maybe team admin, but sticking to owner for now)
    if db_wb.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the creator can delete this whiteboard")

    db.delete(db_wb)
    db.commit()
    return {"detail": "Whiteboard deleted"}
