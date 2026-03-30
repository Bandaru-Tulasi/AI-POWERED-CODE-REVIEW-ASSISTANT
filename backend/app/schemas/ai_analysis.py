"""
AI Analysis schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class SecurityIssue(BaseModel):
    """Schema for security issue"""
    severity: str  # "critical", "high", "medium", "low"
    type: str
    description: str
    location: str  # line number or function name
    suggestion: str
    cvss_score: Optional[float] = None


class CodeSuggestion(BaseModel):
    """Schema for code suggestion"""
    type: str  # "readability", "performance", "best_practice", "security"
    description: str
    current_code: str
    suggested_code: str
    explanation: str
    impact: str  # "high", "medium", "low"


class CodeMetric(BaseModel):
    """Schema for code metric"""
    name: str
    value: float
    threshold: Optional[float] = None
    status: str  # "good", "warning", "critical"
    description: str


class AIAnalysisBase(BaseModel):
    """Base AI analysis schema"""
    review_id: int
    analysis_type: str


class AIAnalysisCreate(AIAnalysisBase):
    """Schema for creating AI analysis"""
    raw_response: Dict[str, Any]
    issues_found: int = 0
    suggestions_provided: int = 0
    metrics_calculated: int = 0


class AIAnalysisResponse(AIAnalysisBase):
    """Schema for AI analysis response"""
    id: int
    raw_response: Dict[str, Any]
    issues_found: int
    suggestions_provided: int
    metrics_calculated: int
    created_at: datetime
    
    class Config:
        from_attributes = True