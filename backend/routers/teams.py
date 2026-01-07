from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import Team, TeamMember, User
from auth import get_current_user
import random
import string

router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# Pydantic models
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    invite_code: str
    created_at: datetime
    role: Optional[str] = None
    
    class Config:
        from_attributes = True

class JoinTeamRequest(BaseModel):
    invite_code: str


@router.get("/", response_model=List[TeamResponse])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all teams for user"""
    memberships = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id
    ).all()
    
    teams = []
    for membership in memberships:
        team = db.query(Team).filter(Team.id == membership.team_id).first()
        if team:
            teams.append({
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "invite_code": team.invite_code,
                "created_at": team.created_at,
                "role": membership.role
            })
    return teams


@router.post("/", response_model=TeamResponse)
def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new team"""
    db_team = Team(
        name=team.name,
        description=team.description,
        invite_code=generate_invite_code()
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # Add creator as owner
    membership = TeamMember(
        team_id=db_team.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(membership)
    db.commit()
    
    return {
        "id": db_team.id,
        "name": db_team.name,
        "description": db_team.description,
        "invite_code": db_team.invite_code,
        "created_at": db_team.created_at,
        "role": "owner"
    }


@router.post("/join", response_model=TeamResponse)
def join_team(
    request: JoinTeamRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a team by invite code"""
    team = db.query(Team).filter(Team.invite_code == request.invite_code).first()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if already member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")
    
    membership = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="member"
    )
    db.add(membership)
    db.commit()
    
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "invite_code": team.invite_code,
        "created_at": team.created_at,
        "role": "member"
    }


@router.delete("/{team_id}")
def delete_team(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a team (owner only)"""
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "owner"
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.query(Team).filter(Team.id == team_id).delete()
    db.commit()
    return {"detail": "Team deleted successfully"}
