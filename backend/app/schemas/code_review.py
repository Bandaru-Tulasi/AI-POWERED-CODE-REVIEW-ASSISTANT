"""
Code review schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class CodeReviewBase(BaseModel):
    """Base code review schema"""
    title: str
    description: Optional[str] = None
    repository_id: Optional[int] = None
    branch_name: Optional[str] = None
    pull_request_url: Optional[str] = None
    pull_request_number: Optional[int] = None


class CodeReviewCreate(CodeReviewBase):
    """Schema for creating a code review"""
    files_changed: Optional[int] = 0
    additions: Optional[int] = 0
    deletions: Optional[int] = 0
    reviewer_id: Optional[int] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    
    # Fields from frontend
    code: Optional[str] = None
    language: Optional[str] = "python"
    analysis_result: Optional[Dict[str, Any]] = None
    user_id: Optional[int] = None


class CodeReviewUpdate(BaseModel):
    """Schema for updating a code review"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None


class CodeReviewResponse(CodeReviewBase):
    """Schema for code review response"""
    id: int
    files_changed: int
    additions: int
    deletions: int
    reviewer_id: Optional[int]
    status: str
    priority: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Additional fields
    code: Optional[str] = None
    language: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None
    
    # Separate JSON fields (for completeness)
    security_issues: Optional[Dict[str, Any]] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    suggestions: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class CodeAnalysisRequest(BaseModel):
    """Schema for code analysis request"""
    code: str
    language: Optional[str] = "python"
    analysis_type: Optional[str] = "comprehensive"
    context: Optional[str] = None


class AnalysisResult(BaseModel):
    """Schema for analysis result"""
    success: bool
    analysis_type: str
    language: str
    code_length: int
    result: Dict[str, Any]


class CodeReviewMetrics(BaseModel):
    """Aggregated metrics for code reviews"""
    total_reviews: int
    completed_reviews: int
    pending_reviews: int
    high_priority_reviews: int
    average_review_time_seconds: Optional[float] = None