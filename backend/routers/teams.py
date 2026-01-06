from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from auth import get_current_user, supabase

router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)

# Pydantic Models
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_by: str
    invite_code: str
    created_at: str
    member_count: Optional[int] = None
    role: Optional[str] = None

class TeamMemberResponse(BaseModel):
    user_id: str
    role: str
    joined_at: str
    full_name: Optional[str] = None
    email: Optional[str] = None

class JoinTeamRequest(BaseModel):
    invite_code: str

# Routes

@router.get("/", response_model=List[TeamResponse])
def get_my_teams(user = Depends(get_current_user)):
    """Get all teams the current user is a member of"""
    try:
        # Get team memberships
        memberships = supabase.table("team_members")\
            .select("team_id, role")\
            .eq("user_id", user.id)\
            .execute()
        
        if not memberships.data:
            return []
        
        # Get team details
        team_ids = [m["team_id"] for m in memberships.data]
        teams = supabase.table("teams")\
            .select("*")\
            .in_("id", team_ids)\
            .execute()
        
        # Merge role info
        role_map = {m["team_id"]: m["role"] for m in memberships.data}
        result = []
        for team in teams.data:
            team["role"] = role_map.get(team["id"])
            result.append(team)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=TeamResponse)
def create_team(team: TeamCreate, user = Depends(get_current_user)):
    """Create a new team (creator becomes owner)"""
    try:
        data = team.model_dump()
        data["created_by"] = user.id
        
        response = supabase.table("teams").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create team")
        
        new_team = response.data[0]
        new_team["role"] = "owner"
        return new_team
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, user = Depends(get_current_user)):
    """Get team details (must be a member)"""
    try:
        # Check membership
        membership = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", user.id)\
            .single()\
            .execute()
        
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this team")
        
        # Get team
        team = supabase.table("teams")\
            .select("*")\
            .eq("id", team_id)\
            .single()\
            .execute()
        
        if not team.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team.data["role"] = membership.data["role"]
        
        # Get member count
        members = supabase.table("team_members")\
            .select("user_id", count="exact")\
            .eq("team_id", team_id)\
            .execute()
        team.data["member_count"] = members.count
        
        return team.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{team_id}", response_model=TeamResponse)
def update_team(team_id: str, team: TeamUpdate, user = Depends(get_current_user)):
    """Update team (owner/admin only)"""
    try:
        # Check admin role
        membership = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", user.id)\
            .single()\
            .execute()
        
        if not membership.data or membership.data["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Only admins can update team")
        
        data = team.model_dump(exclude_unset=True)
        response = supabase.table("teams")\
            .update(data)\
            .eq("id", team_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{team_id}")
def delete_team(team_id: str, user = Depends(get_current_user)):
    """Delete team (owner only)"""
    try:
        team = supabase.table("teams")\
            .select("created_by")\
            .eq("id", team_id)\
            .single()\
            .execute()
        
        if not team.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        if team.data["created_by"] != user.id:
            raise HTTPException(status_code=403, detail="Only owner can delete team")
        
        supabase.table("teams").delete().eq("id", team_id).execute()
        return {"detail": "Team deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/join", response_model=TeamResponse)
def join_team(request: JoinTeamRequest, user = Depends(get_current_user)):
    """Join a team using invite code"""
    try:
        # Find team by invite code
        team = supabase.table("teams")\
            .select("*")\
            .eq("invite_code", request.invite_code)\
            .single()\
            .execute()
        
        if not team.data:
            raise HTTPException(status_code=404, detail="Invalid invite code")
        
        # Check if already a member
        existing = supabase.table("team_members")\
            .select("user_id")\
            .eq("team_id", team.data["id"])\
            .eq("user_id", user.id)\
            .execute()
        
        if existing.data:
            raise HTTPException(status_code=400, detail="Already a member of this team")
        
        # Add as member
        supabase.table("team_members").insert({
            "team_id": team.data["id"],
            "user_id": user.id,
            "role": "member"
        }).execute()
        
        team.data["role"] = "member"
        return team.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
def get_team_members(team_id: str, user = Depends(get_current_user)):
    """Get all members of a team"""
    try:
        # Check membership
        membership = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this team")
        
        # Get all members with profile info
        members = supabase.table("team_members")\
            .select("user_id, role, joined_at")\
            .eq("team_id", team_id)\
            .execute()
        
        # Get profile info for each member
        result = []
        for m in members.data:
            profile = supabase.table("profiles")\
                .select("full_name")\
                .eq("id", m["user_id"])\
                .single()\
                .execute()
            
            m["full_name"] = profile.data.get("full_name") if profile.data else None
            result.append(m)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{team_id}/members/{member_id}")
def remove_team_member(team_id: str, member_id: str, user = Depends(get_current_user)):
    """Remove a member from team (admin/owner or self)"""
    try:
        # Check if removing self or is admin
        membership = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", user.id)\
            .single()\
            .execute()
        
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this team")
        
        is_admin = membership.data["role"] in ["owner", "admin"]
        is_self = member_id == user.id
        
        if not is_admin and not is_self:
            raise HTTPException(status_code=403, detail="Cannot remove other members")
        
        # Prevent owner from being removed
        target = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", member_id)\
            .single()\
            .execute()
        
        if target.data and target.data["role"] == "owner" and not is_self:
            raise HTTPException(status_code=403, detail="Cannot remove team owner")
        
        supabase.table("team_members")\
            .delete()\
            .eq("team_id", team_id)\
            .eq("user_id", member_id)\
            .execute()
        
        return {"detail": "Member removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/decisions")
def get_team_decisions(team_id: str, user = Depends(get_current_user)):
    """Get all decisions shared with a team"""
    try:
        # Check membership
        membership = supabase.table("team_members")\
            .select("role")\
            .eq("team_id", team_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this team")
        
        decisions = supabase.table("decisions")\
            .select("*")\
            .eq("team_id", team_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return decisions.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
