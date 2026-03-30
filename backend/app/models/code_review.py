"""
CodeReview model
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base


class CodeReview(Base):
    __tablename__ = "code_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Repository information - MAKE THIS OPTIONAL
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)  # Changed to nullable=True
    branch_name = Column(String(200))
    pull_request_url = Column(String(500))
    pull_request_number = Column(Integer)
    
    # Code information
    files_changed = Column(Integer, default=0)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    
    # Review metadata
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, rejected
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Store the actual code being reviewed
    code_content = Column(Text, nullable=True)  # Add this field
    language = Column(String(50), default="python")  # Add this field
    
    # AI Analysis results (stored as JSON)
    ai_analysis = Column(JSON, nullable=True)
    security_issues = Column(JSON, nullable=True)
    quality_metrics = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    
    # Scores
    overall_score = Column(Float, nullable=True)
    security_score = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CodeReview(id={self.id}, title={self.title}, status={self.status})>"