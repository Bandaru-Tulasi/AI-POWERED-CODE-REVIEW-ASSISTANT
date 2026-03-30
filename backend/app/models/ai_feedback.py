"""
AIFeedback model
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base


class AIFeedback(Base):
    __tablename__ = "ai_feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Review reference
    review_id = Column(Integer, ForeignKey("code_reviews.id"), nullable=False)
    
    # AI analysis details
    ai_model = Column(String(100), default="gemini")  # gemini, openai, etc.
    analysis_type = Column(String(50))  # security, quality, best_practices, performance
    
    # Analysis results
    issues_found = Column(Integer, default=0)
    suggestions_provided = Column(Integer, default=0)
    confidence_score = Column(Integer, nullable=True)  # 0-100
    
    # Raw AI response
    raw_response = Column(Text, nullable=True)
    structured_response = Column(JSON, nullable=True)
    
    # Feedback from user
    user_feedback = Column(String(20), nullable=True)  # helpful, not_helpful, partially_helpful
    user_comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<AIFeedback(id={self.id}, model={self.ai_model}, type={self.analysis_type})>"