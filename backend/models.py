from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    decisions = relationship("Decision", back_populates="user", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")


# Decision model
class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    context = Column(Text, nullable=True)
    choice_made = Column(Text, nullable=True)
    confidence_level = Column(Integer, default=3)
    status = Column(String, default="pending")  # pending, reviewed
    outcome = Column(String, default="unknown")  # success, failure, unknown
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="decisions")
    team = relationship("Team", back_populates="decisions")
    comments = relationship("Comment", back_populates="decision", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="decision", cascade="all, delete-orphan")
    tags = relationship("DecisionTag", back_populates="decision", cascade="all, delete-orphan")


# Tag model
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="tags")
    decisions = relationship("DecisionTag", back_populates="tag", cascade="all, delete-orphan")


# Decision-Tag association
class DecisionTag(Base):
    __tablename__ = "decision_tags"
    
    decision_id = Column(String, ForeignKey("decisions.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    decision = relationship("Decision", back_populates="tags")
    tag = relationship("Tag", back_populates="decisions")


# Comment model
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    decision = relationship("Decision", back_populates="comments")
    user = relationship("User", back_populates="comments")


# Vote model
class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vote = Column(String, nullable=False)  # approve, reject, abstain
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    decision = relationship("Decision", back_populates="votes")
    user = relationship("User", back_populates="votes")


# Team model
class Team(Base):
    __tablename__ = "teams"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    decisions = relationship("Decision", back_populates="team")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="team", cascade="all, delete-orphan")


# Team Member model
class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, default="member")  # owner, admin, member
    joined_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")


# Message model (Team Chat)
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="messages")
    user = relationship("User", back_populates="messages")


# Whiteboard model
class Whiteboard(Base):
    __tablename__ = "whiteboards"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, nullable=False)
    data = Column(Text, nullable=False, default="[]") # JSON string of shapes
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")
    team = relationship("Team")
