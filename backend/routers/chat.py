from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Message, User, TeamMember
from auth import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

class MessageCreate(BaseModel):
    team_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    team_id: str
    user_id: str
    content: str
    created_at: datetime
    user: dict  # specific user fields

    class Config:
        orm_mode = True

@router.get("/{team_id}", response_model=List[MessageResponse])
def get_messages(team_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is member of the team
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    messages = db.query(Message).filter(Message.team_id == team_id).order_by(Message.created_at.asc()).limit(50).all()
    
    # Format response to include user details
    results = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.user_id).first()
        user_data = {
            "id": sender.id,
            "full_name": sender.full_name,
            "email": sender.email
        }
        results.append({
            "id": msg.id,
            "team_id": msg.team_id,
            "user_id": msg.user_id,
            "content": msg.content,
            "created_at": msg.created_at,
            "user": user_data
        })
    
    return results

@router.post("/", response_model=MessageResponse)
def send_message(message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is member of the team
    member = db.query(TeamMember).filter(
        TeamMember.team_id == message.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    new_message = Message(
        team_id=message.team_id,
        user_id=current_user.id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    user_data = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }
    
    return {
        "id": new_message.id,
        "team_id": new_message.team_id,
        "user_id": new_message.user_id,
        "content": new_message.content,
        "created_at": new_message.created_at,
        "user": user_data
    }
