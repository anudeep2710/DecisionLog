from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import Decision, User
from auth import get_current_user

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"]
)

# Pydantic models
class DecisionCreate(BaseModel):
    title: str
    context: Optional[str] = None
    choice_made: Optional[str] = None
    confidence_level: int = 3
    status: str = "pending"
    outcome: str = "unknown"
    notes: Optional[str] = None
    team_id: Optional[str] = None

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    context: Optional[str] = None
    choice_made: Optional[str] = None
    confidence_level: Optional[int] = None
    status: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None

class DecisionResponse(BaseModel):
    id: str
    user_id: str
    team_id: Optional[str]
    title: str
    context: Optional[str]
    choice_made: Optional[str]
    confidence_level: int
    status: str
    outcome: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[DecisionResponse])
def get_decisions(
    team_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all decisions for user or team"""
    query = db.query(Decision)
    
    if team_id:
        query = query.filter(Decision.team_id == team_id)
    else:
        query = query.filter(Decision.user_id == current_user.id)
    
    return query.order_by(Decision.created_at.desc()).all()


@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new decision"""
    db_decision = Decision(
        user_id=current_user.id,
        team_id=decision.team_id,
        title=decision.title,
        context=decision.context,
        choice_made=decision.choice_made,
        confidence_level=decision.confidence_level,
        status=decision.status,
        outcome=decision.outcome,
        notes=decision.notes
    )
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    return db_decision


@router.put("/{decision_id}", response_model=DecisionResponse)
def update_decision(
    decision_id: str,
    decision: DecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a decision"""
    db_decision = db.query(Decision).filter(
        Decision.id == decision_id,
        Decision.user_id == current_user.id
    ).first()
    
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    update_data = decision.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_decision, key, value)
    
    db.commit()
    db.refresh(db_decision)
    return db_decision


@router.delete("/{decision_id}")
def delete_decision(
    decision_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a decision"""
    db_decision = db.query(Decision).filter(
        Decision.id == decision_id,
        Decision.user_id == current_user.id
    ).first()
    
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    db.delete(db_decision)
    db.commit()
    return {"detail": "Decision deleted successfully"}
